import { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import { SolanaWalletProvider } from './providers/solana-wallet'
import { ArciumPrivacyProvider } from './providers/arcium-privacy'
import { AppShellProvider } from './providers/app-shell'
import App from './App'

// Inject Buffer + process polyfills before anything else runs
import { Buffer } from 'buffer'
window.Buffer = window.Buffer ?? Buffer
window.process = window.process ?? { env: {}, browser: true, version: 'v18.0.0' }

// Top-level error boundary — prevents blank white/black screen on crash
class RootErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }
  static getDerivedStateFromError(error) {
    return { error }
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{
          minHeight: '100vh', background: '#050714', color: '#fff',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', fontFamily: 'monospace', padding: '2rem',
        }}>
          <h1 style={{ color: '#F0B90B', marginBottom: '1rem' }}>Something went wrong</h1>
          <pre style={{
            background: '#161A1E', padding: '1rem', borderRadius: '8px',
            maxWidth: '600px', overflow: 'auto', fontSize: '12px', color: '#F6465D'
          }}>
            {this.state.error.message}
          </pre>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '1.5rem', padding: '0.5rem 1.5rem',
              background: '#F0B90B', color: '#0B0E11',
              border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold'
            }}
          >
            Reload
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RootErrorBoundary>
      <BrowserRouter>
        <SolanaWalletProvider>
          <ArciumPrivacyProvider>
            <AppShellProvider>
              <App />
            </AppShellProvider>
          </ArciumPrivacyProvider>
        </SolanaWalletProvider>
      </BrowserRouter>
    </RootErrorBoundary>
  </StrictMode>,
)
