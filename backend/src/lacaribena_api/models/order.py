from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from lacaribena_api.db.base import Base

if TYPE_CHECKING:
    from lacaribena_api.models.product import Product


class Order(Base):
    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(primary_key=True)
    number: Mapped[int] = mapped_column(Integer, unique=True, index=True)
    customer_name: Mapped[str] = mapped_column(String(120))
    payment_method: Mapped[str] = mapped_column(String(30))
    status: Mapped[str] = mapped_column(String(20), default="Pagada")
    total: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0)
    sold_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), index=True, default=datetime.now
    )

    items: Mapped[list[OrderItem]] = relationship(
        back_populates="order", cascade="all, delete-orphan"
    )


class OrderItem(Base):
    __tablename__ = "order_items"

    id: Mapped[int] = mapped_column(primary_key=True)
    order_id: Mapped[int] = mapped_column(
        ForeignKey("orders.id", ondelete="CASCADE"), index=True
    )
    product_id: Mapped[int | None] = mapped_column(
        ForeignKey("products.id", ondelete="SET NULL"), index=True
    )
    product_name: Mapped[str] = mapped_column(String(80))
    quantity: Mapped[int] = mapped_column(Integer)
    unit_price: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    unit_cost: Mapped[Decimal] = mapped_column(Numeric(12, 2))

    order: Mapped[Order] = relationship(back_populates="items")
    product: Mapped[Product | None] = relationship()

    @property
    def line_total(self) -> float:
        return float(self.unit_price * self.quantity)

    @property
    def line_profit(self) -> float:
        return float((self.unit_price - self.unit_cost) * self.quantity)


class Task(Base):
    __tablename__ = "tasks"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(200))
    done: Mapped[bool] = mapped_column(
        Boolean, default=False, server_default="0"
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.current_timestamp()
    )


class StoreSettings(Base):
    __tablename__ = "store_settings"

    id: Mapped[int] = mapped_column(primary_key=True, default=1)
    store_name: Mapped[str] = mapped_column(
        String(120), default="La Caribeña Encajes"
    )
    owner_name: Mapped[str] = mapped_column(String(120), default="Yesenia Castillo")
    email: Mapped[str] = mapped_column(
        String(255), default="yesenia@lacaribenaencajes.com"
    )
    daily_goal: Mapped[int] = mapped_column(Integer, default=12000)
    weekly_goal: Mapped[int] = mapped_column(Integer, default=42000)
    monthly_goal: Mapped[int] = mapped_column(Integer, default=160000)
    low_stock_alerts: Mapped[bool] = mapped_column(
        Boolean, default=True, server_default="1"
    )
    email_summary: Mapped[bool] = mapped_column(
        Boolean, default=True, server_default="1"
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.current_timestamp(),
        onupdate=func.current_timestamp(),
    )
