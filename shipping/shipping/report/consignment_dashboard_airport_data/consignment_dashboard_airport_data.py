# Copyright (c) 2025, Niranjan and contributors
# For license information, please see license.txt

import frappe

def execute(filters=None):
    columns = [
        {
            "label": "Destination Airport",
            "fieldname": "destination",
            "fieldtype": "Data",
            "width": 250
        },
        {
            "label": "Number of Shipments",
            "fieldname": "shipment_count",
            "fieldtype": "Int",
            "width": 150
        }
    ]

    # SQL query to get top 10 destination airports by shipment count
    data = frappe.db.sql("""
        SELECT 
            destination, 
            COUNT(*) AS shipment_count
        FROM `tabConsignment Note`
        WHERE destination IS NOT NULL
        GROUP BY destination
        ORDER BY shipment_count DESC
        LIMIT 10
    """, as_dict=True)

    return columns, data

