'use client';

import { useState } from 'react';
import { updateProfile } from '@/actions/staff';
import { useRouter } from 'next/navigation';

export default function ProfileForm({ user, profile }: { user: any, profile: any }) {
  const [name, setName] = useState(profile?.name || '');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await updateProfile(user.id, name);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      router.refresh();
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update profile.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl border shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input 
            type="email" 
            value={user.email} 
            disabled 
            className="w-full px-4 py-2 border rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
          />
          <p className="mt-1 text-xs text-gray-500 italic">Email cannot be changed.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Enter your name"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full uppercase">
              {profile?.role || 'User'}
            </span>
          </div>
        </div>

        {message.text && (
          <div className={`p-3 rounded-lg text-sm font-medium ${
            message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {message.text}
          </div>
        )}

        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full bg-indigo-600 text-white py-2 rounded-lg font-bold hover:bg-indigo-700 transition-colors disabled:bg-indigo-300"
        >
          {isLoading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
