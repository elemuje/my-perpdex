import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, Loader2, Copy, Check, X, Shield } from 'lucide-react'
import { useState } from 'react'
import { PIPELINE_STEPS } from '@/hooks/useArciumPipeline'

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 1800)
    })
  }
  return (
    <button onClick={copy} title="Copy" className="p-1 rounded transition-colors" style={{ color: copied ? '#02C076' : '#848E9C' }}>
      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
    </button>
  )
}

function StepRow({ s, step, isLast }) {
  const isDone = step > s.id || step === 6
  const isActive = step === s.id
  const isPend = !isDone && !isActive && step !== -1
  return (
    <div className={`flex items-start gap-3 ${!isLast ? 'pb-4' : ''}`}
      style={{ borderBottom: !isLast ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
      <div className="flex-shrink-0 w-5 h-5 mt-0.5 flex items-center justify-center">
        {isDone
          ? <CheckCircle2 className="w-5 h-5" style={{ color: '#02C076' }} />
          : isActive
            ? <Loader2 className="w-5 h-5 animate-spin" style={{ color: '#F0B90B' }} />
            : <div className="w-4 h-4 rounded-full border-2" style={{ borderColor: '#2E3540' }} />
        }
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold leading-snug" style={{
          color: isDone ? '#02C076' : isActive ? '#F0B90B' : isPend ? '#848E9C' : '#848E9C'
        }}>
          {s.label}
        </p>
        <p className="text-[11px] mt-0.5 leading-snug" style={{ color: '#4B5563' }}>{s.detail}</p>
      </div>
      <div className="flex-shrink-0 text-[11px] font-mono font-semibold mt-0.5"
        style={{ color: isDone ? '#02C076' : isActive ? '#F0B90B' : '#2E3540' }}>
        {String(s.id).padStart(2, '0')}
      </div>
    </div>
  )
}

export function ArciumPipelineTracker({ step, error, result }) {
  if (step === 0) return null
  const done = step === 6
  const isErr = step === -1
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
      className="rounded-xl overflow-hidden"
      style={{
        background: '#0F1318',
        border: `1px solid ${isErr ? 'rgba(246,70,93,0.3)' : done ? 'rgba(2,192,118,0.25)' : 'rgba(240,185,11,0.2)'}`,
      }}>
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full"
            style={{
              background: isErr ? '#F6465D' : done ? '#02C076' : '#F0B90B',
              boxShadow: isErr ? '0 0 6px #F6465D' : done ? '0 0 6px #02C076' : '0 0 6px #F0B90B',
              animation: (!done && !isErr) ? 'pulse 1.5s infinite' : 'none'
            }} />
          <span className="text-sm font-bold" style={{ color: isErr ? '#F6465D' : done ? '#02C076' : '#F0B90B' }}>
            Arcium MPC Execution
          </span>
        </div>
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded"
          style={{ background: 'rgba(240,185,11,0.1)', color: '#F0B90B' }}>Privacy-First</span>
      </div>
      <div className="px-4 py-3 space-y-3">
        {PIPELINE_STEPS.map((s, i) => (
          <StepRow key={s.id} s={s} step={step} isLast={i === PIPELINE_STEPS.length - 1} />
        ))}
      </div>
      {isErr && error && (
        <div className="px-4 pb-3 text-xs" style={{ color: '#F6465D' }}>{'\u2715'} {error}</div>
      )}
      {done && result && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="px-4 pb-4 space-y-2" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 12 }}>
          {result.proof && (
            <div className="flex gap-1.5 flex-wrap pt-1">
              {['ZK Groth16', result.arciumSdkUsed ? 'Arcium SDK Encrypted' : 'MEV Protected', 'Privacy Preserved', 'Devnet Settled'].map(b => (
                <span key={b} className="text-[9px] px-1.5 py-0.5 rounded font-medium"
                  style={{ background: 'rgba(2,192,118,0.1)', color: '#02C076', border: '1px solid rgba(2,192,118,0.2)' }}>
                  {'\u2713'} {b}
                </span>
              ))}
            </div>
          )}
          {result.execHash && (
            <div>
              <p className="text-[9px] mb-0.5" style={{ color: '#848E9C' }}>MPC Execution Hash</p>
              <div className="flex items-center gap-1">
                <a href={`https://explorer.arcium.com/computations/${result.execHash}`}
                  target="_blank" rel="noopener noreferrer"
                  className="text-[10px] font-mono hover:underline" style={{ color: '#F0B90B' }}>
                  {result.execHash.slice(0, 22)}&hellip;{result.execHash.slice(-6)} &rarr;
                </a>
                <CopyBtn text={result.execHash} />
              </div>
            </div>
          )}
          {result.txSignature && (
            <div>
              <p className="text-[9px] mb-0.5" style={{ color: '#848E9C' }}>Solana Devnet Tx</p>
              <div className="flex items-center gap-1">
                <a href={`https://explorer.solana.com/tx/${result.txSignature}?cluster=devnet`}
                  target="_blank" rel="noopener noreferrer"
                  className="text-[10px] font-mono hover:underline" style={{ color: '#02C076' }}>
                  {result.txSignature.slice(0, 22)}&hellip;{result.txSignature.slice(-6)} &rarr;
                </a>
                <CopyBtn text={result.txSignature} />
              </div>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  )
}

