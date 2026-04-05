"""
Orders router — create, list, update status.
GET    /api/orders              list orders (filter by status)
POST   /api/orders              create new order
GET    /api/orders/{id}         get single order
PATCH  /api/orders/{id}/status  update order status / mark paid
DELETE /api/orders/{id}         cancel order
"""
from uuid import UUID
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import datetime

from app.database import get_db
from app import models, schemas
from app.utils.auth import get_current_user
from app.routers.kitchen import manager   # broadcast to kitchen via WS

router = APIRouter(prefix="/api/orders", tags=["Orders"])


def _calc_totals(items: list[models.OrderItem]) -> tuple[float, float, float]:
    """Return (subtotal, tax_total, total) for a list of order items."""
    subtotal = sum(i.price * i.quantity for i in items)
    tax_total = round(subtotal * 0.05, 2)   # simplified flat 5 % — extend per product later
    return round(subtotal, 2), tax_total, round(subtotal + tax_total, 2)


@router.get("", response_model=list[schemas.OrderOut])
def list_orders(
    status: Optional[str] = Query(None, description="Filter by status e.g. open, paid"),
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_user),
):
    q = db.query(models.Order)
    if status:
        try:
            q = q.filter(models.Order.status == models.OrderStatus(status))
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid status '{status}'.")
    return q.order_by(models.Order.created_at.desc()).all()


@router.post("", response_model=schemas.OrderOut, status_code=201)
async def create_order(
    payload: schemas.OrderCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    order = models.Order(
        table_number = payload.table_number,
        notes        = payload.notes,
        cashier_id   = current_user.id,
        status       = models.OrderStatus.open,
    )
    db.add(order)
    db.flush()   # get order.id before adding items

    for item_in in payload.items:
        item = models.OrderItem(
            order_id   = order.id,
            product_id = item_in.product_id,
            name       = item_in.name,
            price      = item_in.price,
            quantity   = item_in.quantity,
            notes      = item_in.notes,
        )
        db.add(item)

    db.flush()
    order.subtotal, order.tax_total, order.total = _calc_totals(order.items)
    db.commit()
    db.refresh(order)

    # 🔴 Broadcast new order to Kitchen Display via WebSocket
    import json
    await manager.broadcast(json.dumps({
        "event":        "new_order",
        "order_id":     str(order.id),
        "table_number": order.table_number,
        "items":        [{"name": i.name, "qty": i.quantity, "notes": i.notes} for i in order.items],
    }))

    return order


@router.get("/{order_id}", response_model=schemas.OrderOut)
def get_order(
    order_id: UUID,
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_user),
):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found.")
    return order


@router.patch("/{order_id}/status", response_model=schemas.OrderOut)
async def update_order_status(
    order_id: UUID,
    payload: schemas.OrderStatusUpdate,
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_user),
):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found.")

    order.status     = payload.status
    order.updated_at = datetime.utcnow()
    if payload.payment_type:
        order.payment_type = payload.payment_type

    db.commit()
    db.refresh(order)

    # Broadcast status change to kitchen
    import json
    await manager.broadcast(json.dumps({
        "event":    "order_status",
        "order_id": str(order.id),
        "status":   order.status.value,
    }))

    return order


@router.delete("/{order_id}", status_code=204)
def cancel_order(
    order_id: UUID,
    db: Session = Depends(get_db),
    _: models.User = Depends(get_current_user),
):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found.")
    if order.status == models.OrderStatus.paid:
        raise HTTPException(status_code=400, detail="Cannot cancel a paid order.")
    order.status = models.OrderStatus.cancelled
    db.commit()
