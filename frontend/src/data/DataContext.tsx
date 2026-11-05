import { createContext } from 'preact'
import { useCallback, useContext, useEffect, useState } from 'preact/hooks'
import type { ComponentChildren } from 'preact'
import {
  seedCategories,
  seedOrders,
  seedProducts,
  seedSettings,
  seedTasks,
} from './seed'
import {
  api,
  ApiError,
  type ApiCategory,
  type ApiOrder,
  type ApiProduct,
  type ApiSettings,
  type ApiTask,
} from '../lib/api'
import { DEMO_MODE } from '../lib/mode'
import type {
  Category,
  Order,
  Product,
  Settings,
  Task,
} from '../types'

type DataValue = {
  products: Product[]
  categories: Category[]
  orders: Order[]
  tasks: Task[]
  settings: Settings
  saveProduct: (product: Product) => Promise<void>
  deleteProduct: (id: string) => Promise<void>
  restoreProduct: (product: Product) => Promise<void>
  addCategory: (category: Category) => Promise<void>
  toggleTask: (id: string) => Promise<void>
  addTask: (title: string) => Promise<void>
  saveSettings: (settings: Settings) => Promise<void>
  resetDemo: () => Promise<void>
}

const DataContext = createContext<DataValue | null>(null)

function mapCategory(category: ApiCategory): Category {
  return {
    id: String(category.id),
    name: category.name,
    slug: category.slug,
    color: category.color ?? '#6E0F0D',
    createdAt: category.created_at,
  }
}

function mapProduct(product: ApiProduct): Product {
  return {
    id: String(product.id),
    name: product.name,
    categoryId: String(product.category_id),
    price: product.price,
    cost: product.cost,
    stock: product.stock,
    minStock: product.min_stock,
    createdAt: product.created_at,
  }
}

function mapOrder(order: ApiOrder): Order {
  return {
    id: String(order.id),
    number: order.number,
    customerName: order.customer_name,
    paymentMethod: order.payment_method as Order['paymentMethod'],
    status: order.status as Order['status'],
    items: order.items.map((item) => ({
      productId: item.product_id ? String(item.product_id) : '',
      quantity: item.quantity,
      unitPrice: item.unit_price,
      unitCost: item.unit_cost,
    })),
    total: order.total,
    soldAt: order.sold_at,
  }
}

function mapTask(task: ApiTask): Task {
  return {
    id: String(task.id),
    title: task.title,
    done: task.done,
    createdAt: task.created_at,
  }
}

function mapSettings(settings: ApiSettings): Settings {
  return {
    storeName: settings.store_name,
    ownerName: settings.owner_name,
    email: settings.email,
    dailyGoal: settings.daily_goal,
    weeklyGoal: settings.weekly_goal,
    monthlyGoal: settings.monthly_goal,
    lowStockAlerts: settings.low_stock_alerts,
    emailSummary: settings.email_summary,
  }
}

const emptySettings: Settings = {
  storeName: 'La Caribeña Encajes',
  ownerName: 'Yesenia Castillo',
  email: 'yesenia@lacaribenaencajes.com',
  dailyGoal: 12000,
  weeklyGoal: 42000,
  monthlyGoal: 160000,
  lowStockAlerts: true,
  emailSummary: true,
}

