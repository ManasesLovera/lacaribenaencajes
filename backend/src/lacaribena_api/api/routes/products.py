from decimal import ROUND_HALF_UP, Decimal
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy import case, func, select
from sqlalchemy.orm import Session, joinedload

from lacaribena_api.db.session import get_db
from lacaribena_api.models import Category, Product
from lacaribena_api.schemas.models import (
    ProductCreate,
    ProductPage,
    ProductRead,
    ProductUpdate,
)
from lacaribena_api.security.auth import get_current_user

router = APIRouter(prefix="/products", tags=["products"])

SortOption = Literal["recent", "name", "price_asc", "price_desc", "margin"]


def money(value: float) -> Decimal:
    return Decimal(str(value)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


def get_product_or_404(db: Session, product_id: int) -> Product:
    product = db.scalar(
        select(Product)
        .options(joinedload(Product.category))
        .where(Product.id == product_id)
    )
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Producto no encontrado",
        )
    return product


def get_category_or_404(db: Session, category_id: int) -> Category:
    category = db.get(Category, category_id)
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Categoría no encontrada",
        )
    return category


@router.get("", response_model=ProductPage)
def list_products(
    q: str | None = Query(default=None, max_length=80),
    category_id: int | None = None,
    sort: SortOption = "recent",
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=8, ge=1, le=100),
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
) -> ProductPage:
    filters = []
    if q:
        filters.append(Product.name.ilike(f"%{q.strip()}%"))
    if category_id is not None:
        filters.append(Product.category_id == category_id)

    total = db.scalar(select(func.count(Product.id)).where(*filters)) or 0

    stmt = (
        select(Product)
        .options(joinedload(Product.category))
        .where(*filters)
    )
    if sort == "name":
        stmt = stmt.order_by(Product.name.asc())
    elif sort == "price_asc":
        stmt = stmt.order_by(Product.price.asc())
    elif sort == "price_desc":
        stmt = stmt.order_by(Product.price.desc())
    elif sort == "margin":
        margin = case(
            (Product.price > 0, (Product.price - Product.cost) / Product.price),
            else_=0,
        )
        stmt = stmt.order_by(margin.desc())
    else:
        stmt = stmt.order_by(Product.created_at.desc(), Product.id.desc())

    stmt = stmt.offset((page - 1) * page_size).limit(page_size)
    items = list(db.scalars(stmt).unique().all())
    return ProductPage(items=items, total=total, page=page, page_size=page_size)


@router.get("/{product_id}", response_model=ProductRead)
def get_product(
    product_id: int,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
) -> Product:
    return get_product_or_404(db, product_id)


@router.post("", response_model=ProductRead, status_code=status.HTTP_201_CREATED)
def create_product(
    payload: ProductCreate,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
) -> Product:
    get_category_or_404(db, payload.category_id)
    product = Product(
        name=payload.name,
        category_id=payload.category_id,
        price=money(payload.price),
        cost=money(payload.cost),
        stock=payload.stock,
        min_stock=payload.min_stock,
    )
    db.add(product)
    db.commit()
    return get_product_or_404(db, product.id)


@router.patch("/{product_id}", response_model=ProductRead)
def update_product(
    product_id: int,
    payload: ProductUpdate,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
) -> Product:
    product = get_product_or_404(db, product_id)
    changes = payload.model_dump(exclude_unset=True)
    if "category_id" in changes and changes["category_id"] is not None:
        get_category_or_404(db, changes["category_id"])
    if "price" in changes and changes["price"] is not None:
        changes["price"] = money(changes["price"])
    if "cost" in changes and changes["cost"] is not None:
        changes["cost"] = money(changes["cost"])
    for field, value in changes.items():
        setattr(product, field, value)
    db.commit()
    return get_product_or_404(db, product_id)


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
) -> Response:
    product = get_product_or_404(db, product_id)
    db.delete(product)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
