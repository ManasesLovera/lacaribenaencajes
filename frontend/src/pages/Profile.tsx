import { Fragment } from 'preact'
import { useEffect, useState } from 'preact/hooks'
import {
  BadgeCheck,
  Bell,
  Check,
  ChevronRight,
  CreditCard,
  KeyRound,
  Laptop,
  LifeBuoy,
  Lock,
  LogOut,
  Pencil,
  ShieldCheck,
  ShieldOff,
  SlidersHorizontal,
  Smartphone,
  Store,
  Tablet,
  Tag,
  UserRound,
} from 'lucide-preact'
import { useData } from '../data/DataContext'
import { navigate } from '../lib/router'
import { Avatar } from '../components/Brand'
import { Toast } from '../components/ui'

const PROFILE_PHONE = '+1 (809) 555-0142'

const menuItems = [
  { label: 'Mi perfil', icon: UserRound, path: '/perfil' },
  { label: 'Datos de la tienda', icon: Store, path: '/ajustes' },
  { label: 'Preferencias', icon: SlidersHorizontal, path: '/ajustes' },
  { label: 'Notificaciones', icon: Bell, path: '/ajustes' },
  { label: 'Métodos de pago', icon: CreditCard, path: '' },
  { label: 'Ayuda y soporte', icon: LifeBuoy, path: '' },
]

const activity = [
  {
    icon: KeyRound,
    date: '12 SEP 2025',
    title: 'Cambiaste la contraseña de acceso',
  },
  {
    icon: Tag,
    date: '28 OCT 2025',
    title: 'Actualizaste el precio de Pijama Rosé',
  },
  {
    icon: ShieldCheck,
    date: 'HOY · 9:14 A. M.',
    title: 'Nuevo inicio de sesión verificado',
  },
]

const initialSessions = [
  { id: 'iphone', name: 'iPhone 14 · App', meta: 'Hace 2 días', icon: Smartphone },
  { id: 'ipad', name: 'iPad Air · Safari', meta: 'Hace 6 días', icon: Tablet },
]

