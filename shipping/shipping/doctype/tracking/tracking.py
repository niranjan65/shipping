# Copyright (c) 2025, Niranjan and contributors
# For license information, please see license.txt

import frappe
from frappe.utils import now
from frappe.model.document import Document


class Tracking(Document):
	def validate(self):
		statuses = set()
		unique_entries = []

		for entry in self.tracking_table:
			if entry.status == "On Hold" or entry.status == "Hold Removed":
				unique_entries.append(entry)
				continue
			if entry.status not in statuses:
				statuses.add(entry.status)
				unique_entries.append(entry)
				
		self.tracking_table = unique_entries
		



@frappe.whitelist(allow_guest=True)
def update_tracking(status, consignment_note=None):
	if consignment_note:
		"if consignment_note exists in the Consignment Note List",
		consignment_note_doc = frappe.get_all(
			"Consignment Note",
			fields=["name"],
			filters={"name": consignment_note},
			order_by="creation desc",
			limit=1
		)
		if len(consignment_note_doc) > 0:
			tracking = frappe.get_doc({'doctype': 'Tracking',
			'tracking_table': [
            {
                'status': status,
				'timestamp':now(),
                'consignment_note': consignment_note
            },
        ]})

		tracking.insert()
		return tracking.name
