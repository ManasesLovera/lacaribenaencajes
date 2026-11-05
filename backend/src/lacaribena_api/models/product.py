from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    func,
    text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from lacaribena_api.db.base import Base

if TYPE_CHECKING:
    from lacaribena_api.models.category import Category


class Product(Base):
    __tablename__ = "products"
    __table_args__ = (
        CheckConstraint("price >= 0", name="ck_products_price_non_negative"),
        CheckConstraint("cost >= 0", name="ck_products_cost_non_negative"),
        CheckConstraint("stock >= 0", name="ck_products_stock_non_negative"),
        CheckConstraint("min_stock >= 0", name="ck_products_min_stock_non_negative"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(80), index=True)
    category_id: Mapped[int] = mapped_column(
        ForeignKey("categories.id", ondelete="RESTRICT"), index=True
    )
    price: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    cost: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    stock: Mapped[int] = mapped_column(
        Integer, default=0, server_default=text("0")
    )
    min_stock: Mapped[int] = mapped_column(
        Integer, default=3, server_default=text("3")
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.current_timestamp()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.current_timestamp(),
        onupdate=func.current_timestamp(),
    )

    category: Mapped[Category] = relationship(back_populates="products")

    @property
    def net_income(self) -> float:
        return float(self.price - self.cost)

    @property
    def margin(self) -> float:
        if self.price <= 0:
            return 0.0
        return float((self.price - self.cost) / self.price * 100)
