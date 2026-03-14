import { Injectable } from '@nestjs/common';

/**
 * Stripe Connect service.
 * Requires: npm install stripe
 * Import Stripe dynamically to avoid breaking builds if not installed.
 */
@Injectable()
export class StripeConnectService {
  private stripe: any;

  constructor() {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const Stripe = require('stripe');
      this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
        apiVersion: '2024-04-10',
      });
    } catch {
      console.warn('Stripe not installed — payment features disabled');
    }
  }

  /** Create a Stripe Connect onboarding link for a restaurant */
  async createConnectAccount(email: string) {
    const account = await this.stripe.accounts.create({
      type: 'standard',
      email,
    });
    return account;
  }

  async createOnboardingLink(accountId: string, returnUrl: string, refreshUrl: string) {
    const link = await this.stripe.accountLinks.create({
      account: accountId,
      return_url: returnUrl,
      refresh_url: refreshUrl,
      type: 'account_onboarding',
    });
    return link;
  }

  /** Create a PaymentIntent on the restaurant's connected account */
  async createPaymentIntent(params: {
    amountCents: number;
    currency: string;
    stripeAccountId: string;
    metadata?: Record<string, string>;
  }) {
    const intent = await this.stripe.paymentIntents.create(
      {
        amount: params.amountCents,
        currency: params.currency,
        metadata: params.metadata || {},
        automatic_payment_methods: { enabled: true },
      },
      { stripeAccount: params.stripeAccountId },
    );
    return intent;
  }

  async constructWebhookEvent(payload: Buffer, signature: string) {
    return this.stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  }

  async getAccount(accountId: string) {
    return this.stripe.accounts.retrieve(accountId);
  }
}
