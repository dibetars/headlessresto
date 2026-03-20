'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { login } from '@/actions/auth';
import Link from 'next/link';

const initialState = {
  message: '',
};

function SubmitButton() {
  const { pending } = useFormStatus();
  
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full px-4 py-2 text-sm font-medium text-white bg-gray-800 border border-transparent rounded-md shadow-sm hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
    >
      {pending ? (
        <>
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Signing in...
        </>
      ) : (
        'Login'
      )}
    </button>
  );
}

export default function LoginPage() {
  const [state, formAction] = useFormState(login, initialState);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center">Login</h1>
        <form action={formAction} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              required
              className="block w-full px-3 py-2 mt-1 text-gray-900 bg-gray-100 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              required
              className="block w-full px-3 py-2 mt-1 text-gray-900 bg-gray-100 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm"
            />
          </div>
          <SubmitButton />
          {state?.message && <p className="text-sm text-red-500">{state.message}</p>}
        </form>
        <p className="text-sm text-center text-gray-600">
          Don't have an account? <Link href="/auth/signup" className="font-medium text-gray-800 hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
