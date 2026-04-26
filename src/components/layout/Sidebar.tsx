'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Bot,
  CreditCard,
  ClipboardList,
  TrendingUp,
  BookOpen,
  ScanLine,
  Zap,
  Users,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Activity,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore, selectUser } from '@/store/auth'
import { Separator } from '@/components/ui/separator'

interface NavItem {
  label:  string
  href:   string
  icon:   React.ElementType
  role?:  string
}

interface NavGroup {
  title:  string
  items:  NavItem[]
}

const NAV_GROUPS: NavGroup[] = [
  {
    title: 'Overview',
    items: [
      { label: 'Dashboard',  href: '/dashboard',         icon: LayoutDashboard },
    ],
  },
  {
    title: 'Trading',
    items: [
      { label: 'Bots',             href: '/bots',             icon: Bot },
      { label: 'Accounts',         href: '/trading-accounts', icon: CreditCard },
      { label: 'Orders',           href: '/orders',           icon: ClipboardList },
      { label: 'Trades',           href: '/trades',           icon: TrendingUp },
    ],
  },
  {
    title: 'Market',
    items: [
      { label: 'Instruments', href: '/instruments', icon: BookOpen },
      { label: 'Screener',    href: '/screener',    icon: ScanLine },
    ],
  },
  {
    title: 'Strategies',
    items: [
      { label: 'Strategies',  href: '/strategies',  icon: Zap },
    ],
  },
  {
    title: 'Admin',
    items: [
      { label: 'Users',       href: '/users',       icon: Users,       role: 'admin' },
      { label: 'Roles',       href: '/roles',       icon: ShieldCheck, role: 'admin' },
    ],
  },
]

interface SidebarProps {
  collapsed:     boolean
  onToggle:      () => void
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname()
  const user     = useAuthStore(selectUser)
  const roles    = user?.roles ?? []

  return (
    <aside
      className={cn(
        'flex flex-col h-full bg-sidebar border-r border-sidebar-border',
        'transition-all duration-300 ease-out',
        collapsed ? 'w-14' : 'w-56',
      )}
    >
      {/* Brand */}
      <div
        className={cn(
          'flex items-center h-14 border-b border-sidebar-border shrink-0',
          collapsed ? 'justify-center px-0' : 'px-4 gap-2',
        )}
      >
        <Activity className="h-5 w-5 text-primary shrink-0" />
        {!collapsed && (
          <span className="text-sm font-bold tracking-tight text-foreground">
            CypherTrade
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {NAV_GROUPS.map((group) => {
          const visibleItems = group.items.filter(
            (item) => !item.role || roles.includes(item.role),
          )
          if (visibleItems.length === 0) return null

          return (
            <div key={group.title} className="space-y-0.5">
              {!collapsed && (
                <p className="px-2 pb-1 text-2xs font-semibold uppercase tracking-widest text-sidebar-foreground/50">
                  {group.title}
                </p>
              )}
              {collapsed && <Separator className="bg-sidebar-border mx-1 mb-1" />}
              {visibleItems.map((item) => {
                const Icon      = item.icon
                const isActive  = pathname === item.href || pathname.startsWith(`${item.href}/`)

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    className={cn(
                      'flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors',
                      'focus-ring',
                      isActive
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                        : 'text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground',
                      collapsed && 'justify-center px-0 py-2 w-full',
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                )
              })}
            </div>
          )
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="shrink-0 p-2 border-t border-sidebar-border">
        <button
          onClick={onToggle}
          className={cn(
            'flex items-center justify-center w-full rounded-md p-1.5 text-sidebar-foreground/60',
            'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors',
            'focus-ring',
          )}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>
    </aside>
  )
}
