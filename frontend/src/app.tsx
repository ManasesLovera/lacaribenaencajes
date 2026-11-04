import { useEffect, useState } from 'preact/hooks'
import './app.css'

type ApiState = 'checking' | 'online' | 'offline'

export function App() {
  const [apiState, setApiState] = useState<ApiState>('checking')

  useEffect(() => {
    let cancelled = false

    fetch('/api/health')
      .then((response) => {
        if (!response.ok) throw new Error('API unavailable')
        return response.json()
      })
      .then(() => {
        if (!cancelled) setApiState('online')
      })
      .catch(() => {
        if (!cancelled) setApiState('offline')
      })

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <main class="shell">
      <section class="brand">
        <p class="eyebrow">Inventario</p>
        <h1>
          <span class="la">LA</span>
          <span class="script">Caribeña</span>
          <span class="caps">ENCAJES</span>
        </h1>
        <p class="tagline">Cada encaje, en su lugar.</p>
      </section>

      <section class="card">
        <p class="eyebrow">Estado del proyecto</p>
        <h2>Base lista para construir</h2>
        <p>
          Preact, FastAPI y Postgres están conectados. El siguiente paso es el catálogo de
          productos descrito en <code>DESIGN.md</code>.
        </p>
        <div class={`status status--${apiState}`} role="status">
          <span class="dot" aria-hidden="true"></span>
          {apiState === 'checking' && 'Verificando API…'}
          {apiState === 'online' && 'API y base de datos en línea'}
          {apiState === 'offline' && 'API fuera de línea · ejecuta make backend'}
        </div>
        <p class="hint">
          Web en <code>:5173</code> · API en <code>:8000</code> · docs en{' '}
          <a href="http://localhost:8000/docs">/docs</a>
        </p>
      </section>
    </main>
  )
}
