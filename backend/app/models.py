import enum
from datetime import datetime, date
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, Date, ForeignKey, Enum, Text
)
from sqlalchemy.orm import relationship
from .database import Base
from .timezone_utils import local_today


class UserRole(str, enum.Enum):
    admin = "admin"
    employee = "employee"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(64), unique=True, index=True, nullable=False)
    full_name = Column(String(128), nullable=False, default="")
    hashed_password = Column(String(256), nullable=False)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.employee)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    production_records = relationship("ProductionRecord", back_populates="created_by_user")
    sale_records = relationship("SaleRecord", back_populates="created_by_user")
    return_records = relationship("ReturnRecord", back_populates="created_by_user")


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(128), nullable=False, index=True)
    unit = Column(String(32), nullable=False, default="литр")
    description = Column(Text, nullable=True)
    price = Column(Float, nullable=True)
    minimum_stock = Column(Float, nullable=False, default=0)
    is_active = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    production_records = relationship("ProductionRecord", back_populates="product")
    sale_records = relationship("SaleRecord", back_populates="product")
    return_records = relationship("ReturnRecord", back_populates="product")


class ProductionRecord(Base):
    """Өндүрүлгөн товар (кампага кирим)"""
    __tablename__ = "production_records"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False, index=True)
    quantity = Column(Float, nullable=False)
    record_date = Column(Date, nullable=False, default=local_today, index=True)
    note = Column(Text, nullable=True)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    product = relationship("Product", back_populates="production_records")
    created_by_user = relationship("User", back_populates="production_records")


class SaleRecord(Base):
    """Сатылган товар (кампадан чыгым)"""
    __tablename__ = "sale_records"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False, index=True)
    quantity = Column(Float, nullable=False)
    price = Column(Float, nullable=True)
    customer = Column(String(128), nullable=True)
    record_date = Column(Date, nullable=False, default=local_today, index=True)
    note = Column(Text, nullable=True)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    product = relationship("Product", back_populates="sale_records")
    created_by_user = relationship("User", back_populates="sale_records")


class ReturnRecord(Base):
    """Кайтарылган товар (кардардан кампага кайра кирим)"""
    __tablename__ = "return_records"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False, index=True)
    quantity = Column(Float, nullable=False)
    customer = Column(String(128), nullable=True)
    record_date = Column(Date, nullable=False, default=local_today, index=True)
    note = Column(Text, nullable=True)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    product = relationship("Product", back_populates="return_records")
    created_by_user = relationship("User", back_populates="return_records")