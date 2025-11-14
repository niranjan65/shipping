# Copyright (c) 2025, Niranjan and contributors
# For license information, please see license.txt



import frappe
from datetime import datetime, timedelta

def execute(filters=None):
    columns = [
        {
            "label": "Origin Branch",
            "fieldname": "origin_branch",
            "fieldtype": "Data",
            "width": 250
        },
        {
            "label": "Value Of Shipment (PGK)",
            "fieldname": "value_of_shipment",
            "fieldtype": "Currency",
            "width": 180
        }
    ]

    today = datetime.today().date()
    start_30_days = today - timedelta(days=30)

    # Query: Top 10 branches (replace null/empty with 'Others')
    data = frappe.db.sql("""
        SELECT 
            COALESCE(NULLIF(origin_branch, ''), 'Others') AS origin_branch,
            SUM(value_of_shipment) AS value_of_shipment
        FROM `tabConsignment Note`
        WHERE `datetime` >= %s
        GROUP BY COALESCE(NULLIF(origin_branch, ''), 'Others')
        ORDER BY value_of_shipment DESC
        LIMIT 10
    """, (start_30_days,), as_dict=True)

    return columns, data

# import frappe
# from datetime import datetime, timedelta

# def execute(filters=None):
#     columns = [
#         {
#             "label": "Origin Branch",
#             "fieldname": "origin_branch",
#             "fieldtype": "Data",
#             "width": 250
#         },
#         {
#             "label": "Value Of Shipment (PGK)",
#             "fieldname": "value_of_shipment",  
#             "fieldtype": "Currency",
#             "width": 180
#         }
#     ]

#     today = datetime.today().date()
#     start_30_days = today - timedelta(days=30)

#     # Query: Top 10 branches by total shipment value in last 30 days
#     data = frappe.db.sql("""
#         SELECT 
#             origin_branch,
#             SUM(value_of_shipment) AS value_of_shipment
#         FROM `tabConsignment Note`
#         WHERE origin_branch IS NOT NULL
#           AND `datetime` >= %s
#         GROUP BY origin_branch
#         ORDER BY value_of_shipment DESC
#         LIMIT 10
#     """, (start_30_days,), as_dict=True)

#     return columns, data

