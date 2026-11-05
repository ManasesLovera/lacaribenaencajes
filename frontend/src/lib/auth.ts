export type Session = {
  email: string
  name: string
}

const TOKEN_KEY = 'lacaribena:token'

export function saveToken(token: string, remember: boolean): void {
  const storage = remember ? localStorage : sessionStorage
  localStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(TOKEN_KEY)
  storage.setItem(TOKEN_KEY, token)
}

export function loadToken(): string | null {
  return localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(TOKEN_KEY)
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(TOKEN_KEY)
}

export const DEMO_EMAIL = 'yesenia@lacaribenaencajes.com'
export const DEMO_PASSWORD = 'lacaribenaencajes'

const DEMO_SESSION_KEY = 'lacaribena:demo-session'

export function loadDemoSession(): Session | null {
  try {
    const raw = localStorage.getItem(DEMO_SESSION_KEY)
    return raw ? (JSON.parse(raw) as Session) : null
  } catch {
    return null
  }
}

export function saveDemoSession(session: Session): void {
  localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(session))
}

export function clearDemoSession(): void {
  localStorage.removeItem(DEMO_SESSION_KEY)
}
