import React from 'react';

import { signIn } from '@/app/auth/actions'

export default function LoginPage({ searchParams }: { searchParams: { error?: string } }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-2xl shadow-xl border border-gray-100 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary">HeadlessResto</h1>
          <p className="text-gray-500 mt-2 text-sm">Sign in to your account</p>
        </div>
        
        {searchParams.error && (
          <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl">
            {searchParams.error}
          </div>
        )}

        <form action={signIn} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-semibold">Email</label>
            <input 
              name="email"
              type="email" 
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" 
              placeholder="admin@restaurant.com"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold">Password</label>
            <input 
              name="password"
              type="password" 
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" 
              placeholder="••••••••"
            />
          </div>
          <button className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg hover:bg-primary/90 transition-colors">
            Sign In
          </button>
        </form>
        <div className="text-center text-sm text-gray-500">
          <a href="/auth/forgot-password" title="Forgot Password" className="hover:underline">Forgot password?</a>
          <div className="mt-4">
            Don't have an account? <a href="/get-started" className="hover:underline text-primary font-semibold">Get started</a>
          </div>
        </div>
      </div>
    </div>
  );
}
