# import frappe
# from frappe.model.document import Document
# from frappe.utils import today

# class ConsandDispatch(Document):
#     def before_save(self):
#         if self.workflow_state == "Draft":
#             # frappe.msgprint("Draft state detected, setting generate_manifest to 0")
#             self.generate_manifest = 1

#         if self.workflow_state == "Approved" and int(self.generate_manifest) == 1:
#             # frappe.msgprint("Manifest Orders created successfully")
#             packages_by_destination = {}
#             processed_awbs = []

#             for item in self.dispatch_item:
#                 if item.dispatch == "Yes":
#                     if item.destination not in packages_by_destination:
#                         packages_by_destination[item.destination] = []
#                     packages_by_destination[item.destination].append(item)
#                     processed_awbs.append(item.awb)

#             for destination, items in packages_by_destination.items():
#                 packages_by_airline = {}
#                 for item in items:
#                     airline = item.airline_name or "Unknown"
#                     if airline not in packages_by_airline:
#                         packages_by_airline[airline] = []
#                     packages_by_airline[airline].append(item)

#                 for airline, airline_items in packages_by_airline.items():
#                     # frappe.msgprint(f"Creating manifest for {destination} with airline {airline} and {len(airline_items)} items.")

#                     first_item = airline_items[0]
#                     total_pieces = 0
#                     total_weight = 0
#                     bag_set = set()
#                     blank_bag_flag = False
#                     shipment_details = []

#                     for item in airline_items:
#                         pieces = item.no_of_pieces or 1
#                         weight = float(item.net_weight or 0)
#                         total_pieces += int(pieces)
#                         total_weight += weight

#                         if item.bag_no:
#                             bag_set.add(item.bag_no)
#                         else:
#                             blank_bag_flag = True

#                         shipment_details.append({
#                             "cal_awb": item.awb,
#                             "bag_no": item.bag_no,
#                             "weight": item.net_weight,
#                             "length": item.length,
#                             "width": item.width,
#                             "height": item.height,
#                             "pieces_number": pieces,
#                             "remarks": item.remarks or ""
#                         })

#                     manifest_order = frappe.get_doc({
#                         'doctype': 'Manifest Order',
#                         'port_of_destination': destination,
#                         'airline_name': airline if airline != "Unknown" else "",
#                         'date': today(),
#                         'workflow_state': "Manifest Generated",
#                         'port_of_origin': first_item.origin if first_item.origin else "",
#                         'branch_flag': first_item.branch_flag,
#                         'shipment_details': shipment_details,
#                         'total_weight': round(total_weight, 2),
#                         'total_no_of_pieces': len(bag_set) + (1 if blank_bag_flag else 0),
#                         'cons_and_dispatch_no': self.name
#                     })

#                     manifest_order.insert()
#                     frappe.db.commit()

#                     for i in manifest_order.shipment_details:
#     	                id_cons = frappe.db.get_value('Tracking', {'consignment_note': i.cal_awb}, ['name'])
#     	                if(i.cal_awb):
#     	                	tracking = frappe.get_doc('Tracking',id_cons)
#     	                	tracking.append('tracking_table', {
#     	                		'status': manifest_order.workflow_state,
#     	                		'timestamp':manifest_order.modified
#     	                	})
#     	                	tracking.save()

#                     # Safety check before updating Consignment Note
#                     for item in airline_items:
#                         if item.awb:
#                             frappe.db.set_value("Consignment Note", item.awb, "dispatch_flag", 1)
#                         else:
#                             frappe.msgprint("Warning: item.awb is None. Skipping update.")
                    

#                     # return manifest_order.name

# import frappe
# from frappe.model.document import Document
# from frappe.utils import today

# class ConsandDispatch(Document):
#     def validate(self):
#         # for item in self.dispatch_item:
#         #     if item.dispatch == "Yes" and not item.airline_name:
#         #         frappe.throw(f"Airline Name is mandatory for AWB {item.awb}")

#     def before_save(self):
#         for item in self.dispatch_item:
#             if item.dispatch == "Yes" and not item.airline_name:
#                 frappe.throw(f"Airline Name is mandatory for AWB {item.awb}")
        

#         if self.workflow_state == "Approved" :
#             packages_by_destination = {}
#             processed_awbs = []

#             for item in self.dispatch_item:
#                 if item.dispatch == "Yes":
#                     if item.destination not in packages_by_destination:
#                         packages_by_destination[item.destination] = []
#                     packages_by_destination[item.destination].append(item)
#                     processed_awbs.append(item.awb)

#             for destination, items in packages_by_destination.items():
#                 packages_by_airline = {}
#                 for item in items:
#                     airline = item.airline_name or "Unknown"
#                     if airline not in packages_by_airline:
#                         packages_by_airline[airline] = []
#                     packages_by_airline[airline].append(item)

#                 for airline, airline_items in packages_by_airline.items():

