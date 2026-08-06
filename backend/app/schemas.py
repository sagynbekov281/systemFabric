from datetime import date, datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict
from .models import UserRole


# ---------- Auth ----------
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: UserRole
    full_name: str
    username: str


class LoginRequest(BaseModel):
    username: str
    password: str


# ---------- User ----------
class UserBase(BaseModel):
    username: str
    full_name: str
    role: UserRole = UserRole.employee


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None
    password: Optional[str] = None


class UserOut(UserBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    is_active: bool
    created_at: datetime


# ---------- Product ----------
class ProductBase(BaseModel):
    name: str
    unit: str = "литр"
    description: Optional[str] = None


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    unit: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None


class ProductOut(ProductBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    is_active: bool
    created_at: datetime


class ProductWithStock(ProductOut):
    stock: float = 0


# ---------- Production ----------
class ProductionBase(BaseModel):
    product_id: int
    quantity: float
    record_date: date = None
    note: Optional[str] = None


class ProductionCreate(ProductionBase):
    pass


class ProductionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    product_id: int
    product_name: Optional[str] = None
    quantity: float
    record_date: date
    note: Optional[str] = None
    created_by: int
    created_by_name: Optional[str] = None
    created_at: datetime


# ---------- Sale ----------
class SaleBase(BaseModel):
    product_id: int
    quantity: float
    price: Optional[float] = None
    customer: Optional[str] = None
    record_date: date = None
    note: Optional[str] = None


class SaleCreate(SaleBase):
    pass


class SaleOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    product_id: int
    product_name: Optional[str] = None
    quantity: float
    price: Optional[float] = None
    customer: Optional[str] = None
    record_date: date
    note: Optional[str] = None
    created_by: int
    created_by_name: Optional[str] = None
    created_at: datetime


# ---------- Reports ----------
class ReportRow(BaseModel):
    period: str
    product_id: int
    product_name: str
    produced: float
    sold: float
    revenue: float


class DashboardSummary(BaseModel):
    total_products: int
    today_produced: float
    today_sold: float
    today_revenue: float
    total_stock: float
    low_stock_products: List[ProductWithStock] = []
