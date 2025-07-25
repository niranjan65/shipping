
import frappe
from frappe.model.document import Document

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
                create_payment_entry_from_sales_invoice(note.sales_invoice)




@frappe.whitelist()
def create_payment_entry_from_sales_invoice(sales_invoice_name, paid_amount=None, posting_date=None):
    from erpnext.accounts.doctype.payment_entry.payment_entry import get_payment_entry

    sales_invoice = frappe.get_doc("Sales Invoice", sales_invoice_name)
    if sales_invoice.docstatus != 1:
        frappe.throw("Sales Invoice must be submitted.")
    if sales_invoice.status != "Paid":
        payment_entry = get_payment_entry("Sales Invoice", sales_invoice_name)

        if paid_amount:
            payment_entry.paid_amount = paid_amount
            payment_entry.received_amount = paid_amount


        if not posting_date:
            posting_date = frappe.utils.nowdate()
        payment_entry.posting_date = posting_date

        payment_entry.insert(ignore_permissions=True)
        payment_entry.submit()
        print(payment_entry.name)
        return payment_entry.name
        
    else:
        pass

# @frappe.whitelist()
# def save(self):
#     super(type(self), self).save()
    # This function is a placeholder for any save logic you might want to implement
    # It can be used to trigger additional actions or validations before saving the document
    # pass
    # self.save()  # Ensure the document is saved
    # pass  # Replace with actual save logic if needed