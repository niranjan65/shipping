import frappe

@frappe.whitelist(allow_guest=True)
def get_tracking_table(consignment_note_value):
    tracking_doc = frappe.get_doc("Tracking", {"consignment_note": consignment_note_value})

    if not tracking_doc:
        frappe.throw(f"No Tracking document found with consignment_note {consignment_note_value}")

    tracking_table = tracking_doc.tracking_table
    return tracking_table

