"use client"

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  type ToastProps
} from "@/components/ui/toast"
import { useToast } from "@/hooks/use-toast"
import { AlertCircle, CheckCircle2, Info } from "lucide-react"

export function Toaster() {
  const { toasts } = useToast()

  const getIcon = (variant: ToastProps['variant']) => {
    switch(variant) {
      case 'destructive': return <AlertCircle className="h-5 w-5" />;
      case 'success': return <CheckCircle2 className="h-5 w-5" />;
      case 'info': return <Info className="h-5 w-5" />;
      default: return null;
    }
  }

  return (
    <ToastProvider swipeDirection="up">
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        return (
          <Toast key={id} variant={variant} {...props}>
            <div className="flex items-start gap-3 w-full">
              {getIcon(variant)}
              <div className="grid gap-1 flex-1">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && (
                  <ToastDescription>{description}</ToastDescription>
                )}
              </div>
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}