#                     first_item = airline_items[0]
#                     total_pieces = 0
#                     total_weight = 0
#                     bag_set = set()
#                     # blank_bag_flag = False
#                     blank_bag_pieces = 0
#                     shipment_details = []

#                     for item in airline_items:
#                         pieces = item.no_of_pieces or 1
#                         weight = float(item.net_weight or 0)
#                         total_pieces += int(pieces)
#                         total_weight += weight

#                         if item.bag_no:
#                             bag_set.add(item.bag_no)
#                         else:
#                             blank_bag_pieces += int(pieces)
#                             # blank_bag_flag = True

#                         shipment_details.append({
#                             "cal_awb": item.awb,
#                             "bag_no": item.bag_no,
#                             "weight": item.net_weight,
#                             "length": item.length,
#                             "width": item.width,
#                             "height": item.height,
#                             "pieces_number": pieces,
#                             "remarks": item.remarks or ""
#                         })

#                     manifest_order = frappe.get_doc({
#                         'doctype': 'Manifest Order',
#                         'port_of_destination': destination,
#                         'airline_name': airline if airline != "Unknown" else "",
#                         'date': today(),
#                         'workflow_state': "Manifest Generated",
#                         'port_of_origin': first_item.origin if first_item.origin else "",
#                         'branch_flag': first_item.branch_flag,
#                         'shipment_details': shipment_details,
#                         'total_weight': round(total_weight, 2),
#                         'total_no_of_pieces': len(bag_set) + blank_bag_pieces,
#                         # 'total_no_of_pieces': len(bag_set) + (1 if blank_bag_flag else 0),
#                         'cons_and_dispatch_no': self.name
#                     })

#                     manifest_order.insert()
#                     frappe.db.commit()

#                     for i in manifest_order.shipment_details:
#     	                id_cons = frappe.db.get_value('Tracking', {'consignment_note': i.cal_awb}, ['name'])
#     	                if(i.cal_awb):
#     	                	tracking = frappe.get_doc('Tracking',id_cons)
#     	                	tracking.append('tracking_table', {
#     	                		'status': manifest_order.workflow_state,
#     	                		'timestamp':manifest_order.modified
#     	                	})
#     	                	tracking.save()

#                     # Safety check before updating Consignment Note
#                     for item in airline_items:
#                         if item.awb:
#                             frappe.db.set_value("Consignment Note", item.awb, "dispatch_flag", 1)
                    

#                     # return manifest_order.name





import frappe
from frappe.model.document import Document
from frappe.utils import today

class ConsandDispatch(Document):

    def before_save(self):
        for item in self.dispatch_item:
            if item.dispatch == "Yes" and not item.airline_name:
                frappe.throw(f"Airline Name is mandatory for AWB {item.awb}")

        if self.workflow_state == "Approved":
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
                    first_item = airline_items[0]
                    total_pieces = 0
                    total_weight = 0
                    bag_set = set()
                    # blank_bag_flag = False
                    blank_bag_pieces = 0
                    shipment_details = []

                    for item in airline_items:
                        pieces = item.no_of_pieces or 1
                        weight = float(item.net_weight or 0)
                        total_pieces += int(pieces)
                        total_weight += weight

                        if item.bag_no:
                            bag_set.add(item.bag_no)
                        else:
                            blank_bag_pieces += int(pieces)
                            # blank_bag_flag = True

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
                        'total_no_of_pieces': len(bag_set) + blank_bag_pieces,
                        # 'total_no_of_pieces': len(bag_set) + (1 if blank_bag_flag else 0),
                        'cons_and_dispatch_no': self.name
                    })

                    manifest_order.insert()
                    frappe.db.commit()

                    for i in manifest_order.shipment_details:
                        id_cons = frappe.db.get_value('Tracking', {'consignment_note': i.cal_awb}, ['name'])
                        if (i.cal_awb):
                            tracking = frappe.get_doc('Tracking', id_cons)
                            tracking.append('tracking_table', {
                                'status': manifest_order.workflow_state,
                                'timestamp': manifest_order.modified
                            })
                            tracking.save()

                    # Safety check before updating Consignment Note
                    for item in airline_items:
                        if item.awb:
                            frappe.db.set_value("Consignment Note", item.awb, "dispatch_flag", 1)

                    # return manifest_order.name
@frappe.whitelist()
def get_consignment_notes(userLocation):
    data = frappe.db.sql( f""" Select 
        name,
        origin,
        destination,
        branch_flag,
        total_weight,
        total_number_of_pieces,
        workflow_state
        FROM `tabConsignment Note` WHERE workflow_state IN ( "Verified Weight/Dimension", "Payment Received and Issued Invoice" )
        AND dispatch_flag = 0
        AND (status NOT IN ('Cancelled', 'Unconsolidation') OR status IS NULL)
        AND expected_delivery_date > "2025-10-20"
        AND origin = '{userLocation}'
        ORDER BY creation DESC;
        """,as_dict = 1 )
    return data
        