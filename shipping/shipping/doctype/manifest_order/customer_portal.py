import frappe

@frappe.whitelist()
def get_customers_by_portal_user(user_email):
    # Fetch all Customer records where portal_users child table has the given email
    customers = frappe.db.sql("""
        SELECT DISTINCT parent 
        FROM `tabPortal User`
        WHERE user = %s
    """, (user_email,), as_dict=True)

    customer_ids = [customer["parent"] for customer in customers]

    if not customer_ids:
        return {"message": "No customers found", "data": []}

    customer_data = frappe.get_all("Customer", filters={"name": ["in", customer_ids]}, fields=["name", "customer_name"])

    return {"message": "Success", "data": customer_data}
