'use client'

import React, { useState } from 'react'
import { User, Building2, Bell, Shield, CreditCard, ChevronRight, Truck, CheckCircle2, Loader2, Eye, EyeOff, Copy } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createDeliveryQuoteAction } from '@/app/auth/actions'

const sections = [
  { id: 'profile', label: 'Profile', icon: User, description: 'Manage your personal details' },
  { id: 'restaurant', label: 'Restaurant', icon: Building2, description: 'Restaurant info, branding, hours' },
  { id: 'notifications', label: 'Notifications', icon: Bell, description: 'Alerts, emails, push settings' },
  { id: 'security', label: 'Security', icon: Shield, description: 'Password, 2FA, sessions' },
  { id: 'billing', label: 'Billing', icon: CreditCard, description: 'Plan, invoices, payment methods' },
  { id: 'integrations', label: 'Integrations', icon: Truck, description: 'Delivery and third-party services' },
]

function UberDirectSettings() {
  const [enabled, setEnabled] = useState(false)
  const [customerId, setCustomerId] = useState('')
  const [clientId, setClientId] = useState('')
  const [clientSecret, setClientSecret] = useState('')
  const [showSecret, setShowSecret] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)
  const [saveResult, setSaveResult] = useState<string | null>(null)

  const webhookUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/api/webhooks/uber`
    : '/api/webhooks/uber'

  const handleTest = async () => {
    setIsTesting(true)
    setTestResult(null)
    try {
      const res = await createDeliveryQuoteAction(
        'test',
        '123 Test St, San Francisco, CA 94105'
      )
      setTestResult(
        res.success
          ? { success: true, message: 'Connection successful! Quote received.' }
          : { success: false, message: res.error || 'Connection failed.' }
      )
    } catch {
      setTestResult({ success: false, message: 'Connection test failed.' })
    } finally {
      setIsTesting(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    setSaveResult(null)
    // In a real implementation this would call a server action to persist
    // to org brand_assets.integrations.uberDirect. Simulating here.
    await new Promise(r => setTimeout(r, 800))
    setIsSaving(false)
    setSaveResult('Settings saved.')
  }

  const copyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl).catch(() => {})
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-gray-900">Uber Direct</p>
          <p className="text-xs text-gray-400 mt-0.5">White-label delivery dispatching via Uber</p>
        </div>
        <button
          onClick={() => setEnabled(!enabled)}
          className={cn('relative w-11 h-6 rounded-full transition-colors duration-200', enabled ? 'bg-brand-orange' : 'bg-gray-200')}
        >
          <span className={cn('absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200', enabled ? 'translate-x-5' : 'translate-x-0')} />
        </button>
      </div>

      {enabled && (
        <div className="space-y-4 pt-2 border-t border-gray-100">
          {[
            { label: 'Customer ID', value: customerId, set: setCustomerId, type: 'text', placeholder: 'cus_...' },
            { label: 'Client ID', value: clientId, set: setClientId, type: 'text', placeholder: 'uber_client_...' },
          ].map(({ label, value, set, type, placeholder }) => (
            <div key={label}>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">{label}</label>
              <input
                type={type}
                value={value}
                onChange={e => set(e.target.value)}
                placeholder={placeholder}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange/30 transition-all placeholder:text-gray-400"
              />
            </div>
          ))}

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Client Secret</label>
            <div className="relative">
              <input
                type={showSecret ? 'text' : 'password'}
                value={clientSecret}
                onChange={e => setClientSecret(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-4 py-2.5 pr-12 bg-gray-50 border border-gray-200 rounded-2xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange/30 transition-all placeholder:text-gray-400"
              />
              <button
                onClick={() => setShowSecret(!showSecret)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Webhook URL (read-only)</label>
            <div className="flex gap-2">
              <input
                readOnly
                value={webhookUrl}
                className="flex-1 px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-2xl text-sm text-gray-500 font-mono select-all"
              />
              <button
                onClick={copyWebhook}
                className="px-3 py-2.5 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-2xl text-gray-500 transition-colors"
                title="Copy webhook URL"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[10px] text-gray-400 mt-1">Add this URL in your Uber Direct developer dashboard.</p>
          </div>

          {testResult && (
            <div className={cn(
              'flex items-center gap-2 px-4 py-3 rounded-2xl text-xs font-medium',
              testResult.success ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-600'
            )}>
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              {testResult.message}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleTest}
              disabled={isTesting}
              className="h-10 px-5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm rounded-2xl transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isTesting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {isTesting ? 'Testing...' : 'Test Connection'}
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="h-10 px-6 bg-brand-orange hover:bg-brand-orange/90 text-white font-semibold text-sm rounded-2xl shadow-[0_4px_12px_rgba(245,124,0,0.25)] transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {isSaving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
          {saveResult && <p className="text-xs text-emerald-600">{saveResult}</p>}
        </div>
      )}
    </div>
  )
}

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

          {activeSection === 'integrations' && (
            <div className="space-y-5">
              <div className="text-base font-bold text-gray-900 normal-case not-italic font-work-sans">Delivery Integrations</div>
              <p className="text-xs text-gray-400">Connect third-party delivery services to dispatch orders directly from your dashboard.</p>
              <div className="divide-y divide-gray-100">
                <div className="py-4">
                  <UberDirectSettings />
                </div>
              </div>
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
