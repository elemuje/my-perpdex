import { RefreshCw } from 'lucide-react'
import { useSolanaBalance } from '@/hooks/useSolanaBalance'

export function WalletBalanceDisplay({ refreshTrigger = 0, className = '', variant = 'navbar' }) {
  const { solBalance, usdcBalance, loading, refresh } = useSolanaBalance(refreshTrigger)
  if (solBalance === null && !loading) return null
  const isNavbar = variant === 'navbar'
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#161A1E]/70 border border-[#F0B90B]/10 ${isNavbar ? 'text-xs' : 'text-sm'}`}>
        <span className="text-[10px] text-gray-500">SOL</span>
        {loading ? (
          <span className="w-10 h-3 bg-white/5 rounded animate-pulse" />
        ) : (
          <span className="font-mono font-semibold text-white">{solBalance?.toFixed(3) ?? '—'}</span>
        )}
      </div>
      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#161A1E]/70 border border-[#F0B90B]/10 ${isNavbar ? 'text-xs' : 'text-sm'}`}>
        <span className="text-[10px] text-gray-500">USDC</span>
        {loading ? (
          <span className="w-12 h-3 bg-white/5 rounded animate-pulse" />
        ) : (
          <span className="font-mono font-semibold text-[#F0B90B]">{usdcBalance?.toLocaleString() ?? '—'}</span>
        )}
      </div>
      <button onClick={refresh} disabled={loading}
        className="p-1 rounded-md text-gray-600 hover:text-[#F0B90B] transition-colors disabled:opacity-40" title="Refresh balance">
        <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
      </button>
    </div>
  )
}
