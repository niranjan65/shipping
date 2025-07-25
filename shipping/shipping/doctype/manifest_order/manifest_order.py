# Copyright (c) 2025, Niranjan and contributors
# For license information, please see license.txt

import frappe
import json
from frappe.model.document import Document
from shipping.shipping.doctype.manifest_order.qr_code import get_qr_code

class ManifestOrder(Document):
	def onload(self):
		# href = "https://adv.anantdv.com/man"+"?id="+str(self.name)
		href = "http://159.223.77.254/man"+"?id="+str(self.name)
		self.qr_code = get_qr_code(href)
		# data = get_qr_code(href)
		# frappe.db.sql(f""" update `tabConsignment Note` set qr_code = "{data}" where name = '{self.qr_code}' ; """,as_dict = 1)
		# frappe.db.commit()


		# self.qr_code = get_qr_code(self.name)
		data = get_qr_code(href)
		if not self.qr_code:
			frappe.db.sql(f""" update `tabManifest Order` set qr_code = "{data}" where name = '{self.qr_code}' ; """,as_dict = 1)
			frappe.db.commit()
	# def validate(self):
	# 	if(self.workflow_state == "Assign For Airport Delivery"):
	# 		for i in self.shipment_details:
	# 			tracking = frappe.get_doc('Tracking',id_cons)
    # 			tracking.append('tracking_table', {
    # 				'status': doc.workflow_state,
    # 				'consignment_note': doc.name
    # 			})
    # 			tracking.save()

@frappe.whitelist()	
def update_hold_status_in_consignments(doc_data,status_check):
	if isinstance(doc_data, str):
		doc_data = json.loads(doc_data)
	manifest = frappe._dict(doc_data)
	manifest_name = manifest.get("name")
	manifest_modified = manifest.get("modified")
	# hold_status = manifest.get("is_on_hold")
	shipment_details = manifest.shipment_details
	status,notes = "" , ""
	frappe.msgprint(str(status_check))
	if(status_check== "true" or status_check==1):
		status = "On Hold"
		notes = "Shipment processing paused at "+ f"{manifest.workflow_state}" +' stage'
	else:
		status = "Hold Removed"
		notes = "Shipment processing resumed at "+ f"{manifest.workflow_state}" +' stage'
	# status = "On Hold" if hold_status else "Hold Removed"
	# notes = "Shipment processing paused at "+ f"{manifest.workflow_state}" +' stage' if hold_status else "Shipment processing resumed at "+ f"{manifest.workflow_state}" +' stage'
	for i in shipment_details:
		child = frappe._dict(i)
		awb = child.cal_awb
		id_cons = frappe.db.get_value('Tracking', {'consignment_note': awb}, ['name'])
		if(awb):
			tracking = frappe.get_doc('Tracking',id_cons)
			tracking.append('tracking_table', {
				'status': status,
				'timestamp': manifest_modified,
				'notes' : notes,
				"manifest_id" : manifest_name
			})
			tracking.save()
	return {
		"message": "Hold status updated successfully",
		"manifest_name": manifest_name,
		# "hold_status": hold_status,
		"status": status,
		"notes": notes
	}
	