import { useMemo, useState } from 'preact/hooks'
import { ArrowUpRight, CreditCard, Banknote, Truck, Wallet } from 'lucide-preact'
import { MonthlyChart } from '../components/charts'
import { PageHeader, Panel, PeriodTabs } from '../components/ui'
import { useData } from '../data/DataContext'
import {
  delta,
  monthlySeries,
  ordersBetween,
  ordersInPeriod,
  paymentBreakdown,
  previousPeriod,
  summarize,
  topSellers,
} from '../lib/analytics'
import { margin, money, monthLabel, number, pct, relativeDay } from '../lib/format'
import type { Period } from '../types'

const methodIcons = {
  Transferencia: Wallet,
  Efectivo: Banknote,
  Tarjeta: CreditCard,
  'Contra entrega': Truck,
}

export function Sales() {
  const { orders, products, categories } = useData()
  const [period, setPeriod] = useState<Period>('mes')
  const now = new Date()
  const selected = ordersInPeriod(orders, period, now)
  const summary = summarize(selected)
  const [previousStart, previousEnd] = previousPeriod(period, now)
  const previous = summarize(ordersBetween(orders, previousStart, previousEnd))
  const change = delta(summary.revenue, previous.revenue)
  const monthly = monthlySeries(orders, now.getFullYear())
  const channels = paymentBreakdown(selected)
  const sellers = topSellers(selected, products, 6)
  const recent = selected.slice(0, 8)
  const topChannel = [...channels].sort((a, b) => b.revenue - a.revenue)[0]
  const topSeller = sellers[0]

  const periodLabel =
    period === 'hoy'
      ? 'hoy'
      : period === 'semana'
        ? 'esta semana'
        : period === 'mes'
          ? monthLabel(now)
          : String(now.getFullYear())

  const categoryName = useMemo(
    () => (id: string) => categories.find((category) => category.id === id)?.name,
    [categories],
  )

  return (
    <>
      <PageHeader
        eyebrow={new Intl.DateTimeFormat('es-DO', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
        }).format(now).toUpperCase()}
        title="Ventas"
        subtitle={`${periodLabel}, en números · cifras en pesos dominicanos, actualizadas a las ${new Intl.DateTimeFormat('es-DO', { hour: 'numeric', minute: '2-digit' }).format(now)}.`}
      />

      <PeriodTabs value={period} onChange={setPeriod} />

      <section class="sales-hero">
        <div class="sales-hero__main">
          <p class="eyebrow eyebrow--on-wine">Ingresos · {periodLabel}</p>
          <strong class="sales-hero__value">{money(summary.revenue)}</strong>
          <p class="sales-hero__detail">
            Ganancia neta {money(summary.profit)} · {pct(summary.margin)} margen ·{' '}
            {number(summary.orders)} {summary.orders === 1 ? 'pedido' : 'pedidos'}
          </p>
          {change !== null && (
            <span class="sales-hero__delta">
              <ArrowUpRight size={16} /> {pct(Math.abs(change))} vs. período anterior
            </span>
          )}
        </div>
        <dl class="sales-hero__metrics">
          <div>
            <dt>Ticket promedio</dt>
            <dd>{money(summary.ticket)}</dd>
          </div>
          <div>
            <dt>Unidades vendidas</dt>
            <dd>{number(summary.units)}</dd>
          </div>
          <div>
            <dt>Costo de lo vendido</dt>
            <dd>{money(summary.cost)}</dd>
          </div>
        </dl>
      </section>

      <Panel
        title={`Ventas por mes · ${now.getFullYear()}`}
        subtitle={`${money(monthly.reduce((sum, month) => sum + month.revenue, 0))} facturado en el año`}
      >
        <MonthlyChart data={monthly} />
        <p class="insight">
          El margen se mantiene en {pct(summary.margin)} en el período. La ganancia neta
          acumulada del año es {money(monthly.reduce((sum, month) => sum + month.profit, 0))}.
        </p>
      </Panel>

      <div class="dash-grid dash-grid--two">
        <Panel
          title="Por dónde entró el dinero"
          subtitle={`${periodLabel} · ${money(summary.revenue)}`}
        >
          <div class="channels">
            {channels.map((channel) => {
              const Icon = methodIcons[channel.method]
              return (
                <div class="channel" key={channel.method}>
                  <span class="channel__icon"><Icon size={18} /></span>
                  <div class="channel__body">
                    <div class="channel__head">
                      <strong>{channel.method}</strong>
                      <span>{pct(channel.share)}</span>
                    </div>
                    <div class="channel__track">
                      <div
                        class="channel__fill"
                        style={{ width: `${channel.share}%` }}
                      />
                    </div>
                    <span class="channel__value">{money(channel.revenue)} · {pct(channel.share)} del total</span>
                  </div>
                </div>
              )
            })}
          </div>
          {topChannel && (
            <p class="insight">
              <strong>{topChannel.method}</strong> concentra {pct(topChannel.share)} del dinero
              cobrado en el período.
            </p>
          )}
        </Panel>

        <Panel
          title="Productos más vendidos"
          subtitle={`${periodLabel} · por unidades e ingresos`}
        >
          <div class="table-wrap">
            <table class="table table--compact">
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Producto</th>
                  <th scope="col" class="is-right">Uds.</th>
                  <th scope="col" class="is-right">Ingresos</th>
                  <th scope="col" class="is-right">Margen</th>
                </tr>
              </thead>
              <tbody>
                {sellers.map((entry, index) => (
                  <tr key={entry.product?.id}>
                    <td class="rank">{String(index + 1).padStart(2, '0')}</td>
                    <td>
                      <strong class="cell-strong">{entry.product?.name}</strong>
                      <span class="cell-sub">
                        {categoryName(entry.product?.categoryId ?? '')}
                      </span>
                    </td>
                    <td class="is-right money">{number(entry.units)}</td>
                    <td class="is-right money">{money(entry.revenue)}</td>
                    <td class="is-right">
                      {entry.product
                        ? pct(margin(entry.product.price, entry.product.cost))
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {topSeller?.product && (
            <p class="insight">
              <strong>{topSeller.product.name}</strong> lidera con {number(topSeller.units)}{' '}
              unidades y {money(topSeller.revenue)} en ingresos.
            </p>
          )}
        </Panel>
      </div>

      <Panel
        title="Pedidos recientes"
        subtitle={`${recent.length} de ${selected.length} pedidos del período`}
      >
        <div class="orders">
          {recent.map((order) => (
            <div class="order" key={order.id}>
              <div class="order__id">#{order.number}</div>
              <div class="order__who">
                <strong>{order.customerName}</strong>
                <span>{relativeDay(order.soldAt)} · {order.paymentMethod}</span>
              </div>
              <span class={`status-pill status-pill--${order.status.toLowerCase()}`}>
                {order.status}
              </span>
              <strong class="order__total money">{money(order.total)}</strong>
            </div>
          ))}
        </div>
      </Panel>
    </>
  )
}
