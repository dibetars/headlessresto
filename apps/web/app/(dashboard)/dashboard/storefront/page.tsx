'use client'

import React from 'react'
import { Globe, Palette, ExternalLink } from 'lucide-react'

export default function StorefrontPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Storefront</h1>
        <p className="text-sm text-gray-500 mt-1">Customise your public menu page and delivery settings.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-3xl p-6 border border-black/[0.04] shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
          <div className="w-10 h-10 bg-brand-orange/10 rounded-2xl flex items-center justify-center mb-4">
            <Palette className="w-5 h-5 text-brand-orange" />
          </div>
          <h2 className="text-base font-bold text-gray-900 mb-1">Template Engine</h2>
          <p className="text-sm text-gray-500">Choose and customise a high-conversion menu template for your customers.</p>
          <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-brand-orange bg-brand-orange/10 px-3 py-1.5 rounded-full">
            Coming soon
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-black/[0.04] shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
          <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
            <Globe className="w-5 h-5 text-blue-500" />
          </div>
          <h2 className="text-base font-bold text-gray-900 mb-1">Public Menu Page</h2>
          <p className="text-sm text-gray-500">Your customer-facing ordering page. Share the link or embed it anywhere.</p>
          <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-500 bg-blue-50 px-3 py-1.5 rounded-full">
            <ExternalLink className="w-3 h-3" />
            Coming soon
          </div>
        </div>
      </div>
    </div>
  )
}
