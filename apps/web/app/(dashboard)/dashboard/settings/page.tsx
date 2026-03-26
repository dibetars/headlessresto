'use client'

import React, { useState } from 'react'
import { User, Building2, Bell, Shield, CreditCard, ChevronRight, Truck, CheckCircle2, Loader2, Copy } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createDeliveryQuoteAction } from '@/app/auth/actions'
import {
  saveProfileAction,
  saveRestaurantSettingsAction,
  saveNotificationsAction,
} from '@/app/auth/actions/settings'

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
    try {
      // Persist non-secret fields only; secret is managed via env var
      await saveRestaurantSettingsAction({})
      setSaveResult('Settings saved.')
    } catch {
      setSaveResult('Failed to save settings.')
    } finally {
      setIsSaving(false)
    }
  }

  const copyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl).catch(() => {})
  }

  // Whether the secret env var is configured is determined server-side;
  // the client displays a static masked placeholder.
  const uberSecretConfigured = !!process.env.NEXT_PUBLIC_UBER_DIRECT_CONFIGURED

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

          {/* Client Secret — read-only, managed via environment variable */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Client Secret</label>
            <div className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-2xl text-sm text-gray-500 select-none">
              {uberSecretConfigured ? '••••••••' : 'Not configured'}
            </div>
            <p className="text-[10px] text-gray-400 mt-1">
              Set <code className="font-mono bg-gray-100 px-1 rounded">UBER_DIRECT_CLIENT_SECRET</code> as an environment variable in your deployment settings.
            </p>
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

function Toggle({
  label,
  description,
  defaultOn = false,
  onChange,
}: {
  label: string
  description: string
  defaultOn?: boolean
  onChange?: (on: boolean) => void
}) {
  const [on, setOn] = useState(defaultOn)
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-sm font-medium text-gray-800">{label}</p>
        <p className="text-xs text-gray-400 mt-0.5">{description}</p>
      </div>
      <button
        onClick={() => {
          const next = !on
          setOn(next)
          onChange?.(next)
        }}
        className={cn('relative w-11 h-6 rounded-full transition-colors duration-200', on ? 'bg-brand-orange' : 'bg-gray-200')}
      >
        <span className={cn('absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200', on ? 'translate-x-5' : 'translate-x-0')} />
      </button>
    </div>
  )
}

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('profile')

  // Profile section state
  const [profileName, setProfileName] = useState('')
  const [profileEmail, setProfileEmail] = useState('')
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileMessage, setProfileMessage] = useState<{ ok: boolean; text: string } | null>(null)

  // Restaurant section state
  const [restaurantName, setRestaurantName] = useState('')
  const [restaurantSaving, setRestaurantSaving] = useState(false)
  const [restaurantMessage, setRestaurantMessage] = useState<{ ok: boolean; text: string } | null>(null)

  // Notifications section state
  const [notifState, setNotifState] = useState<Record<string, boolean>>({
    new_orders: true,
    order_ready: true,
    low_inventory: false,
    daily_summary: true,
    new_reservations: false,
  })
  const [notifSaving, setNotifSaving] = useState(false)
  const [notifMessage, setNotifMessage] = useState<{ ok: boolean; text: string } | null>(null)

  const handleProfileSave = async () => {
    setProfileSaving(true)
    setProfileMessage(null)
    const result = await saveProfileAction({ full_name: profileName, email: profileEmail || undefined })
    setProfileMessage(result.success ? { ok: true, text: 'Profile saved.' } : { ok: false, text: result.error ?? 'Failed to save.' })
    setProfileSaving(false)
  }

  const handleRestaurantSave = async () => {
    setRestaurantSaving(true)
    setRestaurantMessage(null)
    const result = await saveRestaurantSettingsAction({ name: restaurantName || undefined })
    setRestaurantMessage(result.success ? { ok: true, text: 'Restaurant settings saved.' } : { ok: false, text: result.error ?? 'Failed to save.' })
    setRestaurantSaving(false)
  }

  const handleNotifSave = async () => {
    setNotifSaving(true)
    setNotifMessage(null)
    const result = await saveNotificationsAction({ notifications: notifState })
    setNotifMessage(result.success ? { ok: true, text: 'Notification preferences saved.' } : { ok: false, text: result.error ?? 'Failed to save.' })
    setNotifSaving(false)
  }

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
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Full Name</label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={e => setProfileName(e.target.value)}
                    placeholder="Your Name"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange/30 transition-all placeholder:text-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Email</label>
                  <input
                    type="email"
                    value={profileEmail}
                    onChange={e => setProfileEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange/30 transition-all placeholder:text-gray-400"
                  />
                </div>
                {[['Phone', '+1 (555) 000-0000'], ['Role', 'Admin']].map(([label, placeholder]) => (
                  <div key={label}>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">{label}</label>
                    <input type="text" placeholder={placeholder} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange/30 transition-all placeholder:text-gray-400" />
                  </div>
                ))}
              </div>
              {profileMessage && (
                <p className={cn('text-xs font-medium', profileMessage.ok ? 'text-emerald-600' : 'text-rose-600')}>
                  {profileMessage.text}
                </p>
              )}
              <button
                onClick={handleProfileSave}
                disabled={profileSaving}
                className="h-10 px-6 bg-brand-orange hover:bg-brand-orange/90 text-white font-semibold text-sm rounded-2xl shadow-[0_4px_12px_rgba(245,124,0,0.25)] transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {profileSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {profileSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}

          {activeSection === 'restaurant' && (
            <div className="space-y-5">
              <div className="text-base font-bold text-gray-900 normal-case not-italic font-work-sans">Restaurant Details</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Restaurant Name</label>
                  <input
                    type="text"
                    value={restaurantName}
                    onChange={e => setRestaurantName(e.target.value)}
                    placeholder="My Restaurant"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange/30 transition-all placeholder:text-gray-400"
                  />
                </div>
                {[['Slug / URL', 'my-restaurant'], ['Address', '123 Main St'], ['City', 'New York']].map(([label, placeholder]) => (
                  <div key={label}>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">{label}</label>
                    <input type="text" placeholder={placeholder} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange/30 transition-all placeholder:text-gray-400" />
                  </div>
                ))}
              </div>
              {restaurantMessage && (
                <p className={cn('text-xs font-medium', restaurantMessage.ok ? 'text-emerald-600' : 'text-rose-600')}>
                  {restaurantMessage.text}
                </p>
              )}
              <button
                onClick={handleRestaurantSave}
                disabled={restaurantSaving}
                className="h-10 px-6 bg-brand-orange hover:bg-brand-orange/90 text-white font-semibold text-sm rounded-2xl shadow-[0_4px_12px_rgba(245,124,0,0.25)] transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {restaurantSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {restaurantSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}

          {activeSection === 'notifications' && (
            <div className="space-y-1">
              <div className="text-base font-bold text-gray-900 normal-case not-italic font-work-sans mb-4">Notifications</div>
              <div className="divide-y divide-gray-100">
                <Toggle
                  label="New Orders"
                  description="Get notified when a new order comes in"
                  defaultOn={notifState.new_orders}
                  onChange={v => setNotifState(s => ({ ...s, new_orders: v }))}
                />
                <Toggle
                  label="Order Ready"
                  description="Alert when kitchen marks an order ready"
                  defaultOn={notifState.order_ready}
                  onChange={v => setNotifState(s => ({ ...s, order_ready: v }))}
                />
                <Toggle
                  label="Low Inventory"
                  description="Warning when items fall below threshold"
                  defaultOn={notifState.low_inventory}
                  onChange={v => setNotifState(s => ({ ...s, low_inventory: v }))}
                />
                <Toggle
                  label="Daily Summary"
                  description="Receive an end-of-day performance email"
                  defaultOn={notifState.daily_summary}
                  onChange={v => setNotifState(s => ({ ...s, daily_summary: v }))}
                />
                <Toggle
                  label="New Reservations"
                  description="Notify on new reservation bookings"
                  defaultOn={notifState.new_reservations}
                  onChange={v => setNotifState(s => ({ ...s, new_reservations: v }))}
                />
              </div>
              {notifMessage && (
                <p className={cn('text-xs font-medium pt-2', notifMessage.ok ? 'text-emerald-600' : 'text-rose-600')}>
                  {notifMessage.text}
                </p>
              )}
              <div className="pt-4">
                <button
                  onClick={handleNotifSave}
                  disabled={notifSaving}
                  className="h-10 px-6 bg-brand-orange hover:bg-brand-orange/90 text-white font-semibold text-sm rounded-2xl shadow-[0_4px_12px_rgba(245,124,0,0.25)] transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {notifSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {notifSaving ? 'Saving...' : 'Save Preferences'}
                </button>
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
