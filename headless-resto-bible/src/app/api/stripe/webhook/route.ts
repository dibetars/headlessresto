import { stripe } from '@/lib/stripe';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  if (event.type === 'checkout.session.completed') {
    const orderId = session.metadata?.orderId;
    
    if (orderId) {
      const { createAdminClient } = await import('@/lib/supabase/admin');
      const supabase = createAdminClient();
      
      // 1. Get the order to find the table_id
      const { data: order, error: orderFetchError } = await supabase
        .from('orders')
        .select('table_id')
        .eq('id', orderId)
        .single();

      if (orderFetchError) {
        console.error('Error fetching order from webhook:', orderFetchError);
        return new NextResponse(`Webhook Error: Failed to fetch order ${orderId}`, { status: 500 });
      }

      // 2. Update order status
      const { error: orderUpdateError } = await supabase
        .from('orders')
        .update({ status: 'completed' })
        .eq('id', orderId);

      if (orderUpdateError) {
        console.error('Error updating order status from webhook:', orderUpdateError);
        return new NextResponse(`Webhook Error: Failed to update order ${orderId}`, { status: 500 });
      }

      // 3. Update table status to available
      if (order?.table_id) {
        const { error: tableUpdateError } = await supabase
          .from('tables')
          .update({ status: 'available' })
          .eq('id', order.table_id);
          
        if (tableUpdateError) {
          console.error('Error updating table status from webhook:', tableUpdateError);
          // Don't fail the webhook if table update fails
        }
      }
      
      console.log(`Order ${orderId} and table ${order?.table_id} updated via Stripe webhook`);
    }
  }

  return new NextResponse(null, { status: 200 });
}
