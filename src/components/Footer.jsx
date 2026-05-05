import { Link } from 'react-router-dom'
import { Github, Twitter, MessageCircle, Zap, Shield, Heart } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-[rgba(240,185,11,0.08)] bg-[#0B0E11]">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md btn-gradient flex items-center justify-center">
                <Zap className="w-4 h-4 text-[#161A1E]" />
              </div>
              <span className="text-base font-bold">
                <span className="text-[#F0B90B]">Puffin</span>
                <span className="text-white">Perp</span>
              </span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              Privacy-first perpetual DEX on Solana, powered by Arcium confidential computation.
            </p>
            <div className="flex items-center gap-3">
              <a href="#" className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-[#F0B90B] hover:bg-[#F0B90B]/10 transition-all">
                <Github className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-[#F0B90B] hover:bg-[#F0B90B]/10 transition-all">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-[#F0B90B] hover:bg-[#F0B90B]/10 transition-all">
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Product</h4>
            <ul className="space-y-2.5">
              <li><Link to="/trade" className="text-sm text-gray-500 hover:text-[#F0B90B] transition-colors">Trading</Link></li>
              <li><Link to="/leaderboard" className="text-sm text-gray-500 hover:text-[#F0B90B] transition-colors">Leaderboard</Link></li>
              <li><Link to="/privacy-architecture" className="text-sm text-gray-500 hover:text-[#F0B90B] transition-colors">Privacy Architecture</Link></li>
              <li><Link to="/docs" className="text-sm text-gray-500 hover:text-[#F0B90B] transition-colors">Documentation</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Resources</h4>
            <ul className="space-y-2.5">
              <li><a href="https://faucet.solana.com/" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 hover:text-[#F0B90B] transition-colors">Solana Devnet Faucet</a></li>
              <li><a href="https://docs.arcium.com/" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 hover:text-[#F0B90B] transition-colors">Arcium Docs</a></li>
              <li><a href="https://solana.com/docs" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 hover:text-[#F0B90B] transition-colors">Solana Docs</a></li>
              <li><a href="#" className="text-sm text-gray-500 hover:text-[#F0B90B] transition-colors">GitHub Repository</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Ecosystem</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#F0B90B]/5 border border-[#F0B90B]/10">
                <Shield className="w-4 h-4 text-[#F0B90B]" />
                <span className="text-xs text-gray-400">Powered by Arcium</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#F0B90B]/5 border border-[#F0B90B]/10">
                <Zap className="w-4 h-4 text-[#F0B90B]" />
                <span className="text-xs text-gray-400">Built on Solana</span>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                Deployed on Solana Devnet with Arcium Testnet integration.
              </p>
            </div>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-[rgba(240,185,11,0.06)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-600">&copy; 2025 PuffinPerpDex. Open source under MIT License.</p>
          <p className="text-xs text-gray-600 flex items-center gap-1">
            Made with <Heart className="w-3 h-3 text-[#FF4D6D]" /> for the Solana ecosystem
          </p>
        </div>
      </div>
    </footer>
  )
}
