'use client';

import React from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { addToWaitlist } from '@/actions/waitlist';

const initialState = {
  message: '',
};

function SubmitButton() {
  const { pending } = useFormStatus();
  
  return (
    <button
      type="submit"
      disabled={pending}
      className={`px-10 py-5 font-black text-white bg-brand-orange rounded-[24px] hover:bg-brand-orange-light hover:scale-105 transition-all uppercase tracking-widest text-xs shadow-xl shadow-brand-orange/20 flex items-center justify-center min-w-[160px] ${
        pending ? 'opacity-70 cursor-not-allowed' : ''
      }`}
    >
      {pending ? (
        <span className="flex items-center space-x-2">
          <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Joining...</span>
        </span>
      ) : (
        'Join Waitlist'
      )}
    </button>
  );
}

const WaitlistForm = () => {
  const [state, formAction] = useFormState(addToWaitlist, initialState);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert('Please enter a valid email address.');
      e.preventDefault();
      return;
    }
  };

  return (
    <div className="space-y-4">
      <form action={formAction} onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
        <input
          type="email"
          name="email"
          placeholder="Enter your email"
          className="flex-1 px-8 py-5 text-white bg-white/5 border border-white/10 rounded-[24px] focus:outline-none focus:ring-2 focus:ring-brand-orange/50 transition-all font-bold placeholder:text-white/20"
          required
        />
        <SubmitButton />
      </form>
      {state?.message && (
        <p className={`text-xs font-black uppercase tracking-widest ml-4 animate-in fade-in slide-in-from-top-2 duration-500 ${
          state.message.includes('Success') ? 'text-emerald-500' : 'text-rose-500'
        }`}>
          {state.message}
        </p>
      )}
    </div>
  );
};

export default WaitlistForm;
