import { useState, useCallback, useRef } from 'react'

let _id = 100

export function useMockTrades() {
  const [positions, setPositions] = useState([])
  const [history, setHistory] = useState([])
  const posMapRef = useRef({})

  const syncMap = useCallback((pos) => {
    posMapRef.current = {}
    pos.forEach(p => { posMapRef.current[p.id] = p })
  }, [])

  const hydratePositions = useCallback((pos) => {
    syncMap(pos)
    setPositions(pos)
  }, [syncMap])

  const openPosition = useCallback(async (params) => {
    const pos = {
      id: _id++,
      side: params.side,
      pair: params.pair ?? 'SOL-PERP',
      entryPrice: params.entryPrice,
      size: params.size,
      leverage: params.leverage,
      margin: params.margin,
      liquidationPrice: params.liquidationPrice,
      orderType: params.orderType ?? 'market',
      stopLoss: params.stopLoss ?? null,
      takeProfit: params.takeProfit ?? null,
      isPrivate: params.isPrivate ?? true,
      privacyScore: params.isPrivate ? 92 : 30,
      // Store Arcium encrypted payload if available
      arciumResult: params.arciumResult ?? null,
      arciumComputationId: params.arciumResult?.computationId ?? null,
      status: 'open',
      createdAt: new Date(),
    }
    posMapRef.current[pos.id] = pos
    setPositions(prev => [pos, ...prev])
    return pos
  }, [])

  const closePosition = useCallback(async ({ id, exitPrice, pnl }) => {
    const original = posMapRef.current[id]
    if (original) {
      const closed = {
        ...original,
        exitPrice,
        pnl,
        status: 'closed',
        closedAt: new Date(),
      }
      setHistory(prev => [closed, ...prev])
      delete posMapRef.current[id]
    }
    setPositions(prev => prev.filter(p => p.id !== id))
  }, [])

  return {
    positions,
    history,
    openPosition,
    closePosition,
    setPositions: hydratePositions,
    setHistory,
  }
}

export function useMockLeaderboard() {
  const [data] = useState(() => {
    const hex = '0123456789abcdef'
    return Array.from({ length: 24 }, (_, i) => {
      const addr = Array.from({ length: 12 }, () => hex[Math.floor(Math.random() * 16)]).join('')
      const trades = Math.floor(Math.random() * 220) + 8
      const wins = Math.floor(trades * (0.38 + Math.random() * 0.44))
      const pnl = parseFloat((Math.random() * 5000 - 800).toFixed(2))
      const volume = parseFloat((Math.random() * 600 + 20).toFixed(1))
      return {
        id: i + 1,
        walletAddress: `${addr.slice(0, 6)}\u2026${addr.slice(-4)}`,
        totalPnl: pnl,
        winRate: ((wins / trades) * 100).toFixed(1),
        totalTrades: trades,
        volumeTraded: volume,
        isPrivate: Math.random() > 0.35,
        privacyScore: Math.floor(Math.random() * 55 + 45),
      }
    })
    .sort((a, b) => b.totalPnl - a.totalPnl)
    .map((t, i) => ({ ...t, rank: i + 1 }))
  })
  return data
}
