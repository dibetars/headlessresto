import React from 'react';

export default function AuthLayout({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-orange-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-brand-700">RestaurantOS</h1>
          <p className="text-gray-500 mt-1">Restaurant operations platform</p>
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-8">{children}</div>
      </div>
    </div>
  );
}
