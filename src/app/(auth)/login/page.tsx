'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Activity, Eye, EyeOff, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { login } from '@/api/auth'
import { useAuthStore } from '@/store/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

export default function LoginPage() {
  const router     = useRouter()
  const storeLogin = useAuthStore((s) => s.login)

  const [email,       setEmail]       = useState('')
  const [password,    setPassword]    = useState('')
  const [showPass,    setShowPass]    = useState(false)
  const [isLoading,   setIsLoading]   = useState(false)
  const [errors,      setErrors]      = useState<{ email?: string; password?: string; general?: string }>({})

  function validate(): boolean {
    const e: typeof errors = {}
    if (!email)                            e.email    = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(email)) e.email    = 'Enter a valid email address'
    if (!password)                         e.password = 'Password is required'
    else if (password.length < 6)          e.password = 'Password must be at least 6 characters'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setIsLoading(true)
    setErrors({})

    try {
      const { token, user } = await login({ email, password })
      storeLogin(token, user)
      router.replace('/dashboard')
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number; data?: { message?: string } } })
        ?.response?.status
      const message = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message

      if (status === 422) {
        setErrors({ general: message ?? 'Invalid credentials. Please try again.' })
      } else if (status === 401) {
        setErrors({ general: 'Incorrect email or password.' })
      } else {
        setErrors({ general: 'Unable to connect. Please check your network and try again.' })
        toast.error('Connection error', { description: 'Could not reach the server.' })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      {/* Background gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% -10%, hsl(239 84% 67% / 0.08) 0%, transparent 70%)',
        }}
      />

      <div className="relative w-full max-w-[360px] animate-slide-up">
        {/* Brand */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="flex items-center justify-center h-11 w-11 rounded-xl bg-primary/15 border border-primary/30">
            <Activity className="h-5 w-5 text-primary" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              CypherTrade
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Sign in to your account
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="surface-1 rounded-xl p-6 shadow-xl">
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* General error */}
            {errors.general && (
              <div
                role="alert"
                className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-xs text-destructive"
              >
                {errors.general}
              </div>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }))
                }}
                disabled={isLoading}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'email-error' : undefined}
                className={cn(errors.email && 'border-destructive/60 focus-visible:ring-destructive/50')}
              />
              {errors.email && (
                <p id="email-error" role="alert" className="text-xs text-destructive">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }))
                  }}
                  disabled={isLoading}
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? 'password-error' : undefined}
                  className={cn(
                    'pr-10',
                    errors.password && 'border-destructive/60 focus-visible:ring-destructive/50',
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus-ring rounded"
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p id="password-error" role="alert" className="text-xs text-destructive">
                  {errors.password}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
              aria-busy={isLoading}
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isLoading ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          CypherTrade Algorithmic Trading Platform
        </p>
      </div>
    </div>
  )
}
