# Copyright (c) 2025, Niranjan and contributors
# For license information, please see license.txt

# import frappe
# from frappe.model.document import Document
# from frappe.utils import today

# ## add a feild name generate_manifest in Cons and Dispatch doctype
# class ConsandDispatch(Document):
# 	def validate(self):
# 		# frappe.msgprint(str(self.generate_manifest))
# 		frappe.msgprint("validate")
# 	def before_save(self):
# 		# frappe.msgprint("before_save")
# 		# if self.generate_manifest == 1:
# 		frappe.msgprint(self.workflow_state)
# 		frappe.msgprint(str(self.generate_manifest))
# 		frappe.msgprint(self.workflow_state)
# 		frappe.msgprint("before_save")
# 		if self.workflow_state == "Approved" and int(self.generate_manifest) == 1:
# 			frappe.msgprint("Manifest Orders created successfully")
# 			# doc = frappe.get_doc("Cons and Dispatch", self.name)
# 			packages_by_destination = {}
# 			processed_awbs = []

# 			# Group by destination
# 			for item in self.dispatch_item:
# 				if item.dispatch == "Yes":
# 					if item.destination not in packages_by_destination:
# 						packages_by_destination[item.destination] = []
# 					packages_by_destination[item.destination].append(item)
# 					processed_awbs.append(item.awb)

# 			# For each destination, group by airline_name
# 			for destination, items in packages_by_destination.items():
# 				packages_by_airline = {}
# 				for item in items:
# 					airline = item.airline_name or "Unknown"
# 					if airline not in packages_by_airline:
# 						packages_by_airline[airline] = []
# 					packages_by_airline[airline].append(item)
# 					# frappe.msgprint(str(packages_by_airline))
# 					# frappe.throw(f"Manifest Order created for {destination} with {len(items)} items.")

# 				for airline, airline_items in packages_by_airline.items():
# 					frappe.msgprint(f"Creating manifest for {destination} with airline {airline} and {len(airline_items)} items.")
# 					manifest_order = frappe.new_doc('Manifest Order')
# 					manifest_order.port_of_destination = destination
# 					manifest_order.airline_name = airline if airline != "Unknown" else ""
# 					manifest_order.date = today()
# 					manifest_order.workflow_state = "Manifest Generated"
# 					# manifest_order.save(ignore_permissions=True)

# 					# Set origin and branch_flag from first item
# 					first_item = airline_items[0]
# 					if first_item.origin:
# 						manifest_order.port_of_origin = first_item.origin
# 						manifest_order.branch_flag = first_item.branch_flag

# 					manifest_order.shipment_details = []
# 					total_pieces = 0
# 					total_weight = 0
# 					bag_set = set()
# 					blank_bag_flag = False

# 					for item in airline_items:
# 						pieces = item.no_of_pieces or 1
# 						weight = float(item.net_weight or 0)
# 						total_pieces += int(pieces)
# 						total_weight += weight

# 						if item.bag_no:
# 							bag_set.add(item.bag_no)
# 						else:
# 							blank_bag_flag = True

# 						manifest_order.append("shipment_details", {
# 							"cal_awb": item.awb,
# 							"bag_no": item.bag_no,
# 							"weight": item.net_weight,
# 							"length": item.length,
# 							"width": item.width,
# 							"height": item.height,
# 							"pieces_number": pieces,
# 							"remarks": item.remarks or ""
# 						})

# 					manifest_order.total_weight = round(total_weight, 2)
# 					manifest_order.total_no_of_pieces = len(bag_set) + (1 if blank_bag_flag else 0)

# 					manifest_order.insert()
# 					manifest_order.save()
# 					frappe.db.commit()

# 					# Optionally update dispatch_flag for processed AWBs
# 					# for item in airline_items:
# 					# 	frappe.db.set_value("Consignment Note", item.awb, "dispatch_flag", 1)
# 					return manifest_order.name

# 		# frappe.msgprint(str(self.generate_manifest))
# 	# def after_save(self):
# 	# 	frappe.msgprint("after_save")	
# # class ConsandDispatch(Document):
# # 	def validate(self):
# # 		pass





import frappe
from frappe.model.document import Document
from frappe.utils import today

class ConsandDispatch(Document):
    def validate(self):
        frappe.msgprint("validate")

    def before_save(self):
        frappe.msgprint(self.workflow_state)
        frappe.msgprint(str(self.generate_manifest))
        frappe.msgprint(self.workflow_state)
        frappe.msgprint("before_save")

        if self.workflow_state == "Approved" and int(self.generate_manifest) == 1:
            frappe.msgprint("Manifest Orders created successfully")
            packages_by_destination = {}
            processed_awbs = []

            for item in self.dispatch_item:
                if item.dispatch == "Yes":
                    if item.destination not in packages_by_destination:
                        packages_by_destination[item.destination] = []
                    packages_by_destination[item.destination].append(item)
                    processed_awbs.append(item.awb)

            for destination, items in packages_by_destination.items():
                packages_by_airline = {}
                for item in items:
                    airline = item.airline_name or "Unknown"
                    if airline not in packages_by_airline:
                        packages_by_airline[airline] = []
                    packages_by_airline[airline].append(item)

                for airline, airline_items in packages_by_airline.items():
                    frappe.msgprint(f"Creating manifest for {destination} with airline {airline} and {len(airline_items)} items.")

                    first_item = airline_items[0]
                    total_pieces = 0
                    total_weight = 0
                    bag_set = set()
                    blank_bag_flag = False
                    shipment_details = []

                    for item in airline_items:
                        pieces = item.no_of_pieces or 1
                        weight = float(item.net_weight or 0)
                        total_pieces += int(pieces)
                        total_weight += weight

                        if item.bag_no:
                            bag_set.add(item.bag_no)
                        else:
                            blank_bag_flag = True

                        shipment_details.append({
                            "cal_awb": item.awb,
                            "bag_no": item.bag_no,
                            "weight": item.net_weight,
                            "length": item.length,
                            "width": item.width,
                            "height": item.height,
                            "pieces_number": pieces,
                            "remarks": item.remarks or ""
                        })

                    manifest_order = frappe.get_doc({
                        'doctype': 'Manifest Order',
                        'port_of_destination': destination,
                        'airline_name': airline if airline != "Unknown" else "",
                        'date': today(),
                        'workflow_state': "Manifest Generated",
                        'port_of_origin': first_item.origin if first_item.origin else "",
                        'branch_flag': first_item.branch_flag,
                        'shipment_details': shipment_details,
                        'total_weight': round(total_weight, 2),
                        'total_no_of_pieces': len(bag_set) + (1 if blank_bag_flag else 0),
                    })

                    manifest_order.insert()
                    frappe.db.commit()

                    for i in manifest_order.shipment_details:
    	                id_cons = frappe.db.get_value('Tracking', {'consignment_note': i.cal_awb}, ['name'])
    	                if(i.cal_awb):
    	                	tracking = frappe.get_doc('Tracking',id_cons)
    	                	tracking.append('tracking_table', {
    	                		'status': manifest_order.workflow_state,
    	                		'timestamp':manifest_order.modified
    	                	})
    	                	tracking.save()

                    # Safety check before updating Consignment Note
                    for item in airline_items:
                        if item.awb:
                            frappe.db.set_value("Consignment Note", item.awb, "dispatch_flag", 1)
                        else:
                            frappe.msgprint("Warning: item.awb is None. Skipping update.")
                    

                    # return manifest_order.name
