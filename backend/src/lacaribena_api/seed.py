from __future__ import annotations

import random
from datetime import datetime, timedelta
from decimal import Decimal

from sqlalchemy import delete, func, select

from lacaribena_api.core.config import get_settings
from lacaribena_api.db.session import SessionLocal
from lacaribena_api.models import (
    Category,
    Order,
    OrderItem,
    Product,
    StoreSettings,
    Task,
    User,
)
from lacaribena_api.security.auth import hash_password

settings = get_settings()

CATEGORIES = [
    ("Pijamas", "pijamas", "#8C2A28"),
    ("Lencería", "lenceria", "#6E0F0D"),
    ("Bikinis", "bikinis", "#DCA396"),
    ("Encajes", "encajes", "#B8863B"),
]

PRODUCTS = [
    ("Pijama satinada Rosé", "pijamas", 3850, 1900, 3, 4),
    ("Kimono de satén Perla", "pijamas", 4300, 2150, 0, 3),
    ("Short pijama algodón Luna", "pijamas", 1650, 830, 6, 4),
    ("Pijama algodón Nube", "pijamas", 2400, 1200, 4, 3),
    ("Pijama seda Camel", "pijamas", 3200, 1600, 4, 3),
    ("Camisa dormir Marfil", "pijamas", 1900, 950, 5, 3),
    ("Conjunto pijama Vino", "pijamas", 2800, 1400, 3, 3),
    ("Pijama estampada Flora", "pijamas", 2200, 1100, 3, 3),
    ("Bata satén Champagne", "pijamas", 2900, 1350, 0, 2),
    ("Conjunto encaje Medianoche", "lenceria", 2950, 1280, 2, 4),
    ("Body de encaje Vino", "lenceria", 3200, 1640, 0, 3),
    ("Babydoll Terciopelo", "lenceria", 2840, 1420, 3, 3),
    ("Panty encaje Rubí", "lenceria", 1980, 1000, 7, 4),
    ("Conjunto encaje Marfil", "lenceria", 3200, 1500, 4, 3),
    ("Body puntilla Arena", "lenceria", 2650, 1250, 3, 3),
    ("Sujetador sin costura Nude", "lenceria", 2490, 1150, 5, 3),
    ("Tanga encaje Cereza", "lenceria", 3090, 1400, 1, 3),
    ("Bikini Tropical Coral", "bikinis", 2400, 1150, 6, 4),
    ("Trikini Arena", "bikinis", 2350, 1180, 4, 3),
    ("Bikini brasileño Dorado", "bikinis", 2250, 2380, 3, 3),
    ("Bikini Palms", "bikinis", 2100, 700, 3, 3),
    ("Bikini encaje Negro", "bikinis", 2550, 780, 5, 3),
    ("Corsé encaje Marfil", "encajes", 5200, 2580, 1, 2),
    ("Bralette Chantilly", "encajes", 2000, 940, 5, 3),
]

CUSTOMERS = [
    "María Fernanda Peña",
    "Ana Lucía Rodríguez",
    "Carla Jiménez",
    "Rosa Martínez",
    "Wendy Almonte",
    "Yamilet Ortiz",
    "Carolina Santos",
    "Lisandra Pérez",
    "Daniela Guzmán",
    "Michelle Batista",
    "Patricia Núñez",
    "Sofía Herrera",
    "Nathalie Reyes",
    "Claudia Fernández",
]

PAYMENT_METHODS = ["Transferencia", "Efectivo", "Tarjeta", "Contra entrega"]
STATUSES = ["Pagada", "Pagada", "Pagada", "Enviada", "Pendiente"]

TASKS = [
    "Confirmar transferencia #1042 de Ana Lucía",
    "Empacar 3 pedidos para el envío de las 4:00 p. m.",
    "Pedir reposición de Kimono Perla a Encajes del Caribe",
    "Revisar precio del Bikini brasileño Dorado",
    "Actualizar fotos de la nueva colección",
]


def seed_user(db) -> bool:
    existing = db.scalar(
        select(User).where(User.email == settings.seed_email.lower())
    )
    if existing:
        return False
    db.add(
        User(
            name="Yesenia Castillo",
            email=settings.seed_email.lower(),
            hashed_password=hash_password(settings.seed_password),
        )
    )
    return True


def seed_categories(db) -> dict[str, Category]:
    categories = {
        category.slug: category
        for category in db.scalars(select(Category)).all()
    }
    for name, slug, color in CATEGORIES:
        if slug not in categories:
            category = Category(name=name, slug=slug, color=color)
            db.add(category)
            categories[slug] = category
    db.flush()
    return categories


