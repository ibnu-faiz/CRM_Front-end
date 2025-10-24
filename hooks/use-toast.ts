// FRONTEND: hooks/use-toast.ts
import * as React from "react"

type ToastProps = {
  title?: string
  description?: string
  variant?: 'default' | 'destructive'
}

export function useToast() {
  const [toasts, setToasts] = React.useState<ToastProps[]>([])

  const toast = React.useCallback(({ title, description, variant = 'default' }: ToastProps) => {
    const newToast = { title, description, variant }
    setToasts((prev) => [...prev, newToast])

    // Simple console log for now - you can replace with a proper toast UI
    console.log(`[${variant.toUpperCase()}] ${title}: ${description}`)

    // Auto remove after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t !== newToast))
    }, 3000)
  }, [])

  return { toast, toasts }
}