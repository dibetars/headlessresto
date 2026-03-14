import { Injectable, BadRequestException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { StripeConnectService } from './stripe-connect.service';

@Injectable()
export class PaymentsService {
  private supabase: SupabaseClient;

  constructor(private stripeConnect: StripeConnectService) {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
  }

  async createPaymentIntent(orderId: string) {
    const { data: order } = await this.supabase
      .from('orders')
      .select('*, locations(stripe_account_id)')
      .eq('id', orderId)
      .single();

    if (!order) throw new BadRequestException('Order not found');

    const stripeAccountId = (order.locations as any)?.stripe_account_id;
    if (!stripeAccountId) {
      throw new BadRequestException('Restaurant has not connected Stripe yet');
    }

    const intent = await this.stripeConnect.createPaymentIntent({
      amountCents: order.total_cents,
      currency: 'usd',
      stripeAccountId,
      metadata: { order_id: orderId },
    });

    // Record pending payment
    await this.supabase.from('payments').insert({
      order_id: orderId,
      stripe_payment_intent_id: intent.id,
      stripe_account_id: stripeAccountId,
      status: 'pending',
      amount_cents: order.total_cents,
      currency: 'usd',
    });

    return { clientSecret: intent.client_secret };
  }

  async handleStripeWebhook(payload: Buffer, signature: string) {
    const event = await this.stripeConnect.constructWebhookEvent(payload, signature);

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const intent = event.data.object as any;
        await this.supabase
          .from('payments')
          .update({ status: 'succeeded', receipt_url: intent.charges?.data?.[0]?.receipt_url })
          .eq('stripe_payment_intent_id', intent.id);

        // Confirm the order
        const orderId = intent.metadata?.order_id;
        if (orderId) {
          await this.supabase
            .from('orders')
            .update({ status: 'confirmed', updated_at: new Date().toISOString() })
            .eq('id', orderId);
        }
        break;
      }
      case 'payment_intent.payment_failed': {
        const intent = event.data.object as any;
        await this.supabase
          .from('payments')
          .update({ status: 'failed' })
          .eq('stripe_payment_intent_id', intent.id);
        break;
      }
    }

    return { received: true };
  }

  async startConnectOnboarding(locationId: string, returnUrl: string) {
    const { data: location } = await this.supabase
      .from('locations')
      .select('stripe_account_id, org_id, organizations(owner_user_id, users(email))')
      .eq('id', locationId)
      .single();

    if (!location) throw new BadRequestException('Location not found');

    let accountId = location.stripe_account_id;

    if (!accountId) {
      const ownerEmail = (location as any).organizations?.users?.email || '';
      const account = await this.stripeConnect.createConnectAccount(ownerEmail);
      accountId = account.id;

      await this.supabase
        .from('locations')
        .update({ stripe_account_id: accountId })
        .eq('id', locationId);
    }

    const link = await this.stripeConnect.createOnboardingLink(
      accountId,
      returnUrl,
      `${returnUrl}?refresh=true`,
    );

    return { url: link.url };
  }
}
