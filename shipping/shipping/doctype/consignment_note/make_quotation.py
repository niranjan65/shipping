
import frappe
@frappe.whitelist()
def make_invoice(data_json):
    data = frappe.parse_json(data_json)

    quotation = frappe.get_doc({
        "doctype": "Quotation",
        "customer_name": data.get("customer_name"),
        "custom_origin": data.get("custom_origin"),
        "custom_destination": data.get("custom_destination"),
        "custom__chargeable_weight": data.get("custom__chargeable_weight"),
        "custom_customer_type": data.get("custom_customer_type"),
        "quotation_to": "Customer",
        "company": data.get("company"),
        "transaction_date": data.get("transaction_date"),
        "valid_till": data.get("valid_till"),
        "custom_total_no_of_pieces": data.get("custom_total_no_of_pieces"),
        "items": data.get("items"),
        "taxes_and_charges": data.get("taxes_and_charges")
    })

    gst_template = frappe.get_doc("Sales Taxes and Charges Template", data.get("taxes_and_charges"))
    for tax in gst_template.taxes:
        quotation.append("taxes", {
            "charge_type": tax.charge_type,
            "account_head": tax.account_head,
            "description": tax.description,
            "rate": tax.rate,
            "included_in_print_rate": tax.included_in_print_rate,
        })

    quotation.set_missing_values()
    quotation.calculate_taxes_and_totals()
    quotation.submit()
    frappe.db.commit()

    return {"quotation": quotation.name}
