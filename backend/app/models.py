import enum
from datetime import datetime, date
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, Date, ForeignKey, Enum, Text
)
from sqlalchemy.orm import relationship
from .database import Base


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


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(128), nullable=False)
    unit = Column(String(32), nullable=False, default="литр")  # литр, кг, даана ж.б.
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    production_records = relationship("ProductionRecord", back_populates="product")
    sale_records = relationship("SaleRecord", back_populates="product")


class ProductionRecord(Base):
    """Өндүрүлгөн товар (кампага кирим)"""
    __tablename__ = "production_records"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Float, nullable=False)
    record_date = Column(Date, nullable=False, default=date.today)
    note = Column(Text, nullable=True)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    product = relationship("Product", back_populates="production_records")
    created_by_user = relationship("User", back_populates="production_records")


class SaleRecord(Base):
    """Сатылган товар (кампадан чыгым)"""
    __tablename__ = "sale_records"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Float, nullable=False)
    price = Column(Float, nullable=True)  # бир бирдиктин баасы (милдеттүү эмес)
    customer = Column(String(128), nullable=True)
    record_date = Column(Date, nullable=False, default=date.today)
    note = Column(Text, nullable=True)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    product = relationship("Product", back_populates="sale_records")
    created_by_user = relationship("User", back_populates="sale_records")
