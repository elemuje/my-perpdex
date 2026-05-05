import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js'

/** ───────────────────────────────────────────────────────────────────────────
 *  SolanaWalletProvider
 *  ───────────────────────────────────────────────────────────────────────────
 *  REAL Solana wallet integration using @solana/web3.js Connection.
 *
 *  Features:
 *    • Phantom, Solflare, Backpack wallet detection + connection
 *    • Real Solana RPC via Connection (balance, genesis hash, etc.)
 *    • Proper wallet adapter pattern with event listeners
 *    • Simulated mode for demo when no extension installed
 *    • Connection is exposed via useConnection() for child components
 *
 *  Arcium Integration: The Connection is used by ArciumPrivacyProvider to
 *  fetch MXE public keys and submit encrypted computations on-chain.
 *  ─────────────────────────────────────────────────────────────────────────── */

const WalletContext = createContext(null)

// Devnet genesis hash for network verification
const DEVNET_GENESIS_HASH = 'EtWTRABZaYq6iMfeYKouRu166VU2xqa1wcaWoxPkrZBG'

const WALLETS = [
  {
    id: 'phantom',
    name: 'Phantom',
    icon: 'https://raw.githubusercontent.com/solana-labs/wallet-adapter/master/packages/wallets/icons/phantom.svg',
    detect: () => typeof window !== 'undefined' && window.solana?.isPhantom,
    connect: async () => {
      const resp = await window.solana.connect()
      return resp.publicKey.toString()
    },
    disconnect: () => window.solana?.disconnect(),
    // Listen for account changes
    onChange: (cb) => {
      if (window.solana) window.solana.on('accountChanged', cb)
    },
    offChange: (cb) => {
      if (window.solana) window.solana.off('accountChanged', cb)
    },
  },
  {
    id: 'solflare',
    name: 'Solflare',
    icon: 'https://raw.githubusercontent.com/solana-labs/wallet-adapter/master/packages/wallets/icons/solflare.svg',
    detect: () => typeof window !== 'undefined' && window.solflare?.isSolflare,
    connect: async () => {
      await window.solflare.connect()
      return window.solflare.publicKey.toString()
    },
    disconnect: () => window.solflare?.disconnect(),
    onChange: (cb) => {
      if (window.solflare) window.solflare.on('accountChanged', cb)
    },
    offChange: (cb) => {
      if (window.solflare) window.solflare.off('accountChanged', cb)
    },
  },
  {
    id: 'backpack',
    name: 'Backpack',
    icon: 'https://raw.githubusercontent.com/coral-xyz/backpack/master/assets/backpack.png',
    detect: () => typeof window !== 'undefined' && window.backpack?.isBackpack,
    connect: async () => {
      const resp = await window.backpack.connect()
      return resp.publicKey.toString()
    },
    disconnect: () => window.backpack?.disconnect(),
    onChange: () => {},
    offChange: () => {},
  },
]

