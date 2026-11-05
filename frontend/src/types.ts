export type Category = {
  id: string
  name: string
  slug: string
  color: string
  createdAt: string
}

export type Product = {
  id: string
  name: string
  categoryId: string
  price: number
  cost: number
  stock: number
  minStock: number
  createdAt: string
}

export type PaymentMethod = 'Transferencia' | 'Efectivo' | 'Tarjeta' | 'Contra entrega'
export type OrderStatus = 'Pagada' | 'Pendiente' | 'Enviada'

export type OrderItem = {
  productId: string
  quantity: number
  unitPrice: number
  unitCost: number
}

export type Order = {
  id: string
  number: number
  customerName: string
  paymentMethod: PaymentMethod
  status: OrderStatus
  items: OrderItem[]
  total: number
  soldAt: string
}

export type Task = {
  id: string
  title: string
  done: boolean
  createdAt: string
}

export type Settings = {
  storeName: string
  ownerName: string
  email: string
  dailyGoal: number
  weeklyGoal: number
  monthlyGoal: number
  lowStockAlerts: boolean
  emailSummary: boolean
}

export type Period = 'hoy' | 'semana' | 'mes' | 'ano'
