"""
Odoo POS Cafe — FastAPI Application Entry Point
================================================
Tech Stack:
  - FastAPI         REST API + WebSocket
  - PostgreSQL      Persistent order/product storage (via SQLAlchemy)
  - WebSockets      Live kitchen display updates
  - Python QRCode   UPI payment QR generation

Run:
    uvicorn main:app --reload --host 0.0.0.0 --port 8000

Docs:
    http://localhost:8000/docs   (Swagger UI)
    http://localhost:8000/redoc  (ReDoc)
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import engine, Base

# Import all models so SQLAlchemy registers them before create_all
from app import models  # noqa: F401

# Routers
from app.routers import auth, products, orders, payments, kitchen


# ── Lifespan (startup / shutdown) ─────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create all DB tables on startup (dev-friendly auto-migrate)."""
    Base.metadata.create_all(bind=engine)
    print("✅  Database tables ready.")
    yield
    print("👋  Shutting down Odoo POS Cafe API.")


# ── App factory ───────────────────────────────────────────────────────────────

app = FastAPI(
    title       = settings.APP_NAME,
    version     = "1.0.0",
    description = "Full-stack POS API: orders, products, auth, kitchen WS, UPI QR.",
    lifespan    = lifespan,
)

# ── CORS ──────────────────────────────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins     = settings.ALLOWED_ORIGINS,
    allow_credentials = True,
    allow_methods     = ["*"],
    allow_headers     = ["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────

app.include_router(auth.router)
app.include_router(products.router)
app.include_router(orders.router)
app.include_router(payments.router)
app.include_router(kitchen.router)   # includes both WS + REST kitchen endpoints


# ── Health check ──────────────────────────────────────────────────────────────

@app.get("/", tags=["Health"])
def root():
    return {
        "service": settings.APP_NAME,
        "status":  "online",
        "docs":    "/docs",
    }

@app.get("/health", tags=["Health"])
def health():
    return {"status": "ok"}
