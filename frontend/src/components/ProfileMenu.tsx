import { ChevronRight, LogOut, Monitor, Settings as SettingsIcon } from 'lucide-preact'
import type { Settings } from '../types'
import { Avatar } from './Brand'

export function ProfileMenu({
  settings,
  onSettings,
  onLogout,
}: {
  settings: Settings
  onSettings: () => void
  onLogout: () => void
}) {
  return (
    <div class="profile-menu" role="menu" aria-label="Menú de perfil">
      <header class="profile-menu__header">
        <Avatar name={settings.ownerName} size="lg" />
        <div class="profile-menu__identity">
          <strong>{settings.ownerName}</strong>
          <span>{settings.email}</span>
        </div>
        <span class="profile-menu__role">Propietaria</span>
      </header>

      <div class="profile-menu__divider" />

      <div class="profile-menu__items">
        <button
          type="button"
          class="profile-menu__item"
          role="menuitem"
          onClick={onSettings}
        >
          <span class="profile-menu__badge">
            <SettingsIcon size={15} strokeWidth={1.7} />
          </span>
          <span class="profile-menu__text">
            <strong>Configuración de la cuenta</strong>
            <span>Perfil, contraseña y preferencias</span>
          </span>
          <ChevronRight size={14} class="profile-menu__chevron" />
        </button>

        <button
          type="button"
          class="profile-menu__item profile-menu__item--logout"
          role="menuitem"
          onClick={onLogout}
        >
          <span class="profile-menu__badge">
            <LogOut size={15} strokeWidth={1.7} />
          </span>
          <span class="profile-menu__text">
            <strong>Cerrar sesión</strong>
            <span>Salir de esta sesión</span>
          </span>
          <ChevronRight size={14} class="profile-menu__chevron" />
        </button>

        <span class="profile-menu__item-divider" />
      </div>

      <footer class="profile-menu__footer">
        <Monitor size={12} strokeWidth={1.6} />
        <span>Sesión iniciada en Chrome · hace 2 h</span>
      </footer>
    </div>
  )
}
