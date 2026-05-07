import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TrendingUp, TrendingDown, RefreshCw, Clock, Trash2, Copy, Check, Lock, Unlock, Calculator, Flame } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useArciumPrivacy } from '@/providers/arcium-privacy'
import { useWallet } from '@/providers/solana-wallet'
import { useRealtimePrice, fetchHistoricalPrices } from '@/hooks/useRealtimePrice'
import { useMockTrades } from '@/hooks/useMockTrades'
import { useArciumPipeline, PIPELINE_STEPS } from '@/hooks/useArciumPipeline'
import { useAppShell } from '@/providers/app-shell'
import { ArciumPipelineTracker, ArciumPipelineModal } from '@/components/ArciumPipelineTracker'
import { WalletBalanceDisplay } from '@/components/WalletBalanceDisplay'
import { cn } from '@/lib/utils'

const PAIRS = ['SOL-PERP', 'BTC-PERP', 'ETH-PERP', 'JUP-PERP', 'BONK-PERP']
const PRICE_DECIMALS = { 'SOL-PERP': 2, 'BTC-PERP': 1, 'ETH-PERP': 2, 'JUP-PERP': 4, 'BONK-PERP': 8 }
const LEV_BANDS = [2, 5, 10, 25, 50, 100]
const GREEN = '#02C076', RED = '#F6465D', YELLOW = '#F0B90B', MUTED = '#848E9C'

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1800) })
  }
  return (
    <button onClick={copy} className="p-1 rounded transition-colors" style={{ color: copied ? GREEN : MUTED }}>
      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
    </button>
  )
}

// ── Price Chart (live animated) ──
function PriceChart({ pair }) {
  const { price, change24h } = useRealtimePrice(pair)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [chartInterval, setChartInterval] = useState('1m')
  const tickRef = useRef(null)
  const baseRef = useRef(null)

  // Load historical + seed fallback
  useEffect(() => {
    setLoading(true)
    fetchHistoricalPrices(pair, chartInterval, 100).then(data => {
      const seed = data.length ? data : generateFallback(pair, chartInterval)
      setHistory(seed)
      baseRef.current = seed[seed.length - 1]?.price ?? parseFloat(SEED_PRICES[pair] ?? 100)
      setLoading(false)
    })
  }, [pair, chartInterval])

  // Animate chart tick every 800ms — appends a new micro-candle so it flows continuously
  useEffect(() => {
    if (loading) return
    tickRef.current = setInterval(() => {
      setHistory(prev => {
        if (!prev.length) return prev
        const last = prev[prev.length - 1]
        const base = baseRef.current ?? last.price
        // Random walk: small drift + noise
        const drift = (Math.random() - 0.499) * base * 0.0012
        const newPrice = Math.max(base * 0.85, base + drift)
        baseRef.current = newPrice
        const now = new Date()
        const timeLabel = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        // Either update last candle or push a new one every ~30 ticks
        const shouldAppend = prev.length < 120 || Math.random() < 0.08
        if (shouldAppend) {
          const newCandle = {
            time: timeLabel,
            open: last.price,
            high: Math.max(last.price, newPrice),
            low: Math.min(last.price, newPrice),
            close: newPrice,
            price: newPrice,
            volume: Math.random() * 500,
          }
          return [...prev.slice(-119), newCandle]
        } else {
          const next = [...prev]
          const updated = { ...last, price: newPrice, close: newPrice, high: Math.max(last.high ?? last.price, newPrice), low: Math.min(last.low ?? last.price, newPrice) }
          next[next.length - 1] = updated
          return next
        }
      })
    }, 800)
    return () => clearInterval(tickRef.current)
  }, [loading, pair, chartInterval])

  // Sync real price from API into chart when it arrives
  useEffect(() => {
    if (!price || !history.length) return
    baseRef.current = price
    setHistory(prev => {
      if (!prev.length) return prev
      const next = [...prev]
      const last = next[next.length - 1]
      next[next.length - 1] = { ...last, price, close: price, high: Math.max(last.high ?? last.price, price), low: Math.min(last.low ?? last.price, price) }
      return next
    })
  }, [price])

  const isPos = (change24h || 0) >= 0
  const currentPrice = history.length ? history[history.length - 1].price : (price ?? 0)

  if (loading) return <div className="flex-1 flex items-center justify-center"><Skeleton className="h-64 w-full" /></div>

  return (
    <div className="flex-1 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          {[{ label: '1m', val: '1m' }, { label: '5m', val: '5m' }, { label: '15m', val: '15m' }, { label: '1H', val: '1h' }, { label: '4H', val: '4h' }, { label: '1D', val: '1d' }].map(b => (
            <button key={b.val} onClick={() => setChartInterval(b.val)}
              className="px-2 py-1 rounded text-[11px] font-semibold transition-all"
              style={{ background: chartInterval === b.val ? 'rgba(240,185,11,0.15)' : 'transparent', color: chartInterval === b.val ? YELLOW : MUTED, border: chartInterval === b.val ? '1px solid rgba(240,185,11,0.3)' : '1px solid transparent' }}>
              {b.label}
            </button>
          ))}
        </div>
        <div className="text-right">
          <div className="text-xl font-extrabold tabular-nums transition-colors" style={{ color: isPos ? GREEN : RED }}>
            ${currentPrice.toFixed(PRICE_DECIMALS[pair])}
          </div>
          <div className="text-[11px] font-semibold" style={{ color: isPos ? GREEN : RED }}>
            {isPos ? '+' : ''}{(change24h || 0).toFixed(2)}%
          </div>
        </div>
      </div>
      <div className="flex-1" style={{ minHeight: 280 }}>
        <ChartCanvas data={history} positive={isPos} />
      </div>
    </div>
  )
}

