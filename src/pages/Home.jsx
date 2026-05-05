import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, TrendingUp, Shield, Zap, Lock, Cpu, Eye, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useArciumPrivacy } from '@/providers/arcium-privacy'

export default function Home() {
  const navigate = useNavigate()
  const { isPrivateMode, privacyScore } = useArciumPrivacy()
  return (
    <div className="flex flex-col items-center w-full">
      {/* ── Hero ── */}
      <section className="w-full relative overflow-hidden" style={{
        background: 'radial-gradient(ellipse 100% 80% at 50% -10%, rgba(240,185,11,0.1) 0%, transparent 60%), linear-gradient(180deg, #0B0E11 0%, #0a0d12 100%)',
        padding: '80px 0 100px',
      }}>
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="mb-6">
            <span className="text-[11px] font-bold px-3 py-1 rounded-full"
              style={{ background: 'rgba(240,185,11,0.12)', color: '#F0B90B', border: '1px solid rgba(240,185,11,0.25)' }}>
              <Zap className="w-3 h-3 inline mr-1" /> ARCIUM SDK INTEGRATED
            </span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.08 }}
            className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6 neon-text"
            style={{ color: '#F0B90B' }}>
            Privacy-First<br />
            <span className="text-white">Perpetual DEX</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.16 }}
            className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto mb-8 leading-relaxed">
            Trade perpetuals with end-to-end encrypted order flow via Arcium confidential computation.
            No front-running, no exposed positions — just secure MPC execution on Solana.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.24 }}
            className="flex flex-wrap items-center justify-center gap-3 mb-10">
            <Button onClick={() => navigate('/trade')} className="btn-gradient text-[#0B0E11] font-semibold rounded-xl px-7 py-5 text-sm hover:opacity-90">
              Launch Trading <ArrowRight className="w-4 h-4" />
            </Button>
            <Button onClick={() => navigate('/privacy-architecture')} variant="outline"
              className="rounded-xl px-7 py-5 text-sm border-white/10 text-gray-300 hover:bg-white/5 hover:text-white">
              <Shield className="w-4 h-4" /> Privacy Architecture
            </Button>
          </motion.div>
          {/* Privacy score card */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.4 }}
            className="inline-flex items-center gap-4 rounded-2xl px-6 py-4"
            style={{ background: '#161A1E', border: '1px solid rgba(240,185,11,0.12)' }}>
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: '#F0B90B' }}>{privacyScore}%</div>
              <div className="text-[10px] text-gray-500 font-semibold">PRIVACY SCORE</div>
            </div>
            <div className="w-px h-10" style={{ background: 'rgba(255,255,255,0.06)' }} />
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: '#02C076' }}>5</div>
              <div className="text-[10px] text-gray-500 font-semibold">MPC STEPS</div>
            </div>
            <div className="w-px h-10" style={{ background: 'rgba(255,255,255,0.06)' }} />
            <div className="text-center">
              <div className="text-2xl font-bold text-white">ZK</div>
              <div className="text-[10px] text-gray-500 font-semibold">PROOFS</div>
            </div>
            <div className="w-px h-10" style={{ background: 'rgba(255,255,255,0.06)' }} />
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ background: isPrivateMode ? '#02C076' : '#848E9C' }} />
              <span className="text-xs font-semibold" style={{ color: isPrivateMode ? '#02C076' : '#848E9C' }}>
                {isPrivateMode ? 'Private Mode ON' : 'Private Mode OFF'}
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="w-full" style={{ background: '#0a0d12', borderTop: '1px solid rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { label: 'Total Volume', value: '$12.4M' },
              { label: 'Active Traders', value: '2,847' },
              { label: 'Privacy Preserved', value: '100%', color: '#02C076' },
              { label: 'MPC Executions', value: '18.2K', color: '#F0B90B' },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <div className="text-2xl sm:text-3xl font-extrabold" style={{ color: s.color || '#F0B90B' }}>{s.value}</div>
                <div className="text-[11px] text-gray-500 font-semibold mt-1">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="w-full py-24" style={{ background: '#0B0E11' }}>
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Why PuffinPerpDex?</h2>
            <p className="text-gray-400 max-w-lg mx-auto">The only perpetual DEX with end-to-end encrypted order flow powered by Arcium MPC.</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: Lock, title: 'Encrypted Orders', desc: 'All trade parameters encrypted client-side via Arcium RescueCipher before leaving your browser.' },
              { icon: Shield, title: 'MEV Protection', desc: 'Encrypted payload prevents front-running. Validators cannot see your order details.' },
              { icon: Cpu, title: 'MPC Execution', desc: 'Multi-party computation executes trades across distributed nodes without decrypting inputs.' },
              { icon: Eye, title: 'Private Positions', desc: 'Position sizes and PnL are never visible on-chain. Only ZK proofs are submitted.' },
            ].map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <div className="glass-card rounded-xl p-6 h-full hover:border-[rgba(240,185,11,0.2)] transition-all group">
                  <div className="w-10 h-10 rounded-lg bg-[#F0B90B]/10 border border-[#F0B90B]/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <f.icon className="w-5 h-5 text-[#F0B90B]" />
                  </div>
                  <h3 className="text-sm font-bold text-white mb-2">{f.title}</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="w-full py-24" style={{ background: '#0a0d12', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">How Arcium Integration Works</h2>
            <p className="text-gray-400 max-w-lg mx-auto">Real SDK integration — not a simulation.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              { step: '01', title: 'x25519 Key Exchange', desc: 'Client generates ephemeral x25519 keypair and fetches MXE public key from Arcium devnet cluster.' },
              { step: '02', title: 'RescueCipher Encrypt', desc: 'Derive shared secret via X25519. Create RescueCipher and encrypt trade inputs with random nonce.' },
              { step: '03', title: 'Submit to Cluster', desc: 'Encrypted payload queued via Anchor program to Arcium MPC cluster nodes for execution.' },
              { step: '04', title: 'MPC + ZK Proof', desc: 'Cluster nodes compute margin, liq price, and PnL in encrypted domain. Generate Groth16 proof.' },
              { step: '05', title: 'Decrypt Result', desc: 'Client decrypts computation output with the same RescueCipher, revealing only the final result.' },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="glass-card rounded-xl p-5 h-full">
                <div className="text-3xl font-extrabold mb-3" style={{ color: 'rgba(240,185,11,0.15)' }}>{s.step}</div>
                <h3 className="text-sm font-bold text-white mb-2">{s.title}</h3>
                <p className="text-[11px] text-gray-400 leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="w-full py-24">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="glass-panel rounded-2xl p-10 sm:p-16 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Ready to trade privately?</h2>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">Connect your wallet and experience the future of private perpetual trading with Arcium MPC.</p>
            <Button onClick={() => navigate('/trade')} className="btn-gradient text-[#0B0E11] font-semibold rounded-xl px-8 py-5 text-sm">
              <TrendingUp className="w-4 h-4" /> Start Trading Privately
            </Button>
            <div className="flex items-center justify-center gap-6 mt-8 text-xs text-gray-500">
              <span className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" /> Solana Devnet</span>
              <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" /> Arcium Testnet</span>
              <span className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5" /> End-to-End Encrypted</span>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
