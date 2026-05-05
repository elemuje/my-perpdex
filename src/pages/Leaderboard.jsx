import { useState } from 'react'
import { motion } from 'framer-motion'
import { Trophy, TrendingUp, TrendingDown, Shield, Clock } from 'lucide-react'
import { useMockLeaderboard } from '@/hooks/useMockTrades'

export default function Leaderboard() {
  const [filter, setFilter] = useState('all')
  const data = useMockLeaderboard()
  const filtered = filter === 'private' ? data.filter(d => d.isPrivate) : filter === 'public' ? data.filter(d => !d.isPrivate) : data
  const muted = '#848E9C'

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-10">
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Trader Leaderboard</h1>
        <p className="text-gray-400 text-sm max-w-lg mx-auto">
          Top performers on PuffinPerpDex. Privacy-preserving rankings — identities remain confidential.
        </p>
      </div>
      <div className="flex justify-center gap-2 mb-8">
        {[{ k: 'all', l: 'All Traders' }, { k: 'private', l: 'Private Only' }, { k: 'public', l: 'Public' }].map(f => (
          <button key={f.k} onClick={() => setFilter(f.k)}
            className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
            style={{ background: filter === f.k ? 'rgba(240,185,11,0.15)' : 'transparent', color: filter === f.k ? '#F0B90B' : muted, border: filter === f.k ? '1px solid rgba(240,185,11,0.3)' : '1px solid rgba(255,255,255,0.06)' }}>
            {f.l}
          </button>
        ))}
      </div>
      <div className="glass-panel rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                <th className="text-left px-4 py-3 text-[10px] font-bold uppercase" style={{ color: muted }}>Rank</th>
                <th className="text-left px-4 py-3 text-[10px] font-bold uppercase" style={{ color: muted }}>Wallet</th>
                <th className="text-right px-4 py-3 text-[10px] font-bold uppercase" style={{ color: muted }}>P&L (USDC)</th>
                <th className="text-right px-4 py-3 text-[10px] font-bold uppercase" style={{ color: muted }}>Win Rate</th>
                <th className="text-right px-4 py-3 text-[10px] font-bold uppercase" style={{ color: muted }}>Trades</th>
                <th className="text-right px-4 py-3 text-[10px] font-bold uppercase" style={{ color: muted }}>Volume</th>
                <th className="text-center px-4 py-3 text-[10px] font-bold uppercase" style={{ color: muted }}>Privacy</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, i) => (
                <motion.tr key={row.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                  className="border-b transition-colors hover:bg-white/[0.02]" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {row.rank <= 3 ? <Trophy className="w-4 h-4" style={{ color: row.rank === 1 ? '#F0B90B' : row.rank === 2 ? '#C0C0C0' : '#CD7F32' }} /> :
                        <span className="text-xs font-mono font-bold" style={{ color: muted }}>{row.rank}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-mono text-white">{row.walletAddress}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`text-xs font-mono font-bold ${row.totalPnl >= 0 ? 'text-[#02C076]' : 'text-[#F6465D]'}`}>
                      {row.totalPnl >= 0 ? '+' : ''}{row.totalPnl.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-xs font-mono" style={{ color: parseFloat(row.winRate) > 50 ? '#02C076' : muted }}>{row.winRate}%</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-xs font-mono text-white">{row.totalTrades}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-xs font-mono text-white">{row.volumeTraded.toFixed(1)}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {row.isPrivate ? (
                      <span className="text-[10px] px-2 py-0.5 rounded font-bold" style={{ background: 'rgba(240,185,11,0.1)', color: '#F0B90B', border: '1px solid rgba(240,185,11,0.2)' }}>
                        <Shield className="w-2.5 h-2.5 inline" /> {row.privacyScore}%
                      </span>
                    ) : (
                      <span className="text-[10px]" style={{ color: muted }}>—</span>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