function ChartCanvas({ data, positive }) {
  const color = positive ? GREEN : RED
  if (!data.length) return null

  const width = 800, height = 300, pad = { t: 16, r: 16, b: 28, l: 56 }
  const prices = data.map(d => d.price)
  const minP = Math.min(...prices), maxP = Math.max(...prices)
  const pad5 = (maxP - minP) * 0.05 || minP * 0.002
  const lo = minP - pad5, hi = maxP + pad5, rng = hi - lo

  const toX = i => pad.l + (i / (data.length - 1)) * (width - pad.l - pad.r)
  const toY = p => pad.t + (1 - (p - lo) / rng) * (height - pad.t - pad.b)

  const linePath = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${toX(i).toFixed(1)},${toY(d.price).toFixed(1)}`).join(' ')
  const areaPath = linePath + ` L${toX(data.length - 1).toFixed(1)},${height - pad.b} L${toX(0).toFixed(1)},${height - pad.b} Z`

  // Y-axis gridlines
  const gridCount = 4
  const gridLines = Array.from({ length: gridCount + 1 }, (_, i) => {
    const p = lo + (rng * i) / gridCount
    return { y: toY(p), label: p >= 1000 ? `$${(p / 1000).toFixed(1)}k` : p >= 1 ? `$${p.toFixed(2)}` : `$${p.toFixed(6)}` }
  })

  const lastPrice = data[data.length - 1].price
  const lastY = toY(lastPrice)
  const candleW = Math.max(1.5, (width - pad.l - pad.r) / data.length * 0.55)

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={`ag-${positive}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0.01" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Grid lines */}
      {gridLines.map((g, i) => (
        <g key={i}>
          <line x1={pad.l} y1={g.y} x2={width - pad.r} y2={g.y} stroke="#ffffff" strokeOpacity="0.04" strokeWidth="1" strokeDasharray="4 4" />
          <text x={pad.l - 6} y={g.y + 4} textAnchor="end" fontSize="9" fill="#848E9C">{g.label}</text>
        </g>
      ))}

      {/* Candle wicks */}
      {data.map((d, i) => {
        const isUp = (d.close ?? d.price) >= (d.open ?? d.price)
        const hi = d.high ?? d.price, lo2 = d.low ?? d.price
        return (
          <line key={`w${i}`} x1={toX(i)} y1={toY(hi)} x2={toX(i)} y2={toY(lo2)}
            stroke={isUp ? GREEN : RED} strokeWidth="0.6" opacity="0.4" />
        )
      })}

      {/* Area fill */}
      <path d={areaPath} fill={`url(#ag-${positive})`} />

      {/* Price line */}
      <path d={linePath} fill="none" stroke={color} strokeWidth="1.8" filter="url(#glow)" />

      {/* Candle bodies */}
      {data.map((d, i) => {
        const isUp = (d.close ?? d.price) >= (d.open ?? d.price)
        const y1 = toY(Math.max(d.open ?? d.price, d.close ?? d.price))
        const y2 = toY(Math.min(d.open ?? d.price, d.close ?? d.price))
        return (
          <rect key={`c${i}`} x={toX(i) - candleW / 2} y={y1} width={candleW}
            height={Math.max(1, y2 - y1)} rx="0.5"
            fill={isUp ? GREEN : RED} opacity="0.55" />
        )
      })}

      {/* Live price line */}
      <line x1={pad.l} y1={lastY} x2={width - pad.r} y2={lastY}
        stroke={color} strokeWidth="0.8" strokeDasharray="5 3" strokeOpacity="0.6" />
      {/* Price tag */}
      <rect x={width - pad.r + 2} y={lastY - 9} width={48} height={16} rx="3" fill={color} opacity="0.9" />
      <text x={width - pad.r + 26} y={lastY + 4} textAnchor="middle" fontSize="9" fontWeight="bold" fill="#fff">
        {lastPrice >= 1000 ? `${(lastPrice / 1000).toFixed(2)}k` : lastPrice >= 1 ? lastPrice.toFixed(2) : lastPrice.toFixed(5)}
      </text>

      {/* Animated dot at last point */}
      <circle cx={toX(data.length - 1)} cy={lastY} r="3.5" fill={color} opacity="0.9">
        <animate attributeName="r" values="3;5;3" dur="1.6s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.9;0.4;0.9" dur="1.6s" repeatCount="indefinite" />
      </circle>

      {/* X-axis */}
      <line x1={pad.l} y1={height - pad.b} x2={width - pad.r} y2={height - pad.b} stroke="#ffffff" strokeOpacity="0.06" strokeWidth="1" />
      {/* X labels — every ~20 candles */}
      {data.filter((_, i) => i % Math.max(1, Math.floor(data.length / 6)) === 0).map((d, i, arr) => {
        const origIdx = i * Math.max(1, Math.floor(data.length / 6))
        return (
          <text key={i} x={toX(origIdx)} y={height - pad.b + 14} textAnchor="middle" fontSize="9" fill="#848E9C">
            {d.time}
          </text>
        )
      })}
    </svg>
  )
}

