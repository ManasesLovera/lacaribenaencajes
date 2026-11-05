import { compactMoney, money, number } from '../lib/format'

type MonthPoint = {
  label: string
  revenue: number
  profit: number
  cost: number
  now?: boolean
}

export function MonthlyChart({ data }: { data: MonthPoint[] }) {
  const max = Math.max(...data.map((point) => point.revenue), 1)

  return (
    <div class="chart">
      <div class="chart__plot" role="img" aria-label="Ingresos por mes">
        {data.map((point) => {
          const height = (point.revenue / max) * 100
          const profitShare =
            point.revenue > 0 ? (point.profit / point.revenue) * 100 : 0
          return (
            <div class="chart__col" key={point.label}>
              <span class="chart__value">{compactMoney(point.revenue)}</span>
              <div
                class={`chart__bar ${point.now ? 'is-now' : ''}`}
                style={{ height: `${Math.max(height, 2)}%` }}
                title={`${point.label}: ${money(point.revenue)} · ganancia ${money(point.profit)}`}
              >
                <span
                  class="chart__profit"
                  style={{ height: `${profitShare}%` }}
                />
              </div>
              <span class="chart__label">{point.label}</span>
            </div>
          )
        })}
      </div>
      <div class="chart__legend">
        <span><i class="dot dot--wine" /> Ganancia neta</span>
        <span><i class="dot dot--blush" /> Costo</span>
      </div>
    </div>
  )
}

export function DailyChart({
  data,
}: {
  data: { label: string; revenue: number; profit: number; date: Date }[]
}) {
  const max = Math.max(...data.map((point) => point.revenue), 1)

  return (
    <div class="daily-chart" role="img" aria-label="Ingresos de los últimos días">
      {data.map((point) => {
        const height = (point.revenue / max) * 100
        return (
          <div class="daily-chart__col" key={point.date.toISOString()}>
            <span class="daily-chart__value">
              {point.revenue > 0 ? compactMoney(point.revenue).replace('RD$ ', '') : '0'}
            </span>
            <div class="daily-chart__track">
              <div
                class="daily-chart__bar"
                style={{ height: `${Math.max(height, 2)}%` }}
                title={`${number(point.date.getDate())}: ${money(point.revenue)}`}
              />
            </div>
            <span class="daily-chart__label">{point.label}</span>
          </div>
        )
      })}
    </div>
  )
}
