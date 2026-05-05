import { useState } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Search, ChevronRight, Zap, Lock, TrendingUp, Shield, Code, ExternalLink } from 'lucide-react'

const SECTIONS = {
  'Getting Started': {
    icon: Zap,
    color: '#F0B90B',
    items: [
      { title: 'Installation', content: 'Clone the repository and install dependencies:\n\n```bash\ngit clone https://github.com/YOUR_USERNAME/puffinperpdex.git\ncd puffinperpdex\nnpm install\n```\n\nStart the dev server:\n```bash\nnpm run dev  # => http://localhost:3000\n```' },
      { title: 'Wallet Setup', content: 'Install a Solana wallet (Phantom, Solflare, or Backpack). Switch to **Devnet** in wallet settings. Visit [faucet.solana.com](https://faucet.solana.com) to get devnet SOL.' },
      { title: 'Environment Configuration', content: 'Create a `.env` file with your configuration:\n\n```env\nVITE_SOLANA_NETWORK=devnet\nVITE_RPC_URL=https://api.devnet.solana.com\nVITE_ARCIUM_CLUSTER_OFFSET=456\nVITE_MXE_PROGRAM_ID=your_deployed_program_id\n```' },
    ],
  },
  'Trading': {
    icon: TrendingUp,
    color: '#02C076',
    items: [
      { title: 'Placing a Trade', content: '1. Connect your wallet (top right)\n2. Select a trading pair (SOL-PERP, BTC-PERP, etc.)\n3. Choose Long or Short\n4. Set position size and leverage\n5. Click the trade button\n6. The Arcium MPC pipeline executes automatically' },
      { title: 'Private vs Public Mode', content: 'When **Private Mode** is ON (default), all trade parameters are encrypted via the Arcium SDK before being submitted. When OFF, trades execute transparently without encryption.' },
      { title: 'Understanding the Pipeline', content: 'Each private trade flows through 5 steps:\n\n1. **Encrypt** — RescueCipher encrypts parameters\n2. **Submit** — Encrypted payload queued on-chain\n3. **Compute** — MPC nodes calculate on ciphertext\n4. **Verify** — Groth16 ZK proof generated\n5. **Settle** — Result committed to Solana' },
    ],
  },
  'Arcium Integration': {
    icon: Lock,
    color: '#9945FF',
    items: [
      { title: 'SDK Architecture', content: 'The `@arcium-hq/client` SDK provides:\n\n- `x25519` — Key exchange primitives\n- `RescueCipher` — Encryption/decryption cipher\n- `getMXEPublicKeyWithRetry()` — Fetch MXE public key\n- `deriveSharedSecret()` — X25519 shared secret derivation\n- `getClusterAccount()` — Cluster PDA resolution' },
      { title: 'Encryption Flow', content: '```javascript\nimport { x25519, RescueCipher, deriveSharedSecret } from \'@arcium-hq/client\'\n\n// 1. Generate keypair\nconst priv = x25519.randomPrivateKey()\nconst pub = x25519.getPublicKey(priv)\n\n// 2. Get MXE public key (from chain)\nconst mxePub = await getMXEPublicKeyWithRetry(provider, programId)\n\n// 3. Derive shared secret\nconst secret = deriveSharedSecret(priv, mxePub)\n\n// 4. Create cipher and encrypt\nconst cipher = new RescueCipher(secret)\nconst nonce = crypto.getRandomValues(new Uint8Array(16))\nconst ciphertext = cipher.encrypt(inputs, nonce)\n```' },
      { title: 'Cluster Configuration', content: 'Arcium uses cluster offsets to identify MPC clusters:\n\n- **Devnet**: Cluster offset `456`\n- **Mainnet**: Cluster offset `2026`\n\nSet via environment variable:\n```env\nVITE_ARCIUM_CLUSTER_OFFSET=456\n```' },
    ],
  },
  'Security': {
    icon: Shield,
    color: '#00FFB2',
    items: [
      { title: 'MEV Protection', content: 'Encrypted order flow prevents validators from seeing trade details before execution. This eliminates front-running and sandwich attacks.' },
      { title: 'Zero-Knowledge Proofs', content: 'Every computation produces a Groth16 ZK proof that can be verified without revealing inputs. This ensures correct execution even with encrypted data.' },
      { title: 'Key Management', content: 'x25519 keypairs are ephemeral — generated per session and never stored. The shared secret is derived fresh each time and kept in memory only.' },
    ],
  },
}

