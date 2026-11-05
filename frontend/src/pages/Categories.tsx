import { useMemo, useState } from 'preact/hooks'
import { ArrowRight, Plus, Tag } from 'lucide-preact'
import {
  EmptyState,
  Modal,
  PageHeader,
  Panel,
} from '../components/ui'
import { useData } from '../data/DataContext'
import { money, netIncome, pct, slugify } from '../lib/format'
import { navigate } from '../lib/router'
import type { Category, Product } from '../types'

type Tab = 'cards' | 'table' | 'compare'

const tabs: { id: Tab; label: string }[] = [
  { id: 'cards', label: 'Tarjetas' },
  { id: 'table', label: 'Tabla y detalle' },
  { id: 'compare', label: 'Comparativa' },
]

const palette = ['#6E0F0D', '#8C2A28', '#DCA396', '#B8863B', '#4F7A5B', '#A32626']

function categoryStats(products: Product[], category: Category) {
  const items = products.filter((product) => product.categoryId === category.id)
  const value = items.reduce((sum, product) => sum + product.price, 0)
  const cost = items.reduce((sum, product) => sum + product.cost, 0)
  const net = value - cost
  return {
    category,
    products: items,
    count: items.length,
    value,
    cost,
    net,
    margin: value > 0 ? (net / value) * 100 : 0,
    top: [...items]
      .sort(
        (a, b) =>
          netIncome(b.price, b.cost) - netIncome(a.price, a.cost),
      )
      .slice(0, 3),
  }
}

