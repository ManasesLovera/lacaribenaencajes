import { Logo } from './Brand'

function BootArt() {
  return (
    <div class="boot__art" aria-hidden="true">
      <span class="boot__glow" />
      <span class="boot__ring boot__ring--1" />
      <span class="boot__ring boot__ring--2" />
      <span class="boot__ring boot__ring--3" />
      <span class="boot__ring boot__ring--4" />
      <span class="boot__ring boot__ring--core" />
    </div>
  )
}

export function BootScreen() {
  return (
    <div
      class="boot"
      role="status"
      aria-live="polite"
      aria-label="Preparando tu catálogo"
    >
      <BootArt />
      <div class="boot__core">
        <div class="boot__logo">
          <Logo />
        </div>
        <p class="boot__script">un momento</p>
        <div class="boot__progress" aria-hidden="true">
          <span />
        </div>
        <p class="boot__label">Preparando tu catálogo</p>
      </div>
      <p class="boot__foot">La Caribeña Encajes · Nagua, RD</p>
    </div>
  )
}

export function BootError({
  message,
  onRetry,
  onLogout,
}: {
  message: string
  onRetry: () => void
  onLogout: () => void
}) {
  return (
    <div class="boot boot--error" role="alert">
      <BootArt />
      <div class="boot__core boot__core--error">
        <div class="boot__logo">
          <Logo />
        </div>
        <h1 class="boot__error-title">No se pudo cargar la tienda</h1>
        <p class="boot__error-copy">{message}</p>
        <div class="boot__actions">
          <button type="button" class="boot__action boot__action--solid" onClick={onRetry}>
            Reintentar
          </button>
          <button type="button" class="boot__action" onClick={onLogout}>
            Iniciar sesión de nuevo
          </button>
        </div>
      </div>
      <p class="boot__foot">La Caribeña Encajes · Nagua, RD</p>
    </div>
  )
}
