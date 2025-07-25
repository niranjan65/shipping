import frappe
from frappe.model.document import Document

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

        return payment_entry.name
    else:
        pass