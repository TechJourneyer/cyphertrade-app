'use client'

import { LogOut, User, Settings, Bell, ChevronsUpDown, Plus } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useTradingAccount } from '@/hooks/useTradingAccount'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface TopbarProps {
  className?: string
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? '')
    .join('')
}

export function Topbar({ className }: TopbarProps) {
  const { user, logout } = useAuth()
  const { accounts, activeAccount, setActiveAccountId, hasAccounts, isLoading: accountsLoading } = useTradingAccount()

  return (
    <header
      className={cn(
        'h-14 flex items-center justify-between gap-2 px-4',
        'bg-background border-b border-border shrink-0',
        className,
      )}
    >
      {/* Left — Trading Account Switcher */}
      <div className="flex items-center">
        {accountsLoading ? (
          <Skeleton className="h-7 w-36" />
        ) : !hasAccounts ? (
          <Link
            href="/trading-accounts"
            className="flex items-center gap-1.5 rounded-md border border-warning/30 bg-warning/10 px-2.5 py-1 text-xs font-medium text-warning hover:bg-warning/20 transition-colors"
          >
            <Plus className="h-3 w-3" />
            Add Trading Account
          </Link>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm hover:bg-secondary transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                <span
                  className={cn(
                    'h-2 w-2 rounded-full shrink-0',
                    activeAccount?.status === 'active' ? 'bg-success' : 'bg-muted-foreground',
                  )}
                />
                <span className="max-w-[160px] truncate text-xs font-medium text-foreground">
                  {activeAccount?.account_name ?? 'Select Account'}
                </span>
                <ChevronsUpDown className="h-3 w-3 text-muted-foreground shrink-0" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-60">
              <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                Switch Trading Account
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {accounts.map((acc) => (
                <DropdownMenuItem
                  key={acc.id}
                  onClick={() => setActiveAccountId(acc.id)}
                  className={cn(
                    'flex items-center gap-2',
                    acc.id === activeAccount?.id && 'bg-secondary',
                  )}
                >
                  <span
                    className={cn(
                      'h-1.5 w-1.5 rounded-full shrink-0',
                      acc.status === 'active' ? 'bg-success' : 'bg-muted-foreground',
                    )}
                  />
                  <span className="flex-1 truncate">{acc.account_name}</span>
                  {acc.id === activeAccount?.id && (
                    <Badge variant="outline" className="h-3.5 px-1 py-0 text-[10px]">
                      active
                    </Badge>
                  )}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/trading-accounts" className="flex items-center gap-2">
                  <Settings className="h-3.5 w-3.5" />
                  Manage Accounts
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Right — Notifications + User */}
      <div className="flex items-center gap-2">
        {/* Notification stub */}
        <button
          className="relative flex items-center justify-center h-8 w-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors focus-ring"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
        </button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-secondary transition-colors focus-ring"
              aria-label="User menu"
            >
              <Avatar className="h-7 w-7">
                <AvatarFallback className="text-2xs bg-primary/20 text-primary">
                  {user ? getInitials(user.name) : '?'}
                </AvatarFallback>
              </Avatar>
              {user && (
                <div className="hidden sm:flex flex-col items-start leading-tight">
                  <span className="text-xs font-medium text-foreground">{user.name}</span>
                  {user.roles[0] && (
                    <Badge variant="outline" className="text-2xs px-1 py-0 h-3.5 capitalize">
                      {user.roles[0]}
                    </Badge>
                  )}
                </div>
              )}
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>
              {user?.email ?? 'Account'}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive focus:bg-destructive/10"
              onClick={logout}
            >
              <LogOut />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