export function Categories() {
  const { categories, products, addCategory } = useData()
  const [tab, setTab] = useState<Tab>('cards')
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  const [color, setColor] = useState(palette[0])
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const stats = useMemo(
    () => categories.map((category) => categoryStats(products, category)),
    [categories, products],
  )
  const totals = stats.reduce(
    (sum, entry) => ({
      count: sum.count + entry.count,
      value: sum.value + entry.value,
      cost: sum.cost + entry.cost,
      net: sum.net + entry.net,
    }),
    { count: 0, value: 0, cost: 0, net: 0 },
  )
  const totalMargin = totals.value > 0 ? (totals.net / totals.value) * 100 : 0
  const ranked = [...stats].sort((a, b) => b.value - a.value)
  const lowest = [...stats]
    .filter((entry) => entry.count > 0)
    .sort((a, b) => a.margin - b.margin)[0]
  const lossProducts = products.filter(
    (product) => product.cost > product.price,
  )

  const openAdd = () => {
    setName('')
    setColor(palette[0])
    setError('')
    setAdding(true)
  }

  const submitCategory = async (event: Event) => {
    event.preventDefault()
    const trimmed = name.trim()
    if (trimmed.length < 2) {
      setError('El nombre debe tener al menos 2 caracteres.')
      return
    }
    const slug = slugify(trimmed)
    if (categories.some((category) => category.slug === slug)) {
      setError('Ya existe una categoría con ese nombre.')
      return
    }
    const now = new Date().toISOString()
    setSaving(true)
    try {
      await addCategory({
        id: `cat-${Date.now()}`,
        name: trimmed,
        slug,
        color,
        createdAt: now,
      })
      setAdding(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear la categoría.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Inventario"
        title="Categorías"
        subtitle={`${categories.length} categorías · ${products.length} productos · cómo rinde cada línea de la tienda`}
        actions={
          <button type="button" class="button button--primary" onClick={openAdd}>
            <Plus size={18} /> Añadir categoría
          </button>
        }
      />

      <div class="view-tabs" role="tablist" aria-label="Vista de categorías">
        {tabs.map((entry) => (
          <button
            type="button"
            key={entry.id}
            role="tab"
            aria-selected={tab === entry.id}
            class={`view-tabs__item ${tab === entry.id ? 'is-active' : ''}`}
            onClick={() => setTab(entry.id)}
          >
            {entry.label}
          </button>
        ))}
      </div>

      {products.length === 0 ? (
        <EmptyState
          title="Todavía no hay categorías con productos"
          message="Añade productos al catálogo para ver cómo rinde cada línea."
          action={
            <button type="button" class="button button--primary" onClick={() => navigate('/productos')}>
              Ir al catálogo
            </button>
          }
        />
      ) : (
        <>
          {tab === 'cards' && (
            <div class="category-cards">
              {stats.map((entry) => {
                const share = totals.value > 0 ? (entry.value / totals.value) * 100 : 0
                return (
                  <article class="category-card" key={entry.category.id}>
                    <header class="category-card__head">
                      <div>
                        <span class="category-card__swatch" style={{ background: entry.category.color }} />
                        <h2 class="display-md">{entry.category.name}</h2>
                      </div>
                      <span class="category-card__count">{entry.count} productos</span>
                    </header>
                    <div class="category-card__value">
                      <span class="label">Valor</span>
                      <strong>{money(entry.value)}</strong>
                      <span>{pct(share)} del inventario</span>
                    </div>
                    <div class="category-card__metrics">
                      <div><span>Costo</span><strong>{money(entry.cost)}</strong></div>
                      <div><span>Ganancia neta</span><strong>{money(entry.net)}</strong></div>
                      <div><span>Margen</span><strong>{pct(entry.margin)}</strong></div>
                    </div>
                    <div class="category-card__top">
                      <p class="label">Mayor ganancia</p>
                      {entry.top.map((product) => (
                        <div class="mini-row" key={product.id}>
                          <span>{product.name}</span>
                          <strong>{money(netIncome(product.price, product.cost))}</strong>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      class="button button--secondary button--full"
                      onClick={() => navigate(`/productos?cat=${entry.category.slug}`)}
                    >
                      Ver productos <ArrowRight size={16} />
                    </button>
                  </article>
                )
              })}

              <button type="button" class="category-card category-card--add" onClick={openAdd}>
                <Tag size={28} strokeWidth={1.4} />
                <strong>Añadir categoría</strong>
                <span>Organiza una nueva línea de la tienda.</span>
              </button>
            </div>
          )}

          {tab === 'table' && (
            <Panel className="panel--table">
              <div class="table-wrap">
                <table class="table">
                  <thead>
                    <tr>
                      <th scope="col">Categoría</th>
                      <th scope="col" class="is-right">Productos</th>
                      <th scope="col" class="is-right">Valor</th>
                      <th scope="col" class="is-right">Ganancia</th>
                      <th scope="col" class="is-right">Margen</th>
                      <th scope="col"><span class="sr-only">Detalle</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.map((entry) => (
                      <tr
                        class="table__row"
                        key={entry.category.id}
                        onClick={() => navigate(`/productos?cat=${entry.category.slug}`)}
                      >
                        <td>
                          <span class="table-category">
                            <i class="dot" style={{ background: entry.category.color }} />
                            {entry.category.name}
                          </span>
                        </td>
                        <td class="is-right money">{entry.count}</td>
                        <td class="is-right money">{money(entry.value)}</td>
                        <td class="is-right money">{money(entry.net)}</td>
                        <td class="is-right">{pct(entry.margin)}</td>
                        <td class="is-right"><ArrowRight size={16} /></td>
                      </tr>
                    ))}
                    <tr class="table__total">
                      <td>Total de la tienda</td>
                      <td class="is-right money">{totals.count}</td>
                      <td class="is-right money">{money(totals.value)}</td>
                      <td class="is-right money">{money(totals.net)}</td>
                      <td class="is-right">{pct(totalMargin)}</td>
                      <td />
                    </tr>
                  </tbody>
                </table>
              </div>
              <p class="panel__footnote">
                La ganancia y el margen se calculan con el precio y el costo de cada producto.
              </p>
            </Panel>
          )}

          {tab === 'compare' && (
            <>
              <Panel
                title="Distribución del valor del inventario"
                subtitle={`${money(totals.value)} a precio de venta`}
              >
                <div class="distribution" role="img" aria-label="Distribución del valor por categoría">
                  {ranked.map((entry) => (
                    <div
                      key={entry.category.id}
                      class="distribution__segment"
                      style={{
                        width: `${totals.value > 0 ? (entry.value / totals.value) * 100 : 0}%`,
                        background: entry.category.color,
                      }}
                      title={`${entry.category.name}: ${money(entry.value)}`}
                    />
                  ))}
                </div>
                <div class="distribution__legend">
                  {ranked.map((entry) => (
                    <span key={entry.category.id}>
                      <i class="dot" style={{ background: entry.category.color }} />
                      {entry.category.name} <strong>{pct(totals.value > 0 ? (entry.value / totals.value) * 100 : 0)}</strong>
                    </span>
                  ))}
                </div>
              </Panel>

              <Panel className="panel--table">
                <div class="table-wrap">
                  <table class="table">
                    <thead>
                      <tr>
                        <th scope="col">#</th>
                        <th scope="col">Categoría</th>
                        <th scope="col" class="is-right">Valor</th>
                        <th scope="col" class="is-right">Ganancia neta</th>
                        <th scope="col" class="is-right">Margen</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ranked.map((entry, index) => (
                        <tr class="table__row" key={entry.category.id}>
                          <td class="rank">{String(index + 1).padStart(2, '0')}</td>
                          <td>
                            <span class="table-category">
                              <i class="dot" style={{ background: entry.category.color }} />
                              {entry.category.name}
                            </span>
                            <span class="cell-sub">{entry.count} productos</span>
                          </td>
                          <td class="is-right money">{money(entry.value)}</td>
                          <td class="is-right money">{money(entry.net)}</td>
                          <td class="is-right">{pct(entry.margin)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Panel>

              <div class="callout-row">
                {lowest && (
                  <div class="callout callout--warning">
                    <strong>{lowest.category.name} tiene el margen más bajo ({pct(lowest.margin)})</strong>
                    <span>Su ganancia neta es {money(lowest.net)} sobre {money(lowest.value)} en inventario.</span>
                  </div>
                )}
                {lossProducts.length > 0 && (
                  <div class="callout callout--danger">
                    <strong>{lossProducts.length} {lossProducts.length === 1 ? 'producto se vende' : 'productos se venden'} por debajo del costo</strong>
                    <span>
                      {lossProducts.map((product) => product.name).join(', ')}. Revisa el precio para recuperar el margen.
                    </span>
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}

      {adding && (
        <Modal
          eyebrow="Nueva línea"
          title="Añadir categoría"
          onClose={() => setAdding(false)}
        >
          <form id="category-form" class="form-grid" onSubmit={submitCategory} novalidate>
            <label class="field field--full">
              <span class="field__label">Nombre de la categoría</span>
              <input
                value={name}
                onInput={(event) => setName((event.currentTarget as HTMLInputElement).value)}
                placeholder="Ej. Accesorios"
                required
                autofocus
              />
            </label>
            <div class="field field--full">
              <span class="field__label">Color de etiqueta</span>
              <div class="swatches">
                {palette.map((swatch) => (
                  <button
                    type="button"
                    key={swatch}
                    class={`swatch ${color === swatch ? 'is-active' : ''}`}
                    style={{ background: swatch }}
                    onClick={() => setColor(swatch)}
                    aria-label={`Usar color ${swatch}`}
                  />
                ))}
                <input
                  type="color"
                  value={color}
                  onInput={(event) => setColor((event.currentTarget as HTMLInputElement).value)}
                  aria-label="Color personalizado"
                />
              </div>
            </div>
            {error && <p class="form-error field--full" role="alert">{error}</p>}
            <div class="modal__actions field--full">
              <button type="button" class="button button--secondary" onClick={() => setAdding(false)}>
                Cancelar
              </button>
              <button type="submit" class="button button--primary" disabled={saving}>
                {saving ? 'Añadiendo…' : 'Añadir categoría'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  )
}
