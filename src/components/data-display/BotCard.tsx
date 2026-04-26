import Link from 'next/link'
import { Pencil, Bot, Wallet, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/data-display/StatusBadge'
import { Skeleton } from '@/components/ui/skeleton'
import type { Bot as BotType } from '@/types/api'

interface BotCardProps {
  bot: BotType
}

export function BotCard({ bot }: BotCardProps) {
  const statusLabel = bot.status === 1 ? 'active' : 'inactive'

  return (
    <Card className="group flex flex-col transition-all duration-200 hover:border-primary/40 hover:shadow-md hover:shadow-primary/5">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Bot className="h-4.5 w-4.5 text-primary" size={18} />
            </div>
            <CardTitle className="truncate text-sm font-semibold text-foreground">
              {bot.name}
            </CardTitle>
          </div>
          <StatusBadge status={statusLabel} className="shrink-0" />
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-3 pb-4">
        {/* Strategy */}
        <div className="flex items-center gap-2 text-xs">
          <TrendingUp className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <span className="text-muted-foreground">Strategy</span>
          <span className="ml-auto font-medium text-foreground truncate max-w-[140px]">
            {bot.strategy?.name ?? <span className="text-muted-foreground italic">None</span>}
          </span>
        </div>

        {/* Linked Account */}
        <div className="flex items-center gap-2 text-xs">
          <Wallet className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <span className="text-muted-foreground">Account</span>
          <span className="ml-auto font-medium text-foreground truncate max-w-[140px]">
            {bot.account?.account_name ?? <span className="text-muted-foreground italic">None</span>}
          </span>
        </div>

        <div className="h-px bg-border" />

        {/* Limits row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-md bg-muted/30 px-3 py-2">
            <p className="text-[10px] text-muted-foreground leading-none mb-1">Per Trade</p>
            <p className="text-xs font-semibold text-foreground">
              ₹{Number(bot.per_trade_limit).toLocaleString('en-IN')}
            </p>
          </div>
          <div className="rounded-md bg-muted/30 px-3 py-2">
            <p className="text-[10px] text-muted-foreground leading-none mb-1">Max Invest</p>
            <p className="text-xs font-semibold text-foreground">
              ₹{Number(bot.max_investment_limit).toLocaleString('en-IN')}
            </p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="mt-auto pt-0">
        <Link href={`/bots/${bot.id}/edit`} className="w-full">
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-1.5 text-xs transition-colors group-hover:border-primary/50 group-hover:text-primary"
          >
            <Pencil size={13} />
            Edit Bot
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}

export function BotCardSkeleton() {
  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <Skeleton className="h-9 w-9 rounded-lg" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 pb-4">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-3/4" />
        <div className="h-px bg-border" />
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-10 rounded-md" />
          <Skeleton className="h-10 rounded-md" />
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <Skeleton className="h-8 w-full rounded-md" />
      </CardFooter>
    </Card>
  )
}
