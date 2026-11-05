import { useState } from 'preact/hooks'
import { ArrowRight, Eye, EyeOff, Lock, MapPin } from 'lucide-preact'
import { Logo } from '../components/Brand'
import { DEMO_EMAIL, DEMO_PASSWORD } from '../lib/auth'

type Props = {
  onLogin: (email: string, password: string, remember: boolean) => Promise<void>
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function Login({ onLogin }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fillDemo = () => {
    setEmail(DEMO_EMAIL)
    setPassword(DEMO_PASSWORD)
    setError('')
  }

  const submit = async (event: Event) => {
    event.preventDefault()
    if (!emailPattern.test(email.trim())) {
      setError('Escribe un correo válido para entrar.')
      return
    }
    if (!password) {
      setError('Escribe la contraseña de la tienda.')
      return
    }
    setError('')
    setSubmitting(true)
    try {
      await onLogin(email.trim(), password, remember)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo iniciar sesión. Revisa que la API esté corriendo.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main class="login">
      <section class="login__editorial">
        <div class="login__spark" aria-hidden="true">
          ✦
        </div>
        <p class="eyebrow eyebrow--on-wine">Acceso privado al atelier</p>
        <Logo size="lg" />
        <h1 class="login__headline">
          Cada encaje, <em>en su lugar.</em>
        </h1>
        <p class="login__lede">
          Un solo lugar para tu inventario, tus precios en pesos dominicanos y
          cada pedido que sale del taller.
        </p>
        <p class="login__place">
          <MapPin size={16} />
          Santo Domingo · República Dominicana
        </p>
        <span class="login__ghost" aria-hidden="true">
          bienvenida de nuevo
        </span>
      </section>

      <section class="login__form-wrap">
        <div class="login__form">
          <p class="eyebrow">— Panel de administración</p>
          <h2 class="display-lg">Iniciar sesión</h2>
          <p class="login__intro">
            qué bueno verte. Ingresa con tu correo para gestionar inventario,
            precios y pedidos.
          </p>

          <form onSubmit={submit} novalidate>
            <label class="field">
              <span class="field__label">Correo electrónico</span>
              <input
                type="email"
                autocomplete="email"
                value={email}
                onInput={(event) =>
                  setEmail((event.currentTarget as HTMLInputElement).value)
                }
                placeholder="tu@correo.com"
                required
              />
            </label>

            <label class="field">
              <span class="field__label">Contraseña</span>
              <div class="field__password">
                <input
                  type={(showPassword ? 'text' : 'password') as 'text'}
                  autocomplete="current-password"
                  value={password}
                  onInput={(event) =>
                    setPassword((event.currentTarget as HTMLInputElement).value)
                  }
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  class="field__reveal"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>

            <div class="login__row">
              <label class="checkbox">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(event) =>
                    setRemember((event.currentTarget as HTMLInputElement).checked)
                  }
                />
                <span>Recordarme</span>
              </label>
              <button type="button" class="link-button" onClick={fillDemo}>
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            {error && (
              <p class="form-error" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              class="button button--primary button--full"
              disabled={submitting}
            >
              {submitting ? 'Entrando…' : 'Entrar al panel'}
              {!submitting && <ArrowRight size={18} />}
            </button>
          </form>

          <div class="demo-card">
            <span class="demo-card__icon">
              <Lock size={16} />
            </span>
            <div>
              <strong>Credenciales de la tienda</strong>
              <p>
                {DEMO_EMAIL} · {DEMO_PASSWORD}
              </p>
            </div>
            <button type="button" class="button button--secondary button--sm" onClick={fillDemo}>
              Usar
            </button>
          </div>

          <p class="login__help">
            ¿Problemas para entrar? <button type="button" class="link-button">Escríbenos</button>
          </p>
        </div>

        <footer class="login__footer">
          <span>© 2026 La Caribeña Encajes · Todos los derechos reservados</span>
          <span>Privacidad · Términos</span>
        </footer>
      </section>
    </main>
  )
}
