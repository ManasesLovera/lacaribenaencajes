import type {
  Category,
  Order,
  OrderItem,
  PaymentMethod,
  Product,
  Settings,
  Task,
} from '../types'

const now = new Date()

function daysAgo(days: number): string {
  const date = new Date(now)
  date.setDate(date.getDate() - days)
  return date.toISOString()
}

export const seedCategories: Category[] = [
  { id: 'cat-pijamas', name: 'Pijamas', slug: 'pijamas', color: '#8C2A28', createdAt: daysAgo(180) },
  { id: 'cat-lenceria', name: 'Lencería', slug: 'lenceria', color: '#6E0F0D', createdAt: daysAgo(180) },
  { id: 'cat-bikinis', name: 'Bikinis', slug: 'bikinis', color: '#DCA396', createdAt: daysAgo(180) },
  { id: 'cat-encajes', name: 'Encajes', slug: 'encajes', color: '#B8863B', createdAt: daysAgo(180) },
]

type SeedProduct = {
  id: string
  name: string
  categoryId: string
  price: number
  cost: number
  stock: number
  minStock: number
  added: number
}

const seedProductsRaw: SeedProduct[] = [
  { id: 'p01', name: 'Pijama satinada Rosé', categoryId: 'cat-pijamas', price: 3850, cost: 1900, stock: 3, minStock: 4, added: 7 },
  { id: 'p02', name: 'Kimono de satén Perla', categoryId: 'cat-pijamas', price: 4300, cost: 2150, stock: 0, minStock: 3, added: 12 },
  { id: 'p03', name: 'Short pijama algodón Luna', categoryId: 'cat-pijamas', price: 1650, cost: 830, stock: 6, minStock: 4, added: 9 },
  { id: 'p04', name: 'Pijama algodón Nube', categoryId: 'cat-pijamas', price: 2400, cost: 1200, stock: 4, minStock: 3, added: 18 },
  { id: 'p05', name: 'Pijama seda Camel', categoryId: 'cat-pijamas', price: 3200, cost: 1600, stock: 4, minStock: 3, added: 22 },
  { id: 'p06', name: 'Camisa dormir Marfil', categoryId: 'cat-pijamas', price: 1900, cost: 950, stock: 5, minStock: 3, added: 30 },
  { id: 'p07', name: 'Conjunto pijama Vino', categoryId: 'cat-pijamas', price: 2800, cost: 1400, stock: 3, minStock: 3, added: 34 },
  { id: 'p08', name: 'Pijama estampada Flora', categoryId: 'cat-pijamas', price: 2200, cost: 1100, stock: 3, minStock: 3, added: 40 },
  { id: 'p09', name: 'Bata satén Champagne', categoryId: 'cat-pijamas', price: 2900, cost: 1350, stock: 0, minStock: 2, added: 48 },
  { id: 'p10', name: 'Conjunto encaje Medianoche', categoryId: 'cat-lenceria', price: 2950, cost: 1280, stock: 2, minStock: 4, added: 8 },
  { id: 'p11', name: 'Body de encaje Vino', categoryId: 'cat-lenceria', price: 3200, cost: 1640, stock: 0, minStock: 3, added: 11 },
  { id: 'p12', name: 'Babydoll Terciopelo', categoryId: 'cat-lenceria', price: 2840, cost: 1420, stock: 3, minStock: 3, added: 15 },
  { id: 'p13', name: 'Panty encaje Rubí', categoryId: 'cat-lenceria', price: 1980, cost: 1000, stock: 7, minStock: 4, added: 20 },
  { id: 'p14', name: 'Conjunto encaje Marfil', categoryId: 'cat-lenceria', price: 3200, cost: 1500, stock: 4, minStock: 3, added: 26 },
  { id: 'p15', name: 'Body puntilla Arena', categoryId: 'cat-lenceria', price: 2650, cost: 1250, stock: 3, minStock: 3, added: 31 },
  { id: 'p16', name: 'Sujetador sin costura Nude', categoryId: 'cat-lenceria', price: 2490, cost: 1150, stock: 5, minStock: 3, added: 38 },
  { id: 'p17', name: 'Tanga encaje Cereza', categoryId: 'cat-lenceria', price: 3090, cost: 1400, stock: 1, minStock: 3, added: 45 },
  { id: 'p18', name: 'Bikini Tropical Coral', categoryId: 'cat-bikinis', price: 2400, cost: 1150, stock: 6, minStock: 4, added: 6 },
  { id: 'p19', name: 'Trikini Arena', categoryId: 'cat-bikinis', price: 2350, cost: 1180, stock: 4, minStock: 3, added: 14 },
  { id: 'p20', name: 'Bikini brasileño Dorado', categoryId: 'cat-bikinis', price: 2250, cost: 2380, stock: 3, minStock: 3, added: 19 },
  { id: 'p21', name: 'Bikini Palms', categoryId: 'cat-bikinis', price: 2100, cost: 700, stock: 3, minStock: 3, added: 29 },
  { id: 'p22', name: 'Bikini encaje Negro', categoryId: 'cat-bikinis', price: 2550, cost: 780, stock: 5, minStock: 3, added: 36 },
  { id: 'p23', name: 'Corsé encaje Marfil', categoryId: 'cat-encajes', price: 5200, cost: 2580, stock: 1, minStock: 2, added: 10 },
  { id: 'p24', name: 'Bralette Chantilly', categoryId: 'cat-encajes', price: 2000, cost: 940, stock: 5, minStock: 3, added: 25 },
]

