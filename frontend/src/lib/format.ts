const currency = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const integer = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 0,
})

export function money(value: number): string {
  return `RD$ ${currency.format(value)}`
}

export function compactMoney(value: number): string {
  if (Math.abs(value) >= 1_000_000) {
    return `RD$ ${(value / 1_000_000).toFixed(1)}M`
  }
  if (Math.abs(value) >= 1_000) {
    return `RD$ ${(value / 1_000).toFixed(1)}k`
  }
  return money(value)
}

export function number(value: number): string {
  return integer.format(value)
}

export function pct(value: number, digits = 1): string {
  return `${value.toFixed(digits)}%`
}

export function netIncome(price: number, cost: number): number {
  return price - cost
}

export function margin(price: number, cost: number): number {
  if (price <= 0) return 0
  return ((price - cost) / price) * 100
}

export function shortDate(iso: string): string {
  return new Intl.DateTimeFormat('es-DO', {
    day: 'numeric',
    month: 'short',
  }).format(new Date(iso))
}

export function longDate(date: Date): string {
  return new Intl.DateTimeFormat('es-DO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(date)
}

export function monthLabel(date: Date): string {
  return new Intl.DateTimeFormat('es-DO', { month: 'long' }).format(date)
}

export function timeLabel(iso: string): string {
  return new Intl.DateTimeFormat('es-DO', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(iso))
}

export function relativeDay(iso: string): string {
  const date = new Date(iso)
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)

  if (date.toDateString() === today.toDateString()) return `Hoy ${timeLabel(iso)}`
  if (date.toDateString() === yesterday.toDateString()) return `Ayer ${timeLabel(iso)}`
  return `${shortDate(iso)} · ${timeLabel(iso)}`
}

export function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}
