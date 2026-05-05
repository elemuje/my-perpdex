# PuffinPerpDex

Privacy-First Perpetual DEX on Solana, powered by Arcium Confidential Computation.

## Features

- **End-to-End Encrypted Trading** — All trade parameters encrypted via Arcium SDK (`@arcium-hq/client`)
- **MPC Execution** — Multi-party computation on encrypted order data
- **ZK-Proof Verification** — Groth16 proofs attest to correct execution
- **Real-Time Prices** — Live price feeds from Binance + CoinGecko
- **Solana Devnet** — Wallet integration with Phantom, Solflare, Backpack

## Arcium SDK Integration

This project uses the **real** `@arcium-hq/client` SDK:

```javascript
import { x25519, RescueCipher, deriveSharedSecret, getMXEPublicKeyWithRetry } from '@arcium-hq/client'

// 1. Generate ephemeral x25519 keypair
const clientPrivateKey = x25519.randomPrivateKey()

// 2. Fetch MXE public key from Arcium devnet
const mxePublicKey = await getMXEPublicKeyWithRetry(provider, programId)

// 3. Derive shared secret
const sharedSecret = deriveSharedSecret(clientPrivateKey, mxePublicKey)

// 4. Encrypt trade parameters
const cipher = new RescueCipher(sharedSecret)
const ciphertext = cipher.encrypt(inputs, nonce)
```

## Quick Start

```bash
npm install
npm run dev      # => http://localhost:3000
npm run build    # => dist/
```

## Environment Variables

```env
VITE_SOLANA_NETWORK=devnet
VITE_RPC_URL=https://api.devnet.solana.com
VITE_ARCIUM_CLUSTER_OFFSET=456
VITE_MXE_PROGRAM_ID=your_deployed_program_id
```

## Tech Stack

- React 18 + Vite 6
- `@arcium-hq/client` — Arcium SDK for confidential computation
- `@solana/web3.js` — Solana RPC
- `@coral-xyz/anchor` — Anchor framework
- Tailwind CSS + shadcn/ui
- Framer Motion + Recharts

## License

MIT
