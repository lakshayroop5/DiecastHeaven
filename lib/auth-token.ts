/** HMAC-signed session tokens — works in both Edge (middleware) and Node
 * (route handlers) via Web Crypto. Token = "<expiryMs>.<hmac(expiryMs)>".
 * Key is the gate's own password, so changing the password invalidates
 * every outstanding session for free. */

async function hmacHex(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message))
  return Array.from(new Uint8Array(sig), (b) => b.toString(16).padStart(2, '0')).join('')
}

export async function signSession(secret: string, maxAgeSeconds: number): Promise<string> {
  const exp = Date.now() + maxAgeSeconds * 1000
  return `${exp}.${await hmacHex(secret, String(exp))}`
}

export async function verifySession(secret: string, token: string | undefined): Promise<boolean> {
  if (!secret || !token) return false
  const dot = token.indexOf('.')
  if (dot === -1) return false
  const expStr = token.slice(0, dot)
  const sig = token.slice(dot + 1)
  const exp = Number(expStr)
  if (!Number.isSafeInteger(exp) || exp < Date.now()) return false
  const expected = await hmacHex(secret, expStr)
  if (expected.length !== sig.length) return false
  let diff = 0
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ sig.charCodeAt(i)
  }
  return diff === 0
}

/** Constant-time password check: hash both sides first so lengths never leak. */
export async function passwordMatches(input: string, expected: string): Promise<boolean> {
  const enc = new TextEncoder()
  const [a, b] = await Promise.all([
    crypto.subtle.digest('SHA-256', enc.encode(input)),
    crypto.subtle.digest('SHA-256', enc.encode(expected)),
  ])
  const A = new Uint8Array(a)
  const B = new Uint8Array(b)
  if (A.length !== B.length || A.length === 0) return false
  let diff = 0
  for (let i = 0; i < A.length; i++) diff |= A[i] ^ B[i]
  return diff === 0
}
