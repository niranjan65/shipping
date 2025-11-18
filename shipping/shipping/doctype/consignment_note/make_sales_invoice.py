# import frappe

# @frappe.whitelist()
# def make_invoice(data):
    
#     # return data

#     # sales_invoice = frappe.get_doc("Sales Invoice")
    
#     # data = frappe.parse_json(data)
#     # si = frappe.get_doc({
#     #     "doctype": "Sales Invoice",
#     #     "customer": data.get("customer_name"),
#     #     "company": "Carpenters Air Logistics",
#     #     "origin": data.get("origin"),
#     #     "destination": data.get("destination"),
#     #     "total_weight": data.get("total_weight"),
#     #     "air_way_bill": data.get("name")
#     # })
#     # # return si
#     # origin_dest_code = None
#     # od_data = frappe.db.get_value("Origin Destination Map", 
#     #                               {"origin": data.get("origin"), "destination": data.get("destination")}, 
#     #                               "code")
#     # if od_data:
#     #     origin_dest_code = od_data

#     # rc = frappe.get_doc("Rate Chart", "Rate Chart 1")
#     # rate = 0

#     # if data.get("total_weight") < 5:
#     #     for item in rc.rate_chart:
#     #         if item.area_code == "0":
#     #             if data.get("customer_type") == "Cash":
#     #                 rate = item.cash_rate
#     #             elif data.get("customer_type") == "Corporate":
#     #                 rate = item.corporate_rate
#     # else:
#     #     for item in rc.rate_chart:
#     #         if item.area_code == origin_dest_code:
#     #             if data.get("customer_type") == "Cash":
#     #                 rate = item.cash_rate * data.get("total_weight")
#     #             elif data.get("customer_type") == "Corporate":
#     #                 rate = item.corporate_rate * data.get("total_weight")

#     # si.rate = rate
#     # si.total_weight = data.get("total_weight")
#     # si.needs_doc_fee = data.get("total_weight") > 5
#     # si.insert()
#     # frappe.db.commit()

#     # return si.name



#     # data = frappe.parse_json(data)

#     # si = frappe.get_doc({
#     #     "doctype": "Sales Invoice",
#     #     "customer": data.get("customer_name"),
#     #     "company": "Carpenters Air Logistics",
#     #     "origin": data.get("origin"),
#     #     "destination": data.get("destination"),
#     #     "total_weight": float(data.get("total_weight")),
#     #     "air_way_bill": data.get("name")
#     # })

#     # origin_dest_code = frappe.db.get_value(
#     #     "Origin Destination Map",
#     #     {"origin": data.get("origin"), "destination": data.get("destination")},
#     #     "code"
#     # )

#     # rc = frappe.get_doc("Rate Chart", "Rate Chart 1")
#     # rate = 0

    
#     # if float(data.get("total_weight")) < 5:
#     #     for item in rc.rate_chart:
#     #         if item.area_code == "0":
#     #             if data.get("customer_type") == "Cash":
#     #                 rate = item.cash_rate
#     #             elif data.get("customer_type") == "Corporate":
#     #                 rate = item.corporate_rate
#     # else:
#     #     for item in rc.rate_chart:
#     #         if item.area_code == origin_dest_code:
#     #             if data.get("customer_type") == "Cash":
#     #                 rate = item.cash_rate * data.get("total_weight")
#     #             elif data.get("customer_type") == "Corporate":
#     #                 rate = item.corporate_rate * data.get("total_weight")

   
#     # si.rate = rate
#     # si.total_weight = data.get("total_weight")
#     # si.needs_doc_fee = float(data.get("total_weight")) > 5
#     # si.base_grand_total = float(rate)
#     # si.grand_total = float(rate)
#     # si.total = float(rate)
#     # # return rate,data.get("total_weight"),float(data.get("total_weight")) > 5
#     # si.save()
#     # # si.insert()
#     # # frappe.db.commit()