export const seedProducts: Product[] = seedProductsRaw.map((product) => ({
  id: product.id,
  name: product.name,
  categoryId: product.categoryId,
  price: product.price,
  cost: product.cost,
  stock: product.stock,
  minStock: product.minStock,
  createdAt: daysAgo(product.added),
}))

function mulberry32(seed: number) {
  let state = seed
  return () => {
    state |= 0
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const customers = [
  'María Fernanda Peña',
  'Ana Lucía Rodríguez',
  'Carla Jiménez',
  'Rosa Martínez',
  'Wendy Almonte',
  'Yamilet Ortiz',
  'Carolina Santos',
  'Lisandra Pérez',
  'Daniela Guzmán',
  'Michelle Batista',
  'Patricia Núñez',
  'Sofía Herrera',
  'Nathalie Reyes',
  'Claudia Fernández',
]

const paymentMethods: PaymentMethod[] = [
  'Transferencia',
  'Efectivo',
  'Tarjeta',
  'Contra entrega',
]

const statuses = ['Pagada', 'Pagada', 'Pagada', 'Enviada', 'Pendiente'] as const

function randomOrder(
  rng: () => number,
  number: number,
  soldAt: Date,
): Order {
  const itemCount = 1 + Math.floor(rng() * 3)
  const chosen = new Set<number>()
  const items: OrderItem[] = []

  while (chosen.size < itemCount) {
    const index = Math.floor(rng() * seedProducts.length)
    if (chosen.has(index)) continue
    chosen.add(index)
    const product = seedProducts[index]
    items.push({
      productId: product.id,
      quantity: 1 + Math.floor(rng() * 2),
      unitPrice: product.price,
      unitCost: product.cost,
    })
  }

  const total = items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  )
  const paymentRoll = rng()
  const paymentIndex =
    paymentRoll < 0.42 ? 0 : paymentRoll < 0.75 ? 1 : paymentRoll < 0.9 ? 2 : 3

  return {
    id: `order-${number}`,
    number,
    customerName: customers[Math.floor(rng() * customers.length)],
    paymentMethod: paymentMethods[paymentIndex],
    status: statuses[Math.floor(rng() * statuses.length)],
    items,
    total,
    soldAt: soldAt.toISOString(),
  }
}

function generateOrders(): Order[] {
  const rng = mulberry32(20261104)
  const orders: Order[] = []
  let number = 1001
  const yearStart = new Date(now.getFullYear(), 0, 1).getTime()
  const nowTime = now.getTime()

  for (let index = 0; index < 135; index += 1) {
    const time = yearStart + rng() * (nowTime - yearStart)
    orders.push(randomOrder(rng, number, new Date(time)))
    number += 1
  }

  for (let index = 0; index < 85; index += 1) {
    const time = nowTime - rng() * 44 * 24 * 60 * 60 * 1000
    orders.push(randomOrder(rng, number, new Date(time)))
    number += 1
  }

  for (let index = 0; index < 4; index += 1) {
    const date = new Date(now.getTime() - 35 * (index + 1) * 60 * 1000)
    orders.push(randomOrder(rng, number, date))
    number += 1
  }

  return orders.sort(
    (a, b) => new Date(b.soldAt).getTime() - new Date(a.soldAt).getTime(),
  )
}

export const seedOrders: Order[] = generateOrders()

export const seedTasks: Task[] = [
  { id: 'task-1', title: 'Confirmar transferencia #1042 de Ana Lucía', done: false, createdAt: daysAgo(0) },
  { id: 'task-2', title: 'Empacar 3 pedidos para el envío de las 4:00 p. m.', done: false, createdAt: daysAgo(0) },
  { id: 'task-3', title: 'Pedir reposición de Kimono Perla a Encajes del Caribe', done: false, createdAt: daysAgo(1) },
  { id: 'task-4', title: 'Revisar precio del Bikini brasileño Dorado', done: false, createdAt: daysAgo(1) },
  { id: 'task-5', title: 'Actualizar fotos de la nueva colección', done: true, createdAt: daysAgo(1) },
]

export const seedSettings: Settings = {
  storeName: 'La Caribeña Encajes',
  ownerName: 'Yesenia Castillo',
  email: 'yesenia@lacaribenaencajes.com',
  dailyGoal: 12000,
  weeklyGoal: 42000,
  monthlyGoal: 160000,
  lowStockAlerts: true,
  emailSummary: true,
}
