import { useMemo, useState } from 'preact/hooks'
import { Minus, Package, Plus, Search, Trash2 } from 'lucide-preact'
import { useData } from '../data/DataContext'
import { margin, money, netIncome, pct } from '../lib/format'
import type { Order, Product } from '../types'
import { Modal } from './ui'

type CartLine = {
  productId: string
  quantity: number
}

const paymentMethods: Order['paymentMethod'][] = [
  'Transferencia',
  'Efectivo',
  'Tarjeta',
  'Contra entrega',
]

const statuses: Order['status'][] = ['Pagada', 'Pendiente', 'Enviada']

export function SaleModal({
  onClose,
  onCreated,
}: {
  onClose: () => void
  onCreated: (order: Order) => void
}) {
  const { products, categories, createOrder } = useData()
  const [customer, setCustomer] = useState('')
  const [payment, setPayment] = useState<Order['paymentMethod']>('Efectivo')
  const [status, setStatus] = useState<Order['status']>('Pagada')
  const [search, setSearch] = useState('')
  const [cart, setCart] = useState<CartLine[]>([])
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const findProduct = (id: string): Product | undefined =>
    products.find((product) => product.id === id)

  const lines = useMemo(
    () =>
      cart
        .map((line) => {
          const product = findProduct(line.productId)
          return product ? { ...line, product } : null
        })
        .filter((line): line is CartLine & { product: Product } => line !== null),
    [cart, products],
  )

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(search.trim().toLowerCase()),
  )

  const subtotal = lines.reduce(
    (sum, line) => sum + line.product.price * line.quantity,
    0,
  )
  const totalCost = lines.reduce(
    (sum, line) => sum + line.product.cost * line.quantity,
    0,
  )
  const profit = netIncome(subtotal, totalCost)
  const saleMargin = margin(subtotal, totalCost)
  const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0)

  const categoryName = (product: Product) =>
    categories.find((category) => category.id === product.categoryId)?.name ??
    'Sin categoría'

  const addProduct = (product: Product) => {
    if (product.stock <= 0) return
    setError('')
    setCart((current) => {
      const existing = current.find((line) => line.productId === product.id)
      if (existing) {
        if (existing.quantity >= product.stock) return current
        return current.map((line) =>
          line.productId === product.id
            ? { ...line, quantity: line.quantity + 1 }
            : line,
        )
      }
      return [...current, { productId: product.id, quantity: 1 }]
    })
  }

  const setQuantity = (productId: string, quantity: number) => {
    const product = findProduct(productId)
    if (!product) return
    if (quantity <= 0) {
      setCart((current) => current.filter((line) => line.productId !== productId))
      return
    }
    setCart((current) =>
      current.map((line) =>
        line.productId === productId
          ? { ...line, quantity: Math.min(quantity, product.stock) }
          : line,
      ),
    )
  }

  const removeLine = (productId: string) => {
    setCart((current) => current.filter((line) => line.productId !== productId))
  }

  const submit = async (event: Event) => {
    event.preventDefault()
    if (customer.trim().length < 2) {
      setError('Escribe el nombre de la clienta.')
      return
    }
    if (lines.length === 0) {
      setError('Añade al menos un producto para registrar la venta.')
      return
    }
    setError('')
    setSaving(true)
    try {
      const order = await createOrder({
        customerName: customer.trim(),
        paymentMethod: payment,
        status,
        items: lines.map((line) => ({
          productId: line.product.id,
          quantity: line.quantity,
        })),
      })
      onCreated(order)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'No se pudo registrar la venta.',
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      eyebrow="Nueva venta"
      title="Registrar venta"
      onClose={onClose}
      wide
    >
      <form id="sale-form" class="sale-form" onSubmit={submit} novalidate>
        <div class="sale-grid">
          <div class="sale-main">
            <label class="field">
              <span class="field__label">Cliente</span>
              <input
                value={customer}
                autofocus
                maxLength={120}
                onInput={(event) =>
                  setCustomer((event.currentTarget as HTMLInputElement).value)
                }
                placeholder="Nombre de la clienta"
                required
              />
            </label>

            <div class="field">
              <span class="field__label">Método de pago</span>
              <div class="segmented">
                {paymentMethods.map((method) => (
                  <button
                    type="button"
                    key={method}
                    class={`segmented__item ${payment === method ? 'is-active' : ''}`}
                    onClick={() => setPayment(method)}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            <div class="field">
              <span class="field__label">Estado</span>
              <div class="segmented segmented--compact">
                {statuses.map((option) => (
                  <button
                    type="button"
                    key={option}
                    class={`segmented__item ${status === option ? 'is-active' : ''}`}
                    onClick={() => setStatus(option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div class="sale-picker">
              <span class="field__label">Productos</span>
              <div class="search sale-search">
                <Search size={18} aria-hidden="true" />
                <input
                  type="search"
                  value={search}
                  onInput={(event) =>
                    setSearch((event.currentTarget as HTMLInputElement).value)
                  }
                  placeholder="Buscar producto…"
                  aria-label="Buscar producto para la venta"
                />
              </div>
              <div class="sale-products">
                {filteredProducts.map((product) => (
                  <button
                    type="button"
                    key={product.id}
                    class="sale-product"
                    onClick={() => addProduct(product)}
                    disabled={product.stock <= 0}
                  >
                    <span class="thumb"><Package size={16} /></span>
                    <span class="sale-product__body">
                      <strong>{product.name}</strong>
                      <span>
                        {categoryName(product)} · {money(product.price)}
                      </span>
                    </span>
                    <span class="sale-product__stock">
                      {product.stock <= 0
                        ? 'Agotado'
                        : `${product.stock} uds.`}
                    </span>
                    <Plus size={16} aria-hidden="true" />
                  </button>
                ))}
                {filteredProducts.length === 0 && (
                  <p class="sale-picker__empty">No encontramos ese producto.</p>
                )}
              </div>
            </div>
          </div>

          <aside class="sale-cart">
            <div class="sale-cart__head">
              <span class="field__label">Carrito</span>
              <span class="sale-cart__count">
                {itemCount} {itemCount === 1 ? 'artículo' : 'artículos'}
              </span>
            </div>

            {lines.length === 0 ? (
              <p class="sale-cart__empty">
                Añade al menos un producto para registrar la venta.
              </p>
            ) : (
              <div class="sale-lines">
                {lines.map((line) => (
                  <div class="sale-line" key={line.product.id}>
                    <div class="sale-line__top">
                      <strong>{line.product.name}</strong>
                      <button
                        type="button"
                        class="icon-button icon-button--sm"
                        onClick={() => removeLine(line.product.id)}
                        aria-label={`Quitar ${line.product.name}`}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                    <div class="sale-line__bottom">
                      <div class="qty">
                        <button
                          type="button"
                          onClick={() =>
                            setQuantity(line.product.id, line.quantity - 1)
                          }
                          aria-label={`Restar uno de ${line.product.name}`}
                        >
                          <Minus size={13} />
                        </button>
                        <span>{line.quantity}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setQuantity(line.product.id, line.quantity + 1)
                          }
                          disabled={line.quantity >= line.product.stock}
                          aria-label={`Sumar uno de ${line.product.name}`}
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                      <span class="sale-line__price">
                        {money(line.product.price * line.quantity)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <dl class="sale-totals">
              <div><dt>Subtotal</dt><dd>{money(subtotal)}</dd></div>
              <div><dt>Costo total</dt><dd>{money(totalCost)}</dd></div>
              <div class="sale-totals__profit">
                <dt>Ganancia neta <span class="tag">Calculado</span></dt>
                <dd class={profit < 0 ? 'is-negative' : ''}>{money(profit)}</dd>
              </div>
              <div><dt>Margen</dt><dd>{pct(saleMargin)}</dd></div>
              <div class="sale-totals__total">
                <dt>Total</dt>
                <dd>{money(subtotal)}</dd>
              </div>
            </dl>

            {lines.length > 0 && profit < 0 && (
              <p class="form-warning">
                Esta venta se registra por debajo del costo.
              </p>
            )}
          </aside>
        </div>

        {error && (
          <p class="form-error" role="alert">
            {error}
          </p>
        )}

        <div class="modal__actions">
          <button type="button" class="button button--secondary" onClick={onClose}>
            Cancelar
          </button>
          <button
            type="submit"
            class="button button--primary"
            disabled={saving || lines.length === 0}
          >
            {saving ? 'Registrando…' : 'Registrar venta'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
