import frappe

@frappe.whitelist()
def make_invoice(data):
    
    # return data

    # sales_invoice = frappe.get_doc("Sales Invoice")
    
    # data = frappe.parse_json(data)
    # si = frappe.get_doc({
    #     "doctype": "Sales Invoice",
    #     "customer": data.get("customer_name"),
    #     "company": "Carpenters Air Logistics",
    #     "origin": data.get("origin"),
    #     "destination": data.get("destination"),
    #     "total_weight": data.get("total_weight"),
    #     "air_way_bill": data.get("name")
    # })
    # # return si
    # origin_dest_code = None
    # od_data = frappe.db.get_value("Origin Destination Map", 
    #                               {"origin": data.get("origin"), "destination": data.get("destination")}, 
    #                               "code")
    # if od_data:
    #     origin_dest_code = od_data

    # rc = frappe.get_doc("Rate Chart", "Rate Chart 1")
    # rate = 0

    # if data.get("total_weight") < 5:
    #     for item in rc.rate_chart:
    #         if item.area_code == "0":
    #             if data.get("customer_type") == "Cash":
    #                 rate = item.cash_rate
    #             elif data.get("customer_type") == "Corporate":
    #                 rate = item.corporate_rate
    # else:
    #     for item in rc.rate_chart:
    #         if item.area_code == origin_dest_code:
    #             if data.get("customer_type") == "Cash":
    #                 rate = item.cash_rate * data.get("total_weight")
    #             elif data.get("customer_type") == "Corporate":
    #                 rate = item.corporate_rate * data.get("total_weight")

    # si.rate = rate
    # si.total_weight = data.get("total_weight")
    # si.needs_doc_fee = data.get("total_weight") > 5
    # si.insert()
    # frappe.db.commit()

    # return si.name



    # data = frappe.parse_json(data)

    # si = frappe.get_doc({
    #     "doctype": "Sales Invoice",
    #     "customer": data.get("customer_name"),
    #     "company": "Carpenters Air Logistics",
    #     "origin": data.get("origin"),
    #     "destination": data.get("destination"),
    #     "total_weight": float(data.get("total_weight")),
    #     "air_way_bill": data.get("name")
    # })

    # origin_dest_code = frappe.db.get_value(
    #     "Origin Destination Map",
    #     {"origin": data.get("origin"), "destination": data.get("destination")},
    #     "code"
    # )

    # rc = frappe.get_doc("Rate Chart", "Rate Chart 1")
    # rate = 0

    
    # if float(data.get("total_weight")) < 5:
    #     for item in rc.rate_chart:
    #         if item.area_code == "0":
    #             if data.get("customer_type") == "Cash":
    #                 rate = item.cash_rate
    #             elif data.get("customer_type") == "Corporate":
    #                 rate = item.corporate_rate
    # else:
    #     for item in rc.rate_chart:
    #         if item.area_code == origin_dest_code:
    #             if data.get("customer_type") == "Cash":
    #                 rate = item.cash_rate * data.get("total_weight")
    #             elif data.get("customer_type") == "Corporate":
    #                 rate = item.corporate_rate * data.get("total_weight")

   
    # si.rate = rate
    # si.total_weight = data.get("total_weight")
    # si.needs_doc_fee = float(data.get("total_weight")) > 5
    # si.base_grand_total = float(rate)
    # si.grand_total = float(rate)
    # si.total = float(rate)
    # # return rate,data.get("total_weight"),float(data.get("total_weight")) > 5
    # si.save()
    # # si.insert()
    # # frappe.db.commit()

    # return {"sales_invoice_name": si.name}
    data = frappe.parse_json(data)
    # sales_invoice_no = frappe.db.sql("""
    #     select sales_invoice From `tabConsignment Note`
    #     WHERE name = %s
    #     """, (data.get("name")),as_dict = True)
    # if sales_invoice_no:
    #     return {"created_sales_invoice_name": sales_invoice_no[0].sales_invoice}
    # else:
    si = frappe.get_doc({
        "doctype": "Sales Invoice",
        "customer": data.get("customer_name"),
        "company": "Carpenters Air Logistics",
        "origin": data.get("origin"),
        "destination": data.get("destination"),
        "total_weight": float(data.get("total_weight")),
        "air_way_bill": data.get("name")
    })
    origin_dest_code = frappe.db.get_value(
        "Origin Destination Map",
        {"origin": data.get("origin"), "destination": data.get("destination")},
        "code"
    )
    rc = frappe.get_doc("Rate Chart", "Rate Chart 1")
    rate = 0
    if float(data.get("total_weight")) < 5:
        for item in rc.rate_chart:
            if item.area_code == "0":
                if data.get("customer_type") == "Cash":
                    rate = item.cash_rate
                elif data.get("customer_type") == "Corporate":
                    rate = item.corporate_rate
    else:
        for item in rc.rate_chart:
            if item.area_code == origin_dest_code:
                if data.get("customer_type") == "Cash":
                    rate = float(item.cash_rate) * float(data.get("total_weight"))
                elif data.get("customer_type") == "Corporate":
                    rate = float(item.corporate_rate) * float(data.get("total_weight"))
    si.rate = rate
    si.total_weight = data.get("total_weight")
    si.needs_doc_fee = float(data.get("total_weight")) > 5
    # si.append("items", {
    #     "item_name": "Documentation Fee",
    #     "item_code": "Documentation Fee",
    #     "description": "Fee for documentation services",
    #     "uom": "Unit",
    #     "qty": 1,
    #     "rate": rate,
    #     "amount": rate,
    #     "base_rate": rate,
    #     "base_amount": rate,
    #     "net_rate": rate,
    #     "net_amount": rate,
    #     "income_account": "Sales - CAL PNG",
    #     "expense_account": "Cost of Goods Sold - CAL PNG",
    #     "cost_center": "Main - CAL PNG",
    #     "stock_uom": "Nos",
    #     "stock_qty": 1,
    # })
    if float(data.get("total_weight")) >= 5 :
        si.append("items", {
            # "item_name": "Documentation Fee",
            "item_code": "Airfreight-KG",
            "uom": "Unit",
            "qty": 1,
            "rate": rate,
            "amount": rate,
            })
        si.append("items", {
            # "item_name": "Documentation Fee",
            "item_code": "Documentation Fee",
            "uom": "Unit",
            "qty": 1,
            "rate": 45,
            "amount": 45,
            })
        si.taxes_and_charges = "GST - CAL PNG"
        gst_template = frappe.get_doc("Sales Taxes and Charges Template", "GST - CAL PNG")
        for tax in gst_template.taxes:
            si.append("taxes", {
                "charge_type": tax.charge_type,
                "account_head": tax.account_head,
                "description": tax.description,
                "rate": tax.rate,
                "tax_amount": tax.tax_amount,
                "included_in_print_rate": tax.included_in_print_rate,
            })
    else:
        si.append("items", {
            # "item_name": "Documentation Fee",
            "item_code": "Airfreight-KG",
            "uom": "Unit",
            "qty": 1,
            "rate": rate,
            "amount": rate,
            })
        si.taxes_and_charges = "GST Included - CAL PNG"
        gst_template = frappe.get_doc("Sales Taxes and Charges Template", "GST Included - CAL PNG")
        for tax in gst_template.taxes:
            si.append("taxes", {
                "charge_type": tax.charge_type,
                "account_head": tax.account_head,
                "description": tax.description,
                "rate": tax.rate,
                "tax_amount": tax.tax_amount,
                "included_in_print_rate": tax.included_in_print_rate,
            })
    # si.base_grand_total = float(rate)
    # si.grand_total = float(rate)
    # si.total = float(rate)
    si.save()
    si.submit()
    frappe.db.sql("""
        UPDATE `tabConsignment Note`
        SET sales_invoice = %s
        WHERE name = %s
        """, (si.name, data.get("name"))
        )
    frappe.db.commit()
    return {"sales_invoice_name": si.name}