import Link from 'next/link'
import { Pencil, Building2, ShieldCheck, ShieldAlert, ShieldOff, Clock, CheckCircle2 } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/data-display/StatusBadge'
import { Skeleton } from '@/components/ui/skeleton'
import type { TradingAccount } from '@/types/api'

interface TradingAccountCardProps {
  account: TradingAccount
}

function TerminalStatusIcon({ isOn }: { isOn: boolean }) {
  if (isOn) {
    return <ShieldCheck className="h-3.5 w-3.5 text-success" />
  }
  return <ShieldOff className="h-3.5 w-3.5 text-muted-foreground" />
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day:   '2-digit',
    month: 'short',
    year:  'numeric',
    hour:  '2-digit',
    minute: '2-digit',
  })
}

export function TradingAccountCard({ account }: TradingAccountCardProps) {
  const tokenExpired = account.status === 'token_expired' || account.auth_status === 'expired'

  return (
    <Card className="group flex flex-col transition-all duration-200 hover:border-primary/40 hover:shadow-md hover:shadow-primary/5">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Building2 className="h-[18px] w-[18px] text-primary" />
            </div>
            <div className="min-w-0">
              <CardTitle className="truncate text-sm font-semibold text-foreground">
                {account.account_name}
              </CardTitle>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">{account.app_name}</p>
            </div>
          </div>
          <StatusBadge status={account.status} className="shrink-0" />
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-3 pb-4">
        {/* Terminal / Token status */}
        <div className="flex items-center gap-2 text-xs">
          <TerminalStatusIcon isOn={account.is_terminal_on} />
          <span className="text-muted-foreground">Terminal</span>
          <span className={`ml-auto font-medium ${account.is_terminal_on ? 'text-success' : 'text-muted-foreground'}`}>
            {account.is_terminal_on ? 'Active' : 'Inactive'}
          </span>
        </div>

        {/* Auth / Token status */}
        <div className="flex items-center gap-2 text-xs">
          {tokenExpired
            ? <ShieldAlert className="h-3.5 w-3.5 shrink-0 text-warning" />
            : <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-success" />}
          <span className="text-muted-foreground">Token</span>
          <span className={`ml-auto font-medium ${tokenExpired ? 'text-warning' : 'text-success'}`}>
            {tokenExpired ? 'Expired' : 'Valid'}
          </span>
        </div>

        <div className="h-px bg-border" />

        {/* Last verified / updated */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs">
            <Clock className="h-3 w-3 shrink-0 text-muted-foreground" />
            <span className="text-muted-foreground">Last verified</span>
            <span className="ml-auto text-[10px] text-muted-foreground">
              {formatDate(account.last_verified_at)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Clock className="h-3 w-3 shrink-0 text-muted-foreground" />
            <span className="text-muted-foreground">Last updated</span>
            <span className="ml-auto text-[10px] text-muted-foreground">
              {formatDate(account.updated_at)}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="mt-auto pt-0">
        <Link href={`/trading-accounts/${account.id}/edit`} className="w-full">
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-1.5 text-xs transition-colors group-hover:border-primary/50 group-hover:text-primary"
          >
            <Pencil size={13} />
            Edit Account
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}

export function TradingAccountCardSkeleton() {
  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <Skeleton className="h-9 w-9 rounded-lg" />
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 pb-4">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-3/4" />
        <div className="h-px bg-border" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
      </CardContent>
      <CardFooter className="pt-0">
        <Skeleton className="h-8 w-full rounded-md" />
      </CardFooter>
    </Card>
  )
}
