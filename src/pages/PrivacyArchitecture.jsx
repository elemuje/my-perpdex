import { useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, Lock, Eye, Cpu, Server, CheckCircle, FileCode, BookOpen, ExternalLink, ChevronDown, ChevronUp, Zap, Key, Fingerprint, Radio } from 'lucide-react'
import { useArciumPrivacy } from '@/providers/arcium-privacy'

const TAB_CONTENT = {
  overview: {
    title: 'Arcium MPC Overview',
    icon: Shield,
    content: [
      { heading: 'What is Arcium?', text: 'Arcium is a decentralized confidential computing network that enables multi-party computation (MPC) on encrypted data. It uses x25519 key exchange and the RescueCipher for client-side encryption, ensuring trade parameters never leave your browser in plaintext.' },
      { heading: 'How PuffinPerpDex Uses Arcium', text: 'Every trade in private mode is encrypted using the @arcium-hq/client SDK. The encrypted payload is submitted to an Arcium MPC cluster where computations (margin, liquidation price, PnL) are performed on ciphertext. A Groth16 zero-knowledge proof attests to correct execution without revealing inputs.' },
    ],
  },
  encryption: {
    title: 'Encryption Flow',
    icon: Lock,
    content: [
      { heading: 'Step 1: x25519 Key Exchange', text: 'The client generates an ephemeral x25519 keypair. The public key is shared with the Arcium MXE (Multi-Party Execution Environment), which returns its own public key. Both parties derive the same shared secret via X25519.' },
      { heading: 'Step 2: RescueCipher', text: 'The shared secret seeds a RescueCipher — a sponge-based cipher optimized for arithmetic circuits. Trade parameters (size, leverage, entry price, side) are converted to field elements and encrypted with a random nonce.' },
      { heading: 'Step 3: Ciphertext Submission', text: 'The encrypted payload (number[][] in base64) is submitted to the on-chain Arcium program via Anchor. The computation offset identifies which cluster will execute the MPC.' },
    ],
  },
  computation: {
    title: 'MPC Computation',
    icon: Cpu,
    content: [
      { heading: 'Cluster Assignment', text: 'Arcium cluster nodes (ARX nodes) receive the encrypted computation request. Each node holds a share of the decryption key — no single node can decrypt alone.' },
      { heading: 'Encrypted Execution', text: 'Nodes perform MPC protocols to compute margin, liquidation price, and projected PnL directly on encrypted inputs. The data is never decrypted during computation.' },
      { heading: 'ZK Proof Generation', text: 'After computation, a Groth16 zero-knowledge proof is generated. This proof can be verified by anyone to confirm correct execution, without revealing any trade details.' },
    ],
  },
  settlement: {
    title: 'On-Chain Settlement',
    icon: Server,
    content: [
      { heading: 'Result Commitment', text: 'The computation result (still encrypted) and its ZK proof are committed to the Solana ledger via the Arcium program. The proof is verified on-chain.' },
      { heading: 'Client Decryption', text: 'The client retrieves the encrypted result from the chain and decrypts it locally using the same RescueCipher. Only the trader ever sees the plaintext result.' },
      { heading: 'Atomic Settlement', text: 'If the proof verifies and the result meets margin requirements, the position is opened atomically. The entire flow is front-running resistant.' },
    ],
  },
}

