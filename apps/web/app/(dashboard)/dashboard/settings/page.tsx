'use client'

import React, { useState } from 'react'
import { User, Building2, Bell, Shield, CreditCard, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const sections = [
  { id: 'profile', label: 'Profile', icon: User, description: 'Manage your personal details' },
  { id: 'restaurant', label: 'Restaurant', icon: Building2, description: 'Restaurant info, branding, hours' },
  { id: 'notifications', label: 'Notifications', icon: Bell, description: 'Alerts, emails, push settings' },
  { id: 'security', label: 'Security', icon: Shield, description: 'Password, 2FA, sessions' },
  { id: 'billing', label: 'Billing', icon: CreditCard, description: 'Plan, invoices, payment methods' },
]

function Toggle({ label, description, defaultOn = false }: { label: string; description: string; defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn)
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-sm font-medium text-gray-800">{label}</p>
        <p className="text-xs text-gray-400 mt-0.5">{description}</p>
      </div>
      <button
        onClick={() => setOn(!on)}
        className={cn('relative w-11 h-6 rounded-full transition-colors duration-200', on ? 'bg-brand-orange' : 'bg-gray-200')}
      >
        <span className={cn('absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200', on ? 'translate-x-5' : 'translate-x-0')} />
      </button>
    </div>
  )
}

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('profile')

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-700">

      {/* Header */}
      <div className="pb-4 border-b border-gray-200/80">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-orange/10 text-brand-orange text-xs font-semibold mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-orange" />
          Settings
        </div>
        <div className="text-2xl font-bold text-gray-900 tracking-tight normal-case not-italic font-work-sans">Account Settings</div>
        <p className="text-sm text-gray-500 mt-1">Manage your restaurant and account preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6">

        {/* Sidebar nav */}
        <div className="bg-white rounded-3xl p-3 shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-black/[0.04] h-fit">
          {sections.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveSection(id)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium transition-all duration-150 text-left',
                activeSection === id
                  ? 'bg-brand-orange text-black shadow-[0_4px_12px_rgba(245,124,0,0.25)]'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="flex-1">{label}</span>
              {activeSection !== id && <ChevronRight className="w-3.5 h-3.5 text-gray-300 shrink-0" />}
            </button>
          ))}
        </div>

        {/* Content panel */}
        <div className="bg-white rounded-3xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-black/[0.04]">

          {activeSection === 'profile' && (
            <div className="space-y-5">
              <div className="text-base font-bold text-gray-900 normal-case not-italic font-work-sans">Profile</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[['Full Name', 'Your Name'], ['Email', 'you@example.com'], ['Phone', '+1 (555) 000-0000'], ['Role', 'Admin']].map(([label, placeholder]) => (
                  <div key={label}>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">{label}</label>
                    <input type="text" placeholder={placeholder} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange/30 transition-all placeholder:text-gray-400" />
                  </div>
                ))}
              </div>
              <button className="h-10 px-6 bg-brand-orange hover:bg-brand-orange/90 text-white font-semibold text-sm rounded-2xl shadow-[0_4px_12px_rgba(245,124,0,0.25)] transition-all">
                Save Changes
              </button>
            </div>
          )}

          {activeSection === 'restaurant' && (
            <div className="space-y-5">
              <div className="text-base font-bold text-gray-900 normal-case not-italic font-work-sans">Restaurant Details</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[['Restaurant Name', 'My Restaurant'], ['Slug / URL', 'my-restaurant'], ['Address', '123 Main St'], ['City', 'New York']].map(([label, placeholder]) => (
                  <div key={label}>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">{label}</label>
                    <input type="text" placeholder={placeholder} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange/30 transition-all placeholder:text-gray-400" />
                  </div>
                ))}
              </div>
              <button className="h-10 px-6 bg-brand-orange hover:bg-brand-orange/90 text-white font-semibold text-sm rounded-2xl shadow-[0_4px_12px_rgba(245,124,0,0.25)] transition-all">
                Save Changes
              </button>
            </div>
          )}

          {activeSection === 'notifications' && (
            <div className="space-y-1">
              <div className="text-base font-bold text-gray-900 normal-case not-italic font-work-sans mb-4">Notifications</div>
              <div className="divide-y divide-gray-100">
                <Toggle label="New Orders" description="Get notified when a new order comes in" defaultOn={true} />
                <Toggle label="Order Ready" description="Alert when kitchen marks an order ready" defaultOn={true} />
                <Toggle label="Low Inventory" description="Warning when items fall below threshold" defaultOn={false} />
                <Toggle label="Daily Summary" description="Receive an end-of-day performance email" defaultOn={true} />
                <Toggle label="New Reservations" description="Notify on new reservation bookings" defaultOn={false} />
              </div>
            </div>
          )}

          {activeSection === 'security' && (
            <div className="space-y-5">
              <div className="text-base font-bold text-gray-900 normal-case not-italic font-work-sans">Security</div>
              <div className="space-y-4">
                {[['Current Password', 'password'], ['New Password', 'password'], ['Confirm Password', 'password']].map(([label, type]) => (
                  <div key={label}>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">{label}</label>
                    <input type={type} placeholder="••••••••" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange/30 transition-all" />
                  </div>
                ))}
              </div>
              <div className="pt-2 border-t border-gray-100">
                <Toggle label="Two-Factor Authentication" description="Add extra security with 2FA on login" defaultOn={false} />
              </div>
              <button className="h-10 px-6 bg-brand-orange hover:bg-brand-orange/90 text-white font-semibold text-sm rounded-2xl shadow-[0_4px_12px_rgba(245,124,0,0.25)] transition-all">
                Update Password
              </button>
            </div>
          )}

          {activeSection === 'billing' && (
            <div className="space-y-5">
              <div className="text-base font-bold text-gray-900 normal-case not-italic font-work-sans">Billing</div>
              <div className="p-5 bg-brand-orange/5 border border-brand-orange/20 rounded-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-gray-900">Starter Plan</p>
                    <p className="text-xs text-gray-500 mt-0.5">Up to 3 staff · 1 location · Basic analytics</p>
                  </div>
                  <span className="text-lg font-bold text-brand-orange">$29/mo</span>
                </div>
                <button className="mt-4 w-full h-9 bg-brand-orange hover:bg-brand-orange/90 text-white font-semibold text-sm rounded-xl transition-all">
                  Upgrade Plan
                </button>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-700 mb-3 normal-case not-italic font-work-sans">Payment Method</div>
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-700">•••• •••• •••• 4242</span>
                  </div>
                  <button className="text-xs font-semibold text-brand-orange hover:underline">Update</button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
