import { NavLink } from 'react-router-dom'
import { IconBandage, IconBook, IconCalendar, IconChart, IconSmiley } from '@/ui/components/doodles'
import type { ComponentType, SVGProps } from 'react'

const items: { to: string; label: string; icon: ComponentType<SVGProps<SVGSVGElement>> }[] = [
  { to: '/', label: '今日', icon: IconCalendar },
  { to: '/books', label: '词书', icon: IconBook },
  { to: '/wrong', label: '错题', icon: IconBandage },
  { to: '/stats', label: '统计', icon: IconChart },
  { to: '/settings', label: '我的', icon: IconSmiley },
]

export function BottomNav() {
  return (
    <nav className="sticky bottom-0 z-20 border-t-2 border-dashed border-ink/15 bg-paper/95 px-2 pb-[max(0.6rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur">
      <div className="grid grid-cols-5">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 rounded-2xl py-1 text-[11px] transition-colors ${
                isActive ? 'font-semibold text-coral' : 'text-muted'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={`h-6 w-6 transition-transform ${isActive ? 'scale-110' : ''}`} />
                {item.label}
                <span className={`h-1 w-4 rounded-full ${isActive ? 'bg-coral' : 'bg-transparent'}`} />
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
