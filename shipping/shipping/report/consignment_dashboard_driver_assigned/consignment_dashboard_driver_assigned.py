# Copyright (c) 2025, Niranjan and contributors
# For license information, please see license.txt

import frappe
from datetime import datetime, timedelta

def execute(filters=None):
    columns = [
        {
            "label": "Driver",
            "fieldname": "assigned_to",
            "fieldtype": "Data",
            "width": 250
        },
        {
            "label": "Number of Assignments",
            "fieldname": "assignment_count",
            "fieldtype": "Int",
            "width": 150
        }
    ]

    # Calculate start date for last 30 days
    today = datetime.today().date()
    start_30_days = today - timedelta(days=30)

    # Query: Top 10 drivers by number of assignments in last 30 days
    data = frappe.db.sql("""
        SELECT 
            assigned_to, 
            COUNT(*) AS assignment_count
        FROM `tabPickup-Delivery Schedule`
        WHERE assigned_to IS NOT NULL
          AND `creation` >= %s
        GROUP BY assigned_to
        ORDER BY assignment_count DESC
        LIMIT 10
    """, (start_30_days,), as_dict=True)

    return columns, data

