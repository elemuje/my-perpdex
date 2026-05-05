import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react'

const ICONS = {
  success: <CheckCircle2 className="w-4 h-4 text-[#00FFB2] flex-shrink-0" />,
  error: <XCircle className="w-4 h-4 text-[#FF4D6D] flex-shrink-0" />,
  info: <Info className="w-4 h-4 text-[#F0B90B] flex-shrink-0" />,
  warn: <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0" />,
}
const BORDERS = {
  success: 'border-[#00FFB2]/30',
  error: 'border-[#FF4D6D]/30',
  info: 'border-[#F0B90B]/30',
  warn: 'border-yellow-400/30',
}

export function ToastContainer({ toasts, dismiss }) {
  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      <AnimatePresence initial={false}>
        {toasts.map(t => (
          <motion.div key={t.id} layout
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl border bg-[#161A1E]/95 backdrop-blur-sm shadow-xl ${BORDERS[t.type] ?? 'border-white/10'}`}>
            {ICONS[t.type]}
            <span className="text-sm text-gray-200 flex-1 leading-snug">{t.message}</span>
            <button onClick={() => dismiss(t.id)} className="text-gray-500 hover:text-white transition-colors mt-0.5">
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