function generateFallback(pair, interval) {
  const n = interval === '1m' ? 100 : interval === '5m' ? 80 : interval === '15m' ? 60 : interval === '1h' ? 48 : 30
  const priceMap = { 'SOL-PERP': 145, 'BTC-PERP': 67000, 'ETH-PERP': 3200, 'JUP-PERP': 0.8, 'BONK-PERP': 0.000028 }
  const base = priceMap[pair] || 100
  const mult = interval === '1m' ? 0.003 : interval === '5m' ? 0.005 : interval === '15m' ? 0.008 : interval === '1h' ? 0.015 : 0.03
  const d = []
  for (let i = 0; i < n; i++) {
    const p = base * (1 + Math.sin(i / 8) * mult * 0.3 + (Math.random() - 0.5) * mult)
    d.push({
      time: new Date(Date.now() - (n - i) * (interval === '1m' ? 60000 : interval === '5m' ? 300000 : interval === '15m' ? 900000 : interval === '1h' ? 3600000 : 86400000)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      open: p * (1 - Math.random() * 0.002), high: p * (1 + Math.random() * 0.003), low: p * (1 - Math.random() * 0.003),
      close: p, price: p, volume: Math.random() * 1000,
    })
  }
  return d
}

// ── Market Panel ──
function MarketPanel({ currentPair }) {
  const { price, change24h, high24h, low24h, volume24h } = useRealtimePrice(currentPair)
  const isPos = (change24h || 0) >= 0
  const stats = [
    { label: 'Mark Price', value: price ? `$${price.toFixed(PRICE_DECIMALS[currentPair])}` : '—' },
    { label: '24h Change', value: change24h ? `${isPos ? '+' : ''}${change24h.toFixed(2)}%` : '—', color: isPos ? GREEN : RED },
    { label: '24h High', value: high24h ? `$${high24h.toFixed(PRICE_DECIMALS[currentPair])}` : '—' },
    { label: '24h Low', value: low24h ? `$${low24h.toFixed(PRICE_DECIMALS[currentPair])}` : '—' },
    { label: '24h Volume', value: volume24h ? `$${(volume24h / 1e6).toFixed(2)}M` : '—' },
    { label: 'Open Interest', value: '$3.2M' },
    { label: 'Funding Rate', value: '0.0100%' },
    { label: 'Countdown', value: '07:23:14' },
  ]
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
      {stats.map((s, i) => (
        <div key={i}>
          <div className="text-[9px] font-semibold mb-0.5" style={{ color: MUTED }}>{s.label}</div>
          <div className="text-xs font-mono font-semibold truncate" style={{ color: s.color || '#E5E7EB' }}>{s.value}</div>
        </div>
      ))}
    </div>
  )
}