export function ArciumPipelineModal({ step, error, result, onClose, tradeInfo }) {
  const done = step === 6
  const isErr = step === -1
  const show = step > 0
  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
          <motion.div initial={{ opacity: 0, scale: 0.96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="w-full max-w-md rounded-2xl overflow-hidden"
            style={{ background: '#161A1E', border: '1px solid rgba(240,185,11,0.2)', boxShadow: '0 32px 80px rgba(0,0,0,0.6)' }}>
            <div className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: '#0F1318' }}>
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full"
                  style={{
                    background: isErr ? '#F6465D' : done ? '#02C076' : '#F0B90B',
                    boxShadow: isErr ? '0 0 8px #F6465D' : done ? '0 0 8px #02C076' : '0 0 8px #F0B90B',
                    animation: (!done && !isErr) ? 'pulse 1.5s infinite' : 'none'
                  }} />
                <div>
                  <p className="text-sm font-bold" style={{ color: isErr ? '#F6465D' : done ? '#02C076' : '#F0B90B' }}>
                    Arcium MPC Execution
                  </p>
                  {tradeInfo && (
                    <p className="text-[10px]" style={{ color: '#848E9C' }}>
                      {tradeInfo.action} &middot; {tradeInfo.side?.toUpperCase()} {tradeInfo.size} {tradeInfo.pair}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded"
                  style={{ background: 'rgba(240,185,11,0.1)', color: '#F0B90B', border: '1px solid rgba(240,185,11,0.2)' }}>
                  Privacy-First
                </span>
                {(done || isErr) && (
                  <button onClick={onClose}
                    className="p-1.5 rounded-lg transition-colors" style={{ color: '#848E9C' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                    onMouseLeave={e => e.currentTarget.style.color = '#848E9C'}>
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            <div className="px-5 py-4 space-y-0">
              {PIPELINE_STEPS.map((s, i) => (
                <motion.div key={s.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}>
                  <StepRow s={s} step={step} isLast={i === PIPELINE_STEPS.length - 1} />
                  {i < PIPELINE_STEPS.length - 1 && <div className="h-3" />}
                </motion.div>
              ))}
            </div>
            {isErr && error && (
              <div className="mx-5 mb-4 px-4 py-3 rounded-xl text-sm"
                style={{ background: 'rgba(246,70,93,0.08)', border: '1px solid rgba(246,70,93,0.2)', color: '#F6465D' }}>
                {'\u2715'} {error}
              </div>
            )}
            {done && result && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="mx-5 mb-5 rounded-xl p-4 space-y-3"
                style={{ background: '#0F1318', border: '1px solid rgba(2,192,118,0.15)' }}>
                <div className="flex gap-1.5 flex-wrap">
                  {['\u2713 ZK Groth16', result.arciumSdkUsed ? '\u2713 Arcium SDK Encrypted' : '\u2713 MEV Protected', '\u2713 Privacy Preserved', '\u2713 Devnet Settled'].map(b => (
                    <span key={b} className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                      style={{ background: 'rgba(2,192,118,0.12)', color: '#02C076', border: '1px solid rgba(2,192,118,0.25)' }}>
                      {b}
                    </span>
                  ))}
                </div>
                {result.execHash && (
                  <div>
                    <p className="text-[9px] mb-1" style={{ color: '#848E9C' }}>ARCIUM MPC EXECUTION HASH</p>
                    <div className="flex items-center gap-1.5">
                      <a href={`https://explorer.arcium.com/computations/${result.execHash}`}
                        target="_blank" rel="noopener noreferrer"
                        className="text-[11px] font-mono hover:underline flex-1 break-all" style={{ color: '#F0B90B' }}>
                        {result.execHash.slice(0, 26)}&hellip;{result.execHash.slice(-8)} &rarr;
                      </a>
                      <CopyBtn text={result.execHash} />
                    </div>
                  </div>
                )}
                {result.txSignature && (
                  <div>
                    <p className="text-[9px] mb-1" style={{ color: '#848E9C' }}>SOLANA DEVNET TX</p>
                    <div className="flex items-center gap-1.5">
                      <a href={`https://explorer.solana.com/tx/${result.txSignature}?cluster=devnet`}
                        target="_blank" rel="noopener noreferrer"
                        className="text-[11px] font-mono hover:underline flex-1" style={{ color: '#02C076' }}>
                        {result.txSignature.slice(0, 26)}&hellip;{result.txSignature.slice(-8)} &rarr;
                      </a>
                      <CopyBtn text={result.txSignature} />
                    </div>
                  </div>
                )}
                <button onClick={onClose}
                  className="w-full py-2.5 rounded-xl text-sm font-bold transition-all mt-1"
                  style={{ background: '#F0B90B', color: '#0B0E11' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#F8D12F'}
                  onMouseLeave={e => e.currentTarget.style.background = '#F0B90B'}>
                  Done
                </button>
              </motion.div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
