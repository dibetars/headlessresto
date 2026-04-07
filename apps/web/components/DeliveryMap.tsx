'use client'

import { useState } from 'react'

interface DeliveryMapProps {
  /** demo = animated OSM map with moving driver dot
   *  live  = Uber iframe if trackingUrl present, else waiting state */
  mode: 'demo' | 'live'
  /** Uber Direct tracking URL (live mode) */
  trackingUrl?: string
  /** 0-4 step index — moves the demo driver dot along the route */
  step?: number
  /** Brand colour for accents */
  primaryColor?: string
}

// Predefined driver dot positions (left%, top%) keyed by step 0-4
// Mapped against an OSM embed centered on ~Mission/SoMa SF
const DRIVER_POS: [number, number][] = [
  [18, 28],  // step 0 – Order Received (at restaurant)
  [18, 28],  // step 1 – Preparing      (still at restaurant)
  [38, 42],  // step 2 – Ready          (driver heading to pick up)
  [58, 56],  // step 3 – Out for delivery
  [78, 68],  // step 4 – Delivered      (at customer)
]

const ETA_BY_STEP = ['25–35 min', '20–30 min', '15–20 min', '5–10 min', 'Arrived!']

const PULSE_CSS = `
@keyframes dm-pulse {
  0%,100% { box-shadow: 0 0 0 0 rgba(59,130,246,0.5); }
  50%      { box-shadow: 0 0 0 10px rgba(59,130,246,0); }
}
@keyframes dm-ripple {
  0%   { transform: scale(1); opacity: 0.6; }
  100% { transform: scale(2.8); opacity: 0; }
}
@keyframes dm-spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
`

// OSM embed — Mission/SoMa SF bounding box
const OSM_URL =
  'https://www.openstreetmap.org/export/embed.html' +
  '?bbox=-122.4260,37.7700,-122.4020,37.7870&layer=mapnik'

/* ── Demo Map ─────────────────────────────────────────────────── */
function DemoMap({ step = 0, primaryColor = '#FF6B00' }: { step: number; primaryColor?: string }) {
  const [left, top] = DRIVER_POS[Math.min(step, 4)]
  const eta = ETA_BY_STEP[Math.min(step, 4)]
  const delivered = step >= 4

  return (
    <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', height: 260 }}>
      <style>{PULSE_CSS}</style>

      {/* OSM iframe base */}
      <iframe
        src={OSM_URL}
        title="Delivery map"
        style={{ width: '100%', height: '100%', border: 'none', display: 'block', pointerEvents: 'none' }}
        loading="lazy"
      />

      {/* Destination pin */}
      <div style={{
        position: 'absolute', left: '78%', top: '68%',
        transform: 'translate(-50%, -100%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        zIndex: 3,
      }}>
        <div style={{
          background: primaryColor, color: '#fff', fontSize: 10, fontWeight: 900,
          padding: '3px 8px', borderRadius: 6, whiteSpace: 'nowrap', marginBottom: 2,
          boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
        }}>
          📍 You
        </div>
        <div style={{ width: 2, height: 8, background: primaryColor }} />
      </div>

      {/* Driver dot */}
      <div style={{
        position: 'absolute',
        left: `${left}%`, top: `${top}%`,
        transform: 'translate(-50%, -50%)',
        zIndex: 4,
        transition: 'left 1.8s ease-in-out, top 1.8s ease-in-out',
      }}>
        {/* Ripple */}
        {!delivered && (
          <div style={{
            position: 'absolute', inset: -6, borderRadius: 999,
            border: '2px solid rgba(59,130,246,0.5)',
            animation: 'dm-ripple 1.4s ease-out infinite',
          }} />
        )}
        {/* Dot */}
        <div style={{
          width: 32, height: 32, borderRadius: 999,
          background: delivered ? '#22c55e' : '#3b82f6',
          border: '3px solid #fff',
          boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14,
          animation: delivered ? 'none' : 'dm-pulse 1.4s ease-in-out infinite',
        }}>
          {delivered ? '✓' : '🛵'}
        </div>
      </div>

      {/* ETA chip */}
      <div style={{
        position: 'absolute', bottom: 12, left: 12, right: 12,
        background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(8px)',
        borderRadius: 12, padding: '10px 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        zIndex: 5,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: 999, background: delivered ? '#22c55e' : '#3b82f6', boxShadow: delivered ? '0 0 6px #22c55e' : '0 0 6px #3b82f6' }} />
          <span style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>
            {delivered ? 'Delivered!' : 'Driver en route'}
          </span>
        </div>
        <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 600 }}>
          {delivered ? '🎉' : `ETA ${eta}`}
        </span>
      </div>

      {/* DEMO watermark */}
      <div style={{
        position: 'absolute', top: 10, right: 10,
        background: 'rgba(0,0,0,0.55)', color: 'rgba(255,255,255,0.6)',
        fontSize: 10, fontWeight: 800, padding: '2px 7px', borderRadius: 5,
        letterSpacing: 1, textTransform: 'uppercase', zIndex: 5,
      }}>
        DEMO
      </div>
    </div>
  )
}

/* ── Live Map ─────────────────────────────────────────────────── */
function LiveMap({ trackingUrl, primaryColor = '#FF6B00' }: { trackingUrl: string; primaryColor?: string }) {
  const [iframeBlocked, setIframeBlocked] = useState(false)

  // Uber may send X-Frame-Options: DENY — detect via load error timing
  const handleLoad = () => {
    // If iframe loaded but is blank (blocked), contentDocument will throw
    // We can't detect cross-origin blocks reliably, so show button fallback too
  }

  return (
    <div style={{ borderRadius: 16, overflow: 'hidden', position: 'relative' }}>
      {!iframeBlocked && (
        <iframe
          src={trackingUrl}
          title="Live delivery tracking"
          style={{ width: '100%', height: 300, border: 'none', display: 'block' }}
          onError={() => setIframeBlocked(true)}
          onLoad={handleLoad}
          allow="geolocation"
        />
      )}
      <a
        href={trackingUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          background: primaryColor, color: '#fff', textDecoration: 'none',
          padding: '14px', fontWeight: 800, fontSize: 14,
          borderTop: iframeBlocked ? 'none' : '1px solid rgba(0,0,0,0.08)',
        }}
      >
        🗺️ Open Live Tracking →
      </a>
    </div>
  )
}

/* ── Waiting for Driver ────────────────────────────────────────── */
function WaitingMap() {
  return (
    <div style={{
      height: 160, borderRadius: 16, background: '#f1f5f9',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12,
    }}>
      <style>{PULSE_CSS}</style>
      <div style={{ width: 40, height: 40, borderRadius: 999, border: '4px solid #e2e8f0', borderTopColor: '#3b82f6', animation: 'dm-spin 0.9s linear infinite' }} />
      <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#64748b' }}>Finding your driver...</p>
    </div>
  )
}

/* ── Public export ─────────────────────────────────────────────── */
export function DeliveryMap({ mode, trackingUrl, step = 0, primaryColor = '#FF6B00' }: DeliveryMapProps) {
  if (mode === 'demo') {
    return <DemoMap step={step} primaryColor={primaryColor} />
  }
  if (trackingUrl) {
    return <LiveMap trackingUrl={trackingUrl} primaryColor={primaryColor} />
  }
  return <WaitingMap />
}
