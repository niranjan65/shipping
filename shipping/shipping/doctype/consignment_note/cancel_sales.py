import frappe

@frappe.whitelist()
def cancel_sales_invoice_and_payment_entry(sales_invoice_name, consignment_name=None):
    try:
        # Cancel Payment Entries first
        for pe in frappe.get_all("Payment Entry", {"reference_name": sales_invoice_name, "docstatus": 1}):
            frappe.get_doc("Payment Entry", pe.name).cancel()

        # Cancel Sales Invoice
        inv = frappe.get_doc("Sales Invoice", sales_invoice_name)
        if inv.docstatus == 1:
            inv.cancel()

        # Consignment cancelled
        if consignment_name:
            frappe.db.set_value("Consignment Note", consignment_name, "status", "Cancelled")
            

        frappe.db.commit()  
        return {"status": "success"}

    except Exception as e:
        frappe.log_error(frappe.get_traceback(), "Cancel Sales + Payment Error")
        return {"status": "error", "message": str(e)}
