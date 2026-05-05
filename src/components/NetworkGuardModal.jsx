import { AlertTriangle, ExternalLink } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export function NetworkGuardModal({ open }) {
  const handleSwitch = () => {
    try {
      window.solana?.request({ method: 'switchNetwork', params: { network: 'devnet' } })
    } catch (_) { /* silently ignore */ }
  }
  return (
    <Dialog open={open}>
      <DialogContent onInteractOutside={e => e.preventDefault()} onEscapeKeyDown={e => e.preventDefault()} className="max-w-sm">
        <DialogHeader>
          <div className="w-14 h-14 rounded-2xl bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center mx-auto mb-2">
            <AlertTriangle className="w-7 h-7 text-yellow-400" />
          </div>
          <DialogTitle className="text-center">Wrong Network Detected</DialogTitle>
          <DialogDescription className="text-center">
            PuffinPerpDex runs exclusively on <span className="text-[#F0B90B] font-semibold">Solana Devnet</span>.
            Please switch your wallet network to continue trading.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Button onClick={handleSwitch}
            className="w-full btn-gradient text-[#161A1E] font-semibold rounded-xl hover:opacity-90">
            Switch to Devnet Automatically
          </Button>
          <a href="https://phantom.app/learn/solana/how-to-change-solana-networks"
            target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full px-4 py-2 rounded-xl border border-white/10 text-sm text-gray-400 hover:text-white hover:border-white/20 transition-all">
            <ExternalLink className="w-4 h-4" /> How to switch manually
          </a>
        </div>
        <p className="text-[10px] text-gray-600 text-center mt-4">
          Phantom &rarr; Settings &rarr; Network &rarr; Devnet<br />
          Solflare &rarr; Settings &rarr; Network &rarr; Devnet
        </p>
      </DialogContent>
    </Dialog>
  )
}
