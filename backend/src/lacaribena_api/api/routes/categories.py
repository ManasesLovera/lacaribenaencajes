import re
import unicodedata

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, selectinload

from lacaribena_api.db.session import get_db
from lacaribena_api.models import Category, Product
from lacaribena_api.schemas.models import (
    CategoryCreate,
    CategoryRead,
    CategoryUpdate,
)
from lacaribena_api.security.auth import get_current_user

router = APIRouter(prefix="/categories", tags=["categories"])


def slugify(value: str) -> str:
    normalized = unicodedata.normalize("NFD", value)
    ascii_value = normalized.encode("ascii", "ignore").decode("ascii")
    return re.sub(r"[^a-z0-9]+", "-", ascii_value.lower()).strip("-")


def get_category_or_404(db: Session, category_id: int) -> Category:
    category = db.scalar(
        select(Category)
        .options(selectinload(Category.products))
        .where(Category.id == category_id)
    )
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Categoría no encontrada",
        )
    return category


@router.get("", response_model=list[CategoryRead])
def list_categories(
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
) -> list[Category]:
    return list(
        db.scalars(
            select(Category)
            .options(selectinload(Category.products))
            .order_by(Category.id)
        ).all()
    )


@router.post("", response_model=CategoryRead, status_code=status.HTTP_201_CREATED)
def create_category(
    payload: CategoryCreate,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
) -> Category:
    slug = slugify(payload.name)
    if db.scalar(select(Category).where(Category.slug == slug)):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ya existe una categoría con ese nombre",
        )
    category = Category(name=payload.name, slug=slug, color=payload.color)
    db.add(category)
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ya existe una categoría con ese nombre",
        ) from exc
    return get_category_or_404(db, category.id)


@router.patch("/{category_id}", response_model=CategoryRead)
def update_category(
    category_id: int,
    payload: CategoryUpdate,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
) -> Category:
    category = get_category_or_404(db, category_id)
    changes = payload.model_dump(exclude_unset=True)
    if "name" in changes and changes["name"]:
        new_slug = slugify(changes["name"])
        duplicate = db.scalar(
            select(Category).where(
                Category.slug == new_slug, Category.id != category_id
            )
        )
        if duplicate:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Ya existe una categoría con ese nombre",
            )
        category.slug = new_slug
    for field, value in changes.items():
        setattr(category, field, value)
    db.commit()
    return get_category_or_404(db, category_id)


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
) -> Response:
    category = get_category_or_404(db, category_id)
    products = db.scalar(
        select(func.count(Product.id)).where(Product.category_id == category_id)
    )
    if products:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="No se puede eliminar una categoría con productos",
        )
    db.delete(category)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
