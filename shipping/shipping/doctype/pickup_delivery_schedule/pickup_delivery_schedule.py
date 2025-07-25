# Copyright (c) 2025, Niranjan and contributors
# For license information, please see license.txt

import frappe
from frappe.utils import now
from frappe.model.document import Document


class PickupDeliverySchedule(Document):
	def validate(self):
		if self.consignment_id:
			id_cons = frappe.db.get_value('Tracking', {'consignment_note': self.consignment_id}, ['name'])
			if(id_cons):
				tracking = frappe.get_doc('Tracking',id_cons)
				tracking.append('tracking_table', {
    				'status': self.status,
					'timestamp':now(),
					'location': self.company_branch,
					'assigned_to': self.assigned_to
    				# 'consignment_note': self.consignment_id
    			})
				tracking.save()

		if self.manifest_id:
			# id_cons = frappe.db.get_value('Manifest Order', {'name': self.manifest_id}, ['name'])
			
			manifest_order = frappe.get_doc('Manifest Order', self.manifest_id)

			if manifest_order:
				for i in manifest_order.shipment_details:
					id_cons = frappe.db.get_value('Tracking', {'consignment_note': i.cal_awb}, ['name'])
					if(i.cal_awb):
						tracking = frappe.get_doc('Tracking',id_cons)
						tracking.append('tracking_table', {
							'status': self.status,
							'timestamp':now(),
							'location': self.company_branch,
							'assigned_to': self.assigned_to
							# 'consignment_note': self.consignment_id
						})
						tracking.save()


