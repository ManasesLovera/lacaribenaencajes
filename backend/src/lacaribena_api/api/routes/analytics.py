from datetime import datetime, timedelta
from typing import Any

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from lacaribena_api.db.session import get_db
from lacaribena_api.models import Order, Product, Task
from lacaribena_api.schemas.models import OrderRead, Period
from lacaribena_api.security.auth import get_current_user
from lacaribena_api.services import analytics

router = APIRouter(prefix="/analytics", tags=["analytics"])

SUPPLIERS = ["Encajes del Caribe", "Satín RD", "Atelier Import", "Textiles Zona"]


def in_range(orders: list[Order], start: datetime, end: datetime) -> list[Order]:
    return [order for order in orders if start <= order.sold_at < end]


def one_period(orders: list[Order], period: Period, now: datetime) -> list[Order]:
    start = analytics.period_start(period, now)
    return [order for order in orders if order.sold_at >= start]


def load_products(db: Session) -> list[Product]:
    return list(
        db.scalars(
            select(Product).options(joinedload(Product.category)).order_by(Product.id)
        ).all()
    )


@router.get("/summary")
def get_summary(
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
) -> dict[str, Any]:
    now = datetime.now()
    orders = analytics.fetch_orders(db)
    result = {}
    for period in ("hoy", "semana", "mes", "ano"):
        current = one_period(orders, period, now)  # type: ignore[arg-type]
        start, end = analytics.previous_range(period, now)  # type: ignore[arg-type]
        previous = in_range(orders, start, end)
        current_summary = analytics.summary_from_orders(current)
        previous_summary = analytics.summary_from_orders(previous)
        result[period] = {
            **current_summary,
            "delta": analytics.delta_pct(
                float(current_summary["revenue"]),
                float(previous_summary["revenue"]),
            ),
        }
    return {"generated_at": now.isoformat(), "periods": result}


@router.get("/dashboard")
def get_dashboard(
    period: Period = "mes",
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
) -> dict[str, Any]:
    now = datetime.now()
    orders = analytics.fetch_orders(db)
    products = load_products(db)
    selected = one_period(orders, period, now)

    def with_delta(current_period: Period) -> dict[str, Any]:
        current = analytics.summary_from_orders(
            one_period(orders, current_period, now)
        )
        start, end = analytics.previous_range(current_period, now)
        previous = analytics.summary_from_orders(in_range(orders, start, end))
        return {
            **current,
            "delta": analytics.delta_pct(
                float(current["revenue"]), float(previous["revenue"])
            ),
        }

    monthly = analytics.monthly_series(orders, now.year)
    daily = analytics.daily_series(orders, 7)
    return {
        "generated_at": now.isoformat(),
        "period": period,
        "today": with_delta("hoy"),
        "week": with_delta("semana"),
        "month": with_delta("mes"),
        "year": with_delta("ano"),
        "selected": analytics.summary_from_orders(selected),
        "monthly": monthly,
        "daily": daily,
        "top_sellers": analytics.top_sellers(selected, 5),
        "restock": analytics.restock_items(products)[:4],
        "category_sales": analytics.category_breakdown(selected, products),
        "recent_orders": [
            OrderRead.model_validate(order) for order in orders[:4]
        ],
        "monthly_total": sum(point["revenue"] for point in monthly),
        "daily_total": sum(point["revenue"] for point in daily),
    }


@router.get("/sales")
def get_sales(
    period: Period = "mes",
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
) -> dict[str, Any]:
    now = datetime.now()
    orders = analytics.fetch_orders(db)
    selected = one_period(orders, period, now)
    start, end = analytics.previous_range(period, now)
    previous = in_range(orders, start, end)
    current_summary = analytics.summary_from_orders(selected)
    previous_summary = analytics.summary_from_orders(previous)
    return {
        "generated_at": now.isoformat(),
        "period": period,
        "summary": current_summary,
        "previous": previous_summary,
        "delta": analytics.delta_pct(
            float(current_summary["revenue"]),
            float(previous_summary["revenue"]),
        ),
        "monthly": analytics.monthly_series(orders, now.year),
        "channels": analytics.payment_breakdown(selected),
        "top_sellers": analytics.top_sellers(selected, 6),
        "recent_orders": [
            OrderRead.model_validate(order) for order in selected[:8]
        ],
    }


@router.get("/operations")
def get_operations(
    period: Period = "mes",
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
) -> dict[str, Any]:
    now = datetime.now()
    orders = analytics.fetch_orders(db)
    products = load_products(db)
    selected = one_period(orders, period, now)
    summary = analytics.summary_from_orders(selected)

    out_of_stock = [product for product in products if product.stock == 0]
    low_stock = [
        product for product in products if 0 < product.stock < product.min_stock
    ]
    loss = [product for product in products if product.cost > product.price]
    in_stock = [
        product for product in products if product.stock >= product.min_stock
    ]
    total_products = max(len(products), 1)
    stock_value = sum(
        float(product.cost) * product.stock for product in products
    )
    stock_units = sum(product.stock for product in products)

    last_30 = [
        order
        for order in orders
        if order.sold_at >= now - timedelta(days=30)
    ]
    units_by_product: dict[int, int] = {}
    for order in last_30:
        for item in order.items:
            if item.product_id is None:
                continue
            units_by_product[item.product_id] = (
                units_by_product.get(item.product_id, 0) + item.quantity
            )

    low_stock_data = []
    for product in sorted(low_stock, key=lambda item: item.stock):
        average = units_by_product.get(product.id, 0) / 30
        days_left = (product.stock / average) if average > 0 else None
        low_stock_data.append(
            {
                "product_id": product.id,
                "name": product.name,
                "stock": product.stock,
                "min_stock": product.min_stock,
                "days_left": round(days_left, 1) if days_left is not None else None,
                "suggested": max(
                    product.min_stock * 2 - product.stock, product.min_stock
                ),
            }
        )

    tasks = list(db.scalars(select(Task).order_by(Task.id)).all())
    return {
        "generated_at": now.isoformat(),
        "period": period,
        "summary": summary,
        "alerts": analytics.inventory_alerts(products),
        "inventory_health": {
            "stock_value": stock_value,
            "stock_units": stock_units,
            "active_products": len(products),
            "in_stock": len(in_stock),
            "low_stock": len(low_stock),
            "out_of_stock": len(out_of_stock),
            "in_stock_pct": len(in_stock) / total_products * 100,
            "low_stock_pct": len(low_stock) / total_products * 100,
            "out_of_stock_pct": len(out_of_stock) / total_products * 100,
        },
        "category_sales": analytics.category_breakdown(selected, products),
        "low_stock": low_stock_data,
        "restock_queue": [
            {
                **item,
                "supplier": SUPPLIERS[index % len(SUPPLIERS)],
                "eta_days": 3 + index,
            }
            for index, item in enumerate(
                analytics.restock_items(products)[:3]
            )
        ],
        "tasks": {
            "total": len(tasks),
            "open": sum(1 for task in tasks if not task.done),
            "done": sum(1 for task in tasks if task.done),
        },
        "loss_products": [
            {
                "product_id": product.id,
                "name": product.name,
                "price": float(product.price),
                "cost": float(product.cost),
                "margin": product.margin,
            }
            for product in loss
        ],
    }
