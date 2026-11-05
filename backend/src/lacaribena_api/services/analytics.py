from __future__ import annotations

from datetime import datetime, timedelta
from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from lacaribena_api.models import Order, OrderItem, Product
from lacaribena_api.schemas.models import Period


def period_start(period: Period, now: datetime | None = None) -> datetime:
    now = now or datetime.now()
    if period == "hoy":
        return now.replace(hour=0, minute=0, second=0, microsecond=0)
    if period == "semana":
        start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        return start - timedelta(days=start.weekday())
    if period == "mes":
        return now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    return now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)


def previous_range(
    period: Period, now: datetime | None = None
) -> tuple[datetime, datetime]:
    now = now or datetime.now()
    start = period_start(period, now)
    if period == "hoy":
        return start - timedelta(days=1), start
    if period == "semana":
        return start - timedelta(days=7), start
    if period == "mes":
        return start.replace(month=start.month - 1, day=1), start
    return start.replace(year=start.year - 1), start


def fetch_orders(
    db: Session,
    start: datetime | None = None,
    end: datetime | None = None,
    limit: int | None = None,
) -> list[Order]:
    stmt = (
        select(Order)
        .options(
            joinedload(Order.items)
            .joinedload(OrderItem.product)
            .joinedload(Product.category)
        )
        .order_by(Order.sold_at.desc())
    )
    if start is not None:
        stmt = stmt.where(Order.sold_at >= start)
    if end is not None:
        stmt = stmt.where(Order.sold_at < end)
    if limit is not None:
        stmt = stmt.limit(limit)
    return list(db.scalars(stmt).unique().all())


def summary_from_orders(orders: list[Order]) -> dict[str, float | int]:
    revenue = sum(float(order.total) for order in orders)
    cost = sum(
        float(item.unit_cost * item.quantity)
        for order in orders
        for item in order.items
    )
    units = sum(item.quantity for order in orders for item in order.items)
    profit = revenue - cost
    count = len(orders)
    return {
        "revenue": revenue,
        "cost": cost,
        "profit": profit,
        "orders": count,
        "units": units,
        "ticket": revenue / count if count else 0.0,
        "margin": (profit / revenue * 100) if revenue else 0.0,
    }


def delta_pct(current: float, previous: float) -> float | None:
    if previous <= 0:
        return None
    return (current - previous) / previous * 100


def monthly_series(orders: list[Order], year: int) -> list[dict[str, Any]]:
    labels = [
        "Ene",
        "Feb",
        "Mar",
        "Abr",
        "May",
        "Jun",
        "Jul",
        "Ago",
        "Sep",
        "Oct",
        "Nov",
        "Dic",
    ]
    now = datetime.now()
    series = [
        {
            "label": label,
            "revenue": 0.0,
            "profit": 0.0,
            "cost": 0.0,
            "now": now.year == year and now.month == month + 1,
        }
        for month, label in enumerate(labels)
    ]
    for order in orders:
        if order.sold_at.year != year:
            continue
        point = series[order.sold_at.month - 1]
        revenue = float(order.total)
        cost = sum(
            float(item.unit_cost * item.quantity) for item in order.items
        )
        point["revenue"] += revenue
        point["cost"] += cost
        point["profit"] += revenue - cost
    return series


def daily_series(orders: list[Order], days: int = 7) -> list[dict[str, Any]]:
    now = datetime.now()
    labels = ["D", "L", "M", "M", "J", "V", "S"]
    series: list[dict[str, Any]] = []
    for offset in range(days - 1, -1, -1):
        day = (now - timedelta(days=offset)).replace(
            hour=0, minute=0, second=0, microsecond=0
        )
        series.append(
            {
                "label": labels[day.weekday() + 1 if day.weekday() < 6 else 0],
                "date": day.date().isoformat(),
                "revenue": 0.0,
                "profit": 0.0,
            }
        )
    for order in orders:
        sold = order.sold_at.replace(hour=0, minute=0, second=0, microsecond=0)
        for point in series:
            if point["date"] == sold.date().isoformat():
                revenue = float(order.total)
                cost = sum(
                    float(item.unit_cost * item.quantity)
                    for item in order.items
                )
                point["revenue"] += revenue
                point["profit"] += revenue - cost
                break
    return series


