'use server';

import { stripe } from '@/lib/stripe';
import { headers } from 'next/headers';

export async function createCheckoutSession(amount: number, orderId?: string) {
  const origin = headers().get('origin') || 'http://localhost:3000';

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: orderId ? `Order #${orderId.slice(0, 8)}` : 'Restaurant Payment',
          },
          unit_amount: Math.round(amount * 100),
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    metadata: {
      orderId: orderId || '',
    },
    success_url: `${origin}/dashboard/payments?success=true${orderId ? `&orderId=${orderId}` : ''}`,
    cancel_url: `${origin}/dashboard/payments?canceled=true`,
  });

  return {
    id: session.id,
    url: session.url,
  };
}
