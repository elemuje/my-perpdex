import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { WalletMultiButton, useWallet } from '@/providers/solana-wallet'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, TrendingUp, Trophy, BookOpen, Menu, X, Radio } from 'lucide-react'
import { useArciumPrivacy } from '@/providers/arcium-privacy'
import { Switch } from '@/components/ui/switch'
import { WalletBalanceDisplay } from '@/components/WalletBalanceDisplay'

const BY = {
  bg: '#0B0E11',
  card: '#161A1E',
  border: 'rgba(255,255,255,0.06)',
  yellow: '#F0B90B',
  green: '#02C076',
  red: '#F6465D',
  muted: '#848E9C',
}

export function Navbar() {
  const location = useLocation()
  const { connected } = useWallet()
  const { isPrivateMode, togglePrivateMode, privacyScore } = useArciumPrivacy()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navLinks = [
    { path: '/trade', label: 'Trade', icon: TrendingUp },
    { path: '/leaderboard', label: 'Leaderboard', icon: Trophy },
    { path: '/privacy-architecture', label: 'Privacy', icon: Shield },
    { path: '/docs', label: 'Docs', icon: BookOpen },
  ]
  const isActive = (path) => location.pathname === path

  return (
    <nav className="sticky top-0 z-50" style={{ background: BY.bg, borderBottom: `1px solid ${BY.border}` }}>
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm"
              style={{ background: BY.yellow, color: BY.bg }}>P</div>
            <span className="text-base font-bold tracking-tight">
              <span style={{ color: BY.yellow }}>Puffin</span>
              <span className="text-white">PerpDex</span>
            </span>
            {isPrivateMode && (
              <span className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold"
                style={{ background: `${BY.yellow}15`, border: `1px solid ${BY.yellow}30`, color: BY.yellow }}>
                <Shield className="w-2.5 h-2.5" /> PRIVATE
              </span>
            )}
          </Link>
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link key={link.path} to={link.path}
                className="flex items-center gap-1.5 px-3 py-2 rounded text-sm font-medium transition-all"
                style={isActive(link.path)
                  ? { background: `${BY.yellow}12`, color: BY.yellow, border: `1px solid ${BY.yellow}25` }
                  : { color: BY.muted, border: '1px solid transparent' }}
                onMouseEnter={e => { if (!isActive(link.path)) e.currentTarget.style.color = '#fff' }}
                onMouseLeave={e => { if (!isActive(link.path)) e.currentTarget.style.color = BY.muted }}>
                <link.icon className="w-4 h-4" />
                {link.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded text-[9px] font-bold"
              style={{ background: `${BY.green}10`, border: `1px solid ${BY.green}25`, color: BY.green }}>
              <Radio className="w-2.5 h-2.5 animate-pulse" /> DEVNET
            </div>
            {connected && <WalletBalanceDisplay variant="navbar" className="hidden lg:flex" />}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded"
              style={{ background: BY.card, border: `1px solid ${BY.border}` }}>
              <Shield className="w-3.5 h-3.5" style={{ color: BY.yellow }} />
              <Switch checked={isPrivateMode} onCheckedChange={togglePrivateMode}
                className="data-[state=checked]:bg-[#F0B90B]" />
              <span className="text-[10px] font-mono" style={{ color: BY.yellow }}>{privacyScore}%</span>
            </div>
            <WalletMultiButton />
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded" style={{ color: BY.muted }}>
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            style={{ borderTop: `1px solid ${BY.border}`, background: BY.bg }}>
            <div className="px-4 py-3 space-y-1">
              {navLinks.map(link => (
                <Link key={link.path} to={link.path} onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded text-sm font-medium"
                  style={isActive(link.path) ? { color: BY.yellow } : { color: BY.muted }}>
                  <link.icon className="w-4 h-4" />{link.label}
                </Link>
              ))}
              <div className="flex items-center gap-2 px-3 py-2.5">
                <Shield className="w-4 h-4" style={{ color: BY.yellow }} />
                <span className="text-sm" style={{ color: BY.muted }}>Private Mode</span>
                <Switch checked={isPrivateMode} onCheckedChange={togglePrivateMode}
                  className="data-[state=checked]:bg-[#F0B90B]" />
                <span className="text-xs font-mono" style={{ color: BY.yellow }}>{privacyScore}%</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
