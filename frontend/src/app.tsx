import { useEffect, useState } from 'preact/hooks'
import { Shell } from './components/Shell'
import { DataProvider } from './data/DataContext'
import { api } from './lib/api'
import {
  clearDemoSession,
  clearToken,
  DEMO_EMAIL,
  DEMO_PASSWORD,
  loadDemoSession,
  loadToken,
  saveDemoSession,
  saveToken,
  type Session,
} from './lib/auth'
import { DEMO_MODE } from './lib/mode'
import { navigate, useRoute } from './lib/router'
import { Categories } from './pages/Categories'
import { Dashboard } from './pages/Dashboard'
import { Login } from './pages/Login'
import { Operations } from './pages/Operations'
import { Products } from './pages/Products'
import { Profile } from './pages/Profile'
import { Sales } from './pages/Sales'
import { Settings } from './pages/Settings'
import './app.css'

function Page({
  path,
  query,
  onLogout,
}: {
  path: string
  query: URLSearchParams
  onLogout: () => void
}) {
  switch (path) {
    case '/productos':
      return <Products query={query} />
    case '/categorias':
      return <Categories />
    case '/ventas':
      return <Sales />
    case '/operativo':
      return <Operations />
    case '/ajustes':
      return <Settings />
    case '/perfil':
      return <Profile onLogout={onLogout} />
    case '/dashboard':
    default:
      return <Dashboard />
  }
}

export function App() {
  const [session, setSession] = useState<Session | null>(() =>
    DEMO_MODE ? loadDemoSession() : null,
  )
  const [checking, setChecking] = useState(
    () => !DEMO_MODE && Boolean(loadToken()),
  )
  const route = useRoute()

  useEffect(() => {
    if (DEMO_MODE) {
      setChecking(false)
      return
    }
    if (!loadToken()) {
      setChecking(false)
      return
    }
    api
      .me()
      .then((user) => setSession({ email: user.email, name: user.name }))
      .catch(() => clearToken())
      .finally(() => setChecking(false))
  }, [])

  useEffect(() => {
    const onExpired = () => {
      clearToken()
      setSession(null)
    }
    window.addEventListener('lacaribena:auth-expired', onExpired)
    return () => window.removeEventListener('lacaribena:auth-expired', onExpired)
  }, [])

  if (checking) {
    return (
      <div class="boot">
        <span class="boot__mark" aria-hidden="true">✦</span>
        <p>Abriendo el atelier…</p>
      </div>
    )
  }

  if (!session) {
    return (
      <Login
        onLogin={async (email, password, remember) => {
          if (DEMO_MODE) {
            if (email.toLowerCase() !== DEMO_EMAIL || password !== DEMO_PASSWORD) {
              throw new Error('Correo o contraseña incorrectos')
            }
            const demoSession = { email: DEMO_EMAIL, name: 'Yesenia Castillo' }
            saveDemoSession(demoSession)
            setSession(demoSession)
            navigate('/dashboard')
            return
          }
          const result = await api.login(email, password)
          saveToken(result.access_token, remember)
          setSession({ email: result.user.email, name: result.user.name })
          navigate('/dashboard')
        }}
      />
    )
  }

  const logout = () => {
    if (DEMO_MODE) {
      clearDemoSession()
    } else {
      clearToken()
    }
    setSession(null)
    navigate('/dashboard')
  }

  return (
    <DataProvider onLogout={logout}>
      <Shell path={route.path} onLogout={logout}>
        <Page path={route.path} query={route.query} onLogout={logout} />
      </Shell>
    </DataProvider>
  )
}