// ── Order Book ──
function OrderBook({ currentPair }) {
  const { price } = useRealtimePrice(currentPair)
  const rows = Array.from({ length: 8 }, (_, i) => {
    const offset = (i + 1) * 0.05
    const sprd = (Math.random() * 0.08 + 0.01)
    return {
      bid: { price: price ? price * (1 - offset * 0.01) : 100 * (1 - offset * 0.01), size: (Math.random() * 40 + 2).toFixed(3) },
      ask: { price: price ? price * (1 + offset * 0.01) : 100 * (1 + offset * 0.01), size: (Math.random() * 40 + 2).toFixed(3) },
      spread: sprd,
    }
  })
  return (
    <div>
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="text-[9px] font-semibold" style={{ color: MUTED }}>Price (USD)</span>
        <span className="text-[9px] font-semibold" style={{ color: MUTED }}>Size ({currentPair.split('-')[0]})</span>
      </div>
      {rows.map((r, i) => (
        <div key={i} className="grid grid-cols-[1fr_1fr] gap-1 mb-0.5">
          <div className="flex justify-between px-1.5 py-0.5 rounded text-[11px]" style={{ background: `rgba(2,192,118,${0.04 + (8 - i) * 0.012})` }}>
            <span className="font-mono" style={{ color: GREEN }}>{r.bid.price.toFixed(PRICE_DECIMALS[currentPair])}</span>
            <span className="font-mono" style={{ color: '#D1D5DB' }}>{r.bid.size}</span>
          </div>
          <div className="flex justify-between px-1.5 py-0.5 rounded text-[11px]" style={{ background: `rgba(246,70,93,${0.04 + (8 - i) * 0.012})` }}>
            <span className="font-mono" style={{ color: RED }}>{r.ask.price.toFixed(PRICE_DECIMALS[currentPair])}</span>
            <span className="font-mono" style={{ color: '#D1D5DB' }}>{r.ask.size}</span>
          </div>
        </div>
      ))}
      <div className="text-center py-1.5">
        <span className="text-[10px] font-mono font-semibold" style={{ color: YELLOW }}>
          Spread: {rows[0]?.spread?.toFixed(2) ?? '0.05'}%
        </span>
      </div>
    </div>
  )
}