function makeSimulatedAddress() {
  const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
  return Array.from({ length: 44 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

/** Create a real Solana Connection to devnet */
function createConnection() {
  const rpcUrl = import.meta.env?.VITE_RPC_URL || 'https://api.devnet.solana.com'
  return new Connection(rpcUrl, 'confirmed')
}

export function SolanaWalletProvider({ children }) {
  const [connected, setConnected] = useState(false)
  const [publicKey, setPublicKey] = useState(null)
  const [connecting, setConnecting] = useState(false)
  const [walletName, setWalletName] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [activeDisconnect, setActiveDisconnect] = useState(null)
  const [activeWallet, setActiveWallet] = useState(null)

  // Real Solana connection - shared across the app
  const connectionRef = useRef(createConnection())

  // Ensure connection is fresh
  useEffect(() => {
    connectionRef.current = createConnection()
  }, [])

  const connect = useCallback(async (wallet) => {
    setConnecting(true)
    setShowModal(false)
    try {
      let addr
      if (wallet.detect()) {
        // Real wallet extension detected
        addr = await wallet.connect()
        setActiveDisconnect(() => wallet.disconnect)
        setActiveWallet(wallet)

        // Set up account change listener
        wallet.onChange?.((newPublicKey) => {
          if (newPublicKey) {
            const newAddr = newPublicKey.toString?.() || newPublicKey
            setPublicKey({ toString: () => newAddr, toBase58: () => newAddr })
          } else {
            // User disconnected from wallet side
            setConnected(false)
            setPublicKey(null)
            setWalletName(null)
            setActiveWallet(null)
          }
        })
      } else {
        // Extension not installed — simulate for demo
        await new Promise(r => setTimeout(r, 900))
        addr = makeSimulatedAddress()
        setActiveDisconnect(null)
        setActiveWallet(null)
      }
      setPublicKey({ toString: () => addr, toBase58: () => addr })
      setWalletName(wallet.name)
      setConnected(true)
    } catch (e) {
      console.error('Wallet connect error:', e)
    } finally {
      setConnecting(false)
    }
  }, [])

  const disconnect = useCallback(() => {
    try {
      if (activeWallet?.offChange) {
        activeWallet.offChange()
      }
      activeDisconnect?.()
    } catch { /* ignore */ }
    setConnected(false)
    setPublicKey(null)
    setWalletName(null)
    setActiveDisconnect(null)
    setActiveWallet(null)
  }, [activeDisconnect, activeWallet])

  return (
    <WalletContext.Provider value={{
      connected,
      publicKey,
      connecting,
      walletName,
      connection: connectionRef.current,
      connect: () => setShowModal(true),
      disconnect,
    }}>
      {children}
      <WalletModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onSelect={connect}
        connecting={connecting}
      />
    </WalletContext.Provider>
  )
}

/* ── Wallet Selection Modal ── */
function WalletModal({ open, onClose, onSelect, connecting }) {
  return (
    <AnimatePresence>
      {open && (
        <div className="wallet-modal-overlay" onClick={onClose}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            onClick={e => e.stopPropagation()}
            className="w-full max-w-sm mx-4 rounded-2xl overflow-hidden"
            style={{ background: '#161A1E', border: '1px solid rgba(240,185,11,0.15)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              <h2 className="text-base font-bold text-white">Connect Wallet</h2>
              <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors text-xl leading-none">&times;</button>
            </div>
            {/* Wallet list */}
            <div className="p-4 space-y-2">
              {WALLETS.map(w => {
                const installed = w.detect()
                return (
                  <button
                    key={w.id}
                    onClick={() => onSelect(w)}
                    disabled={connecting}
                    className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all disabled:opacity-50"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(240,185,11,0.35)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'}
                  >
                    <img src={w.icon} alt={w.name} className="w-9 h-9 rounded-xl" onError={e => { e.target.style.display = 'none' }} />
                    <div className="text-left flex-1">
                      <div className="text-sm font-semibold text-white">{w.name}</div>
                      <div className="text-[11px]" style={{ color: installed ? '#02C076' : '#848E9C' }}>
                        {installed ? '\u25CF Detected' : 'Not installed — will simulate'}
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                      style={installed
                        ? { background: 'rgba(2,192,118,0.12)', color: '#02C076' }
                        : { background: 'rgba(132,142,156,0.12)', color: '#848E9C' }}>
                      {installed ? 'Connect' : 'Demo'}
                    </span>
                  </button>
                )
              })}
            </div>
            <div className="px-6 pb-5 text-center">
              <p className="text-[10px]" style={{ color: '#848E9C' }}>
                Running on <span style={{ color: '#F0B90B' }}>Solana Devnet</span> &middot; Arcium MPC Testnet
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

/* ── WalletMultiButton — drop-in replacement ── */
export function WalletMultiButton({ className = '' }) {
  const { connected, publicKey, connecting, walletName, connect, disconnect } = useWallet()
  if (connecting) return (
    <button className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold ${className}`}
      style={{ background: 'rgba(240,185,11,0.1)', border: '1px solid rgba(240,185,11,0.25)', color: '#F0B90B' }}>
      <span className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
      Connecting&hellip;
    </button>
  )
  if (connected && publicKey) {
    const addr = publicKey.toString()
    return (
      <button onClick={disconnect}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${className}`}
        style={{ background: 'rgba(240,185,11,0.08)', border: '1px solid rgba(240,185,11,0.2)', color: '#F0B90B' }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(246,70,93,0.1)'; e.currentTarget.style.color = '#F6465D'; e.currentTarget.style.borderColor = 'rgba(246,70,93,0.25)' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(240,185,11,0.08)'; e.currentTarget.style.color = '#F0B90B'; e.currentTarget.style.borderColor = 'rgba(240,185,11,0.2)' }}
      >
        <span className="w-2 h-2 rounded-full" style={{ background: '#02C076' }} />
        {walletName && <span className="text-[10px] opacity-60">{walletName}</span>}
        {addr.slice(0, 4)}&hellip;{addr.slice(-4)}
      </button>
    )
  }
  return (
    <button onClick={connect}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${className}`}
      style={{ background: '#F0B90B', color: '#0B0E11' }}
      onMouseEnter={e => e.currentTarget.style.background = '#F8D12F'}
      onMouseLeave={e => e.currentTarget.style.background = '#F0B90B'}
    >
      Connect Wallet
    </button>
  )
}

export function useWallet() {
  return useContext(WalletContext)
}

/**
 * useConnection — returns the REAL Solana Connection from the provider.
 * Used by ArciumPrivacyProvider for MXE key fetching and by
 * useSolanaBalance for real RPC balance queries.
 */
export function useConnection() {
  const ctx = useContext(WalletContext)
  if (!ctx) {
    // Fallback: create a new connection if called outside provider
    return { connection: createConnection() }
  }
  return { connection: ctx.connection }
}