#     # return {"sales_invoice_name": si.name}
#     data = frappe.parse_json(data)
#     # sales_invoice_no = frappe.db.sql("""
#     #     select sales_invoice From `tabConsignment Note`
#     #     WHERE name = %s
#     #     """, (data.get("name")),as_dict = True)
#     # if sales_invoice_no:
#     #     return {"created_sales_invoice_name": sales_invoice_no[0].sales_invoice}
#     # else:
#     si = frappe.get_doc({
#         "doctype": "Sales Invoice",
#         "customer": data.get("customer_name"),
#         "company": "Carpenters Air Logistics",
#         "origin": data.get("origin"),
#         "destination": data.get("destination"),
#         "total_weight": float(data.get("total_weight")),
#         "air_way_bill": data.get("name"),
#         "shipping_company_name": data.get("shipping_company_name"),
#         "shipping_address": data.get("address"),
#         "shipping_city":data.get("shipping_city"),

#     })
#     origin_dest_code = frappe.db.get_value(
#         "Origin Destination Map",
#         {"origin": data.get("origin"), "destination": data.get("destination")},
#         "code"
#     )
#     rc = frappe.get_doc("Rate Chart", "Rate Chart 1")
#     rate = 0
#     if float(data.get("total_weight")) < 5:
#         for item in rc.rate_chart:
#             if item.area_code == "0":
#                 if data.get("customer_type") == "Cash":
#                     rate = item.cash_rate
#                 elif data.get("customer_type") == "Corporate":
#                     rate = item.corporate_rate
#     else:
#         for item in rc.rate_chart:
#             if item.area_code == origin_dest_code:
#                 if data.get("customer_type") == "Cash":
#                     rate = float(item.cash_rate) * float(data.get("total_weight"))
#                 elif data.get("customer_type") == "Corporate":
#                     rate = float(item.corporate_rate) * float(data.get("total_weight"))
#     si.rate = rate
#     si.total_weight = data.get("total_weight")
#     si.needs_doc_fee = float(data.get("total_weight")) > 5
   
