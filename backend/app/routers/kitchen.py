"""
Kitchen WebSocket router — live order updates for Kitchen Display System (KDS).

WS  /ws/kitchen        Kitchen Display — receives live order events
GET /api/kitchen/orders List orders currently in kitchen queue (sent / ready)
"""
import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas

router = APIRouter(tags=["Kitchen"])


# ── Connection Manager ────────────────────────────────────────────────────────

class KitchenConnectionManager:
    """Manages all active WebSocket connections to the Kitchen Display."""

    def __init__(self):
        self.active: list[WebSocket] = []

    async def connect(self, ws: WebSocket):
        await ws.accept()
        self.active.append(ws)
        print(f"[WS] Kitchen client connected. Total: {len(self.active)}")

    def disconnect(self, ws: WebSocket):
        if ws in self.active:
            self.active.remove(ws)
        print(f"[WS] Kitchen client disconnected. Total: {len(self.active)}")

    async def broadcast(self, message: str):
        """Send a JSON string to ALL connected kitchen screens."""
        dead = []
        for ws in self.active:
            try:
                await ws.send_text(message)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect(ws)

    async def send_personal(self, ws: WebSocket, message: str):
        await ws.send_text(message)


# Singleton — imported by orders.py to broadcast on order events
manager = KitchenConnectionManager()


# ── WebSocket endpoint ────────────────────────────────────────────────────────

@router.websocket("/ws/kitchen")
async def kitchen_ws(websocket: WebSocket, db: Session = Depends(get_db)):
    """
    Kitchen Display connects here.
    On connect:  sends the current open/sent orders as initial state.
    Ongoing:     receives status-update messages from kitchen staff.
    """
    await manager.connect(websocket)

    # Push current kitchen queue on connect
    queue = (
        db.query(models.Order)
        .filter(models.Order.status.in_([models.OrderStatus.sent, models.OrderStatus.open]))
        .order_by(models.Order.created_at)
        .all()
    )
    init_payload = json.dumps({
        "event": "init",
        "orders": [
            {
                "order_id":     str(o.id),
                "table_number": o.table_number,
                "status":       o.status.value,
                "items": [
                    {"name": i.name, "qty": i.quantity, "notes": i.notes}
                    for i in o.items
                ],
                "created_at": o.created_at.isoformat(),
            }
            for o in queue
        ],
    })
    await manager.send_personal(websocket, init_payload)

    try:
        while True:
            raw = await websocket.receive_text()
            try:
                data = json.loads(raw)
                # Kitchen staff marks an order ready / done
                if data.get("event") == "mark_ready":
                    await manager.broadcast(json.dumps({
                        "event":    "order_status",
                        "order_id": data.get("order_id"),
                        "status":   "ready",
                    }))
            except json.JSONDecodeError:
                pass   # ignore malformed messages
    except WebSocketDisconnect:
        manager.disconnect(websocket)


# ── REST: kitchen queue ───────────────────────────────────────────────────────

@router.get("/api/kitchen/orders", response_model=list[schemas.OrderOut], tags=["Kitchen"])
def kitchen_queue(db: Session = Depends(get_db)):
    """Returns all orders currently in the kitchen queue (open or sent)."""
    return (
        db.query(models.Order)
        .filter(models.Order.status.in_([models.OrderStatus.open, models.OrderStatus.sent]))
        .order_by(models.Order.created_at)
        .all()
    )
