import { useState } from 'preact/hooks'
import type { ComponentChildren } from 'preact'
import {
  Activity,
  Bell,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Search,
  Settings as SettingsIcon,
  ShoppingBag,
  Tags,
  X,
} from 'lucide-preact'
import { useData } from '../data/DataContext'
import { navigate } from '../lib/router'
import { Avatar, Logo } from './Brand'

type NavItem = {
  label: string
  path: string
  icon: typeof LayoutDashboard
}

const groups: { label: string; items: NavItem[] }[] = [
  {
    label: 'Tienda',
    items: [
      { label: 'Resumen', path: '/dashboard', icon: LayoutDashboard },
      { label: 'Ventas', path: '/ventas', icon: ShoppingBag },
      { label: 'Operativo', path: '/operativo', icon: Activity },
    ],
  },
  {
    label: 'Inventario',
    items: [
      { label: 'Productos', path: '/productos', icon: Package },
      { label: 'Categorías', path: '/categorias', icon: Tags },
    ],
  },
  {
    label: 'Cuenta',
    items: [{ label: 'Ajustes', path: '/ajustes', icon: SettingsIcon }],
  },
]

const mobileItems: NavItem[] = [
  { label: 'Resumen', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Productos', path: '/productos', icon: Package },
  { label: 'Categorías', path: '/categorias', icon: Tags },
  { label: 'Ajustes', path: '/ajustes', icon: SettingsIcon },
]

const titles: Record<string, string> = {
  '/dashboard': 'Resumen',
  '/productos': 'Productos',
  '/categorias': 'Categorías',
  '/ventas': 'Ventas',
  '/operativo': 'Operativo',
  '/ajustes': 'Ajustes',
}

type Props = {
  path: string
  children: ComponentChildren
  onLogout: () => void
}

export function Shell({ path, children, onLogout }: Props) {
  const { settings, products } = useData()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [search, setSearch] = useState('')
  const alerts = products.filter(
    (product) => product.stock < product.minStock,
  ).length

  const isActive = (itemPath: string) =>
    path === itemPath || path.startsWith(`${itemPath}/`)

  const go = (itemPath: string) => {
    navigate(itemPath)
    setDrawerOpen(false)
  }

  const submitSearch = (event: Event) => {
    event.preventDefault()
    const query = search.trim()
    navigate(query ? `/productos?q=${encodeURIComponent(query)}` : '/productos')
    setDrawerOpen(false)
  }

  const nav = (
    <nav class="nav" aria-label="Navegación principal">
      {groups.map((group) => (
        <div class="nav__group" key={group.label}>
          <p class="nav__label">{group.label}</p>
          {group.items.map((item) => {
            const Icon = item.icon
            return (
              <button
                type="button"
                key={item.path}
                class={`nav__item ${isActive(item.path) ? 'is-active' : ''}`}
                onClick={() => go(item.path)}
              >
                <Icon size={20} strokeWidth={1.6} />
                <span>{item.label}</span>
              </button>
            )
          })}
        </div>
      ))}
    </nav>
  )

  return (
    <div class="app">
      <aside class="sidebar">
        <div class="sidebar__brand">
          <Logo />
        </div>
        {nav}
        <div class="sidebar__owner">
          <Avatar name={settings.ownerName} />
          <div class="sidebar__owner-text">
            <strong>{settings.ownerName}</strong>
            <span>{settings.email}</span>
          </div>
          <button
            type="button"
            class="icon-button icon-button--on-wine"
            onClick={onLogout}
            aria-label="Cerrar sesión"
            title="Cerrar sesión"
          >
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      <div class="main">
        <header class="topbar">
          <button
            type="button"
            class="icon-button topbar__menu"
            onClick={() => setDrawerOpen(true)}
            aria-label="Abrir menú"
          >
            <Menu size={22} />
          </button>

          <span class="topbar__title">{titles[path] ?? 'La Caribeña'}</span>

          <form class="search" role="search" onSubmit={submitSearch}>
            <Search size={18} aria-hidden="true" />
            <input
              type="search"
              value={search}
              onInput={(event) =>
                setSearch((event.currentTarget as HTMLInputElement).value)
              }
              placeholder="Buscar producto…"
              aria-label="Buscar producto"
            />
          </form>

          <div class="topbar__actions">
            <button
              type="button"
              class="icon-button"
              aria-label={`${alerts} alertas de inventario`}
              title="Alertas de inventario"
              onClick={() => navigate('/operativo')}
            >
              <Bell size={20} />
              {alerts > 0 && <span class="badge">{alerts}</span>}
            </button>
            <button
              type="button"
              class="topbar__avatar"
              onClick={() => navigate('/ajustes')}
              aria-label="Ajustes de la cuenta"
            >
              <Avatar name={settings.ownerName} size="sm" />
            </button>
          </div>
        </header>

        <main class="page">{children}</main>
      </div>

      {drawerOpen && (
        <div class="drawer-backdrop" onClick={() => setDrawerOpen(false)}>
          <aside
            class="drawer"
            onClick={(event) => event.stopPropagation()}
            aria-label="Menú"
          >
            <div class="drawer__head">
              <Logo size="sm" />
              <button
                type="button"
                class="icon-button icon-button--on-wine"
                onClick={() => setDrawerOpen(false)}
                aria-label="Cerrar menú"
              >
                <X size={20} />
              </button>
            </div>
            <form class="search search--drawer" role="search" onSubmit={submitSearch}>
              <Search size={18} aria-hidden="true" />
              <input
                type="search"
                value={search}
                onInput={(event) =>
                  setSearch((event.currentTarget as HTMLInputElement).value)
                }
                placeholder="Buscar producto…"
                aria-label="Buscar producto"
              />
            </form>
            {nav}
            <button
              type="button"
              class="nav__item nav__item--logout"
              onClick={onLogout}
            >
              <LogOut size={20} strokeWidth={1.6} />
              <span>Cerrar sesión</span>
            </button>
          </aside>
        </div>
      )}

      <nav class="bottom-nav" aria-label="Navegación móvil">
        {mobileItems.map((item) => {
          const Icon = item.icon
          return (
            <button
              type="button"
              key={item.path}
              class={`bottom-nav__item ${isActive(item.path) ? 'is-active' : ''}`}
              onClick={() => go(item.path)}
            >
              <Icon size={20} strokeWidth={1.6} />
              <span>{item.label}</span>
            </button>
          )
        })}
        <button
          type="button"
          class="bottom-nav__item"
          onClick={() => setDrawerOpen(true)}
        >
          <Menu size={20} strokeWidth={1.6} />
          <span>Más</span>
        </button>
      </nav>
    </div>
  )
}
