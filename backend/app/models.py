"""
SQLAlchemy ORM models for Odoo POS Cafe.
Tables: users, products, orders, order_items, payment_methods
"""
import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Float, Boolean, Integer,
    DateTime, ForeignKey, Text, Enum as SAEnum, Uuid
)
from sqlalchemy.orm import relationship
import enum

from app.database import Base


# ── Enums ─────────────────────────────────────────────────────────────────────

class OrderStatus(str, enum.Enum):
    pending  = "pending"
    open     = "open"
    sent     = "sent"       # sent to kitchen
    ready    = "ready"      # kitchen marked ready
    paid     = "paid"
    cancelled = "cancelled"


class PaymentType(str, enum.Enum):
    cash    = "cash"
    upi     = "upi"
    digital = "digital"     # card / netbanking


# ── Models ────────────────────────────────────────────────────────────────────

class User(Base):
    __tablename__ = "users"

    id         = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name       = Column(String(120), nullable=False)
    email      = Column(String(200), unique=True, nullable=False, index=True)
    hashed_pw  = Column(String(255), nullable=False)
    role       = Column(String(30), default="cashier")   # cashier | manager
    is_active  = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    orders     = relationship("Order", back_populates="cashier")


class Product(Base):
    __tablename__ = "products"

    id          = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name        = Column(String(150), nullable=False)
    category    = Column(String(80), default="General")
    price       = Column(Float, nullable=False)
    tax_percent = Column(Float, default=5.0)
    unit        = Column(String(40), default="piece")
    description = Column(Text, default="")
    image_url   = Column(String(500), default="")
    is_active   = Column(Boolean, default=True)
    created_at  = Column(DateTime, default=datetime.utcnow)

    order_items = relationship("OrderItem", back_populates="product")


class Order(Base):
    __tablename__ = "orders"

    id           = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    table_number = Column(Integer, nullable=True)
    status       = Column(SAEnum(OrderStatus), default=OrderStatus.open)
    subtotal     = Column(Float, default=0.0)
    tax_total    = Column(Float, default=0.0)
    total        = Column(Float, default=0.0)
    notes        = Column(Text, default="")
    cashier_id   = Column(Uuid(as_uuid=True), ForeignKey("users.id"), nullable=True)
    payment_type = Column(SAEnum(PaymentType), nullable=True)
    created_at   = Column(DateTime, default=datetime.utcnow)
    updated_at   = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    cashier    = relationship("User", back_populates="orders")
    items      = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")


class OrderItem(Base):
    __tablename__ = "order_items"

    id         = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_id   = Column(Uuid(as_uuid=True), ForeignKey("orders.id"), nullable=False)
    product_id = Column(Uuid(as_uuid=True), ForeignKey("products.id"), nullable=True)
    name       = Column(String(150), nullable=False)   # snapshot at order time
    price      = Column(Float, nullable=False)
    quantity   = Column(Integer, default=1)
    notes      = Column(String(300), default="")

    order   = relationship("Order", back_populates="items")
    product = relationship("Product", back_populates="order_items")