const INTEGRATION_STEPS = [
  {
    id: 1,
    title: 'Install Arcium SDK',
    description: 'Add the official @arcium-hq/client package to your project.',
    code: 'npm install @arcium-hq/client @coral-xyz/anchor',
  },
  {
    id: 2,
    title: 'Initialize x25519 Keypair',
    description: 'Generate an ephemeral keypair for this session.',
    code: `import { x25519 } from '@arcium-hq/client'

// Generate ephemeral keypair
const keypair = x25519.keygen()
const clientPrivateKey = keypair.privateKey
const clientPublicKey = keypair.publicKey`,
  },
  {
    id: 3,
    title: 'Fetch MXE Public Key',
    description: 'Get the MXE public key from the Arcium devnet cluster.',
    code: `import { getMXEPublicKey } from '@arcium-hq/client'

const mxePublicKey = await getMXEPublicKey(
  anchorProvider,
  clusterOffset  // e.g. 456 for devnet
)`,
  },
  {
    id: 4,
    title: 'Derive Shared Secret',
    description: 'Use X25519 to derive the shared encryption key.',
    code: `// x25519.getSharedSecret is exported from @arcium-hq/client
const sharedSecret = x25519.getSharedSecret(
  clientPrivateKey,
  mxePublicKey
)`,
  },
  {
    id: 5,
    title: 'Create RescueCipher',
    description: 'Initialize the cipher for encrypting trade inputs.',
    code: `import { RescueCipher } from '@arcium-hq/client'

const cipher = new RescueCipher(sharedSecret)

// Encrypt trade parameters
const inputs = [size, leverage, entryPrice, sideBit]
const nonce = crypto.getRandomValues(new Uint8Array(16))
const ciphertext = cipher.encrypt(inputs, nonce)`,
  },
  {
    id: 6,
    title: 'Submit Computation',
    description: 'Queue the encrypted computation on Solana via Anchor.',
    code: `// Submit via Anchor program
const tx = await program.methods
  .queueComputation(ciphertext, computationOffset)
  .accounts({
    clusterAccount,
    // ... other accounts
  })
  .rpc()`,
  },
  {
    id: 7,
    title: 'Monitor & Decrypt Result',
    description: 'Listen for computation completion and decrypt the result.',
    code: `import { awaitComputationFinalization } from '@arcium-hq/client'

// Wait for computation to finalize
const result = await awaitComputationFinalization(
  provider,
  computationId,
  timeoutMs
)

// Decrypt the result locally
const plaintext = cipher.decrypt(
  result.encryptedOutput,
  nonce
)`,
  },
]

