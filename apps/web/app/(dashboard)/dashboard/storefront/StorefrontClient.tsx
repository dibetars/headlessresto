'use client'

import React, { useState, useTransition } from 'react'
import { ExternalLink, Check, Loader2 } from 'lucide-react'
import { saveStorefrontSettingsAction } from '@/app/auth/actions/settings'

interface Props {
  slug: string
  initialTemplate: string
  initialPrimaryColor: string
  initialHeroText: string
}

const TEMPLATES = [
  {
    id: 'bold',
    name: 'Bold',
    description: 'High-impact dark design with orange accents and a full-bleed hero. Perfect for fast-casual.',
    palette: ['#111111', '#FF6B00', '#1c1c1c', '#ffffff'],
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Clean white canvas with generous whitespace and a 3-column grid. Suits upscale dining.',
    palette: ['#ffffff', '#000000', '#f5f5f5', '#888888'],
  },
  {
    id: 'warm',
    name: 'Warm',
    description: 'Cosy cream tones with a serif typeface and masonry layout. Ideal for cafes and bakeries.',
    palette: ['#FAF7F2', '#C17C3A', '#FFF8F0', '#3d2b1f'],
  },
]

export default function StorefrontClient({ slug, initialTemplate, initialPrimaryColor, initialHeroText }: Props) {
  const [selectedTemplate, setSelectedTemplate] = useState(initialTemplate)
  const [primaryColor, setPrimaryColor] = useState(initialPrimaryColor)
  const [heroText, setHeroText] = useState(initialHeroText)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleSave = async (overrides?: { template?: string }) => {
    setError(null)
    setSaved(false)
    startTransition(async () => {
      const result = await saveStorefrontSettingsAction({
        template: overrides?.template ?? selectedTemplate,
        primary_color: primaryColor,
        hero_text: heroText,
      })
      if (result.success) {
        setSaved(true)
        setTimeout(() => setSaved(false), 2500)
      } else {
        setError(result.error ?? 'Something went wrong')
      }
    })
  }

  const handleTemplateSelect = (id: string) => {
    setSelectedTemplate(id)
    handleSave({ template: id })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Storefront</h1>
        <p className="text-sm text-gray-500 mt-1">Choose a template and customise your public menu page.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Template Picker */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-base font-semibold text-gray-800">Choose a Template</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {TEMPLATES.map(t => (
              <button
                key={t.id}
                onClick={() => handleTemplateSelect(t.id)}
                className={[
                  'text-left p-4 rounded-2xl border-2 transition-all focus:outline-none',
                  selectedTemplate === t.id
                    ? 'border-brand-orange ring-2 ring-brand-orange/20 bg-orange-50/40'
                    : 'border-black/[0.06] bg-white hover:border-black/20',
                ].join(' ')}
              >
                {/* Colour Swatches */}
                <div className="flex gap-1.5 mb-3">
                  {t.palette.map((color, i) => (
                    <div
                      key={i}
                      style={{ background: color }}
                      className="w-6 h-6 rounded-full border border-black/10"
                    />
                  ))}
                </div>
                <p className="font-bold text-gray-900 text-sm mb-1">{t.name}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{t.description}</p>
                {selectedTemplate === t.id && (
                  <div className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-brand-orange">
                    <Check className="w-3.5 h-3.5" /> Selected
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Customisation */}
        <div className="bg-white rounded-3xl border border-black/[0.04] shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-6 space-y-5">
          <h2 className="text-base font-semibold text-gray-800">Customise</h2>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Hero Text</label>
            <input
              type="text"
              value={heroText}
              onChange={e => setHeroText(e.target.value)}
              placeholder="e.g. Order Fresh, Delivered Fast"
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange/50 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Primary Colour</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={primaryColor}
                onChange={e => setPrimaryColor(e.target.value)}
                className="w-10 h-10 rounded-lg border border-slate-200 cursor-pointer p-0.5 bg-white"
              />
              <span className="text-sm font-mono text-gray-600">{primaryColor}</span>
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-500 font-medium">{error}</p>
          )}

          <div className="flex flex-col gap-3 pt-1">
            <button
              onClick={() => handleSave()}
              disabled={isPending}
              className="w-full py-2.5 px-4 rounded-xl bg-brand-orange text-white text-sm font-semibold transition-all hover:bg-orange-600 active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isPending ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
              ) : saved ? (
                <><Check className="w-4 h-4" /> Saved!</>
              ) : (
                'Save Changes'
              )}
            </button>

            {slug && (
              <a
                href={`/menu/${slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 rounded-xl border border-slate-200 text-sm font-semibold text-gray-600 hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-4 h-4" /> Preview Menu
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
