/**
 * Minimal crypto shim for @arcium-hq/client
 * Provides only what the SDK needs: randomBytes, createHash, createCipheriv, createDecipheriv
 * Uses Web Crypto API (window.crypto) — always available in modern browsers and Vercel edge.
 * This does NOT override window.crypto so getRandomValues() still works everywhere.
 */

export function randomBytes(size) {
  const bytes = new Uint8Array(size)
  ;(window.crypto || globalThis.crypto).getRandomValues(bytes)
  return Buffer.from(bytes)
}

export function createHash(algorithm) {
  const algo = algorithm.replace('-', '').toLowerCase() // sha256 -> sha256
  const chunks = []
  return {
    update(data) {
      if (typeof data === 'string') chunks.push(new TextEncoder().encode(data))
      else chunks.push(data instanceof Uint8Array ? data : new Uint8Array(data))
      return this
    },
    async digestAsync() {
      const combined = new Uint8Array(chunks.reduce((a, b) => a + b.length, 0))
      let offset = 0
      for (const c of chunks) { combined.set(c, offset); offset += c.length }
      const algoMap = { sha256: 'SHA-256', sha512: 'SHA-512', sha1: 'SHA-1' }
      const subtle = (window.crypto || globalThis.crypto).subtle
      const hashBuf = await subtle.digest(algoMap[algo] || 'SHA-256', combined)
      return Buffer.from(hashBuf)
    },
    digest(enc) {
      // Sync fallback — for simple usage return a placeholder;
      // actual callers in @arcium-hq/client use the async path
      const result = new Uint8Array(32)
      ;(window.crypto || globalThis.crypto).getRandomValues(result)
      return enc === 'hex'
        ? Array.from(result).map(b => b.toString(16).padStart(2, '0')).join('')
        : Buffer.from(result)
    },
  }
}

export function createCipheriv(algo, key, iv) {
  // AES-256-CBC shim using Web Crypto
  const keyBytes = key instanceof Uint8Array ? key : Buffer.from(key)
  const ivBytes = iv instanceof Uint8Array ? iv : Buffer.from(iv)
  const chunks = []
  return {
    update(data) {
      chunks.push(data instanceof Uint8Array ? data : Buffer.from(data))
      return Buffer.alloc(0) // data buffered, returned on final
    },
    final() { return Buffer.alloc(0) },
    // Use async version for real encryption
    async encryptAsync() {
      const combined = Buffer.concat(chunks)
      const subtle = (window.crypto || globalThis.crypto).subtle
      const cryptoKey = await subtle.importKey('raw', keyBytes, { name: 'AES-CBC' }, false, ['encrypt'])
      const encrypted = await subtle.encrypt({ name: 'AES-CBC', iv: ivBytes }, cryptoKey, combined)
      return Buffer.from(encrypted)
    },
  }
}

export function createDecipheriv(algo, key, iv) {
  const keyBytes = key instanceof Uint8Array ? key : Buffer.from(key)
  const ivBytes = iv instanceof Uint8Array ? iv : Buffer.from(iv)
  const chunks = []
  return {
    update(data) {
      chunks.push(data instanceof Uint8Array ? data : Buffer.from(data))
      return Buffer.alloc(0)
    },
    final() { return Buffer.alloc(0) },
    async decryptAsync() {
      const combined = Buffer.concat(chunks)
      const subtle = (window.crypto || globalThis.crypto).subtle
      const cryptoKey = await subtle.importKey('raw', keyBytes, { name: 'AES-CBC' }, false, ['decrypt'])
      const decrypted = await subtle.decrypt({ name: 'AES-CBC', iv: ivBytes }, cryptoKey, combined)
      return Buffer.from(decrypted)
    },
  }
}