#     if float(data.get("total_weight")) >= 5 :
#         si.append("items", {
#             # "item_name": "Documentation Fee",
#             "item_code": "Airfreight-KG",
#             "uom": "Kg",
#             "qty": 1,
#             "weight": data.get("total_weight"),
#             "rate": rate,
#             "amount": rate,
#             })
#         si.append("items", {
#             # "item_name": "Documentation Fee",
#             "item_code": "Documentation Fee",
#             "uom": "Unit",
#             "qty": 1,
#             "rate": 45,
#             "amount": 45,
#             })
#         service_charge = round((rate + 45) * 0, 2)
#         si.append("items", {
#             # "item_name": "Documentation Fee",
#             "item_code": "Service Charge",
#             "uom": "Unit",
#             "qty": 1,
#             "rate": service_charge,
#             "amount": service_charge,
#             })
#         si.taxes_and_charges = "GST - CAL PNG"
#         gst_template = frappe.get_doc("Sales Taxes and Charges Template", "GST - CAL PNG")
#         for tax in gst_template.taxes:
#             si.append("taxes", {
#                 "charge_type": tax.charge_type,
#                 "account_head": tax.account_head,
#                 "description": tax.description,
#                 "rate": tax.rate,
#                 "tax_amount": tax.tax_amount,
#                 "included_in_print_rate": tax.included_in_print_rate,
#             })
#     else:
#         si.append("items", {
#             # "item_name": "Documentation Fee",
#             "item_code": "Airfreight-KG",
#             "uom": "Kg",
#             "qty": 1,
#             "weight": data.get("total_weight"),
#             "rate": rate,
#             "amount": rate,
#             })
#         si.taxes_and_charges = "GST Included - CAL PNG"
#         gst_template = frappe.get_doc("Sales Taxes and Charges Template", "GST Included - CAL PNG")
#         for tax in gst_template.taxes:
#             si.append("taxes", {
#                 "charge_type": tax.charge_type,
#                 "account_head": tax.account_head,
#                 "description": tax.description,
#                 "rate": tax.rate,
#                 "tax_amount": tax.tax_amount,
#                 "included_in_print_rate": tax.included_in_print_rate,
#             })
#     # si.base_grand_total = float(rate)
#     # si.grand_total = float(rate)
#     # si.total = float(rate)
#     # si.save()
#     si.submit()
#     # frappe.db.sql("""
#     #     UPDATE `tabConsignment Note`
#     #     SET sales_invoice = %s
#     #     WHERE name = %s
#     #     """, (si.name, data.get("name"))
#     #     )
#     # frappe.db.commit()
#     frappe.db.set_value('Consignment Note', data.get("name"), 'sales_invoice', si.name)
#     return {"sales_invoice_name": si.name}
import frappe
from datetime import datetime, date

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
    # frappe.msgprint(str(data))
    # frappe.msgprint("Parsed data:\n" + data)
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
        "air_way_bill": data.get("name"),
        "shipping_company_name": data.get("shipping_company_name"),
        "shipping_address": data.get("address"),
        "shipping_city":data.get("shipping_city"),
        "consignment_note":data.get("name"),
        "custom_actual_weight":data.get("custom_actual_weight"),
        "custom_volumetric_weight":data.get("custom_volumetric_weight"),

    })
    origin_dest_code = frappe.db.get_value(
        "Origin Destination Map",
        {"origin": data.get("origin"), "destination": data.get("destination")},
        "code"
    )
    rc = frappe.get_doc("Rate Chart", "Rate Chart 1")
    rate = 0
    if float(data.get("total_weight")) <= 5:
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

    weight=float(data.get("total_weight"))
    # Promotional Scheme Logic
    promo = frappe.get_value(
        "Item",
        "Airfreight-KG",
        [
            "enable_promotional_scheme",
            "start_date",
            "end_date",
            "discount_type",
            "percentage_amount",
            "flat_amount"
        ],
        as_dict=True
        )

    item_rate = rate  
    enable_promotional_scheme_discount = 0
    date_check = False
    is_promotional = False
    
    txn_date = data.get("datetime")

    rate = float(rate)
    # frappe.msgprint(f"Comparision Transaction Date: {start_date <= txn_date <= end_date}", alert=True)
    txn_date_type=type(data.get("datetime"))
    if promo and promo.get("enable_promotional_scheme"):
        txn_date_str = data.get("datetime")

        # Convert txn_date safely
        if isinstance(txn_date_str, datetime):
            txn_date = txn_date_str.date()
        elif isinstance(txn_date_str, date):
            txn_date = txn_date_str
        else:
            # try parsing from string
            try:
                txn_date = datetime.fromisoformat(txn_date_str).date()
            except ValueError:
                txn_date = datetime.strptime(txn_date_str, "%Y-%m-%d").date()

        # Handle promo start/end dates
        start_date = promo.get("start_date")
        end_date = promo.get("end_date")

        # Convert if needed
        if isinstance(start_date, str):
            start_date = datetime.strptime(start_date, "%Y-%m-%d").date()
        if isinstance(end_date, str):
            end_date = datetime.strptime(end_date, "%Y-%m-%d").date()

        # Now you can safely compare
        date_check = start_date <= txn_date <= end_date
        # frappe.msgprint(f"Comparison Transaction Date: {date_check}", alert=True)

        # frappe.msgprint(f"Type of Promo Start Date: {start_date_type}", alert=True)
        # frappe.msgprint(f"Promo Start Date: {start_date}", alert=True)
        # frappe.msgprint(f"Type of Promo End Date: {str(type(end_date))}", alert=True)
        # frappe.msgprint(f"Promo End Date: {end_date}", alert=True)
        # frappe.msgprint(f"Type of Transaction Date (raw): {txn_date_type}", alert=True)
        # frappe.msgprint(f"Transaction Date: {txn_date}", alert=True)
        if start_date and end_date and txn_date:
            rate = float(rate) 
            if start_date <= txn_date <= end_date:
                date_check = True
                is_promotional = True
       
            if weight > 5:
                if promo["discount_type"] == "Percentage Amount":

                    discount_percentage = float(promo["percentage_amount"] or 0)
                    enable_promotional_scheme_discount = rate * (discount_percentage / 100)
                   
                elif promo["discount_type"] == "Flat amount":
                    flat_discount = float(promo["flat_amount"] or 0)
                    enable_promotional_scheme_discount = flat_discount
                 
            else:
                item_rate = rate / 1.1
                if promo["discount_type"] == "Percentage Amount":
                    discount_percentage = float(promo["percentage_amount"] or 0)
                    enable_promotional_scheme_discount = item_rate * (discount_percentage / 100)
                    # item_rate = base_amount - enable_promotional_scheme_discount
                elif promo["discount_type"] == "Flat amount":
                    flat_discount = float(promo["flat_amount"] or 0)
                    enable_promotional_scheme_discount = flat_discount
                    # item_rate = base_amount - enable_promotional_scheme_discount
   
    # new
    # if float(data.get("total_weight")) >= 5:
    #     si.append("items", {
    #         "item_code": "Airfreight-KG",
    #         "uom": "Kg",
    #         "qty": float(data.get("total_weight")),  # qty = weight
    #         "rate": rate / float(data.get("total_weight")),  # rate per kg
    #         "amount": rate,
    #     })
    # else:
    #     si.append("items", {
    #         "item_code": "Airfreight-KG",
    #         "uom": "Kg",
    #         "qty": 1,  # qty = 1 for weight < 5
    #         "rate": rate,  # rate = total amount
    #         "amount": rate,
    #     })

    ##new######
    # weight = float(data.get("total_weight"))
    # si.append("items", {
    #     "item_code": "Airfreight-KG",
    #     "uom": "Kg",
    #     "qty": weight if weight >= 5 else 1,
    #     "rate": rate / weight if weight >= 5 else rate,
    #     "amount": rate,
    # })
    airfreight_qty = weight if weight > 5 else 1
    airfreight_rate = rate / weight if weight > 5 else (rate if not date_check else item_rate)
    if not date_check:
        si.append("items", {
            "item_code": "Airfreight-KG",
            "uom": "Kg",
            "qty": airfreight_qty,
            "rate": airfreight_rate,
            "amount": rate,
    })
    else:
       
        
        si.append("items", {
                "item_code": "Airfreight-KG",
                "uom": "Kg",
                "qty": airfreight_qty,
                "rate": airfreight_rate,
                # "amount": amount,
        })
        si.append("items", {
                "item_code": "Xmas Promo",
                "uom": "Nos",
                "qty": 1,
                "rate": - enable_promotional_scheme_discount,
                # "amount": amount,
        })
    if data.get("service_type") == "Express Air Cargo":
        express_amount = airfreight_qty * airfreight_rate
        si.append("items", {
            "item_code": "Express service Fee",
            "item_name": "Express service Fee",
            "uom": "Unit",
            "qty": 1,
            "rate": express_amount,
            "amount": express_amount,
        })
    if float(data.get("total_weight")) > 5 :
        si.append("items", {
            # "item_name": "Documentation Fee",
            "item_code": "Documentation Fee",
            "uom": "Unit",
            "qty": 1,
            "rate": 45,
            "amount": 45,
            })
        service_charge = round((rate + 45) * 0, 2)
        si.append("items", {
            # "item_name": "Documentation Fee",
            "item_code": "Service Charge",
            "uom": "Unit",
            "qty": 1,
            "rate": service_charge,
            "amount": service_charge,
            })

    if data.get("service_type") == "DG Air Cargo":
        si.append("items", {
            "item_code": "DG Service Fee",
            "item_name": "DG Service Fee",
            "uom": "Unit",
            "qty": 1,
            "rate": 200,
            "amount": 200,
        })
    if(weight <= 5):
            if(date_check):
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
    else:
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
        # si.taxes_and_charges = "GST Included - CAL PNG"
        # gst_template = frappe.get_doc("Sales Taxes and Charges Template", "GST Included - CAL PNG")
        # for tax in gst_template.taxes:
        #     si.append("taxes", {
        #         "charge_type": tax.charge_type,
        #         "account_head": tax.account_head,
        #         "description": tax.description,
        #         "rate": tax.rate,
        #         "tax_amount": tax.tax_amount,
        #         "included_in_print_rate": tax.included_in_print_rate,
        #     })
    
    si.submit()
    # frappe.db.sql("""
    #     UPDATE `tabConsignment Note`
    #     SET sales_invoice = %s
    #     WHERE name = %s
    #     """, (si.name, data.get("name"))
    #     )
    # frappe.db.commit()
    # return {"sales_invoice_name": si.name}

    frappe.db.set_value('Consignment Note', data.get("name"), 'sales_invoice', si.name)
    return {"sales_invoice_name": si.name}
