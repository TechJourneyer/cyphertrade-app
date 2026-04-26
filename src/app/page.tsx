import { redirect } from 'next/navigation'

// Root route redirects to dashboard; layout handles auth check
export default function RootPage() {
  redirect('/dashboard')
}
