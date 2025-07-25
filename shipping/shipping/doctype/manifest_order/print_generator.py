import frappe
from frappe.utils.pdf import get_pdf
from frappe.utils.file_manager import save_file
from frappe.utils import get_url

@frappe.whitelist()
def generate_piecewise_pdfs(docname):
    doc = frappe.get_doc("Manifest Order", docname)
    count = int(doc.total_no_of_pieces or 1)
    combined_html = ""

    for i in range(1, count + 1):
        label = f"{i}/{count}"

        # Get the HTML of the print format
        html = frappe.get_print("Manifest Order", doc.name, print_format="Manifest Order Label 3", as_pdf=False)

        # Add label to top-right corner
        label_html = f"""
            <div style="position: absolute; top: 10px; right: 20px; font-weight: bold; font-size: 12px;">
                {label}
            </div>
        """

        # Wrap each page in a container and force page break
        page_html = f"""
            <div style="position: relative; page-break-after: always;">
                {label_html}
                {html}
            </div>
        """

        combined_html += page_html

    # Generate a single combined PDF
    pdf = get_pdf(combined_html)
    file_name = f"{docname}_Multi_Piece_Label.pdf"
    saved_file = save_file(file_name, pdf, doc.doctype, doc.name, is_private=1)

    return {
        "file_url": saved_file.file_url,
        "full_url": get_url(saved_file.file_url)
    }