export function Profile({ onLogout }: { onLogout: () => void }) {
  const { settings, saveSettings } = useData()
  const [form, setForm] = useState({
    name: settings.ownerName,
    email: settings.email,
  })
  const [twoFactor, setTwoFactor] = useState(true)
  const [loginAlerts, setLoginAlerts] = useState(true)
  const [sessions, setSessions] = useState(initialSessions)
  const [toast, setToast] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setForm({ name: settings.ownerName, email: settings.email })
  }, [settings.ownerName, settings.email])

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(''), 3000)
    return () => window.clearTimeout(timer)
  }, [toast])

  const submit = async (event: Event) => {
    event.preventDefault()
    setSaving(true)
    try {
      await saveSettings({
        ...settings,
        ownerName: form.name.trim() || settings.ownerName,
        email: form.email.trim() || settings.email,
      })
      setToast('Perfil actualizado.')
    } catch (error) {
      setToast(
        error instanceof Error ? error.message : 'No se pudo guardar el perfil.',
      )
    } finally {
      setSaving(false)
    }
  }

  const go = (item: (typeof menuItems)[number]) => {
    if (item.path) {
      navigate(item.path)
      return
    }
    if (item.label === 'Métodos de pago') {
      setToast('Los métodos de pago se configuran al registrar una venta.')
      return
    }
    setToast('Escríbenos a soporte@lacaribenaencajes.com')
  }

  return (
    <div class="profile-page">
      <div class="profile-split">
        <div class="profile-main">
          <header class="profile-header">
            <p class="profile-eyebrow">— CUENTA · LA CARIBEÑA ENCAJES</p>
            <div class="profile-title-row">
              <h1 class="profile-title">Mi perfil</h1>
              <span class="profile-script">tu cuenta</span>
            </div>
            <p class="profile-subtitle">
              Actualiza tus datos, tu seguridad y la forma en que apareces en la tienda.
            </p>
          </header>

          <section class="profile-hero" aria-label="Resumen del perfil">
            <span class="profile-hero__ring profile-hero__ring--a" aria-hidden="true" />
            <span class="profile-hero__ring profile-hero__ring--b" aria-hidden="true" />
            <span class="profile-hero__glow" aria-hidden="true" />
            <Avatar name={settings.ownerName} size="lg" />
            <div class="profile-hero__text">
              <strong>{settings.ownerName}</strong>
              <span>{settings.email}</span>
              <div class="profile-hero__chips">
                <span class="profile-chip">ADMINISTRADORA</span>
                <span class="profile-chip">
                  <i class="profile-chip__dot" aria-hidden="true" />
                  TIENDA ABIERTA
                </span>
              </div>
            </div>
            <button
              type="button"
              class="profile-edit"
              onClick={() => document.getElementById('profile-name')?.focus()}
            >
              <Pencil size={15} strokeWidth={1.7} />
              Editar perfil
            </button>
          </section>

          <div class="profile-cards">
            <form class="profile-card profile-card--info" onSubmit={submit}>
              <header class="profile-card__head">
                <span class="profile-card__label">DATOS PERSONALES</span>
                <span class="profile-verified">
                  <BadgeCheck size={12} strokeWidth={1.8} />
                  Verificada
                </span>
              </header>

              <div class="profile-fields">
                <label class="profile-field">
                  <span>Nombre completo</span>
                  <input
                    id="profile-name"
                    value={form.name}
                    onInput={(event) =>
                      setForm({ ...form, name: (event.currentTarget as HTMLInputElement).value })
                    }
                  />
                </label>
                <label class="profile-field">
                  <span>Correo electrónico</span>
                  <input
                    type="email"
                    value={form.email}
                    onInput={(event) =>
                      setForm({ ...form, email: (event.currentTarget as HTMLInputElement).value })
                    }
                  />
                </label>
                <label class="profile-field">
                  <span>Teléfono</span>
                  <input value={PROFILE_PHONE} readOnly />
                </label>
                <label class="profile-field">
                  <span>Rol de cuenta</span>
                  <input value="Administradora" readOnly />
                </label>
              </div>

              <div class="profile-card__spacer" />

              <footer class="profile-card__footer">
                <span class="profile-note">Actualizado hoy</span>
                <button type="submit" class="profile-save" disabled={saving}>
                  <Check size={15} strokeWidth={1.8} />
                  {saving ? 'Guardando…' : 'Guardar cambios'}
                </button>
              </footer>
            </form>

            <section class="profile-card profile-card--security">
              <header class="profile-card__head profile-card__head--bordered">
                <span class="profile-card__label">SEGURIDAD Y ACCESO</span>
                <ShieldCheck size={16} strokeWidth={1.7} class="profile-head-icon" />
              </header>

              <div class="profile-setting">
                <div class="profile-setting__text">
                  <strong>Contraseña</strong>
                  <span>Cambiada hace 3 meses · recomendamos cada 90 días</span>
                </div>
                <button
                  type="button"
                  class="profile-action"
                  onClick={() => setToast('Te enviaremos un enlace para cambiar la contraseña.')}
                >
                  Cambiar
                </button>
              </div>

              <span class="profile-divider" />

              <div class="profile-setting">
                <div class="profile-setting__text">
                  <strong>Verificación en dos pasos</strong>
                  <span>Código al iniciar sesión desde un dispositivo nuevo</span>
                </div>
                <button
                  type="button"
                  class="profile-switch"
                  role="switch"
                  aria-checked={twoFactor}
                  aria-label="Verificación en dos pasos"
                  onClick={() => setTwoFactor((value) => !value)}
                >
                  <span />
                </button>
              </div>

              <span class="profile-divider" />

              <div class="profile-setting">
                <div class="profile-setting__text">
                  <strong>Alertas de inicio de sesión</strong>
                  <span>Recibe un correo cuando alguien acceda a tu cuenta</span>
                </div>
                <button
                  type="button"
                  class="profile-switch"
                  role="switch"
                  aria-checked={loginAlerts}
                  aria-label="Alertas de inicio de sesión"
                  onClick={() => setLoginAlerts((value) => !value)}
                >
                  <span />
                </button>
              </div>

              <span class="profile-divider" />
              <div class="profile-card__spacer" />

              <div class="profile-callout">
                <Lock size={13} strokeWidth={1.7} />
                <span>Solo esta cuenta tiene permisos de admin.</span>
              </div>
            </section>
          </div>

          <section class="profile-activity">
            <header class="profile-activity__head">
              <span class="profile-card__label">ACTIVIDAD RECIENTE</span>
              <button
                type="button"
                class="profile-link"
                onClick={() => setToast('El historial completo estará disponible pronto.')}
              >
                Ver historial
              </button>
            </header>
            <div class="profile-activity__items">
              {activity.map((item, index) => {
                const Icon = item.icon
                return (
                  <Fragment key={item.date}>
                    {index > 0 && <span class="profile-activity__divider" />}
                    <div class="profile-activity__item">
                      <span class="profile-activity__top">
                        <Icon size={12} strokeWidth={1.7} />
                        {item.date}
                      </span>
                      <strong>{item.title}</strong>
                    </div>
                  </Fragment>
                )
              })}
            </div>
          </section>
        </div>

        <aside class="profile-side">
          <section class="profile-card profile-menu-card">
            <span class="profile-card__label">MENÚ DE CUENTA</span>
            <div class="profile-menu-card__items">
              {menuItems.map((item) => {
                const Icon = item.icon
                const active = item.path === '/perfil'
                return (
                  <button
                    type="button"
                    key={item.label}
                    class={`profile-menu-card__item ${active ? 'is-active' : ''}`}
                    onClick={() => go(item)}
                  >
                    <Icon size={17} strokeWidth={1.7} />
                    <span>{item.label}</span>
                    <ChevronRight size={14} strokeWidth={1.7} />
                  </button>
                )
              })}
            </div>
            <span class="profile-divider" />
            <button
              type="button"
              class="profile-menu-card__item profile-menu-card__item--logout"
              onClick={onLogout}
            >
              <LogOut size={17} strokeWidth={1.7} />
              <span>Cerrar sesión</span>
            </button>
          </section>

          <section class="profile-card profile-session">
            <span class="profile-card__label">SESIÓN ACTUAL</span>
            <div class="profile-session__current">
              <span class="profile-session__icon">
                <Laptop size={16} strokeWidth={1.7} />
              </span>
              <div>
                <strong>Este dispositivo · Navegador</strong>
                <span>Santo Domingo, RD</span>
              </div>
            </div>

            <span class="profile-divider" />
            <span class="profile-session__label">OTROS DISPOSITIVOS</span>

            {sessions.map((session) => {
              const Icon = session.icon
              return (
                <div class="profile-session__row" key={session.id}>
                  <Icon size={14} strokeWidth={1.7} />
                  <div>
                    <strong>{session.name}</strong>
                    <span>{session.meta}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setSessions((items) => items.filter((item) => item.id !== session.id))
                    }
                  >
                    Cerrar
                  </button>
                </div>
              )
            })}

            <div class="profile-session__hint">
              <Check size={12} strokeWidth={1.8} />
              <span>Todas las sesiones requieren verificación en dos pasos.</span>
            </div>

            <div class="profile-card__spacer" />

            <button
              type="button"
              class="profile-close-all"
              onClick={() => {
                setSessions([])
                setToast('Cerramos los otros dispositivos.')
              }}
            >
              <ShieldOff size={14} strokeWidth={1.8} />
              Cerrar todas las sesiones
            </button>
          </section>
        </aside>
      </div>

      {toast && <Toast message={toast} onClose={() => setToast('')} />}
    </div>
  )
}
