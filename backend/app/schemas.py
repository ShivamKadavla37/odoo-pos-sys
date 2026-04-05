"""
Pydantic v2 schemas (request/response shapes) for Odoo POS Cafe.
"""
from __future__ import annotations
from uuid import UUID
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field, ConfigDict

from app.models import OrderStatus, PaymentType


# ── Shared config ─────────────────────────────────────────────────────────────

class OrmBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)


# ── Auth ──────────────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    name:     str       = Field(..., min_length=2, max_length=120)
    email:    EmailStr
    password: str       = Field(..., min_length=6)

class UserOut(OrmBase):
    id:         UUID
    name:       str
    email:      str
    role:       str
    is_active:  bool
    created_at: datetime

class Token(BaseModel):
    access_token: str
    token_type:   str = "bearer"

class LoginRequest(BaseModel):
    email:    EmailStr
    password: str


# ── Products ──────────────────────────────────────────────────────────────────

class ProductCreate(BaseModel):
    name:        str   = Field(..., min_length=1, max_length=150)
    category:    str   = "General"
    price:       float = Field(..., gt=0)
    tax_percent: float = 5.0
    unit:        str   = "piece"
    description: str   = ""
    image_url:   str   = ""
    is_active:   bool  = True

class ProductUpdate(BaseModel):
    name:        Optional[str]   = None
    category:    Optional[str]   = None
    price:       Optional[float] = None
    tax_percent: Optional[float] = None
    unit:        Optional[str]   = None
    description: Optional[str]  = None
    image_url:   Optional[str]  = None
    is_active:   Optional[bool] = None

class ProductOut(OrmBase):
    id:          UUID
    name:        str
    category:    str
    price:       float
    tax_percent: float
    unit:        str
    description: str
    image_url:   str
    is_active:   bool
    created_at:  datetime


# ── Orders ────────────────────────────────────────────────────────────────────

class OrderItemCreate(BaseModel):
    product_id: Optional[UUID] = None
    name:       str
    price:      float
    quantity:   int  = Field(default=1, ge=1)
    notes:      str  = ""

class OrderItemOut(OrmBase):
    id:         UUID
    product_id: Optional[UUID]
    name:       str
    price:      float
    quantity:   int
    notes:      str

class OrderCreate(BaseModel):
    table_number: Optional[int] = None
    notes:        str           = ""
    items:        List[OrderItemCreate]

class OrderStatusUpdate(BaseModel):
    status:       OrderStatus
    payment_type: Optional[PaymentType] = None

class OrderOut(OrmBase):
    id:           UUID
    table_number: Optional[int]
    status:       OrderStatus
    subtotal:     float
    tax_total:    float
    total:        float
    notes:        str
    payment_type: Optional[PaymentType]
    created_at:   datetime
    updated_at:   datetime
    items:        List[OrderItemOut] = []


# ── QR Code ───────────────────────────────────────────────────────────────────

class QRResponse(BaseModel):
    qr_code_base64: str
    upi_url:        str
