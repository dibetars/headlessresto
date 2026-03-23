'use client'

import React, { useState, useEffect, useTransition } from 'react'
import { Store, ChevronRight, Calendar, Users } from 'lucide-react'
import { getOrganizations, setOrganizationFeature } from '@/app/auth/actions'
import { cn } from '@/lib/utils'

const FEATURES: { key: string; label: string; description: string }[] = [
  { key: 'pos',          label: 'POS Terminal',       description: 'Point-of-sale order taking' },
  { key: 'kds',          label: 'Kitchen Display',    description: 'Real-time kitchen order screen' },
  { key: 'orders',       label: 'Orders',             description: 'Order management & history' },
  { key: 'reservations', label: 'Reservations',       description: 'Table booking system' },
  { key: 'inventory',    label: 'Inventory',          description: 'Stock tracking & alerts' },
  { key: 'analytics',    label: 'Analytics',          description: 'Revenue & performance reports' },
  { key: 'staff',        label: 'Staff Management',   description: 'Team roles & permissions' },
]

function getFeatures(brandAssets: any): Record<string, boolean> {
  const saved = brandAssets?.features || {}
  // Default all features ON if not explicitly set
  return Object.fromEntries(FEATURES.map(f => [f.key, saved[f.key] !== false]))
}

function FeatureToggle({
  label, description, enabled, onChange, disabled
}: { label: string; description: string; enabled: boolean; onChange: (v: boolean) => void; disabled: boolean }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div>
        <p className="text-sm font-semibold text-gray-800">{label}</p>
        <p className="text-xs text-gray-400 mt-0.5">{description}</p>
      </div>
      <button
        disabled={disabled}
        onClick={() => onChange(!enabled)}
        className={cn(
          'relative w-10 h-5 rounded-full transition-colors duration-200 shrink-0 ml-4 disabled:opacity-60',
          enabled ? 'bg-brand-orange' : 'bg-gray-200'
        )}
      >
        <span className={cn(
          'absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200',
          enabled ? 'translate-x-5' : 'translate-x-0'
        )} />
      </button>
    </div>
  )
}

export default function RestaurantsPage() {
  const [orgs, setOrgs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [features, setFeatures] = useState<Record<string, Record<string, boolean>>>({})
  const [isPending, startTransition] = useTransition()
  const [savingKey, setSavingKey] = useState<string | null>(null)

  useEffect(() => {
    getOrganizations().then(data => {
      setOrgs(data)
      const initial: Record<string, Record<string, boolean>> = {}
      data.forEach((o: any) => { initial[o.id] = getFeatures(o.brand_assets) })
      setFeatures(initial)
      setLoading(false)
    })
  }, [])

  const handleToggle = (orgId: string, featureKey: string, enabled: boolean) => {
    // Optimistic update
    setFeatures(prev => ({
      ...prev,
      [orgId]: { ...prev[orgId], [featureKey]: enabled }
    }))
    setSavingKey(`${orgId}-${featureKey}`)
    startTransition(async () => {
      try {
        await setOrganizationFeature(orgId, featureKey, enabled)
      } catch {
        // Revert on failure
        setFeatures(prev => ({
          ...prev,
          [orgId]: { ...prev[orgId], [featureKey]: !enabled }
        }))
      } finally {
        setSavingKey(null)
      }
    })
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-700">

      {/* Header */}
      <div className="pb-4 border-b border-gray-200/80">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-orange/10 text-brand-orange text-xs font-semibold mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-orange" />
          Super Admin
        </div>
        <div className="text-2xl font-bold text-gray-900 tracking-tight normal-case not-italic font-work-sans">Restaurants</div>
        <p className="text-sm text-gray-500 mt-1">Manage all registered restaurants and their feature access</p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-8 h-8 border-4 border-brand-orange/20 border-t-brand-orange rounded-full animate-spin" />
          <p className="text-sm text-gray-400">Loading restaurants…</p>
        </div>
      ) : orgs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center">
            <Store className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-sm font-semibold text-gray-600">No restaurants yet</p>
          <p className="text-xs text-gray-400">Restaurants will appear here after sign-up</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orgs.map(org => {
            const isOpen = expanded === org.id
            const orgFeatures = features[org.id] || {}
            const enabledCount = FEATURES.filter(f => orgFeatures[f.key] !== false).length

            return (
              <div
                key={org.id}
                className="bg-white rounded-3xl border border-black/[0.04] shadow-[0_2px_12px_rgba(0,0,0,0.06)] overflow-hidden"
              >
                {/* Row */}
                <button
                  onClick={() => setExpanded(isOpen ? null : org.id)}
                  className="w-full flex items-center gap-4 px-6 py-5 hover:bg-gray-50/60 transition-colors text-left"
                >
                  <div className="w-10 h-10 bg-brand-orange/10 rounded-2xl flex items-center justify-center shrink-0">
                    <Store className="w-4.5 h-4.5 text-brand-orange" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 truncate">{org.name}</div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-gray-400">/{org.slug}</span>
                      <span className="w-1 h-1 rounded-full bg-gray-300" />
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(org.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className={cn(
                      'text-xs font-semibold px-2.5 py-1 rounded-full',
                      enabledCount === FEATURES.length
                        ? 'bg-emerald-50 text-emerald-600'
                        : enabledCount === 0
                        ? 'bg-red-50 text-red-500'
                        : 'bg-amber-50 text-amber-600'
                    )}>
                      {enabledCount}/{FEATURES.length} features
                    </div>
                    <ChevronRight className={cn('w-4 h-4 text-gray-300 transition-transform duration-200', isOpen && 'rotate-90')} />
                  </div>
                </button>

                {/* Feature panel */}
                {isOpen && (
                  <div className="px-6 pb-5 pt-1 border-t border-gray-100 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Feature Access</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => FEATURES.forEach(f => handleToggle(org.id, f.key, true))}
                          className="text-xs font-semibold text-brand-orange hover:underline"
                        >
                          Enable all
                        </button>
                        <span className="text-gray-300">·</span>
                        <button
                          onClick={() => FEATURES.forEach(f => handleToggle(org.id, f.key, false))}
                          className="text-xs font-semibold text-gray-400 hover:text-gray-600 hover:underline"
                        >
                          Disable all
                        </button>
                      </div>
                    </div>
                    {FEATURES.map(f => (
                      <FeatureToggle
                        key={f.key}
                        label={f.label}
                        description={f.description}
                        enabled={orgFeatures[f.key] !== false}
                        onChange={(v) => handleToggle(org.id, f.key, v)}
                        disabled={savingKey === `${org.id}-${f.key}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
