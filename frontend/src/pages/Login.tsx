import { useState } from 'preact/hooks'
import { ArrowRight, Eye, EyeOff } from 'lucide-preact'
import { Logo } from '../components/Brand'

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
        <div class="login__art" aria-hidden="true">
          <span class="login__glow" />
          <span class="login__ring login__ring--1" />
          <span class="login__ring login__ring--2" />
          <span class="login__ring login__ring--3" />
          <span class="login__ring login__ring--4" />
          <span class="login__ring login__ring--core" />
        </div>

        <div class="login__logo-block">
          <Logo />
        </div>

        <div class="login__copy">
          <p class="login__eyebrow">— ACCESO PRIVADO AL ATELIER</p>
          <h1 class="login__headline">Cada encaje, en su lugar.</h1>
          <p class="login__script">bienvenida de nuevo</p>
          <p class="login__lede login__lede--desktop">
            Un solo lugar para tu inventario, tus precios en pesos dominicanos y
            cada pedido que sale del taller.
          </p>
          <p class="login__lede login__lede--mobile">
            Un solo lugar para tu inventario, tus precios y cada pedido del
            taller.
          </p>
        </div>

        <div class="login__foot">
          <span class="login__rule" />
          <p class="login__location">SANTO DOMINGO · REPÚBLICA DOMINICANA</p>
        </div>
      </section>

      <section class="login__form-wrap">
        <div class="login__top-spacer" aria-hidden="true" />
        <div class="login__form">
          <header class="login__form-header">
            <p class="eyebrow">— PANEL DE ADMINISTRACIÓN</p>
            <div class="login__title-row">
              <h2 class="login__title">Iniciar sesión</h2>
              <span class="login__title-script">qué bueno verte</span>
            </div>
            <p class="login__intro">
              Ingresa con tu correo para gestionar inventario, precios y pedidos.
            </p>
          </header>

          <form onSubmit={submit} novalidate>
            <div class="login__fields">
              <label class="field">
                <span class="field__label">Correo electrónico</span>
                <input
                  type="email"
                  autocomplete="email"
                  value={email}
                  onInput={(event) =>
                    setEmail((event.currentTarget as HTMLInputElement).value)
                  }
                  placeholder="yesenia@lacaribena.do"
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
                    placeholder="••••••••••"
                    required
                  />
                  <button
                    type="button"
                    class="field__reveal"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </label>
            </div>

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
              <button type="button" class="link-button login__forgot">
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
              class="button button--primary button--full login__submit"
              disabled={submitting}
            >
              {!submitting && <ArrowRight size={18} />}
              {submitting ? 'Entrando…' : 'Entrar'}
            </button>

            <p class="login__help">
              <span>¿Problemas para entrar?</span>
              <button type="button" class="login__help-link">
                Escríbenos
              </button>
            </p>
          </form>
        </div>

        <footer class="login__footer">
          <span class="login__footer-full">
            © 2026 La Caribeña Encajes · Todos los derechos reservados
          </span>
          <span class="login__footer-short">© 2026 La Caribeña Encajes</span>
          <span class="login__footer-full">
            Política de privacidad · Términos de servicio
          </span>
          <span class="login__footer-short">Privacidad · Términos</span>
        </footer>
      </section>
    </main>
  )
}
