
import qrcode
from io import BytesIO
from base64 import b64encode, b64decode
from frappe.utils.file_manager import save_file
import frappe

def consignment_qr(doc, doctype_name):
   
    base_url = "http://182.71.135.110:8888"  

    
    qr_data = (
        f"{base_url}/printview?doctype=Consignment%20Note"
        f"&name={doc.name}"
        f"&trigger_print=1"
        f"&format=Consignment%20Note%20New%20Standard"
        f"&no_letterhead=1"
        f"&letterhead=No%20Letterhead"
        f"&settings=%7B%7D"
        f"&_lang=en"
    )

    
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=10,
        border=4,
    )
    qr.add_data(qr_data)
    qr.make(fit=True)

    
    img = qr.make_image(fill_color="black", back_color="white")

   
    buffer = BytesIO()
    img.save(buffer, format="PNG")
    content = buffer.getvalue()

    
    file_name = f"{doctype_name}_QR_{doc.name}.png"

   
    file_doc = save_file(file_name, content, doctype_name, doc.name, is_private=0)

   
    doc.print_qr_code = file_doc.file_url
