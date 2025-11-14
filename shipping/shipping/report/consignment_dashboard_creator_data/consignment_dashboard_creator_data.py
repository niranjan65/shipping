# Copyright (c) 2025, Niranjan and contributors
# For license information, please see license.txt

import frappe

def execute(filters=None):
    columns = [
        {
            "label": "Created By",
            "fieldname": "owner",
            "fieldtype": "Data",
            "width": 250
        },
        {
            "label": "Number of Consignment Notes",
            "fieldname": "consignment_count",
            "fieldtype": "Int",
            "width": 180
        }
    ]

    # SQL query: Top 10 creators of Consignment Notes
    data = frappe.db.sql("""
        SELECT 
            owner,
            COUNT(*) AS consignment_count
        FROM `tabConsignment Note`
        GROUP BY owner
        ORDER BY consignment_count DESC
        LIMIT 10
    """, as_dict=True)

    return columns, data

