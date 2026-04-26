import { useCallback } from 'react'
import { toast as sonnerToast } from 'sonner'

export interface ToastProps {
  title?: string
  description?: string
  variant?: 'default' | 'destructive'
}

export function useToast() {
  const toast = useCallback((props: ToastProps) => {
    if (props.variant === 'destructive') {
      sonnerToast.error(props.title, {
        description: props.description,
      })
    } else {
      sonnerToast.success(props.title, {
        description: props.description,
      })
    }
  }, [])

  return { toast }
}
