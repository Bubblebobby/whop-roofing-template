import { useEffect, useState } from 'react'
import { TRACK_EVENT } from '#/lib/track'

type Entry = NonNullable<Window['__roofTrackLog']>[number]

const KEY = 'roof:track-debug'

/**
 * Pixel event inspector. Open any page with `?debug=1` (remembered for the
 * session) to watch whop.track calls fire, for demos and QA. Hidden otherwise.
 */
export function TrackDebugPanel() {
  const [enabled, setEnabled] = useState(false)
  const [entries, setEntries] = useState<Entry[]>([])
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    let on = false
    try {
      if (params.get('debug') === '1') sessionStorage.setItem(KEY, '1')
      if (params.get('debug') === '0') sessionStorage.removeItem(KEY)
      on = sessionStorage.getItem(KEY) === '1'
    } catch {
      on = params.get('debug') === '1'
    }
    setEnabled(on)
    setCollapsed(window.innerWidth < 768)
    setEntries(window.__roofTrackLog ?? [])
    const onTrack = () => setEntries([...(window.__roofTrackLog ?? [])])
    window.addEventListener(TRACK_EVENT, onTrack)
    return () => window.removeEventListener(TRACK_EVENT, onTrack)
  }, [])

  if (!enabled) return null
  const pixel = typeof window !== 'undefined' && !!window.whop

  return (
    <div className="fixed bottom-20 right-3 z-50 w-[min(22rem,calc(100vw-1.5rem))] overflow-hidden rounded-xl border border-slate-700 bg-slate-900 font-mono text-[11px] text-slate-200 shadow-2xl md:bottom-4">
      <button
        type="button"
        onClick={() => setCollapsed((c) => !c)}
        className="flex w-full items-center justify-between gap-2 bg-slate-800 px-3 py-2 text-left"
      >
        <span className="font-semibold">whop.track · {entries.length} events</span>
        <span className={pixel ? 'text-emerald-400' : 'text-amber-400'}>{pixel ? '● pixel live' : '● no pixel (local)'}</span>
      </button>
      {!collapsed && (
        <ol className="max-h-64 space-y-1.5 overflow-y-auto p-3">
          {entries.length === 0 && <li className="text-slate-500">No custom events yet. Open a service or submit the form.</li>}
          {[...entries].reverse().map((e, i) => (
            <li key={`${e.at}-${i}`} className="rounded bg-slate-800/60 px-2 py-1.5">
              <div className="flex justify-between gap-2">
                <span className="font-semibold text-orange-300">{e.name}</span>
                <span className="text-slate-500">{new Date(e.at).toLocaleTimeString()}</span>
              </div>
              <div className="truncate text-slate-400">{JSON.stringify(e.props)}</div>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
