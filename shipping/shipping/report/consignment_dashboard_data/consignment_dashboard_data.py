import frappe

def execute(filters=None):
    columns = [
        {"label": "Customer Name", "fieldname": "customer_name", "fieldtype": "Data", "width": 250},
        {"label": "Value Of Shipment (PGK)", "fieldname": "value_of_shipment", "fieldtype": "Currency", "width": 180}
    ]
    data = frappe.db.sql("""
        SELECT customer_name, SUM(value_of_shipment) AS value_of_shipment
        FROM `tabConsignment Note`
        WHERE customer_type = 'Corporate'
        GROUP BY customer_name
        ORDER BY value_of_shipment DESC
        LIMIT 10
    """, as_dict=True)
    return columns, data





    # # Existing example 2: Cash vs Corporate Booking Counts (all time)
    # bookings_split = frappe.db.sql("""
    #     SELECT customer_type, COUNT(name) AS total_bookings
    #     FROM `tabConsignment Note`
    #     GROUP BY customer_type
    # """, as_dict=True)

    # # Existing example 3: Workflow State Count
    # workflow_counts = frappe.db.sql("""
    #     SELECT workflow_state, COUNT(*) AS count
    #     FROM `tabConsignment Note`
    #     GROUP BY workflow_state
    # """, as_dict=True)

    # # New: Top Destination Airports by Number of Shipments
    # top_dest_airports = frappe.db.sql("""
    #     SELECT destination AS label, COUNT(*) AS value
    #     FROM `tabConsignment Note`
    #     WHERE destination IS NOT NULL
    #     GROUP BY destination
    #     ORDER BY value DESC
    #     LIMIT 10
    # """, as_dict=True)

    # # New: Number of shipments in last 30 days
    # shipments_last_30_days = frappe.db.sql("""
    #     SELECT COUNT(*) AS total
    #     FROM `tabConsignment Note`
    #     WHERE `datetime` >= %s
    # """, (start_30_days,), as_dict=True)[0].get("total", 0) or 0

    # # New: Top Performing Branches by origin_branch and shipment value in last 30 days
    # top_branches_30_days = frappe.db.sql("""
    #     SELECT origin_branch AS label, SUM(value_of_shipment) AS total_value
    #     FROM `tabConsignment Note`
    #     WHERE origin_branch IS NOT NULL
    #       AND `datetime` >= %s
    #     GROUP BY origin_branch
    #     ORDER BY total_value DESC
    #     LIMIT 10
    # """, (start_30_days,), as_dict=True)

    # # Prepare columns for the report display
    # columns = [
    #     {"label": "Metric",        "fieldname": "metric",  "fieldtype": "Data",    "width": 250},
    #     {"label": "Label",         "fieldname": "label",   "fieldtype": "Data",    "width": 250},
    #     {"label": "Value",         "fieldname": "value",   "fieldtype": "Float",   "width": 150}
    # ]

    # data = []

    # # Add corporate top10
    # for row in corporate_top10:
    #     data.append({
    #         "metric": "Top 10 Corporate Customers",
    #         "label": row.customer_name,
    #         "value": row.total_value
    #     })

    # # Add bookings split
    # for row in bookings_split:
    #     data.append({
    #         "metric": "Bookings Split",
    #         "label": row.customer_type,
    #         "value": row.total_bookings
    #     })

    # # Add workflow state counts
    # for row in workflow_counts:
    #     data.append({
    #         "metric": "Workflow State Count",
    #         "label": row.workflow_state,
    #         "value": row.count
    #     })

    # # Add top destination airports
    # for row in top_dest_airports:
    #     data.append({
    #         "metric": "Top Destination Airports",
    #         "label": row.label,
    #         "value": row.value
    #     })

    # # Add shipments count last 30 days as a single row with label 'Last 30 Days'
    # data.append({
    #     "metric": "Shipments Last 30 Days",
    #     "label": "Last 30 Days",
    #     "value": shipments_last_30_days
    # })

    # # Add top performing branches last 30 days
    # for row in top_branches_30_days:
    #     data.append({
    #         "metric": "Top Performing Branches (30 Days)",
    #         "label": row.label,
    #         "value": row.total_value
    #     })

    # return columns, data