def seed_products(db, categories: dict[str, Category]) -> list[Product]:
    existing = list(db.scalars(select(Product)).all())
    if existing:
        return existing

    now = datetime.now()
    products: list[Product] = []
    for index, (name, slug, price, cost, stock, min_stock) in enumerate(PRODUCTS):
        product = Product(
            name=name,
            category_id=categories[slug].id,
            price=Decimal(price),
            cost=Decimal(cost),
            stock=stock,
            min_stock=min_stock,
            created_at=now - timedelta(days=index + 5),
        )
        db.add(product)
        products.append(product)
    db.flush()
    return products


def generate_orders(db, products: list[Product]) -> int:
    if db.scalar(select(func.count(Order.id))):
        return 0

    rng = random.Random(20261104)
    now = datetime.now()
    year_start = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
    orders: list[Order] = []
    number = 1001

    def make_order(sold_at: datetime) -> None:
        nonlocal number
        item_count = rng.randint(1, 3)
        chosen: set[int] = set()
        items: list[OrderItem] = []
        total = Decimal("0")
        while len(chosen) < item_count:
            index = rng.randrange(len(products))
            if index in chosen:
                continue
            chosen.add(index)
            product = products[index]
            quantity = rng.randint(1, 2)
            total += product.price * quantity
            items.append(
                OrderItem(
                    product_id=product.id,
                    product_name=product.name,
                    quantity=quantity,
                    unit_price=product.price,
                    unit_cost=product.cost,
                )
            )

        payment_roll = rng.random()
        if payment_roll < 0.42:
            payment = PAYMENT_METHODS[0]
        elif payment_roll < 0.75:
            payment = PAYMENT_METHODS[1]
        elif payment_roll < 0.9:
            payment = PAYMENT_METHODS[2]
        else:
            payment = PAYMENT_METHODS[3]

        order = Order(
            number=number,
            customer_name=rng.choice(CUSTOMERS),
            payment_method=payment,
            status=rng.choice(STATUSES),
            total=total,
            sold_at=sold_at,
            items=items,
        )
        orders.append(order)
        number += 1

    for _ in range(135):
        seconds = rng.random() * max((now - year_start).total_seconds(), 1)
        make_order(year_start + timedelta(seconds=seconds))

    for _ in range(85):
        make_order(now - timedelta(days=rng.random() * 44))

    for index in range(4):
        make_order(
            now.replace(
                hour=9 + index * 2,
                minute=5 + index * 3,
                second=0,
                microsecond=0,
            )
        )

    db.add_all(orders)
    db.flush()
    return len(orders)


def seed_tasks(db) -> int:
    if db.scalar(select(func.count(Task.id))):
        return 0
    now = datetime.now()
    tasks = [
        Task(
            title=title,
            done=index == len(TASKS) - 1,
            created_at=now - timedelta(days=index // 3),
        )
        for index, title in enumerate(TASKS)
    ]
    db.add_all(tasks)
    return len(tasks)


def seed_settings(db) -> bool:
    if db.get(StoreSettings, 1):
        return False
    db.add(
        StoreSettings(
            id=1,
            store_name="La Caribeña Encajes",
            owner_name="Yesenia Castillo",
            email=settings.seed_email.lower(),
            daily_goal=12000,
            weekly_goal=42000,
            monthly_goal=160000,
            low_stock_alerts=True,
            email_summary=True,
        )
    )
    return True


def reset_demo(db) -> None:
    db.execute(delete(OrderItem))
    db.execute(delete(Order))
    db.execute(delete(Task))
    db.execute(delete(Product))
    db.execute(delete(Category))
    db.execute(delete(StoreSettings))
    db.flush()

    categories = seed_categories(db)
    products = seed_products(db, categories)
    generate_orders(db, products)
    seed_tasks(db)
    seed_settings(db)
    db.commit()


def main() -> None:
    with SessionLocal() as db:
        user_created = seed_user(db)
        categories = seed_categories(db)
        products = seed_products(db, categories)
        orders_created = generate_orders(db, products)
        tasks_created = seed_tasks(db)
        settings_created = seed_settings(db)
        db.commit()

        print(
            "Seed complete: "
            f"user={'created' if user_created else 'existing'}, "
            f"categories={len(categories)}, "
            f"products={len(products)}, "
            f"orders_created={orders_created}, "
            f"tasks_created={tasks_created}, "
            f"settings={'created' if settings_created else 'existing'}"
        )


if __name__ == "__main__":
    main()
