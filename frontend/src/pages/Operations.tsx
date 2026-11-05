import { useMemo, useState } from 'preact/hooks'
import {
  AlertTriangle,
  Check,
  ClipboardList,
  Package,
  Plus,
  Truck,
} from 'lucide-preact'
import { PageHeader, Panel, PeriodTabs } from '../components/ui'
import { useData } from '../data/DataContext'
import {
  categoryBreakdown,
  ordersInPeriod,
  summarize,
  unitsSoldLastDays,
} from '../lib/analytics'
import { money, number, pct } from '../lib/format'
import type { Period } from '../types'

const suppliers = ['Encajes del Caribe', 'Satín RD', 'Atelier Import', 'Textiles Zona']

export function Operations() {
  const { products, categories, orders, tasks, toggleTask, addTask } = useData()
  const [period, setPeriod] = useState<Period>('mes')
  const [newTask, setNewTask] = useState('')
  const [taskError, setTaskError] = useState('')
  const now = new Date()

  const selected = ordersInPeriod(orders, period, now)
  const summary = summarize(selected)
  const categorySales = categoryBreakdown(selected, products, categories)
    .filter((entry) => entry.revenue > 0)
    .sort((a, b) => b.revenue - a.revenue)
  const totalCategoryRevenue = categorySales.reduce(
    (sum, entry) => sum + entry.revenue,
    0,
  )

  const outOfStock = products.filter((product) => product.stock === 0)
  const lowStock = products
    .filter((product) => product.stock > 0 && product.stock < product.minStock)
    .sort((a, b) => a.stock - b.stock)
  const lossProducts = products.filter((product) => product.cost > product.price)
  const restock = [...products]
    .filter((product) => product.stock < product.minStock)
    .sort((a, b) => a.stock - b.stock)

  const stockValue = products.reduce(
    (sum, product) => sum + product.cost * product.stock,
    0,
  )
  const stockUnits = products.reduce((sum, product) => sum + product.stock, 0)
  const inStock = products.filter((product) => product.stock >= product.minStock).length
  const lowCount = lowStock.length
  const outCount = outOfStock.length
  const healthTotal = Math.max(products.length, 1)

  const uniqueCustomers = new Set(selected.map((order) => order.customerName)).size
  const openTasks = tasks.filter((task) => !task.done).length

  const alerts = useMemo(() => {
    const list: string[] = []
    if (outOfStock.length > 0) {
      list.push(`${outOfStock.length} ${outOfStock.length === 1 ? 'producto agotado' : 'productos agotados'}`)
    }
    if (lowStock.length > 0) {
      list.push(`${lowStock.length} ${lowStock.length === 1 ? 'producto bajo' : 'productos bajo'} el mínimo`)
    }
    if (lossProducts.length > 0) {
      list.push(`${lossProducts.length} ${lossProducts.length === 1 ? 'producto se vende' : 'productos se venden'} con pérdida`)
    }
    return list
  }, [outOfStock.length, lowStock.length, lossProducts.length])

  const estimateDays = (stock: number, productId: string) => {
    const units = unitsSoldLastDays(orders, productId, 30)
    const average = units / 30
    if (average <= 0) return null
    return stock / average
  }

  const submitTask = async (event: Event) => {
    event.preventDefault()
    if (newTask.trim().length < 2) return
    try {
      await addTask(newTask.trim())
      setNewTask('')
      setTaskError('')
    } catch (err) {
      setTaskError(err instanceof Error ? err.message : 'No se pudo añadir la tarea.')
    }
  }

  return (
    <>
      <PageHeader
        eyebrow={new Intl.DateTimeFormat('es-DO', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
        }).format(now).toUpperCase()}
        title="Operativo"
        subtitle={`hoy · inventario, reposición y tareas pendientes · montos en RD$`}
        actions={
          <button type="button" class="button button--primary">
            <ClipboardList size={18} /> Revisar alertas
          </button>
        }
      />

      <PeriodTabs value={period} onChange={setPeriod} />

      {alerts.length > 0 && (
        <div class="alert-banner">
          <span class="alert-banner__icon"><AlertTriangle size={20} /></span>
          <div>
            <strong>{alerts.length} {alerts.length === 1 ? 'alerta requiere' : 'alertas requieren'} atención</strong>
            <p>{alerts.join(' · ')}.</p>
          </div>
          <button type="button" class="button button--secondary button--sm">
            Revisar
          </button>
        </div>
      )}

      <div class="dash-grid dash-grid--two">
        <Panel
          title="Salud del inventario"
          subtitle={`${money(stockValue)} a costo · ${number(stockUnits)} unidades en ${products.length} productos activos`}
        >
          <div class="health">
            <div class="health__head">
              <strong class="health__value">{money(stockValue)}</strong>
              <span>Valor a costo</span>
            </div>
            <div class="health__bar" role="img" aria-label="Distribución del inventario">
              <span style={{ width: `${(inStock / healthTotal) * 100}%` }} class="health__seg health__seg--ok" />
              <span style={{ width: `${(lowCount / healthTotal) * 100}%` }} class="health__seg health__seg--low" />
              <span style={{ width: `${(outCount / healthTotal) * 100}%` }} class="health__seg health__seg--out" />
            </div>
            <div class="health__legend">
              <span><i class="dot dot--success" /> {pct((inStock / healthTotal) * 100, 0)} en stock ({inStock})</span>
              <span><i class="dot dot--warning" /> {pct((lowCount / healthTotal) * 100, 0)} bajo mínimo ({lowCount})</span>
              <span><i class="dot dot--danger" /> {pct((outCount / healthTotal) * 100, 0)} agotado ({outCount})</span>
            </div>
          </div>
        </Panel>

        <Panel title="Resumen del período" subtitle={`Datos de ${period === 'ano' ? 'este año' : period === 'mes' ? 'este mes' : period === 'semana' ? 'esta semana' : 'hoy'}`}>
          <div class="mini-stats">
            <div><span>Pedidos del mes</span><strong>{number(summary.orders)}</strong></div>
            <div><span>Ticket promedio</span><strong>{money(summary.ticket)}</strong></div>
            <div><span>Margen bruto</span><strong>{pct(summary.margin)}</strong></div>
            <div><span>Clientes</span><strong>{number(uniqueCustomers)}</strong></div>
          </div>
          <p class="insight">
            {number(openTasks)} tareas abiertas y {restock.length} productos necesitan reposición.
          </p>
        </Panel>
      </div>

      <Panel
        title="Ventas por categoría"
        subtitle={`Período seleccionado · ${money(summary.revenue)}`}
      >
        <div class="category-bars category-bars--wide">
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
            <strong>{categorySales[0].category.name}</strong> lidera con {money(categorySales[0].revenue)} y {pct(categorySales[0].share)} de las ventas.
          </p>
        )}
      </Panel>

      <div class="dash-grid dash-grid--two">
        <Panel
          title="Stock bajo"
          subtitle={`${restock.length} productos bajo el mínimo · por urgencia`}
        >
          <div class="low-stock-list">
            {restock.slice(0, 6).map((product, index) => {
              const days = estimateDays(product.stock, product.id)
              return (
                <div class="low-stock" key={product.id}>
                  <span class="low-stock__rank">{index + 1}</span>
                  <span class="thumb"><Package size={18} /></span>
                  <div class="low-stock__body">
                    <strong>{product.name}</strong>
                    <span>
                      {product.stock === 0
                        ? 'Agotado · reponer cuanto antes'
                        : days !== null
                          ? `Se agota en ~${Math.max(1, Math.round(days))} ${Math.round(days) === 1 ? 'día' : 'días'}`
                          : 'Sin ventas recientes'}
                    </span>
                  </div>
                  <span class={`stock-pill ${product.stock === 0 ? 'is-out' : 'is-low'}`}>
                    {product.stock} / {product.minStock}
                  </span>
                </div>
              )
            })}
            {restock.length === 0 && <p class="panel__footnote">Todo el inventario está sobre el mínimo.</p>}
          </div>
        </Panel>

        <Panel
          title="Cola de reposición"
          subtitle={`${Math.min(restock.length, 3)} pedidos sugeridos al proveedor`}
        >
          <div class="restock-queue">
            {restock.slice(0, 3).map((product, index) => {
              const suggested = Math.max(product.minStock * 2 - product.stock, product.minStock)
              return (
                <div class="queue-row" key={product.id}>
                  <span class="queue-row__qty">+{suggested}</span>
                  <div>
                    <strong>{product.name}</strong>
                    <span>{suppliers[index % suppliers.length]} · llega en {3 + index} días</span>
                  </div>
                  <Truck size={18} />
                </div>
              )
            })}
            {restock.length === 0 && <p class="panel__footnote">No hay pedidos pendientes.</p>}
          </div>
          <p class="insight">
            El proveedor tarda 3–5 días. Pide antes del viernes para surtir el fin de semana.
          </p>
        </Panel>
      </div>

      <Panel
        title="Tareas pendientes"
        subtitle={`${openTasks} abiertas · ${tasks.filter((task) => task.done).length} completadas`}
      >
        <form class="task-add" onSubmit={submitTask}>
          <input
            value={newTask}
            onInput={(event) => setNewTask((event.currentTarget as HTMLInputElement).value)}
            placeholder="Añadir una tarea…"
            aria-label="Nueva tarea"
          />
          <button type="submit" class="button button--primary button--sm" disabled={newTask.trim().length < 2}>
            <Plus size={16} /> Añadir
          </button>
        </form>
        {taskError && <p class="form-error">{taskError}</p>}
        <ul class="tasks">
          {tasks.map((task) => (
            <li class={`task ${task.done ? 'is-done' : ''}`} key={task.id}>
              <button
                type="button"
                class="task__check"
                onClick={() => {
                  void toggleTask(task.id).catch((err) =>
                    setTaskError(
                      err instanceof Error ? err.message : 'No se pudo actualizar la tarea.',
                    ),
                  )
                }}
                aria-label={task.done ? `Marcar pendiente: ${task.title}` : `Completar: ${task.title}`}
              >
                {task.done && <Check size={14} />}
              </button>
              <span>{task.title}</span>
            </li>
          ))}
        </ul>
      </Panel>

      {lossProducts.length > 0 && (
        <div class="callout callout--danger">
          <strong>{lossProducts.length} {lossProducts.length === 1 ? 'producto se vende' : 'productos se venden'} con pérdida</strong>
          <span>
            {lossProducts.map((product) => product.name).join(', ')}. Revisa el precio para
            no perder margen en cada venta.
          </span>
        </div>
      )}
    </>
  )
}
