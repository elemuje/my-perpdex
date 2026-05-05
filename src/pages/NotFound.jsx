import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, TrendingUp } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex-1 flex items-center justify-center py-24">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md mx-auto px-4">
        <h1 className="text-8xl font-extrabold mb-4" style={{ color: '#F0B90B' }}>404</h1>
        <p className="text-xl font-bold text-white mb-2">Page Not Found</p>
        <p className="text-sm text-gray-400 mb-8">The page you're looking for doesn't exist or has been moved.</p>
        <div className="flex items-center justify-center gap-3">
          <Link to="/"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{ background: '#F0B90B', color: '#0B0E11' }}
            onMouseEnter={e => e.currentTarget.style.background = '#F8D12F'}
            onMouseLeave={e => e.currentTarget.style.background = '#F0B90B'}>
            <Home className="w-4 h-4" /> Home
          </Link>
          <Link to="/trade"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{ background: 'rgba(255,255,255,0.04)', color: '#D1D5DB', border: '1px solid rgba(255,255,255,0.08)' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(240,185,11,0.3)'; e.currentTarget.style.color = '#F0B90B' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#D1D5DB' }}>
            <TrendingUp className="w-4 h-4" /> Trade
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