def top_sellers(
    orders: list[Order], limit: int = 5
) -> list[dict[str, Any]]:
    totals: dict[str, dict[str, Any]] = {}
    for order in orders:
        for item in order.items:
            key = str(item.product_id) if item.product_id else item.product_name
            entry = totals.setdefault(
                key,
                {
                    "product_id": item.product_id,
                    "name": item.product_name,
                    "category": (
                        item.product.category.name
                        if item.product and item.product.category
                        else None
                    ),
                    "units": 0,
                    "revenue": 0.0,
                    "profit": 0.0,
                },
            )
            entry["units"] += item.quantity
            entry["revenue"] += float(item.unit_price * item.quantity)
            entry["profit"] += float(
                (item.unit_price - item.unit_cost) * item.quantity
            )
    result = sorted(totals.values(), key=lambda entry: entry["units"], reverse=True)
    for entry in result:
        entry["margin"] = (
            entry["profit"] / entry["revenue"] * 100
            if entry["revenue"]
            else 0.0
        )
    return result[:limit]


def payment_breakdown(orders: list[Order]) -> list[dict[str, Any]]:
    methods = ["Transferencia", "Efectivo", "Tarjeta", "Contra entrega"]
    total = sum(float(order.total) for order in orders)
    result = []
    for method in methods:
        revenue = sum(
            float(order.total)
            for order in orders
            if order.payment_method == method
        )
        result.append(
            {
                "method": method,
                "revenue": revenue,
                "share": revenue / total * 100 if total else 0.0,
            }
        )
    return result


def category_breakdown(
    orders: list[Order], products: list[Product]
) -> list[dict[str, Any]]:
    product_map = {product.id: product for product in products}
    totals: dict[int, dict[str, Any]] = {}
    for order in orders:
        for item in order.items:
            product = (
                product_map.get(item.product_id)
                if item.product_id is not None
                else None
            )
            if not product:
                continue
            entry = totals.setdefault(
                product.category_id,
                {
                    "category_id": product.category_id,
                    "name": product.category.name,
                    "color": product.category.color,
                    "units": 0,
                    "revenue": 0.0,
                    "profit": 0.0,
                },
            )
            entry["units"] += item.quantity
            entry["revenue"] += float(item.unit_price * item.quantity)
            entry["profit"] += float(
                (item.unit_price - item.unit_cost) * item.quantity
            )
    total_revenue = sum(entry["revenue"] for entry in totals.values())
    for entry in totals.values():
        entry["share"] = (
            entry["revenue"] / total_revenue * 100 if total_revenue else 0.0
        )
    return sorted(totals.values(), key=lambda entry: entry["revenue"], reverse=True)


def inventory_alerts(products: list[Product]) -> list[str]:
    out = [product for product in products if product.stock == 0]
    low = [
        product
        for product in products
        if 0 < product.stock < product.min_stock
    ]
    loss = [product for product in products if product.cost > product.price]
    alerts: list[str] = []
    if out:
        label = "producto agotado" if len(out) == 1 else "productos agotados"
        alerts.append(f"{len(out)} {label}")
    if low:
        alerts.append(
            f"{len(low)} producto bajo el mínimo"
            if len(low) == 1
            else f"{len(low)} productos bajo el mínimo"
        )
    if loss:
        alerts.append(
            f"{len(loss)} producto se vende con pérdida"
            if len(loss) == 1
            else f"{len(loss)} productos se venden con pérdida"
        )
    return alerts


def restock_items(products: list[Product]) -> list[dict[str, Any]]:
    result = []
    for product in sorted(
        [item for item in products if item.stock < item.min_stock],
        key=lambda item: item.stock,
    ):
        result.append(
            {
                "product_id": product.id,
                "name": product.name,
                "stock": product.stock,
                "min_stock": product.min_stock,
                "suggested": max(
                    product.min_stock * 2 - product.stock, product.min_stock
                ),
            }
        )
    return result
