'use client';

import { useState } from 'react';
import { createCheckoutSession } from '@/actions/payments';

export default function PaymentForm() {
  const [amount, setAmount] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { url } = await createCheckoutSession(amount);

    if (url) {
      window.location.href = url;
    } else {
      console.error('Failed to create checkout session');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold">Make a Payment</h2>
      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount</label>
        <input
          type="number"
          id="amount"
          name="amount"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          required
          className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>
      <button type="submit" className="w-full px-4 py-2 font-bold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
        Pay
      </button>
    </form>
  );
}
