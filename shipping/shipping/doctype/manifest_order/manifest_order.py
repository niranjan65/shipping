# Copyright (c) 2025, Niranjan and contributors
# For license information, please see license.txt

import frappe
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
		frappe.db.sql(f""" update `tabManifest Order` set qr_code = "{data}" where name = '{self.qr_code}' ; """,as_dict = 1)
		frappe.db.commit()