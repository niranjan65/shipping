# # # Copyright (c) 2025, Niranjan and contributors
# # # For license information, please see license.txt

# import frappe
# from frappe.model.document import Document
# from shipping.shipping.doctype.consignment_note.qr_code import get_qr_code
# from shipping.shipping.doctype.consignment_note.standardprintqr import consignment_qr
# from urllib.parse import quote

# class ConsignmentNote(Document):

# 	def before_save(self):
# 		if self.workflow_state == "Picked up from customer":
# 			pickup_delivery_schedule = frappe.get_all(
# 				"Pickup-Delivery Schedule",
# 				filters={"consignment_id": self.name},
# 				fields=["consignment_id"]
# 			)
# 			if not pickup_delivery_schedule:
# 				frappe.throw("Please refresh the page and assign a pickup data before proceeding.")
# 				self.reload()

# 	def validate(self):
		
# 			# return tracking.name

# 		data = frappe.db.get_list("Branch")
# 		for branch in data:
# 			if self.destination == branch.name:
# 				self.branch_flag = 1
		

# 		if(self.origin and self.destination):
# 			origin_dest_code = frappe.db.get_value(
# 			    "Origin Destination Map",
# 			    {"origin": self.origin , "destination": self.destination},
# 			    "code"
# 			)
# 			if(origin_dest_code):
# 				pass
# 			else:
# 			    frappe.throw('This Origin and Destinantion dose not exist in Origin Destination Map')
# 				# frappe.db.set_value("branch_flag", 1)


# 	# def onload(self):
# 	# 	# current_state = self.workflow_state
# 	# 	# next_state = self.get_next_workflow_state(current_state)
# 	# 	# href = "https://adv.anantdv.com/log"+"?id="+str(self.name)
# 	# 	href = "http://159.223.77.254/log"+"?id="+str(self.name)
# 	# 	self.qr_code = get_qr_code(href)
# 	# 	data = get_qr_code(href)
# 	# 	frappe.db.sql(f""" update `tabConsignment Note` set qr_code = "{data}" where name = '{self.qr_code}' ; """,as_dict = 1)
# 	# 	frappe.db.commit()

# 	def onload(self):
# 		# href = "https://adv.anantdv.com/log" + "?id=" + str(self.name)
# 		url = frappe.utils.get_url()
# 		href = url + "/log" + "?id=" + str(self.name)
# 		# href1 = "http://182.71.135.110:8888/app/print/Consignment%20Note/" + str(self.name)
# 		redirect_url = "/printview?doctype=Consignment Note&name={}&trigger_print=1&format=Consignment Note New Standard&no_letterhead=1&letterhead=No Letterhead&settings=%7B%7D&_lang=en".format(self.name)
# 		encoded_redirect_url = quote(redirect_url, safe='')
# 		# href1 = "http://182.71.135.110:8888/printview?doctype=Consignment%20Note&name=" + str(self.name) + "&trigger_print=1&format=Consignment%20Note%20New%20Standard&no_letterhead=1&letterhead=No%20Letterhead&settings=%7B%7D&_lang=en"
# 		href1 = url + "/login?redirect-to=" + encoded_redirect_url
# 		data = get_qr_code(href)
# 		data1 = get_qr_code(href1)
# 		self.qr_code = data
# 		self.print_qr_code = data1
# 		frappe.db.set_value("Consignment Note", self.name, "qr_code", data)
# 		frappe.db.set_value("Consignment Note", self.name, "print_qr_code", data1)
# 		frappe.db.commit()
# 		# consignment_qr(self, "Consignment Note")
# 	# def before_save(self):
# 	# 	# self.save()
# 	# 	frappe.msgprint("Before Save Triggered")

# 	# def get_next_workflow_state(self, current_state):
#     #     workflow_states = frappe.get_all("Workflow State", fields=["name", "state"])
        
#     #     workflow_transitions = {
#     #         "Draft": "Submitted",
#     #         "Submitted": "Approved",
#     #         "Approved": "Completed",
#     #     }
#     #     return workflow_transitions.get(current_state, "Unknown")

# # import frappe
# # from frappe.model.document import Document
# # import random
# # import string
# # bench --site erp.cal-png.com --build shipping 
# # class ConsignmentNote(Document):
# #     def before_insert(self):
# #         # Generate a unique 12-character alphanumeric tracking ID
# #         self.tracking_id = self.generate_tracking_id()

# #     @staticmethod
# #     def generate_tracking_id():
# #         """Generate a 12-character alphanumeric tracking ID."""
# #         characters = string.ascii_uppercase + string.digits  # A-Z, 0-9
# #         return ''.join(random.choices(characters, k=12))

















# Copyright (c) 2025, Niranjan and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from shipping.shipping.doctype.consignment_note.qr_code import get_qr_code
from urllib.parse import quote

class ConsignmentNote(Document):

    def before_save(self):
        if not self.qr_code or not self.print_qr_code:
            url = frappe.utils.get_url()
            
            # QR code for tracking log
            log_href = f"{url}/log?id={self.name}"
            self.qr_code = get_qr_code(log_href)

            # QR code for printing
            redirect_url = f"/printview?doctype=Consignment%20Note&name={self.name}&trigger_print=1&format=Consignment%20Note%20New%20Standard&no_letterhead=1"
            encoded_redirect_url = quote(redirect_url, safe='')
            print_href = f"{url}/login?redirect-to={encoded_redirect_url}"
            self.print_qr_code = get_qr_code(print_href)

        if self.workflow_state == "Picked up from customer":
            pickup_delivery_schedule = frappe.get_all(
                "Pickup-Delivery Schedule",
                filters={"consignment_id": self.name},
                fields=["name"]
            )
            if not pickup_delivery_schedule:
                frappe.throw("Please refresh the page and create a Pickup Schedule before proceeding.")

    def validate(self):
        self.branch_flag = 0
        branches = frappe.get_all("Branch", fields=["name"])
        for branch in branches:
            if self.destination == branch.name:
                self.branch_flag = 1
                break

        # Validate origin and destination map
        if self.origin and self.destination:
            if not frappe.db.exists("Origin Destination Map", {"origin": self.origin, "destination": self.destination}):
                frappe.throw('This Origin and Destination combination does not exist in the "Origin Destination Map".')


