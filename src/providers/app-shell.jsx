import { createContext, useContext, useRef } from 'react'
import { useToast } from '@/hooks/useToast'
import { ToastContainer } from '@/components/ToastContainer'

const AppShellContext = createContext(null)

export function AppShellProvider({ children }) {
  const { toasts, toast, dismiss } = useToast()
  const toastRef = useRef(toast)
  toastRef.current = toast
  const value = useRef({
    toast: {
      success: (m, d) => toastRef.current.success(m, d),
      error: (m, d) => toastRef.current.error(m, d),
      info: (m, d) => toastRef.current.info(m, d),
      warn: (m, d) => toastRef.current.warn(m, d),
    }
  }).current

  return (
    <AppShellContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} dismiss={dismiss} />
    </AppShellContext.Provider>
  )
}

export function useAppShell() {
  const ctx = useContext(AppShellContext)
  if (!ctx) throw new Error('useAppShell must be used inside AppShellProvider')
  return ctx
}
