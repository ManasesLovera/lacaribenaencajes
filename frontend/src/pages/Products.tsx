import { useEffect, useMemo, useRef, useState } from 'preact/hooks'
import {
  ArrowDownUp,
  ChevronLeft,
  ChevronRight,
  Package,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-preact'
import {
  CategoryChip,
  EmptyState,
  Modal,
  PageHeader,
  Toast,
} from '../components/ui'
import { useData } from '../data/DataContext'
import { margin, money, netIncome, pct, shortDate } from '../lib/format'
import type { Product } from '../types'

const PAGE_SIZE = 8
const numberPattern = /^\d+(\.\d{1,2})?$/

type FormState = {
  name: string
  categoryId: string
  price: string
  cost: string
}

function ProductForm({
  product,
  onSave,
  onClose,
}: {
  product: Product | null
  onSave: (product: Product) => Promise<void>
  onClose: () => void
}) {
  const { categories } = useData()
  const nameRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState<FormState>({
    name: product?.name ?? '',
    categoryId: product?.categoryId ?? categories[0]?.id ?? '',
    price: product ? String(product.price) : '',
    cost: product ? String(product.cost) : '',
  })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    nameRef.current?.focus()
  }, [])

  const price = Number(form.price)
  const cost = Number(form.cost)
  const hasNumbers = form.price !== '' && form.cost !== ''
  const net = hasNumbers ? netIncome(price, cost) : 0
  const productMargin = hasNumbers ? margin(price, cost) : 0

  const submit = async (event: Event) => {
    event.preventDefault()
    const name = form.name.trim()
    if (name.length < 2 || name.length > 80) {
      setError('El nombre debe tener entre 2 y 80 caracteres.')
      return
    }
    if (!form.categoryId) {
      setError('Selecciona una categoría.')
      return
    }
    if (!numberPattern.test(form.price) || !numberPattern.test(form.cost)) {
      setError('Precio y costo deben ser números mayores o iguales a cero, con hasta dos decimales.')
      return
    }
    if (Number.isNaN(price) || Number.isNaN(cost)) {
      setError('Revisa el precio y el costo.')
      return
    }

    setError('')
    setSaving(true)
    try {
      await onSave({
        id: product?.id ?? `p-${Date.now()}`,
        name,
        categoryId: form.categoryId,
        price: Math.round(price * 100) / 100,
        cost: Math.round(cost * 100) / 100,
        stock: product?.stock ?? 3,
        minStock: product?.minStock ?? 3,
        createdAt: product?.createdAt ?? new Date().toISOString(),
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el producto.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form id="product-form" onSubmit={submit} class="form-grid" novalidate>
      <label class="field field--full">
        <span class="field__label">Nombre del producto</span>
        <input
          ref={nameRef}
          value={form.name}
          maxLength={80}
          onInput={(event) =>
            setForm({ ...form, name: (event.currentTarget as HTMLInputElement).value })
          }
          placeholder="Ej. Pijama satinada Rosé"
          required
        />
        <span class="field__hint">Entre 2 y 80 caracteres.</span>
      </label>

      <label class="field field--full">
        <span class="field__label">Categoría</span>
        <select
          value={form.categoryId}
          onChange={(event) =>
            setForm({ ...form, categoryId: (event.currentTarget as HTMLSelectElement).value })
          }
        >
          <option value="">Selecciona una categoría</option>
          {categories.map((category) => (
            <option value={category.id} key={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </label>

      <label class="field">
        <span class="field__label">Precio de venta</span>
        <div class="field__currency">
          <span>RD$</span>
          <input
            inputMode="decimal"
            value={form.price}
            onInput={(event) =>
              setForm({ ...form, price: (event.currentTarget as HTMLInputElement).value })
            }
            placeholder="0.00"
            required
          />
        </div>
      </label>

      <label class="field">
        <span class="field__label">Costo</span>
        <div class="field__currency">
          <span>RD$</span>
          <input
            inputMode="decimal"
            value={form.cost}
            onInput={(event) =>
              setForm({ ...form, cost: (event.currentTarget as HTMLInputElement).value })
            }
            placeholder="0.00"
            required
          />
        </div>
      </label>

      <div class="computed field--full">
        <div class="computed__head">
          <span class="field__label">Ganancia neta</span>
          <span class="tag">Calculado</span>
        </div>
        <div class="computed__value">
          <strong class={net < 0 ? 'is-negative' : ''}>
            {hasNumbers ? money(net) : 'RD$ 0.00'}
          </strong>
          <span>{hasNumbers ? pct(productMargin) : '0.0%'} margen</span>
        </div>
        <p class="field__hint">Calculado automáticamente: precio de venta − costo.</p>
      </div>

      {hasNumbers && cost > price && (
        <p class="form-warning field--full" role="alert">
          El costo supera el precio de venta.
        </p>
      )}

      {error && (
        <p class="form-error field--full" role="alert">
          {error}
        </p>
      )}

      <div class="modal__actions field--full">
        <button type="button" class="button button--secondary" onClick={onClose}>
          Cancelar
        </button>
        <button type="submit" class="button button--primary" disabled={saving}>
          {saving ? 'Guardando…' : product ? 'Guardar cambios' : 'Añadir producto'}
        </button>
      </div>
    </form>
  )
}

export function Products({ query }: { query: URLSearchParams }) {
  const { products, categories, saveProduct, deleteProduct, restoreProduct } = useData()
  const queryString = query.toString()
  const initialCategory = categories.find(
    (category) => category.slug === query.get('cat'),
  )?.id
  const [search, setSearch] = useState(query.get('q') ?? '')
  const [categoryFilter, setCategoryFilter] = useState<string>(
    initialCategory ?? 'all',
  )
  const [sort, setSort] = useState('recent')
  const [page, setPage] = useState(1)
  const [editing, setEditing] = useState<Product | null>(null)
  const [creating, setCreating] = useState(false)
  const [deleted, setDeleted] = useState<Product | null>(null)
  const timer = useRef<number | null>(null)

  useEffect(() => {
    setSearch(query.get('q') ?? '')
    setCategoryFilter(
      categories.find((category) => category.slug === query.get('cat'))?.id ?? 'all',
    )
    setPage(1)
  }, [queryString, categories])

  useEffect(() => {
    return () => {
      if (timer.current) window.clearTimeout(timer.current)
    }
  }, [])

  const summary = useMemo(() => {
    const value = products.reduce((sum, product) => sum + product.price, 0)
    const profit = products.reduce(
      (sum, product) => sum + netIncome(product.price, product.cost),
      0,
    )
    return {
      count: products.length,
      value,
      profit,
      margin: value > 0 ? (profit / value) * 100 : 0,
    }
  }, [products])

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    const list = products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(term)
      const matchesCategory =
        categoryFilter === 'all' || product.categoryId === categoryFilter
      return matchesSearch && matchesCategory
    })

    return [...list].sort((a, b) => {
      if (sort === 'name') return a.name.localeCompare(b.name)
      if (sort === 'price-asc') return a.price - b.price
      if (sort === 'price-desc') return b.price - a.price
      if (sort === 'margin') {
        return (
          margin(b.price, b.cost) - margin(a.price, a.cost)
        )
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
  }, [products, search, categoryFilter, sort])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const visible = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  )

  const categoryFor = (id: string) =>
    categories.find((category) => category.id === id)

  const save = async (product: Product) => {
    await saveProduct(product)
    setEditing(null)
    setCreating(false)
  }

  const remove = async (product: Product) => {
    await deleteProduct(product.id)
    setDeleted(product)
    if (timer.current) window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setDeleted(null), 10000)
  }

  const undo = async () => {
    if (!deleted) return
    await restoreProduct(deleted)
    setDeleted(null)
    if (timer.current) window.clearTimeout(timer.current)
  }

  const resetFilters = () => {
    setSearch('')
    setCategoryFilter('all')
    setSort('recent')
    setPage(1)
  }

  return (
    <>
      <PageHeader
        eyebrow="Catálogo"
        title="Productos"
        subtitle={`${summary.count} ${summary.count === 1 ? 'producto' : 'productos'} en ${categories.length} categorías · precios en pesos dominicanos`}
        actions={
          <button
            type="button"
            class="button button--primary"
            onClick={() => setCreating(true)}
          >
            <Plus size={18} />
            Nuevo producto
          </button>
        }
      />

      <div class="stats-grid stats-grid--three">
        <article class="stat-card stat-card--inline">
          <span class="stat-card__label">Productos activos</span>
          <strong class="stat-card__value stat-card__value--num">{summary.count}</strong>
          <span class="stat-card__detail">en {categories.length} categorías</span>
        </article>
        <article class="stat-card stat-card--inline">
          <span class="stat-card__label">Valor del inventario</span>
          <strong class="stat-card__value">{money(summary.value)}</strong>
          <span class="stat-card__detail">a precio de venta</span>
        </article>
        <article class="stat-card stat-card--inline">
          <span class="stat-card__label">Ganancia potencial</span>
          <strong class="stat-card__value">{money(summary.profit)}</strong>
          <span class="stat-card__detail">{pct(summary.margin)} margen promedio</span>
        </article>
      </div>

      <div class="toolbar">
        <div class="pill-row" role="group" aria-label="Filtrar por categoría">
          <button
            type="button"
            class={`filter-pill ${categoryFilter === 'all' ? 'is-active' : ''}`}
            onClick={() => {
              setCategoryFilter('all')
              setPage(1)
            }}
          >
            Todos <span>{products.length}</span>
          </button>
          {categories.map((category) => {
            const count = products.filter(
              (product) => product.categoryId === category.id,
            ).length
            return (
              <button
                type="button"
                key={category.id}
                class={`filter-pill ${categoryFilter === category.id ? 'is-active' : ''}`}
                onClick={() => {
                  setCategoryFilter(category.id)
                  setPage(1)
                }}
              >
                {category.name} <span>{count}</span>
              </button>
            )
          })}
        </div>

        <div class="toolbar__right">
          <span class="result-count">{filtered.length} resultados</span>
          <label class="sort-control">
            <ArrowDownUp size={16} />
            <span class="sr-only">Ordenar por</span>
            <select value={sort} onChange={(event) => setSort((event.currentTarget as HTMLSelectElement).value)}>
              <option value="recent">Más recientes</option>
              <option value="name">Nombre</option>
              <option value="price-desc">Precio: mayor primero</option>
              <option value="price-asc">Precio: menor primero</option>
              <option value="margin">Mejor margen</option>
            </select>
          </label>
        </div>
      </div>

      {visible.length === 0 ? (
        <EmptyState
          title={products.length === 0 ? 'Tu catálogo empieza aquí' : 'No encontramos productos con ese filtro'}
          message={
            products.length === 0
              ? 'Añade tu primera pieza para empezar a seguir precios y márgenes.'
              : 'Prueba con otro nombre o vuelve a ver todas las categorías.'
          }
          action={
            products.length === 0 ? (
              <button type="button" class="button button--primary" onClick={() => setCreating(true)}>
                <Plus size={18} /> Nuevo producto
              </button>
            ) : (
              <button type="button" class="button button--secondary" onClick={resetFilters}>
                Limpiar filtros
              </button>
            )
          }
        />
      ) : (
        <>
          <div class="table-wrap table-wrap--desktop">
            <table class="table">
              <thead>
                <tr>
                  <th scope="col">Producto</th>
                  <th scope="col">Categoría</th>
                  <th scope="col" class="is-right">Precio</th>
                  <th scope="col" class="is-right">Costo</th>
                  <th scope="col" class="is-right">
                    <span class="computed-head">Ganancia neta</span>
                  </th>
                  <th scope="col"><span class="sr-only">Acciones</span></th>
                </tr>
              </thead>
              <tbody>
                {visible.map((product) => {
                  const category = categoryFor(product.categoryId)
                  const net = netIncome(product.price, product.cost)
                  const productMargin = margin(product.price, product.cost)
                  return (
                    <tr
                      key={product.id}
                      class="table__row"
                      onClick={() => setEditing(product)}
                    >
                      <td>
                        <div class="product-cell">
                          <span class="thumb"><Package size={18} /></span>
                          <div>
                            <strong>{product.name}</strong>
                            <span>Añadido {shortDate(product.createdAt)}</span>
                          </div>
                        </div>
                      </td>
                      <td><CategoryChip category={category} /></td>
                      <td class="is-right money">{money(product.price)}</td>
                      <td class="is-right money is-muted">{money(product.cost)}</td>
                      <td class="is-right">
                        <div class="net-cell">
                          <span class={`net ${net < 0 ? 'is-negative' : ''}`}>
                            {money(net)}
                          </span>
                          <span class="net__margin">{pct(productMargin)} margen</span>
                        </div>
                      </td>
                      <td>
                        <div class="row-actions">
                          <button
                            type="button"
                            class="icon-button icon-button--sm"
                            aria-label={`Editar ${product.name}`}
                            onClick={(event) => {
                              event.stopPropagation()
                              setEditing(product)
                            }}
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            type="button"
                            class="icon-button icon-button--sm icon-button--danger"
                            aria-label={`Eliminar ${product.name}`}
                            onClick={(event) => {
                              event.stopPropagation()
                              void remove(product)
                            }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div class="product-cards">
            {visible.map((product) => {
              const category = categoryFor(product.categoryId)
              const net = netIncome(product.price, product.cost)
              const productMargin = margin(product.price, product.cost)
              return (
                <article class="product-card" key={product.id}>
                  <button
                    type="button"
                    class="product-card__main"
                    onClick={() => setEditing(product)}
                  >
                    <span class="thumb"><Package size={18} /></span>
                    <div class="product-card__name">
                      <strong>{product.name}</strong>
                      <CategoryChip category={category} subtle />
                    </div>
                  </button>
                  <div class="product-card__numbers">
                    <div>
                      <span>Precio</span>
                      <strong class="money">{money(product.price)}</strong>
                    </div>
                    <div>
                      <span>Costo</span>
                      <strong class="money is-muted">{money(product.cost)}</strong>
                    </div>
                    <div>
                      <span>Ganancia</span>
                      <strong class={`net ${net < 0 ? 'is-negative' : ''}`}>
                        {money(net)}
                      </strong>
                      <small>{pct(productMargin)} margen</small>
                    </div>
                  </div>
                  <div class="product-card__actions">
                    <button type="button" class="button button--secondary button--sm" onClick={() => setEditing(product)}>
                      <Pencil size={14} /> Editar
                    </button>
                    <button type="button" class="button button--danger button--sm" onClick={() => void remove(product)}>
                      <Trash2 size={14} /> Eliminar
                    </button>
                  </div>
                </article>
              )
            })}
          </div>

          <div class="pagination">
            <span>
              Mostrando {visible.length} de {filtered.length}
              {filtered.length !== products.length ? ` · ${products.length} en total` : ''}
            </span>
            <div class="pagination__controls">
              <button
                type="button"
                class="icon-button"
                onClick={() => setPage((value) => Math.max(1, value - 1))}
                disabled={safePage === 1}
                aria-label="Página anterior"
              >
                <ChevronLeft size={18} />
              </button>
              <span>página {safePage} de {totalPages}</span>
              <button
                type="button"
                class="icon-button"
                onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
                disabled={safePage === totalPages}
                aria-label="Página siguiente"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </>
      )}

      {(creating || editing) && (
        <Modal
          eyebrow={editing ? 'Editar pieza' : 'Nueva pieza'}
          title={editing ? 'Editar producto' : 'Nuevo producto'}
          onClose={() => {
            setCreating(false)
            setEditing(null)
          }}
        >
          <ProductForm
            product={editing}
            onSave={save}
            onClose={() => {
              setCreating(false)
              setEditing(null)
            }}
          />
        </Modal>
      )}

      {deleted && (
        <Toast
          message={`“${deleted.name}” eliminado`}
          actionLabel="Deshacer"
          onAction={() => void undo()}
          onClose={() => setDeleted(null)}
        />
      )}
    </>
  )
}
