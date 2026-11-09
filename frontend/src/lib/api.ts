import { clearToken, loadToken } from './auth'

export type ApiUser = {
  id: number
  name: string
  email: string
}

export type ApiCategory = {
  id: number
  name: string
  slug: string
  color: string | null
  created_at: string
  product_count: number
}

export type ApiProduct = {
  id: number
  name: string
  category_id: number
  price: number
  cost: number
  stock: number
  min_stock: number
  net_income: number
  margin: number
  created_at: string
  updated_at: string
  category: {
    id: number
    name: string
    slug: string
    color: string | null
  }
}

export type ApiProductPage = {
  items: ApiProduct[]
  total: number
  page: number
  page_size: number
}

export type ApiOrderItem = {
  id: number
  product_id: number | null
  product_name: string
  quantity: number
  unit_price: number
  unit_cost: number
  line_total: number
  line_profit: number
}

export type ApiOrder = {
  id: number
  number: number
  customer_name: string
  payment_method: string
  status: string
  total: number
  sold_at: string
  items: ApiOrderItem[]
}

export type ApiOrderPage = {
  items: ApiOrder[]
  total: number
  limit: number
  offset: number
}

export type ApiTask = {
  id: number
  title: string
  done: boolean
  created_at: string
}

export type ApiSettings = {
  store_name: string
  owner_name: string
  email: string
  daily_goal: number
  weekly_goal: number
  monthly_goal: number
  low_stock_alerts: boolean
  email_summary: boolean
}

export type ApiToken = {
  access_token: string
  token_type: string
  user: ApiUser
}

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers)
  if (options.body) headers.set('Content-Type', 'application/json')
  const token = loadToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)

  let response: Response
  try {
    response = await fetch(`/api${path}`, { ...options, headers })
  } catch {
    throw new ApiError('No se pudo conectar con el servidor.', 0)
  }

  if (!response.ok) {
    let message = `Error ${response.status}`
    try {
      const data = await response.json()
      if (typeof data.detail === 'string') {
        message = data.detail
      } else if (Array.isArray(data.detail) && data.detail[0]?.msg) {
        message = data.detail[0].msg
      }
    } catch {
      // Keep the generic message when the response is not JSON.
    }
    if (response.status === 401) {
      clearToken()
      window.dispatchEvent(new Event('lacaribena:auth-expired'))
    }
    throw new ApiError(message, response.status)
  }

  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}

export const api = {
  login(email: string, password: string) {
    return request<ApiToken>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  },
  me() {
    return request<ApiUser>('/auth/me')
  },
  changePassword(currentPassword: string, newPassword: string) {
    return request<{ status: string; message: string }>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword,
      }),
    })
  },
  categories() {
    return request<ApiCategory[]>('/categories')
  },
  createCategory(payload: { name: string; color?: string | null }) {
    return request<ApiCategory>('/categories', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  products() {
    return request<ApiProductPage>('/products?page_size=100')
  },
  createProduct(payload: {
    name: string
    category_id: number
    price: number
    cost: number
    stock: number
    min_stock: number
  }) {
    return request<ApiProduct>('/products', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  updateProduct(
    id: number,
    payload: Partial<{
      name: string
      category_id: number
      price: number
      cost: number
      stock: number
      min_stock: number
    }>,
  ) {
    return request<ApiProduct>(`/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
  },
  deleteProduct(id: number) {
    return request<void>(`/products/${id}`, { method: 'DELETE' })
  },
  orders() {
    return request<ApiOrderPage>('/orders?limit=1000')
  },
  createOrder(payload: {
    customer_name: string
    payment_method: string
    status: string
    items: { product_id: number; quantity: number }[]
  }) {
    return request<ApiOrder>('/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  tasks() {
    return request<ApiTask[]>('/tasks')
  },
  createTask(title: string) {
    return request<ApiTask>('/tasks', {
      method: 'POST',
      body: JSON.stringify({ title }),
    })
  },
  updateTask(id: number, payload: { title?: string; done?: boolean }) {
    return request<ApiTask>(`/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
  },
  settings() {
    return request<ApiSettings>('/settings')
  },
  updateSettings(payload: Partial<ApiSettings>) {
    return request<ApiSettings>('/settings', {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
  },
  resetDemo() {
    return request<{ status: string; message: string }>('/admin/reset-demo', {
      method: 'POST',
    })
  },
}
