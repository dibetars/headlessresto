'use server'

import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-01-27' as any, // Fixed version for stability
})

export async function createPaymentIntent(amount: number, metadata: any = {}) {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // convert to cents
      currency: 'usd',
      metadata: {
        ...metadata,
        source: 'qr_menu'
      },
      automatic_payment_methods: {
        enabled: true,
      },
    })

    return { 
      clientSecret: paymentIntent.client_secret,
      id: paymentIntent.id 
    }
  } catch (error: any) {
    console.error('Error creating payment intent:', error)
    throw new Error(error.message)
  }
}
