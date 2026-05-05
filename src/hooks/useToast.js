import { useState, useCallback, useRef } from 'react'
let _idCounter = 0
export function useToast() {
  const [toasts, setToasts] = useState([])
  const timers = useRef({})
  const dismiss = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
    clearTimeout(timers.current[id])
  }, [])
  const push = useCallback((type, message, duration = 4500) => {
    const id = ++_idCounter
    setToasts(prev => [...prev.slice(-4), { id, type, message }])
    timers.current[id] = setTimeout(() => dismiss(id), duration)
    return id
  }, [dismiss])
  const toast = {
    success: (msg, d) => push('success', msg, d),
    error: (msg, d) => push('error', msg, d),
    info: (msg, d) => push('info', msg, d),
    warn: (msg, d) => push('warn', msg, d),
  }
  return { toasts, toast, dismiss }
}
