import type { Category, Order, Period, Product } from '../types'

export type Summary = {
  revenue: number
  cost: number
  profit: number
  orders: number
  units: number
  ticket: number
  margin: number
}

const emptySummary: Summary = {
  revenue: 0,
  cost: 0,
  profit: 0,
  orders: 0,
  units: 0,
  ticket: 0,
  margin: 0,
}

export function orderRevenue(order: Order): number {
  return order.items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  )
}

export function orderCost(order: Order): number {
  return order.items.reduce(
    (sum, item) => sum + item.unitCost * item.quantity,
    0,
  )
}

export function summarize(orders: Order[]): Summary {
  if (orders.length === 0) return emptySummary

  const revenue = orders.reduce((sum, order) => sum + orderRevenue(order), 0)
  const cost = orders.reduce((sum, order) => sum + orderCost(order), 0)
  const units = orders.reduce(
    (sum, order) =>
      sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
    0,
  )

  return {
    revenue,
    cost,
    profit: revenue - cost,
    orders: orders.length,
    units,
    ticket: revenue / orders.length,
    margin: revenue > 0 ? ((revenue - cost) / revenue) * 100 : 0,
  }
}

function startOfDay(date: Date): Date {
  const value = new Date(date)
  value.setHours(0, 0, 0, 0)
  return value
}

function startOfWeek(date: Date): Date {
  const value = startOfDay(date)
  const day = value.getDay()
  const diff = day === 0 ? 6 : day - 1
  value.setDate(value.getDate() - diff)
  return value
}

export function periodStart(period: Period, now = new Date()): Date {
  if (period === 'hoy') return startOfDay(now)
  if (period === 'semana') return startOfWeek(now)
  if (period === 'mes') return new Date(now.getFullYear(), now.getMonth(), 1)
  return new Date(now.getFullYear(), 0, 1)
}

export function ordersInPeriod(
  orders: Order[],
  period: Period,
  now = new Date(),
): Order[] {
  const start = periodStart(period, now)
  return orders.filter((order) => new Date(order.soldAt) >= start)
}

export function previousPeriod(
  period: Period,
  now = new Date(),
): [Date, Date] {
  if (period === 'hoy') {
    const end = startOfDay(now)
    const start = new Date(end)
    start.setDate(start.getDate() - 1)
    return [start, end]
  }
  if (period === 'semana') {
    const end = startOfWeek(now)
    const start = new Date(end)
    start.setDate(start.getDate() - 7)
    return [start, end]
  }
  if (period === 'mes') {
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const end = new Date(now.getFullYear(), now.getMonth(), 1)
    return [start, end]
  }
  const start = new Date(now.getFullYear() - 1, 0, 1)
  const end = new Date(now.getFullYear(), 0, 1)
  return [start, end]
}

export function ordersBetween(
  orders: Order[],
  start: Date,
  end: Date,
): Order[] {
  return orders.filter((order) => {
    const date = new Date(order.soldAt)
    return date >= start && date < end
  })
}

export function delta(current: number, previous: number): number | null {
  if (previous <= 0) return null
  return ((current - previous) / previous) * 100
}

export function monthlySeries(orders: Order[], year: number) {
  const labels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
  const now = new Date()
  const series = labels.map((label, month) => ({
    label,
    revenue: 0,
    profit: 0,
    cost: 0,
    now: now.getFullYear() === year && now.getMonth() === month,
  }))

  for (const order of orders) {
    const date = new Date(order.soldAt)
    if (date.getFullYear() !== year) continue
    const entry = series[date.getMonth()]
    const revenue = orderRevenue(order)
    const cost = orderCost(order)
    entry.revenue += revenue
    entry.cost += cost
    entry.profit += revenue - cost
  }

  return series
}