// ── Recent Trades ──
function RecentTrades({ currentPair }) {
  const trades = Array.from({ length: 12 }, (_, i) => ({
    time: `${String(Math.floor(Math.random() * 24)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
    price: 100 + Math.random() * 50,
    size: (Math.random() * 5 + 0.1).toFixed(3),
    side: Math.random() > 0.45 ? 'buy' : 'sell',
  }))
  return (
    <div className="space-y-0.5">
      {trades.map((t, i) => (
        <div key={i} className="flex items-center justify-between px-1 py-0.5 text-[11px] font-mono">
          <span style={{ color: MUTED }}>{t.time}</span>
          <span style={{ color: t.side === 'buy' ? GREEN : RED }}>{t.price.toFixed(PRICE_DECIMALS[currentPair])}</span>
          <span style={{ color: '#D1D5DB' }}>{t.size}</span>
        </div>
      ))}
    </div>
  )
}

// ── Open Positions ──
function PositionsTab({ positions, history, onClose, toast }) {
  const [activeTab, setActiveTab] = useState('open')
  if (!positions.length && !history.length && activeTab === 'open') {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
          <TrendingUp className="w-6 h-6 text-gray-600" />
        </div>
        <p className="text-sm text-gray-400 mb-1">No open positions yet</p>
        <p className="text-xs text-gray-600">Place your first trade to see it here</p>
      </div>
    )
  }
  return (
    <div>
      <div className="flex items-center gap-1 mb-3">
        {['open', 'history'].map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className="px-3 py-1 rounded-md text-[11px] font-semibold transition-all"
            style={{ background: activeTab === t ? 'rgba(240,185,11,0.15)' : 'transparent', color: activeTab === t ? YELLOW : MUTED, border: activeTab === t ? '1px solid rgba(240,185,11,0.3)' : '1px solid transparent' }}>
            {t === 'open' ? `Positions (${positions.length})` : `History (${history.length})`}
          </button>
        ))}
      </div>
      {activeTab === 'open' ? (
        <div className="space-y-2 max-h-52 overflow-y-auto scrollbar-thin pr-1">
          <AnimatePresence>
            {positions.map(pos => (
              <motion.div key={pos.id} layout exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}
                className="rounded-lg p-3" style={{ background: '#0B0E11', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${pos.side === 'long' ? 'tag-long' : 'tag-short'}`}>
                      {pos.side.toUpperCase()}
                    </span>
                    <span className="text-sm font-bold text-white">{pos.pair}</span>
                    <span className="text-[10px]" style={{ color: MUTED }}>{pos.leverage}x</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {pos.isPrivate && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded font-bold"
                        style={{ background: 'rgba(240,185,11,0.1)', color: YELLOW, border: '1px solid rgba(240,185,11,0.2)' }}>
                        <Lock className="w-2.5 h-2.5 inline" /> {pos.privacyScore}%
                      </span>
                    )}
                    {pos.arciumComputationId && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded font-medium"
                        style={{ background: 'rgba(2,192,118,0.08)', color: GREEN, border: '1px solid rgba(2,192,118,0.15)' }}>
                        MPC
                      </span>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  <div><div className="text-[9px]" style={{ color: MUTED }}>Size</div><div className="text-xs font-mono text-white">{pos.size}</div></div>
                  <div><div className="text-[9px]" style={{ color: MUTED }}>Entry</div><div className="text-xs font-mono text-white">${pos.entryPrice}</div></div>
                  <div><div className="text-[9px]" style={{ color: MUTED }}>Margin</div><div className="text-xs font-mono" style={{ color: YELLOW }}>{pos.margin}</div></div>
                </div>
                {(pos.stopLoss || pos.takeProfit) && (
                  <div className="flex items-center gap-2 mb-2">
                    {pos.stopLoss && (
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded" style={{ background: 'rgba(246,70,93,0.08)', border: '1px solid rgba(246,70,93,0.2)' }}>
                        <span className="text-[9px] font-semibold" style={{ color: RED }}>SL</span>
                        <span className="text-[9px] font-mono text-white">${parseFloat(pos.stopLoss).toFixed(2)}</span>
                      </div>
                    )}
                    {pos.takeProfit && (
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded" style={{ background: 'rgba(2,192,118,0.08)', border: '1px solid rgba(2,192,118,0.2)' }}>
                        <span className="text-[9px] font-semibold" style={{ color: GREEN }}>TP</span>
                        <span className="text-[9px] font-mono text-white">${parseFloat(pos.takeProfit).toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <div className="text-[10px]" style={{ color: MUTED }}>Liq: <span className="font-mono text-white">${pos.liquidationPrice}</span></div>
                  <button onClick={() => onClose(pos.id)}
                    className="text-[10px] font-semibold px-2 py-1 rounded transition-colors"
                    style={{ background: 'rgba(246,70,93,0.1)', color: RED, border: '1px solid rgba(246,70,93,0.2)' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(246,70,93,0.2)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(246,70,93,0.1)' }}>
                    Close
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="space-y-2 max-h-52 overflow-y-auto scrollbar-thin pr-1">
          {history.map(h => (
            <div key={h.id} className="rounded-lg p-3" style={{ background: '#0B0E11', border: '1px solid rgba(255,255,255,0.04)' }}>
              <div className="flex items-center justify-between mb-1">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${h.side === 'long' ? 'tag-long' : 'tag-short'}`}>{h.side.toUpperCase()}</span>
                <span className="text-sm font-bold text-white">{h.pair}</span>
                <span className="text-xs font-mono font-bold" style={{ color: (h.pnl || 0) >= 0 ? GREEN : RED }}>{(h.pnl || 0) >= 0 ? '+' : ''}{h.pnl?.toFixed(2) ?? '0.00'}</span>
              </div>
              <div className="flex items-center justify-between text-[10px]" style={{ color: MUTED }}>
                <span>{h.size} @ ${h.entryPrice}</span>
                <span>{h.leverage}x</span>
              </div>
              {(h.stopLoss || h.takeProfit) && (
                <div className="flex items-center gap-2 mt-1.5">
                  {h.stopLoss && (
                    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded" style={{ background: 'rgba(246,70,93,0.08)', border: '1px solid rgba(246,70,93,0.15)' }}>
                      <span className="text-[9px] font-semibold" style={{ color: '#F6465D' }}>SL</span>
                      <span className="text-[9px] font-mono text-white">${parseFloat(h.stopLoss).toFixed(2)}</span>
                    </div>
                  )}
                  {h.takeProfit && (
                    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded" style={{ background: 'rgba(2,192,118,0.08)', border: '1px solid rgba(2,192,118,0.15)' }}>
                      <span className="text-[9px] font-semibold" style={{ color: '#02C076' }}>TP</span>
                      <span className="text-[9px] font-mono text-white">${parseFloat(h.takeProfit).toFixed(2)}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main Trade Page ──
export default function Trade() {
  const { connected } = useWallet()
  const { isPrivateMode, togglePrivateMode, privacyScore, mevProtectionEnabled, toggleMevProtection, arciumReady, encryptTradeData } = useArciumPrivacy()
  const { positions, history, openPosition, closePosition, setHistory } = useMockTrades()
  const { step, isRunning, isDone, isError, error, result, run, reset } = useArciumPipeline()
  const { toast } = useAppShell()

  const [currentPair, setCurrentPair] = useState('SOL-PERP')
  const [side, setSide] = useState('long')
  const [size, setSize] = useState(1.5)
  const [leverage, setLeverage] = useState(10)
  const [orderType, setOrderType] = useState('market')
  const [showPipelineModal, setShowPipelineModal] = useState(false)
  const [priceUpdated, setPriceUpdated] = useState(false)
  const [stopLoss, setStopLoss] = useState('')
  const [takeProfit, setTakeProfit] = useState('')
  const [showSlTp, setShowSlTp] = useState(false)

  const { price, change24h } = useRealtimePrice(currentPair)

  useEffect(() => {
    setPriceUpdated(true)
    const t = setTimeout(() => setPriceUpdated(false), 400)
    return () => clearTimeout(t)
  }, [price])

  useEffect(() => {
    if (isDone && result) {
      toast.success(`Trade executed — ${result.proof?.type} proof verified`)
      setShowPipelineModal(false)
    }
    if (isError && error) toast.error(`Trade failed: ${error}`)
  }, [isDone, isError])

  const notional = size * (price || 0)
  const margin = notional / leverage
  const fee = notional * 0.0006
  const estLiq = side === 'long'
    ? (price || 0) * (1 - 0.9 / leverage)
    : (price || 0) * (1 + 0.9 / leverage)

  const doTrade = async () => {
    if (!connected || !price) return
    setShowPipelineModal(true)

    try {
      // Build trade params
      const tradeParams = {
        side, pair: currentPair, entryPrice: price.toString(), size: size.toString(),
        leverage: leverage.toString(), margin: margin.toFixed(4), liquidationPrice: estLiq.toFixed(2),
        orderType, isPrivate: isPrivateMode, stopLoss: stopLoss || null, takeProfit: takeProfit || null,
      }

      // Run the full Arcium pipeline (with real SDK encryption if available)
      const pipelineResult = await run(tradeParams)

      // Open position with encrypted data if available
      const encryptedData = pipelineResult?.encrypted
      await openPosition({
        ...tradeParams,
        arciumResult: encryptedData ? {
          computationId: pipelineResult.computationId,
          encrypted: encryptedData.ciphertext?.slice(0, 2) || 'encrypted',
        } : null,
      })

      toast.success(`${side === 'long' ? 'Long' : 'Short'} position opened at $${price.toFixed(PRICE_DECIMALS[currentPair])}`)
    } catch (err) {
      console.error('Trade error:', err)
      toast.error(err.message || 'Trade failed')
      setShowPipelineModal(false)
    }
  }

  const doClose = async (id) => {
    if (!price) return
    const pos = positions.find(p => p.id === id)
    if (!pos) return
    const pnl = (price - pos.entryPrice) * pos.size * (pos.side === 'long' ? 1 : -1)
    await closePosition({ id, exitPrice: price, pnl: parseFloat(pnl.toFixed(2)) })
    toast.success(`Position closed — PnL: ${pnl >= 0 ? '+' : ''}${pnl.toFixed(2)} USDC`)
  }

  const isPos = (change24h || 0) >= 0

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6">
      {/* Pipeline Modal */}
      <ArciumPipelineModal step={step} error={error} result={result}
        onClose={() => { setShowPipelineModal(false); reset() }}
        tradeInfo={{ action: `${side === 'long' ? 'Long' : 'Short'} ${size} ${currentPair} @ ${leverage}x`, side, size, pair: currentPair }} />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4" style={{ minHeight: 'calc(100vh - 140px)' }}>
        {/* ── Main Chart Area ── */}
        <div className="flex flex-col gap-4">
          {/* Pair selector */}
          <div className="flex items-center gap-1 flex-wrap">
            {PAIRS.map(p => (
              <button key={p} onClick={() => setCurrentPair(p)}
                className="px-3 py-1.5 rounded text-xs font-semibold transition-all"
                style={{
                  background: currentPair === p ? 'rgba(240,185,11,0.15)' : 'transparent',
                  color: currentPair === p ? YELLOW : MUTED,
                  border: currentPair === p ? '1px solid rgba(240,185,11,0.3)' : '1px solid transparent',
                }}>{p}</button>
            ))}
          </div>

          {/* Chart */}
          <div className="glass-panel rounded-xl p-4 flex-1" style={{ minHeight: 400 }}>
            <PriceChart pair={currentPair} />
          </div>

          {/* Positions */}
          <div className="glass-panel rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Flame className="w-4 h-4" style={{ color: YELLOW }} />
              <h3 className="text-sm font-bold text-white">Your Positions</h3>
            </div>
            <PositionsTab positions={positions} history={history} onClose={doClose} toast={toast} />
          </div>
        </div>

        {/* ── Right Panel ── */}
        <div className="space-y-4">
          {/* Privacy Toggle */}
          <div className="glass-panel rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isPrivateMode ? <Lock className="w-4 h-4" style={{ color: YELLOW }} /> : <Unlock className="w-4 h-4" style={{ color: MUTED }} />}
                <div>
                  <div className="text-sm font-bold" style={{ color: isPrivateMode ? YELLOW : MUTED }}>
                    {isPrivateMode ? 'Private Mode ON' : 'Private Mode OFF'}
                  </div>
                  <div className="text-[10px]" style={{ color: MUTED }}>
                    {isPrivateMode ? 'Arcium SDK encryption active' : 'Trades are transparent'}
                  </div>
                </div>
              </div>
              <Switch checked={isPrivateMode} onCheckedChange={togglePrivateMode}
                className="data-[state=checked]:bg-[#F0B90B]" />
            </div>
            {isPrivateMode && (
              <div className="mt-3 flex items-center justify-between px-3 py-2 rounded-lg" style={{ background: '#0B0E11', border: '1px solid rgba(240,185,11,0.08)' }}>
                <div className="flex items-center gap-2">
                  <span className="text-[10px]" style={{ color: MUTED }}>Privacy Score</span>
                  <span className="text-sm font-bold" style={{ color: YELLOW }}>{privacyScore}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px]" style={{ color: MUTED }}>MEV Protection</span>
                  <Switch checked={mevProtectionEnabled} onCheckedChange={toggleMevProtection}
                    className="data-[state=checked]:bg-[#02C076]" style={{ transform: 'scale(0.75)' }} />
                </div>
              </div>
            )}
            {arciumReady && isPrivateMode && (
              <div className="mt-2 flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-[#02C076] animate-pulse" />
                <span className="text-[9px] font-semibold" style={{ color: GREEN }}>Arcium SDK Ready — RescueCipher initialized</span>
              </div>
            )}
          </div>

          {/* Order Panel */}
          <div className="glass-panel rounded-xl p-4">
            {/* Side tabs */}
            <div className="flex gap-1 mb-4">
              <button onClick={() => setSide('long')} className="flex-1 py-2.5 rounded-lg text-sm font-bold transition-all"
                style={{ background: side === 'long' ? GREEN : 'rgba(2,192,118,0.08)', color: side === 'long' ? '#fff' : GREEN, border: side === 'long' ? '1px solid rgba(2,192,118,0.4)' : '1px solid transparent' }}>
                <TrendingUp className="w-4 h-4 inline mr-1.5" /> Long
              </button>
              <button onClick={() => setSide('short')} className="flex-1 py-2.5 rounded-lg text-sm font-bold transition-all"
                style={{ background: side === 'short' ? RED : 'rgba(246,70,93,0.08)', color: side === 'short' ? '#fff' : RED, border: side === 'short' ? '1px solid rgba(246,70,93,0.4)' : '1px solid transparent' }}>
                <TrendingDown className="w-4 h-4 inline mr-1.5" /> Short
              </button>
            </div>

            {/* Order type */}
            <div className="flex gap-1 mb-4">
              {['market', 'limit', 'stop'].map(t => (
                <button key={t} onClick={() => setOrderType(t)}
                  className="flex-1 py-1.5 rounded-md text-[11px] font-semibold transition-all"
                  style={{ background: orderType === t ? 'rgba(240,185,11,0.15)' : 'transparent', color: orderType === t ? YELLOW : MUTED, border: orderType === t ? '1px solid rgba(240,185,11,0.3)' : '1px solid rgba(255,255,255,0.06)' }}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>

            {/* Size */}
            <div className="mb-4">
              <div className="flex justify-between mb-1.5">
                <span className="text-[10px] font-semibold" style={{ color: MUTED }}>Position Size ({currentPair.split('-')[0]})</span>
                <span className="text-[10px] font-mono" style={{ color: YELLOW }}>{size.toFixed(2)}</span>
              </div>
              <Input type="number" value={size} onChange={e => setSize(parseFloat(e.target.value) || 0)}
                className="bg-[#0B0E11] border-white/10 text-white text-sm h-10 mb-2" />
              <Slider value={[size]} onValueChange={v => setSize(v[0])} min={0.1} max={50} step={0.1}
                className="py-1 [&_[role=slider]]:bg-[#F0B90B] [&_[role=slider]]:border-[#F0B90B]/50" />
            </div>

            {/* Leverage */}
            <div className="mb-5">
              <div className="flex justify-between mb-1.5">
                <span className="text-[10px] font-semibold" style={{ color: MUTED }}>Leverage</span>
                <span className="text-[10px] font-mono font-bold" style={{ color: YELLOW }}>{leverage}x</span>
              </div>
              <Slider value={[leverage]} onValueChange={v => setLeverage(v[0])} min={1} max={100} step={1}
                className="py-1 [&_[role=slider]]:bg-[#F0B90B] [&_[role=slider]]:border-[#F0B90B]/50" />
              <div className="flex justify-between mt-1.5">
                {LEV_BANDS.map(l => (
                  <button key={l} onClick={() => setLeverage(l)}
                    className="text-[9px] px-1.5 py-0.5 rounded font-semibold transition-all"
                    style={{ color: leverage === l ? YELLOW : MUTED, background: leverage === l ? 'rgba(240,185,11,0.1)' : 'transparent' }}>
                    {l}x
                  </button>
                ))}
              </div>
            </div>


            {/* Stop Loss / Take Profit */}
            <div className="mb-4">
              <button onClick={() => setShowSlTp(v => !v)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all"
                style={{ background: showSlTp ? "rgba(240,185,11,0.08)" : "rgba(255,255,255,0.03)", color: showSlTp ? YELLOW : MUTED, border: showSlTp ? "1px solid rgba(240,185,11,0.2)" : "1px solid rgba(255,255,255,0.06)" }}>
                <span>TP / SL</span>
                <span style={{ fontSize: 10, color: (stopLoss || takeProfit) ? GREEN : MUTED }}>
                  {stopLoss || takeProfit ? `SL:${stopLoss||"—"} TP:${takeProfit||"—"}` : "Not set"}
                </span>
              </button>
              {showSlTp && (
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <div>
                    <div className="text-[9px] font-semibold mb-1" style={{ color: RED }}>Stop Loss</div>
                    <Input type="number" placeholder={price ? (side==="long" ? (price*0.97).toFixed(PRICE_DECIMALS[currentPair]) : (price*1.03).toFixed(PRICE_DECIMALS[currentPair])) : "0.00"}
                      value={stopLoss} onChange={e => setStopLoss(e.target.value)}
                      className="bg-[#0B0E11] border-white/10 text-white text-xs h-8"
                      style={{ borderColor: stopLoss ? "rgba(246,70,93,0.4)" : undefined }} />
                    {stopLoss && price && (
                      <div className="text-[9px] mt-0.5" style={{ color: RED }}>
                        Loss: {((Math.abs(price - parseFloat(stopLoss)) / price) * leverage * 100).toFixed(1)}%
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="text-[9px] font-semibold mb-1" style={{ color: GREEN }}>Take Profit</div>
                    <Input type="number" placeholder={price ? (side==="long" ? (price*1.05).toFixed(PRICE_DECIMALS[currentPair]) : (price*0.95).toFixed(PRICE_DECIMALS[currentPair])) : "0.00"}
                      value={takeProfit} onChange={e => setTakeProfit(e.target.value)}
                      className="bg-[#0B0E11] border-white/10 text-white text-xs h-8"
                      style={{ borderColor: takeProfit ? "rgba(2,192,118,0.4)" : undefined }} />
                    {takeProfit && price && (
                      <div className="text-[9px] mt-0.5" style={{ color: GREEN }}>
                        Profit: +{((Math.abs(parseFloat(takeProfit) - price) / price) * leverage * 100).toFixed(1)}%
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            {/* Summary */}
            <div className="rounded-lg p-3 mb-4 space-y-1.5" style={{ background: '#0B0E11', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="flex justify-between text-xs">
                <span style={{ color: MUTED }}>Notional</span>
                <span className="font-mono text-white">${notional.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span style={{ color: MUTED }}>Margin Required</span>
                <span className="font-mono" style={{ color: YELLOW }}>${margin.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span style={{ color: MUTED }}>Trading Fee (0.06%)</span>
                <span className="font-mono text-white">${fee.toFixed(3)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span style={{ color: MUTED }}>Est. Liquidation</span>
                <span className="font-mono" style={{ color: side === 'long' ? RED : GREEN }}>${estLiq.toFixed(PRICE_DECIMALS[currentPair])}</span>
              </div>
              {isPrivateMode && (
                <div className="flex justify-between text-xs">
                  <span style={{ color: MUTED }}>Encryption</span>
                  <span className="font-mono" style={{ color: GREEN }}>
                    {arciumReady ? 'Arcium SDK Ready' : 'Initializing...'}
                  </span>
                </div>
              )}
            </div>

            {/* Submit */}
            <Button onClick={doTrade} disabled={!connected || isRunning}
              className={cn('w-full py-3 rounded-xl text-sm font-bold transition-all', isRunning && 'opacity-70')}
              style={{
                background: side === 'long' ? GREEN : RED,
                color: '#fff',
                boxShadow: side === 'long' ? '0 4px 20px rgba(2,192,118,0.3)' : '0 4px 20px rgba(246,70,93,0.3)',
              }}>
              {isRunning ? (
                <span className="flex items-center gap-2">
                  <Lock className="w-4 h-4 animate-pulse" /> Executing via Arcium MPC&hellip;
                </span>
              ) : (
                <span>{side === 'long' ? 'Long' : 'Short'} {currentPair} @ {leverage}x</span>
              )}
            </Button>
            {!connected && <p className="text-[10px] text-center mt-2" style={{ color: MUTED }}>Connect wallet to trade</p>}

            {/* Pipeline tracker inline */}
            {step > 0 && step < 6 && (
              <div className="mt-4">
                <ArciumPipelineTracker step={step} error={error} result={result} />
              </div>
            )}
          </div>

          {/* Order Book */}
          <div className="glass-panel rounded-xl p-4">
            <h3 className="text-sm font-bold text-white mb-3">Order Book</h3>
            <OrderBook currentPair={currentPair} />
          </div>

          {/* Recent Trades */}
          <div className="glass-panel rounded-xl p-4">
            <h3 className="text-sm font-bold text-white mb-3">Recent Trades</h3>
            <RecentTrades currentPair={currentPair} />
          </div>
        </div>
      </div>
    </div>
  )
}