function ApiDataProvider({
  children,
  onLogout,
}: {
  children: ComponentChildren
  onLogout: () => void
}) {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [settings, setSettings] = useState<Settings>(emptySettings)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    const [productPage, categoryList, orderPage, taskList, storeSettings] =
      await Promise.all([
        api.products(),
        api.categories(),
        api.orders(),
        api.tasks(),
        api.settings(),
      ])
    setProducts(productPage.items.map(mapProduct))
    setCategories(categoryList.map(mapCategory))
    setOrders(orderPage.items.map(mapOrder))
    setTasks(taskList.map(mapTask))
    setSettings(mapSettings(storeSettings))
    setError('')
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      await refresh()
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'No se pudo cargar la tienda.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [refresh])

  useEffect(() => {
    void load()
  }, [load])

  const value: DataValue = {
    products,
    categories,
    orders,
    tasks,
    settings,
    saveProduct: async (product) => {
      const existing = products.find((item) => item.id === product.id)
      const payload = {
        name: product.name,
        category_id: Number(product.categoryId),
        price: product.price,
        cost: product.cost,
        stock: product.stock,
        min_stock: product.minStock,
      }
      const saved = existing
        ? await api.updateProduct(Number(product.id), payload)
        : await api.createProduct(payload)
      const mapped = mapProduct(saved)
      setProducts((current) =>
        existing
          ? current.map((item) => (item.id === product.id ? mapped : item))
          : [mapped, ...current],
      )
    },
    deleteProduct: async (id) => {
      await api.deleteProduct(Number(id))
      setProducts((current) => current.filter((item) => item.id !== id))
    },
    restoreProduct: async (product) => {
      const saved = await api.createProduct({
        name: product.name,
        category_id: Number(product.categoryId),
        price: product.price,
        cost: product.cost,
        stock: product.stock,
        min_stock: product.minStock,
      })
      setProducts((current) => [mapProduct(saved), ...current])
    },
    addCategory: async (category) => {
      const saved = await api.createCategory({
        name: category.name,
        color: category.color,
      })
      setCategories((current) => [...current, mapCategory(saved)])
    },
    toggleTask: async (id) => {
      const task = tasks.find((item) => item.id === id)
      if (!task) return
      const saved = await api.updateTask(Number(id), { done: !task.done })
      setTasks((current) =>
        current.map((item) => (item.id === id ? mapTask(saved) : item)),
      )
    },
    addTask: async (title) => {
      const saved = await api.createTask(title)
      setTasks((current) => [...current, mapTask(saved)])
    },
    saveSettings: async (nextSettings) => {
      const saved = await api.updateSettings({
        store_name: nextSettings.storeName,
        owner_name: nextSettings.ownerName,
        email: nextSettings.email,
        daily_goal: nextSettings.dailyGoal,
        weekly_goal: nextSettings.weeklyGoal,
        monthly_goal: nextSettings.monthlyGoal,
        low_stock_alerts: nextSettings.lowStockAlerts,
        email_summary: nextSettings.emailSummary,
      })
      setSettings(mapSettings(saved))
    },
    resetDemo: async () => {
      await api.resetDemo()
      await refresh()
    },
  }

  if (loading) {
    return (
      <div class="boot">
        <span class="boot__mark" aria-hidden="true">✦</span>
        <p>Cargando la tienda…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div class="boot">
        <span class="boot__mark" aria-hidden="true">✦</span>
        <h1 class="display-md">No se pudo cargar la tienda</h1>
        <p>{error}</p>
        <div class="boot__actions">
          <button type="button" class="button button--primary" onClick={() => void load()}>
            Reintentar
          </button>
          <button type="button" class="button button--secondary" onClick={onLogout}>
            Iniciar sesión de nuevo
          </button>
        </div>
      </div>
    )
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}


const DEMO_KEYS = {
  products: 'lacaribena:products',
  categories: 'lacaribena:categories',
  orders: 'lacaribena:orders',
  tasks: 'lacaribena:tasks',
  settings: 'lacaribena:settings',
} as const

function readLocal<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function writeLocal<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // The in-memory state still works when storage is unavailable.
  }
}

function DemoDataProvider({
  children,
}: {
  children: ComponentChildren
  onLogout: () => void
}) {
  const [products, setProducts] = useState<Product[]>(() =>
    readLocal(DEMO_KEYS.products, seedProducts),
  )
  const [categories, setCategories] = useState<Category[]>(() =>
    readLocal(DEMO_KEYS.categories, seedCategories),
  )
  const [orders] = useState<Order[]>(() => readLocal(DEMO_KEYS.orders, seedOrders))
  const [tasks, setTasks] = useState<Task[]>(() =>
    readLocal(DEMO_KEYS.tasks, seedTasks),
  )
  const [settings, setSettings] = useState<Settings>(() =>
    readLocal(DEMO_KEYS.settings, seedSettings),
  )

  useEffect(() => writeLocal(DEMO_KEYS.products, products), [products])
  useEffect(() => writeLocal(DEMO_KEYS.categories, categories), [categories])
  useEffect(() => writeLocal(DEMO_KEYS.orders, orders), [orders])
  useEffect(() => writeLocal(DEMO_KEYS.tasks, tasks), [tasks])
  useEffect(() => writeLocal(DEMO_KEYS.settings, settings), [settings])

  const value: DataValue = {
    products,
    categories,
    orders,
    tasks,
    settings,
    saveProduct: async (product) => {
      setProducts((current) => {
        const exists = current.some((item) => item.id === product.id)
        return exists
          ? current.map((item) => (item.id === product.id ? product : item))
          : [product, ...current]
      })
    },
    deleteProduct: async (id) => {
      setProducts((current) => current.filter((item) => item.id !== id))
    },
    restoreProduct: async (product) => {
      setProducts((current) => [product, ...current])
    },
    addCategory: async (category) => {
      setCategories((current) => [...current, category])
    },
    toggleTask: async (id) => {
      setTasks((current) =>
        current.map((task) =>
          task.id === id ? { ...task, done: !task.done } : task,
        ),
      )
    },
    addTask: async (title) => {
      setTasks((current) => [
        {
          id: `task-${Date.now()}`,
          title,
          done: false,
          createdAt: new Date().toISOString(),
        },
        ...current,
      ])
    },
    saveSettings: async (nextSettings) => {
      setSettings(nextSettings)
    },
    resetDemo: async () => {
      setProducts(seedProducts)
      setCategories(seedCategories)
      setTasks(seedTasks)
      setSettings(seedSettings)
    },
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function DataProvider({
  children,
  onLogout,
}: {
  children: ComponentChildren
  onLogout: () => void
}) {
  return DEMO_MODE ? (
    <DemoDataProvider onLogout={onLogout}>{children}</DemoDataProvider>
  ) : (
    <ApiDataProvider onLogout={onLogout}>{children}</ApiDataProvider>
  )
}

export function useData(): DataValue {
  const context = useContext(DataContext)
  if (!context) throw new Error('useData must be used inside DataProvider')
  return context
}
