from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

Period = Literal["hoy", "semana", "mes", "ano"]


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: EmailStr


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=200)


class ChangePasswordRequest(BaseModel):
    current_password: str = Field(min_length=1, max_length=200)
    new_password: str = Field(min_length=8, max_length=200)


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserRead


class CategoryBrief(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    slug: str
    color: str | None


class CategoryRead(CategoryBrief):
    created_at: datetime
    product_count: int = 0


class CategoryCreate(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    color: str | None = Field(default=None, max_length=20)

    @field_validator("name")
    @classmethod
    def clean_name(cls, value: str) -> str:
        value = value.strip()
        if len(value) < 2:
            raise ValueError("El nombre debe tener al menos 2 caracteres")
        return value


class CategoryUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=80)
    color: str | None = Field(default=None, max_length=20)


class ProductRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    category_id: int
    price: float
    cost: float
    stock: int
    min_stock: int
    net_income: float
    margin: float
    created_at: datetime
    updated_at: datetime
    category: CategoryBrief


class ProductCreate(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    category_id: int
    price: float = Field(ge=0, le=999_999_999)
    cost: float = Field(ge=0, le=999_999_999)
    stock: int = Field(default=0, ge=0)
    min_stock: int = Field(default=3, ge=0)

    @field_validator("name")
    @classmethod
    def clean_name(cls, value: str) -> str:
        value = value.strip()
        if len(value) < 2:
            raise ValueError("El nombre debe tener al menos 2 caracteres")
        return value


class ProductUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=80)
    category_id: int | None = None
    price: float | None = Field(default=None, ge=0, le=999_999_999)
    cost: float | None = Field(default=None, ge=0, le=999_999_999)
    stock: int | None = Field(default=None, ge=0)
    min_stock: int | None = Field(default=None, ge=0)


class ProductPage(BaseModel):
    items: list[ProductRead]
    total: int
    page: int
    page_size: int


class OrderItemRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    product_id: int | None
    product_name: str
    quantity: int
    unit_price: float
    unit_cost: float
    line_total: float
    line_profit: float


class OrderRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    number: int
    customer_name: str
    payment_method: str
    status: str
    total: float
    sold_at: datetime
    items: list[OrderItemRead]


class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int = Field(ge=1, le=100)


class OrderCreate(BaseModel):
    customer_name: str = Field(min_length=2, max_length=120)
    payment_method: Literal[
        "Transferencia", "Efectivo", "Tarjeta", "Contra entrega"
    ] = "Efectivo"
    status: Literal["Pagada", "Pendiente", "Enviada"] = "Pagada"
    items: list[OrderItemCreate] = Field(min_length=1)
    sold_at: datetime | None = None


class OrderUpdate(BaseModel):
    status: Literal["Pagada", "Pendiente", "Enviada"] | None = None
    payment_method: Literal[
        "Transferencia", "Efectivo", "Tarjeta", "Contra entrega"
    ] | None = None


class OrderPage(BaseModel):
    items: list[OrderRead]
    total: int
    limit: int
    offset: int


class TaskRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    done: bool
    created_at: datetime


class TaskCreate(BaseModel):
    title: str = Field(min_length=2, max_length=200)


class TaskUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=2, max_length=200)
    done: bool | None = None


class SettingsRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    store_name: str
    owner_name: str
    email: EmailStr
    daily_goal: int
    weekly_goal: int
    monthly_goal: int
    low_stock_alerts: bool
    email_summary: bool


class SettingsUpdate(BaseModel):
    store_name: str | None = Field(default=None, min_length=2, max_length=120)
    owner_name: str | None = Field(default=None, min_length=2, max_length=120)
    email: EmailStr | None = None
    daily_goal: int | None = Field(default=None, ge=0)
    weekly_goal: int | None = Field(default=None, ge=0)
    monthly_goal: int | None = Field(default=None, ge=0)
    low_stock_alerts: bool | None = None
    email_summary: bool | None = None
