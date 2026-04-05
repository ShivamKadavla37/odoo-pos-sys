"""
Payments router — UPI QR generation endpoint.
GET /api/payments/upi-qr?upi_id=...&amount=...&note=...
"""
from fastapi import APIRouter, Query
from app import schemas
from app.utils.qr_generator import generate_upi_qr

router = APIRouter(prefix="/api/payments", tags=["Payments"])


@router.get("/upi-qr", response_model=schemas.QRResponse)
def upi_qr(
    upi_id: str   = Query(...,    description="UPI VPA e.g. cafe@ybl"),
    amount: float = Query(...,    gt=0, description="Amount in INR"),
    note:   str   = Query("CafeOrder", description="Payment note"),
):
    """
    Dynamically generates a UPI payment QR code.
    Returns a base64-encoded PNG the frontend renders in an <img> tag.
    """
    return generate_upi_qr(upi_id=upi_id, amount=amount, note=note)
