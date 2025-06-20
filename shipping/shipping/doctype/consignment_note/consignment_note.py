# # Copyright (c) 2025, Niranjan and contributors
# # For license information, please see license.txt

import frappe
from frappe.model.document import Document
from shipping.shipping.doctype.consignment_note.qr_code import get_qr_code


class ConsignmentNote(Document):

	def validate(self):
		data = frappe.db.get_list("Branch")
		for branch in data:
			if self.destination == branch.name:
				self.branch_flag = 1
		

		if(self.origin and self.destination):
			origin_dest_code = frappe.db.get_value(
			    "Origin Destination Map",
			    {"origin": self.origin , "destination": self.destination},
			    "code"
			)
			if(origin_dest_code):
				pass
			else:
			    frappe.throw('This Origin and Destinantion dose not exist in Origin Destination Map')
				# frappe.db.set_value("branch_flag", 1) 



	# def onload(self):
	# 	# current_state = self.workflow_state
	# 	# next_state = self.get_next_workflow_state(current_state)
	# 	# href = "https://adv.anantdv.com/log"+"?id="+str(self.name)
	# 	href = "http://159.223.77.254/log"+"?id="+str(self.name)
	# 	self.qr_code = get_qr_code(href)
	# 	data = get_qr_code(href)
	# 	frappe.db.sql(f""" update `tabConsignment Note` set qr_code = "{data}" where name = '{self.qr_code}' ; """,as_dict = 1)
	# 	frappe.db.commit()

	def validate(self):
		href = "https://adv.anantdv.com/log" + "?id=" + str(self.name)
		data = get_qr_code(href)
		self.qr_code = data
		frappe.db.set_value("Consignment Note", self.name, "qr_code", data)
		frappe.db.commit()


	# def get_next_workflow_state(self, current_state):
    #     workflow_states = frappe.get_all("Workflow State", fields=["name", "state"])
        
    #     workflow_transitions = {
    #         "Draft": "Submitted",
    #         "Submitted": "Approved",
    #         "Approved": "Completed",
    #     }
    #     return workflow_transitions.get(current_state, "Unknown")

# import frappe
# from frappe.model.document import Document
# import random
# import string
# bench --site erp.cal-png.com --build shipping 
# class ConsignmentNote(Document):
#     def before_insert(self):
#         # Generate a unique 12-character alphanumeric tracking ID
#         self.tracking_id = self.generate_tracking_id()

#     @staticmethod
#     def generate_tracking_id():
#         """Generate a 12-character alphanumeric tracking ID."""
#         characters = string.ascii_uppercase + string.digits  # A-Z, 0-9
#         return ''.join(random.choices(characters, k=12))
