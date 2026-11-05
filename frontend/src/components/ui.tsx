import { useEffect } from 'preact/hooks'
import type { ComponentChildren } from 'preact'
import { ArrowDownRight, ArrowUpRight, X } from 'lucide-preact'
import { money, pct } from '../lib/format'
import type { Category, Period } from '../types'

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  actions,
}: {
  eyebrow: string
  title: string
  subtitle?: ComponentChildren
  actions?: ComponentChildren
}) {
  return (
    <header class="page-header">
      <div>
        <p class="eyebrow">
          <span aria-hidden="true">— </span>
          {eyebrow}
        </p>
        <h1 class="display-lg">{title}</h1>
        {subtitle && <p class="page-header__subtitle">{subtitle}</p>}
      </div>
      {actions && <div class="page-header__actions">{actions}</div>}
    </header>
  )
}

export function Panel({
  title,
  subtitle,
  action,
  children,
  className = '',
}: {
  title?: string
  subtitle?: string
  action?: ComponentChildren
  children: ComponentChildren
  className?: string
}) {
  return (
    <section class={`panel ${className}`}>
      {(title || action) && (
        <header class="panel__head">
          <div>
            {title && <h2 class="panel__title">{title}</h2>}
            {subtitle && <p class="panel__subtitle">{subtitle}</p>}
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  )
}

export function StatCard({
  label,
  value,
  detail,
  delta,
  deltaLabel,
  icon,
  moneyValue = true,
}: {
  label: string
  value: number | string
  detail?: string
  delta?: number | null
  deltaLabel?: string
  icon?: ComponentChildren
  moneyValue?: boolean
}) {
  const positive = (delta ?? 0) >= 0
  return (
    <article class="stat-card">
      <div class="stat-card__top">
        <span class="stat-card__label">{label}</span>
        {icon && <span class="stat-card__icon">{icon}</span>}
      </div>
      <strong class="stat-card__value">
        {typeof value === 'number' && moneyValue ? money(value) : value}
      </strong>
      {delta !== undefined && delta !== null && (
        <span class={`delta ${positive ? 'is-positive' : 'is-negative'}`}>
          {positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {pct(Math.abs(delta))} {deltaLabel}
        </span>
      )}
      {delta === null && deltaLabel && (
        <span class="delta is-muted">{deltaLabel}</span>
      )}
      {detail && <span class="stat-card__detail">{detail}</span>}
    </article>
  )
}

export function CategoryChip({
  category,
  subtle = false,
}: {
  category?: Category
  subtle?: boolean
}) {
  return (
    <span class={`chip ${subtle ? 'chip--subtle' : ''}`}>
      <span
        class="chip__dot"
        style={{ background: category?.color ?? 'var(--ink-400)' }}
        aria-hidden="true"
      />
      {category?.name ?? 'Sin categoría'}
    </span>
  )
}

const periodLabels: { value: Period; label: string }[] = [
  { value: 'hoy', label: 'Hoy' },
  { value: 'semana', label: 'Semana' },
  { value: 'mes', label: 'Mes' },
  { value: 'ano', label: 'Año' },
]

export function PeriodTabs({
  value,
  onChange,
  label = 'Período',
}: {
  value: Period
  onChange: (period: Period) => void
  label?: string
}) {
  return (
    <div class="period-tabs" role="group" aria-label={label}>
      {periodLabels.map((period) => (
        <button
          type="button"
          key={period.value}
          class={`period-tabs__item ${value === period.value ? 'is-active' : ''}`}
          onClick={() => onChange(period.value)}
        >
          {period.label}
        </button>
      ))}
    </div>
  )
}

export function Modal({
  eyebrow,
  title,
  children,
  footer,
  onClose,
  wide = false,
}: {
  eyebrow: string
  title: string
  children: ComponentChildren
  footer?: ComponentChildren
  onClose: () => void
  wide?: boolean
}) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    document.body.classList.add('is-locked')
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.classList.remove('is-locked')
    }
  }, [onClose])

  return (
    <div class="modal-backdrop" onClick={onClose}>
      <section
        class={`modal ${wide ? 'modal--wide' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
      >
        <header class="modal__head">
          <div>
            <p class="eyebrow">{eyebrow}</p>
            <h2 class="display-md">{title}</h2>
          </div>
          <button
            type="button"
            class="icon-button"
            onClick={onClose}
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </header>
        <div class="modal__body">{children}</div>
        {footer && <footer class="modal__footer">{footer}</footer>}
      </section>
    </div>
  )
}

export function Toast({
  message,
  actionLabel,
  onAction,
  onClose,
}: {
  message: string
  actionLabel?: string
  onAction?: () => void
  onClose?: () => void
}) {
  return (
    <div class="toast" role="status">
      <span>{message}</span>
      {actionLabel && onAction && (
        <button type="button" class="toast__action" onClick={onAction}>
          {actionLabel}
        </button>
      )}
      {onClose && (
        <button
          type="button"
          class="toast__close"
          onClick={onClose}
          aria-label="Cerrar aviso"
        >
          <X size={16} />
        </button>
      )}
    </div>
  )
}

export function EmptyState({
  title,
  message,
  action,
}: {
  title: string
  message?: string
  action?: ComponentChildren
}) {
  return (
    <div class="empty-state">
      <span class="empty-state__mark" aria-hidden="true">
        ✦
      </span>
      <h3 class="display-md">{title}</h3>
      {message && <p>{message}</p>}
      {action}
    </div>
  )
}

export function Money({ value, muted = false }: { value: number; muted?: boolean }) {
  return <span class={muted ? 'money is-muted' : 'money'}>{money(value)}</span>
}
