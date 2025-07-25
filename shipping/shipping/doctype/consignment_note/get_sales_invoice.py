

import frappe

@frappe.whitelist()
def get_cash_consignment_with_overdue_invoice():
    consignment_notes = []

    notes = frappe.get_all(
        "Consignment Note",
        filters={"customer_type": "Cash"},
        fields=["name", "sales_invoice"]
    )

    for note in notes:
        if note.sales_invoice:
            invoice = frappe.get_doc("Sales Invoice", note.sales_invoice)
            if invoice.outstanding_amount > 0 and invoice.status in ["Unpaid", "Overdue"]:
                consignment_notes.append({
                    "consignment_note": note.name,
                    "sales_invoice": note.sales_invoice,
                    "invoice_status": invoice.status,
                    "outstanding_amount": invoice.outstanding_amount
                })

    return consignment_notes
