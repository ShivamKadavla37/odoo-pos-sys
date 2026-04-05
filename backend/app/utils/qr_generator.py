"""
UPI QR Code generator utility.
Uses the `qrcode` library with PIL backend to build a UPI deep-link QR.
"""
import io
import base64
import qrcode
from qrcode.image.styledpil import StyledPilImage
from qrcode.image.styles.moduledrawers import RoundedModuleDrawer


def build_upi_url(upi_id: str, amount: float, name: str = "POSCafe", note: str = "CafeOrder") -> str:
    """Construct a standards-compliant UPI payment URL."""
    txn_ref = f"TXN{int(amount * 100)}"
    return (
        f"upi://pay"
        f"?pa={upi_id}"
        f"&pn={name.replace(' ', '%20')}"
        f"&tr={txn_ref}"
        f"&am={amount:.2f}"
        f"&cu=INR"
        f"&tn={note.replace(' ', '%20')}"
    )


def generate_upi_qr(upi_id: str, amount: float, note: str = "CafeOrder") -> dict:
    """
    Generate a UPI QR code image.

    Returns:
        {
            "qr_code_base64": "data:image/png;base64,...",
            "upi_url": "upi://pay?..."
        }
    """
    upi_url = build_upi_url(upi_id, amount, note=note)

    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=10,
        border=4,
    )
    qr.add_data(upi_url)
    qr.make(fit=True)

    # Rounded QR for a premium look
    img = qr.make_image(
        image_factory=StyledPilImage,
        module_drawer=RoundedModuleDrawer(),
        fill_color="#1A1A2E",
        back_color="white",
    )

    buf = io.BytesIO()
    img.save(buf, format="PNG")
    b64 = base64.b64encode(buf.getvalue()).decode()

    return {
        "qr_code_base64": f"data:image/png;base64,{b64}",
        "upi_url":        upi_url,
    }
