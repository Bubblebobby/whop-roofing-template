import { track } from '#/lib/track'
import { PhoneIcon } from './Icons'
import { telHref } from './SiteHeader'

/** Sticky call / estimate bar on phones, where most roofing leads come from. */
export function MobileActionBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 gap-2 border-t border-stone-200 bg-white/95 p-3 backdrop-blur md:hidden">
      <a
        href={telHref()}
        onClick={() => track('contact', { method: 'phone', location: 'mobile_bar' })}
        className="btn-dark"
      >
        <PhoneIcon className="h-4 w-4" /> Call now
      </a>
      <a href="/#estimate" className="btn-primary">
        Free estimate
      </a>
    </div>
  )
}