export default function PrivacyArchitecture() {
  const [activeTab, setActiveTab] = useState('overview')
  const [expandedStep, setExpandedStep] = useState(null)
  const { isPrivateMode, privacyScore, arciumReady } = useArciumPrivacy()
  const tab = TAB_CONTENT[activeTab]

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-10">
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold mb-3" style={{ color: '#F0B90B' }}>Privacy Architecture</h1>
        <p className="text-gray-400 text-sm max-w-xl mx-auto">
          Deep dive into how PuffinPerpDex integrates the Arcium SDK for end-to-end encrypted perpetual trading.
        </p>
      </div>

      {/* Status bar */}
      <div className="glass-panel rounded-xl p-4 mb-8 flex flex-wrap items-center justify-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: isPrivateMode ? '#02C076' : '#848E9C', boxShadow: isPrivateMode ? '0 0 8px #02C076' : 'none' }} />
          <span className="text-sm" style={{ color: isPrivateMode ? '#02C076' : '#848E9C' }}>
            {isPrivateMode ? 'Private Mode Active' : 'Private Mode Inactive'}
          </span>
        </div>
        <div className="w-px h-5" style={{ background: 'rgba(255,255,255,0.06)' }} />
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Privacy Score</span>
          <span className="text-sm font-bold" style={{ color: '#F0B90B' }}>{privacyScore}%</span>
        </div>
        <div className="w-px h-5" style={{ background: 'rgba(255,255,255,0.06)' }} />
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: arciumReady ? '#02C076' : '#F0B90B', animation: arciumReady ? 'none' : 'pulse 1.5s infinite' }} />
          <span className="text-sm" style={{ color: arciumReady ? '#02C076' : '#F0B90B' }}>
            {arciumReady ? 'Arcium SDK Ready' : 'SDK Initializing...'}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {Object.entries(TAB_CONTENT).map(([key, t]) => (
          <button key={key} onClick={() => setActiveTab(key)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: activeTab === key ? 'rgba(240,185,11,0.15)' : '#161A1E',
              color: activeTab === key ? '#F0B90B' : '#848E9C',
              border: activeTab === key ? '1px solid rgba(240,185,11,0.3)' : '1px solid rgba(255,255,255,0.06)',
            }}>
            <t.icon className="w-4 h-4" />{t.title}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
        className="glass-panel rounded-xl p-6 mb-10">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(240,185,11,0.1)', border: '1px solid rgba(240,185,11,0.2)' }}>
            <tab.icon className="w-5 h-5" style={{ color: '#F0B90B' }} />
          </div>
          <h2 className="text-xl font-bold text-white">{tab.title}</h2>
        </div>
        <div className="space-y-6">
          {tab.content.map((c, i) => (
            <div key={i}>
              <h3 className="text-sm font-bold text-white mb-2">{c.heading}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{c.text}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Integration Steps */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold text-white mb-6">SDK Integration Guide</h2>
        <div className="space-y-3">
          {INTEGRATION_STEPS.map((step) => (
            <div key={step.id} className="glass-panel rounded-xl overflow-hidden">
              <button onClick={() => setExpandedStep(expandedStep === step.id ? null : step.id)}
                className="w-full flex items-center justify-between px-5 py-4 text-left">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                    style={{ background: 'rgba(240,185,11,0.1)', color: '#F0B90B', border: '1px solid rgba(240,185,11,0.2)' }}>{step.id}</span>
                  <div>
                    <h3 className="text-sm font-bold text-white">{step.title}</h3>
                    <p className="text-xs text-gray-500">{step.description}</p>
                  </div>
                </div>
                {expandedStep === step.id ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
              </button>
              {expandedStep === step.id && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="px-5 pb-4">
                  <pre className="rounded-lg p-4 text-xs overflow-x-auto" style={{ background: '#0B0E11', border: '1px solid rgba(255,255,255,0.06)', color: '#E5E7EB' }}>
                    <code>{step.code}</code>
                  </pre>
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Architecture diagram reference */}
      <div className="glass-panel rounded-xl p-6 mb-10">
        <h2 className="text-xl font-bold text-white mb-6">System Architecture</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[
            { icon: Lock, title: 'Client Browser', desc: 'x25519 keygen + RescueCipher encrypt', color: '#F0B90B' },
            { icon: Radio, title: 'Solana Devnet', desc: 'Anchor program queues computation', color: '#9945FF' },
            { icon: Cpu, title: 'Arcium Cluster', desc: 'MPC nodes execute on ciphertext', color: '#00FFB2' },
            { icon: Fingerprint, title: 'ZK Prover', desc: 'Groth16 proof of correct execution', color: '#02C076' },
            { icon: Key, title: 'Client Decrypt', desc: 'RescueCipher decrypts result locally', color: '#F0B90B' },
          ].map((node, i) => (
            <div key={i} className="text-center">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
                style={{ background: `${node.color}15`, border: `1px solid ${node.color}30` }}>
                <node.icon className="w-6 h-6" style={{ color: node.color }} />
              </div>
              <h3 className="text-sm font-bold text-white mb-1">{node.title}</h3>
              <p className="text-[10px] text-gray-500">{node.desc}</p>
              {i < 4 && (
                <div className="hidden md:flex items-center justify-center mt-3">
                  <div className="w-8 h-px" style={{ background: `linear-gradient(90deg, ${node.color}, ${node.color}00)` }} />
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: node.color }} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Links */}
      <div className="glass-panel rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">Resources</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: 'Arcium Documentation', href: 'https://docs.arcium.com', icon: BookOpen },
            { label: 'Arcium GitHub', href: 'https://github.com/arcium-hq', icon: FileCode },
            { label: 'Solana Docs', href: 'https://solana.com/docs', icon: ExternalLink },
          ].map((link, i) => (
            <a key={i} href={link.href} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all hover:bg-white/5"
              style={{ background: '#0B0E11', border: '1px solid rgba(255,255,255,0.06)' }}>
              <link.icon className="w-4 h-4" style={{ color: '#F0B90B' }} />
              <span className="text-sm text-white">{link.label}</span>
              <ExternalLink className="w-3 h-3 ml-auto" style={{ color: '#848E9C' }} />
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
