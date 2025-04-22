import frappe

# @frappe.whitelist()

# def get_cons_and_dispatch_data(date):
#     cons_dispatch = frappe.get_list("Cons and Dispatch Item",
#     filters={"dispatch":"No"},
#     fields=['name', 'origin', 'destination', 'branch_flag', 'net_weight', 'no_of_pieces', 'remarks'])



# def get_consignment_data(date):
#     result = []
#     consignment_notes = frappe.get_list("Consignment Note", 
#     filters={"datetime":date},
#     fields=["name","origin","destination","branch_flag","total_weight","total_number_of_pieces"])

