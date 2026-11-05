import { useState } from 'preact/hooks'
import { ArrowRight, Package, Plus } from 'lucide-preact'
import { DailyChart, MonthlyChart } from '../components/charts'
import { PeriodTabs, PageHeader, Panel, StatCard } from '../components/ui'
import { useData } from '../data/DataContext'
import {
  dailySeries,
  delta,
  monthlySeries,
  ordersBetween,
  ordersInPeriod,
  previousPeriod,
  summarize,
  topSellers,
  categoryBreakdown,
} from '../lib/analytics'
import { margin, money, number, pct, relativeDay } from '../lib/format'
import { navigate } from '../lib/router'
import type { Period } from '../types'

function greeting(date: Date): string {
  const hour = date.getHours()
  if (hour < 12) return 'buenos días'
  if (hour < 18) return 'buenas tardes'
  return 'buenas noches'
}

export function Dashboard() {
  const { orders, products, categories, settings } = useData()
  const [period, setPeriod] = useState<Period>('mes')
  const now = new Date()

  const today = summarize(ordersInPeriod(orders, 'hoy', now))
  const week = summarize(ordersInPeriod(orders, 'semana', now))
  const month = summarize(ordersInPeriod(orders, 'mes', now))
  const year = summarize(ordersInPeriod(orders, 'ano', now))

  const [todayStart] = previousPeriod('hoy', now)
  const yesterday = summarize(
    ordersBetween(orders, todayStart, new Date(todayStart.getTime() + 86400000)),
  )
  const [weekStart] = previousPeriod('semana', now)
  const previousWeek = summarize(
    ordersBetween(orders, weekStart, new Date(weekStart.getTime() + 7 * 86400000)),
  )
  const [monthStart, monthEnd] = previousPeriod('mes', now)
  const previousMonth = summarize(ordersBetween(orders, monthStart, monthEnd))
  const [yearStart, yearEnd] = previousPeriod('ano', now)
  const previousYear = summarize(ordersBetween(orders, yearStart, yearEnd))

  const selectedOrders = ordersInPeriod(orders, period, now)
  const selected = summarize(selectedOrders)
  const categorySales = categoryBreakdown(selectedOrders, products, categories)
    .filter((entry) => entry.revenue > 0)
    .sort((a, b) => b.revenue - a.revenue)

  const monthly = monthlySeries(orders, now.getFullYear())
  const weekSeries = dailySeries(orders, 7)
  const sellers = topSellers(selectedOrders, products, 5)
  const restock = [...products]
    .filter((product) => product.stock < product.minStock)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 4)
  const recent = orders.slice(0, 4)
  const totalCategoryRevenue = categorySales.reduce(
    (sum, entry) => sum + entry.revenue,
    0,
  )
  const bestDay = [...weekSeries].sort((a, b) => b.revenue - a.revenue)[0]
  const dateLabel = new Intl.DateTimeFormat('es-DO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
    .format(now)
    .toUpperCase()

  return (
    <>
      <PageHeader
        eyebrow={dateLabel}
        title="Dashboard"
        subtitle={`${greeting(now)}, ${settings.ownerName.split(' ')[0]}. Así va la tienda hoy. Todas las cifras en pesos dominicanos, actualizadas a las ${new Intl.DateTimeFormat('es-DO', { hour: 'numeric', minute: '2-digit' }).format(now)}.`}
        actions={
          <button
            type="button"
            class="button button--primary"
            onClick={() => navigate('/productos')}
          >
            <Plus size={18} />
            Nuevo producto
          </button>
        }
      />

      <PeriodTabs value={period} onChange={setPeriod} />

      <div class="stats-grid">
        <StatCard
          label="Ingresos · Hoy"
          value={today.revenue}
          detail={`Ganancia ${money(today.profit)} · ${today.orders} ${today.orders === 1 ? 'venta' : 'ventas'} · ticket ${money(today.ticket)}`}
          delta={delta(today.revenue, yesterday.revenue)}
          deltaLabel="vs. ayer"
        />
        <StatCard
          label="Ingresos · Esta semana"
          value={week.revenue}
          detail={`Ganancia ${money(week.profit)} · ${week.orders} ventas`}
          delta={delta(week.revenue, previousWeek.revenue)}
          deltaLabel="vs. semana pasada"
        />
        <StatCard
          label={`Ingresos · ${new Intl.DateTimeFormat('es-DO', { month: 'long' }).format(now)}`}
          value={month.revenue}
          detail={`Ganancia ${money(month.profit)} · margen ${pct(month.margin)}`}
          delta={delta(month.revenue, previousMonth.revenue)}
          deltaLabel="vs. mes anterior"
        />
        <StatCard
          label={`Ingresos · ${now.getFullYear()}`}
          value={year.revenue}
          detail={`Ganancia ${money(year.profit)} · ${number(year.orders)} ventas`}
          delta={delta(year.revenue, previousYear.revenue)}
          deltaLabel={`vs. ${now.getFullYear() - 1}`}
        />
      </div>

      <div class="dash-grid dash-grid--main">
        <Panel
          title={`Ingresos por mes · ${now.getFullYear()}`}
          subtitle={`${money(year.revenue)} en el año`}
          action={
            <button type="button" class="link-button" onClick={() => navigate('/ventas')}>
              Ver ventas <ArrowRight size={14} />
            </button>
          }
        >
          <MonthlyChart data={monthly} />
        </Panel>

        <Panel
          title="Últimos 7 días"
          subtitle={`${money(weekSeries.reduce((sum, day) => sum + day.revenue, 0))} en la semana`}
        >
          <DailyChart data={weekSeries} />
          <p class="insight">
            <strong>{bestDay?.label}</strong> fue tu mejor día:{" "}
            {money(bestDay?.revenue ?? 0)}. El promedio diario es{" "}
            {money(
              weekSeries.reduce((sum, day) => sum + day.revenue, 0) /
                weekSeries.length,
            )}
            .
          </p>
        </Panel>
      </div>

      <div class="dash-grid dash-grid--three">
        <Panel
          title="Los más vendidos"
          subtitle={`Período: ${period === 'ano' ? 'este año' : period === 'mes' ? 'este mes' : period === 'semana' ? 'esta semana' : 'hoy'}`}
          action={
            <button type="button" class="link-button" onClick={() => navigate('/ventas')}>
              Ver todos
            </button>
          }
        >
          <ol class="seller-list">
            {sellers.map((entry, index) => (
              <li class="seller" key={entry.product?.id}>
                <span class="seller__rank">{String(index + 1).padStart(2, '0')}</span>
                <div class="seller__body">
                  <strong>{entry.product?.name}</strong>
                  <span>{entry.units} vendidos · {money(entry.revenue)}</span>
                </div>
                <span class="seller__margin">
                  {entry.product ? pct(margin(entry.product.price, entry.product.cost)) : '—'}
                </span>
              </li>
            ))}
            {sellers.length === 0 && (
              <li class="seller seller--empty">Sin ventas en este período.</li>
            )}
          </ol>
        </Panel>

        <Panel
          title="Necesitan reposición"
          subtitle={`${restock.length} productos con poco inventario`}
          action={
            <button type="button" class="link-button" onClick={() => navigate('/operativo')}>
              Ver inventario
            </button>
          }
        >
          <ul class="restock-list">
            {restock.map((product) => (
              <li class="restock" key={product.id}>
                <span class="thumb"><Package size={18} /></span>
                <div class="restock__body">
                  <strong>{product.name}</strong>
                  <span>
                    {product.stock === 0
                      ? 'Agotado · reponer cuanto antes'
                      : `${product.stock} de ${product.minStock} uds. · bajo mínimo`}
                  </span>
                </div>
                <button
                  type="button"
                  class="button button--secondary button--sm"
                  onClick={() => navigate('/operativo')}
                >
                  Reponer
                </button>
              </li>
            ))}
            {restock.length === 0 && (
              <li class="restock restock--empty">Todo el inventario está sobre el mínimo.</li>
            )}
          </ul>
        </Panel>

        <Panel
          title="Ventas por categoría"
          subtitle={`Período seleccionado · ${money(selected.revenue)}`}
        >
          <div class="category-bars">
            {categorySales.map((entry) => (
              <div class="category-bar" key={entry.category.id}>
                <div class="category-bar__head">
                  <span>
                    <i class="dot" style={{ background: entry.category.color }} />
                    {entry.category.name}
                  </span>
                  <strong>{pct(entry.share)}</strong>
                </div>
                <div class="category-bar__track">
                  <div
                    class="category-bar__fill"
                    style={{
                      width: `${totalCategoryRevenue > 0 ? (entry.revenue / totalCategoryRevenue) * 100 : 0}%`,
                      background: entry.category.color,
                    }}
                  />
                </div>
                <span class="category-bar__value">{money(entry.revenue)}</span>
              </div>
            ))}
          </div>
          {categorySales[0] && (
            <p class="insight">
              <strong>{categorySales[0].category.name}</strong> lidera con{" "}
              {pct(categorySales[0].share)} de lo vendido en el período.
            </p>
          )}
        </Panel>
      </div>

      <Panel
        title="Últimas ventas"
        subtitle="Movimientos recientes de la tienda"
        action={
          <button type="button" class="link-button" onClick={() => navigate('/ventas')}>
            Ver todas <ArrowRight size={14} />
          </button>
        }
      >
        <div class="recent-sales">
          {recent.map((order) => (
            <div class="recent-sale" key={order.id}>
              <div class="recent-sale__who">
                <strong>{order.customerName}</strong>
                <span>{relativeDay(order.soldAt)} · {order.paymentMethod}</span>
              </div>
              <span class={`status-pill status-pill--${order.status.toLowerCase()}`}>
                {order.status}
              </span>
              <span class="money">{money(order.total)}</span>
            </div>
          ))}
        </div>
      </Panel>
    </>
  )
}