export default function Docs() {
  const [search, setSearch] = useState('')
  const [activeSection, setActiveSection] = useState('Getting Started')
  const [activeItem, setActiveItem] = useState(0)

  const filteredSections = Object.entries(SECTIONS).filter(([name, section]) => {
    if (!search) return true
    const q = search.toLowerCase()
    return name.toLowerCase().includes(q) || section.items.some(i =>
      i.title.toLowerCase().includes(q) || i.content.toLowerCase().includes(q)
    )
  })

  const currentSection = SECTIONS[activeSection]
  const currentItem = currentSection?.items[activeItem]

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-10">
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Documentation</h1>
        <p className="text-gray-400 text-sm max-w-lg mx-auto">Everything you need to know about trading on PuffinPerpDex.</p>
      </div>

      <div className="mb-8">
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#848E9C' }} />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search documentation..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-white placeholder:text-gray-600"
            style={{ background: '#161A1E', border: '1px solid rgba(255,255,255,0.06)' }} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        {/* Sidebar */}
        <div className="space-y-4">
          {filteredSections.map(([name, section]) => (
            <div key={name}>
              <button onClick={() => { setActiveSection(name); setActiveItem(0) }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm font-semibold transition-all mb-1"
                style={{ color: activeSection === name ? section.color : '#848E9C', background: activeSection === name ? `${section.color}10` : 'transparent' }}>
                <section.icon className="w-4 h-4" />{name}
              </button>
              {activeSection === name && section.items.map((item, i) => (
                <button key={i} onClick={() => setActiveItem(i)}
                  className="w-full flex items-center gap-2 pl-9 pr-3 py-1.5 rounded-lg text-left text-xs transition-all"
                  style={{ color: activeItem === i ? '#fff' : '#848E9C', background: activeItem === i ? 'rgba(255,255,255,0.04)' : 'transparent' }}>
                  <ChevronRight className="w-3 h-3" />{item.title}
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="glass-panel rounded-xl p-6">
          {currentItem && (
            <motion.div key={`${activeSection}-${activeItem}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <h2 className="text-xl font-bold text-white mb-4">{currentItem.title}</h2>
              <div className="prose prose-invert max-w-none">
                {currentItem.content.split('\n').map((line, i) => {
                  if (line.startsWith('```')) {
                    return <pre key={i} className="rounded-lg p-4 my-3 text-xs overflow-x-auto" style={{ background: '#0B0E11', border: '1px solid rgba(255,255,255,0.06)' }}><code>{line.replace(/```(\w+)?\s?/, '')}</code></pre>
                  }
                  if (line.startsWith('1.') || line.startsWith('2.') || line.startsWith('3.') || line.startsWith('4.') || line.startsWith('5.')) {
                    return <p key={i} className="text-sm text-gray-400 my-1 pl-4">{line}</p>
                  }
                  if (line.startsWith('-')) {
                    return <p key={i} className="text-sm text-gray-400 my-1 pl-4">{line}</p>
                  }
                  if (line.startsWith('**') && line.endsWith('**')) {
                    return <p key={i} className="text-sm text-white font-semibold my-2">{line.replace(/\*\*/g, '')}</p>
                  }
                  return line ? <p key={i} className="text-sm text-gray-400 my-2 leading-relaxed">{line}</p> : <div key={i} className="h-2" />
                })}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
