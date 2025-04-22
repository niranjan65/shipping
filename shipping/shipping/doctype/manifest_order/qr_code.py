import logging
import requests
from PIL import Image
from io import BytesIO
import qrcode
from qrcode.image.styledpil import StyledPilImage
from qrcode.image.styles.moduledrawers import RoundedModuleDrawer
from base64 import b64encode

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

def get_qr_code(data: str, logo_url: str = None) -> str:
    qr_code_bytes = get_qr_code_bytes(data, logo_url, format="PNG")
    base_64_string = bytes_to_base64_string(qr_code_bytes)
    return add_file_info(base_64_string)

def get_qr_code_bytes(data: str, logo_url: str = None, format: str = "PNG") -> bytes:
    qr = qrcode.QRCode(version=1, error_correction=qrcode.constants.ERROR_CORRECT_H, box_size=10, border=4)
    qr.add_data(data)
    qr.make(fit=True)

    img = qr.make_image(fill_color="blue", back_color="white", image_factory=StyledPilImage, module_drawer=RoundedModuleDrawer())
    logger.debug(f"QR code image created. Size: {img.size}")

    if logo_url:
        try:
            logger.debug(f"Attempting to download logo from: {logo_url}")
            response = requests.get(logo_url, timeout=10, verify=False)
            response.raise_for_status()
            logo = Image.open(BytesIO(response.content))
            logger.debug(f"Logo downloaded and opened. Original size: {logo.size}")
            
            logo_size = int(min(img.size) / 4)
            logo = logo.resize((logo_size, logo_size), Image.LANCZOS)
            logger.debug(f"Logo resized to: {logo.size}")
            
            pos = ((img.size[0] - logo.size[0]) // 2, (img.size[1] - logo.size[1]) // 2)
            
            img = img.convert('RGBA')
            logo = logo.convert('RGBA')
            
            img.paste(logo, pos, logo)
            logger.debug("Logo pasted onto QR code")
        except requests.RequestException as e:
            logger.error(f"Error downloading logo: {e}")
        except Exception as e:
            logger.error(f"Error processing logo: {e}")
    else:
        logger.debug("No logo URL provided")

    buffered = BytesIO()
    img.save(buffered, format=format)
    logger.debug(f"QR code with logo saved to buffer. Size: {img.size}")
    return buffered.getvalue()

def add_file_info(data: str) -> str:
    return f"data:image/png;base64,{data}"

def bytes_to_base64_string(data: bytes) -> str:
    return b64encode(data).decode("utf-8")

# Test the function
qr_code_data_url = get_qr_code("https://example.com", logo_url="http://erp.anantdv.com:8001/files/Lotic%20Bige%20Logo.jpg")
print(qr_code_data_url[:100])  # Print the first 100 characters of the result