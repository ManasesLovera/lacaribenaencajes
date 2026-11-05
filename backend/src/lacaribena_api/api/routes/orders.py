from datetime import datetime
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session, joinedload

from lacaribena_api.db.session import get_db
from lacaribena_api.models import Order, OrderItem, Product
from lacaribena_api.schemas.models import (
    OrderCreate,
    OrderPage,
    OrderRead,
    OrderUpdate,
    Period,
)
from lacaribena_api.security.auth import get_current_user
from lacaribena_api.services.analytics import fetch_orders, period_start

router = APIRouter(prefix="/orders", tags=["orders"])


@router.get("", response_model=OrderPage)
def list_orders(
    period: Period | None = None,
    limit: int = Query(default=500, ge=1, le=1000),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
) -> OrderPage:
    start = period_start(period) if period else None
    orders = fetch_orders(db, start=start)
    total = len(orders)
    page = orders[offset : offset + limit]
    return OrderPage(
        items=[OrderRead.model_validate(order) for order in page],
        total=total,
        limit=limit,
        offset=offset,
    )


@router.get("/{order_id}", response_model=OrderRead)
def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
) -> Order:
    order = db.scalar(
        select(Order)
        .options(
            joinedload(Order.items).joinedload(OrderItem.product)
        )
        .where(Order.id == order_id)
    )
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pedido no encontrado",
        )
    return order


@router.post("", response_model=OrderRead, status_code=status.HTTP_201_CREATED)
def create_order(
    payload: OrderCreate,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
) -> Order:
    items: list[OrderItem] = []
    total = Decimal("0")
    for entry in payload.items:
        product = db.get(Product, entry.product_id)
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Producto {entry.product_id} no encontrado",
            )
        if product.stock < entry.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"Stock insuficiente para {product.name}: "
                    f"quedan {product.stock} unidades"
                ),
            )
        total += product.price * entry.quantity
        items.append(
            OrderItem(
                product_id=product.id,
                product_name=product.name,
                quantity=entry.quantity,
                unit_price=product.price,
                unit_cost=product.cost,
            )
        )

    last_number = db.scalar(select(func.max(Order.number))) or 1000
    order = Order(
        number=last_number + 1,
        customer_name=payload.customer_name.strip(),
        payment_method=payload.payment_method,
        status=payload.status,
        total=total,
        sold_at=payload.sold_at or datetime.now(),
        items=items,
    )
    for entry in payload.items:
        product = db.get(Product, entry.product_id)
        if product:
            product.stock -= entry.quantity

    db.add(order)
    db.commit()
    return get_order(order.id, db=db, _=None)


@router.patch("/{order_id}", response_model=OrderRead)
def update_order(
    order_id: int,
    payload: OrderUpdate,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
) -> Order:
    order = db.get(Order, order_id)
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pedido no encontrado",
        )
    for field, value in payload.model_dump(exclude_unset=True).items():
        if value is not None:
            setattr(order, field, value)
    db.commit()
    return get_order(order_id, db=db, _=None)
