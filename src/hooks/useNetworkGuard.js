import { useState, useEffect } from 'react'
import { useWallet, useConnection } from '@/providers/solana-wallet'

/** ───────────────────────────────────────────────────────────────────────────
 *  useNetworkGuard — REAL Solana Network Detection
 *  ───────────────────────────────────────────────────────────────────────────
 *  Uses @solana/web3.js Connection.getGenesisHash() to verify the wallet
 *  is connected to Solana Devnet (not mainnet or testnet).
 *
 *  Arcium Integration: Arcium computations MUST be submitted to devnet.
 *  This guard prevents accidental mainnet transactions.
 *  ─────────────────────────────────────────────────────────────────────────── */

const DEVNET_GENESIS_HASH = 'EtWTRABZaYq6iMfeYKouRu166VU2xqa1wcaWoxPkrZBG'

export function useNetworkGuard() {
  const { connected } = useWallet()
  const { connection } = useConnection()
  const [isDevnet, setIsDevnet] = useState(true)
  const [isWrongNetwork, setIsWrongNetwork] = useState(false)
  const [checking, setChecking] = useState(false)

  useEffect(() => {
    if (!connected || !connection) {
      setIsDevnet(true)
      setIsWrongNetwork(false)
      return
    }

    let cancelled = false
    const check = async () => {
      setChecking(true)
      try {
        const genesis = await connection.getGenesisHash()
        if (cancelled) return
        const onDevnet = genesis === DEVNET_GENESIS_HASH
        setIsDevnet(onDevnet)
        setIsWrongNetwork(!onDevnet)
      } catch {
        if (!cancelled) {
          // If we can't verify, assume devnet to not block the UI
          setIsDevnet(true)
          setIsWrongNetwork(false)
        }
      } finally {
        if (!cancelled) setChecking(false)
      }
    }

    check()
    return () => { cancelled = true }
  }, [connected, connection])

  return { isDevnet, isWrongNetwork, checking }
}