export function dailySeries(orders: Order[], days: number) {
  const now = new Date()
  const labels = ['D', 'L', 'M', 'M', 'J', 'V', 'S']
  const series: { label: string; date: Date; revenue: number; profit: number }[] = []

  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = startOfDay(now)
    date.setDate(date.getDate() - offset)
    series.push({
      label: labels[date.getDay()],
      date,
      revenue: 0,
      profit: 0,
    })
  }

  for (const order of orders) {
    const date = startOfDay(new Date(order.soldAt))
    const entry = series.find(
      (item) => item.date.getTime() === date.getTime(),
    )
    if (!entry) continue
    const revenue = orderRevenue(order)
    entry.revenue += revenue
    entry.profit += revenue - orderCost(order)
  }

  return series
}

export function currentMonthDays(orders: Order[]) {
  const now = new Date()
  const totalDays = now.getDate()
  const series: { label: string; date: Date; revenue: number; profit: number }[] = []

  for (let day = 1; day <= totalDays; day += 1) {
    series.push({
      label: String(day),
      date: new Date(now.getFullYear(), now.getMonth(), day),
      revenue: 0,
      profit: 0,
    })
  }

  for (const order of orders) {
    const date = startOfDay(new Date(order.soldAt))
    const entry = series.find(
      (item) => item.date.getTime() === date.getTime(),
    )
    if (!entry) continue
    const revenue = orderRevenue(order)
    entry.revenue += revenue
    entry.profit += revenue - orderCost(order)
  }

  return series
}

export function topSellers(
  orders: Order[],
  products: Product[],
  limit = 5,
) {
  const map = new Map<string, { units: number; revenue: number; profit: number }>()

  for (const order of orders) {
    for (const item of order.items) {
      const entry = map.get(item.productId) ?? {
        units: 0,
        revenue: 0,
        profit: 0,
      }
      entry.units += item.quantity
      entry.revenue += item.unitPrice * item.quantity
      entry.profit += (item.unitPrice - item.unitCost) * item.quantity
      map.set(item.productId, entry)
    }
  }

  return [...map.entries()]
    .map(([productId, stats]) => ({
      product: products.find((product) => product.id === productId),
      ...stats,
    }))
    .filter((entry) => entry.product)
    .sort((a, b) => b.units - a.units)
    .slice(0, limit)
}

export function paymentBreakdown(orders: Order[]) {
  const methods = ['Transferencia', 'Efectivo', 'Tarjeta', 'Contra entrega'] as const
  const total = orders.reduce((sum, order) => sum + orderRevenue(order), 0)

  return methods.map((method) => {
    const revenue = orders
      .filter((order) => order.paymentMethod === method)
      .reduce((sum, order) => sum + orderRevenue(order), 0)
    return {
      method,
      revenue,
      share: total > 0 ? (revenue / total) * 100 : 0,
    }
  })
}

export function categoryBreakdown(
  orders: Order[],
  products: Product[],
  categories: Category[],
) {
  const productMap = new Map(products.map((product) => [product.id, product]))
  const totals = new Map<string, { units: number; revenue: number; profit: number }>()

  for (const order of orders) {
    for (const item of order.items) {
      const product = productMap.get(item.productId)
      if (!product) continue
      const entry = totals.get(product.categoryId) ?? {
        units: 0,
        revenue: 0,
        profit: 0,
      }
      entry.units += item.quantity
      entry.revenue += item.unitPrice * item.quantity
      entry.profit += (item.unitPrice - item.unitCost) * item.quantity
      totals.set(product.categoryId, entry)
    }
  }

  const revenue = [...totals.values()].reduce(
    (sum, entry) => sum + entry.revenue,
    0,
  )

  return categories.map((category) => {
    const stats = totals.get(category.id) ?? {
      units: 0,
      revenue: 0,
      profit: 0,
    }
    return {
      category,
      ...stats,
      share: revenue > 0 ? (stats.revenue / revenue) * 100 : 0,
    }
  })
}

export function unitsSoldLastDays(
  orders: Order[],
  productId: string,
  days = 30,
): number {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - days)
  return orders
    .filter((order) => new Date(order.soldAt) >= cutoff)
    .reduce(
      (sum, order) =>
        sum +
        order.items
          .filter((item) => item.productId === productId)
          .reduce((itemSum, item) => itemSum + item.quantity, 0),
      0,
    )
}
