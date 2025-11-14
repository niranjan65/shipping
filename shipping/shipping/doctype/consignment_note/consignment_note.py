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
from datetime import datetime, timedelta

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


        # if self.workflow_state == "Picked Up from Airport":
        #     pickup_delivery_schedule = frappe.get_all(
        #         "Pickup-Delivery Schedule",
        #         filters={"status": "Dropped Of At Destination Cal Office", "name": self.name},
        #         fields=["name"]
        #     )
        #     if not pickup_delivery_schedule:
        #         self.reload()
        #         frappe.throw("Please refresh the page and create a Pickup Schedule before proceeding")

        # if self.workflow_state == "Delivery Scheduled":
        #     pickup_delivery_schedule = frappe.get_all(
        #         "Pickup-Delivery Schedule",
        #         filters={"status": "Delivery Scheduled", "consignment_id": self.name},
        #         fields=["name"]
        #     )
        #     if not pickup_delivery_schedule:
        #         self.reload()
        #         frappe.throw("Please refresh the page and create a Pickup Schedule before proceeding")

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

    def before_workflow_action(self, action):
        if self.workflow_state == "Dropped off at Cal Office" and action == "Verify Weight/Dimension":
            if not self.expected_delivery_date or not self.check_shipment_details:
                frappe.throw("You must set <b>Expected Delivery Date</b> and <b>Check Shipment Details</b> before performing this transition.")




# //////////////////////////////Debjit Dashboard Cards////////////////////////////////////////////

@frappe.whitelist()
def get_total_consignment_notes_created():
    """Total number of Consignment Notes created (all time)"""
    return frappe.db.count('Consignment Note')

@frappe.whitelist()
def get_consignment_notes_created_last_week():
    """Number of Consignment Notes created in the last 7 days"""
    today = datetime.today().date()
    start_week = today - timedelta(days=7)
    return frappe.db.count('Consignment Note', filters={'creation': ['>=', start_week]})

@frappe.whitelist()
def get_consignment_notes_created_last_30_days():
    """Number of Consignment Notes created in the last 30 days"""
    today = datetime.today().date()
    start_30_days = today - timedelta(days=30)
    return frappe.db.count('Consignment Note', filters={'creation': ['>=', start_30_days]})

    
@frappe.whitelist()
def get_consignment_total_value():
    total_value = frappe.db.sql("""
        SELECT SUM(value_of_shipment) AS total FROM `tabConsignment Note`
    """, as_dict=True)[0].get('total', 0) or 0
    return total_value


@frappe.whitelist()
def get_consignment_weekly_value():
    from datetime import datetime, timedelta
    today = datetime.today().date()
    start_of_week = today - timedelta(days=today.weekday())
    weekly_value = frappe.db.sql("""
        SELECT SUM(value_of_shipment) AS total FROM `tabConsignment Note`
        WHERE `datetime` >= %s
    """, (start_of_week,), as_dict=True)[0].get('total', 0) or 0
    return weekly_value


@frappe.whitelist()
def get_consignment_monthly_value():
    from datetime import datetime
    today = datetime.today().date()
    start_of_month = today.replace(day=1)
    monthly_value = frappe.db.sql("""
        SELECT SUM(value_of_shipment) AS total FROM `tabConsignment Note`
        WHERE `datetime` >= %s
    """, (start_of_month,), as_dict=True)[0].get('total', 0) or 0
    return monthly_value


# # ////////////////////////////for workflow_state/////////////////////////////////////

# Shipment Drafted
@frappe.whitelist()
def get_count_shipment_drafted():
    return frappe.db.count('Consignment Note', {'workflow_state': 'Shipment Drafted'})

# Shipment Accepted
@frappe.whitelist()
def get_count_shipment_accepted():
    return frappe.db.count('Consignment Note', {'workflow_state': 'Shipment Accepted'})

# Shipment Rejected
@frappe.whitelist()
def get_count_shipment_rejected():
    return frappe.db.count('Consignment Note', {'workflow_state': 'Shipment Rejected'})

# Assigned for Pickup
@frappe.whitelist()
def get_count_assigned_for_pickup():
    return frappe.db.count('Consignment Note', {'workflow_state': 'Assigned for Pickup'})

# Picked up from customer
@frappe.whitelist()
def get_count_picked_up_from_customer():
    return frappe.db.count('Consignment Note', {'workflow_state': 'Picked up from customer'})

# Dropped off at Cal Office
@frappe.whitelist()
def get_count_dropped_off_at_cal_office():
    return frappe.db.count('Consignment Note', {'workflow_state': 'Dropped off at Cal Office'})

# Verified Weight/Dimension
@frappe.whitelist()
def get_count_verified_weight_dimension():
    return frappe.db.count('Consignment Note', {'workflow_state': 'Verified Weight/Dimension'})

# Picked Up from Airport
@frappe.whitelist()
def get_count_picked_up_from_airport():
    return frappe.db.count('Consignment Note', {'workflow_state': 'Picked Up from Airport'})

# Dropped Of At Destination Cal Office
@frappe.whitelist()
def get_count_dropped_at_destination_office():
    return frappe.db.count('Consignment Note', {'workflow_state': 'Dropped Of At Destination Cal Office'})

# Out For Delivery
@frappe.whitelist()
def get_count_out_for_delivery():
    return frappe.db.count('Consignment Note', {'workflow_state': 'Out For Delivery'})

# Delivered To Customer
@frappe.whitelist()
def get_count_delivered_to_customer():
    return frappe.db.count('Consignment Note', {'workflow_state': 'Delivered To Customer'})

# Invoice Generated
@frappe.whitelist()
def get_count_invoice_generated():
    return frappe.db.count('Consignment Note', {'workflow_state': 'Invoice Generated'})

# Payment Received and Issued Invoice
@frappe.whitelist()
def get_count_payment_received_issued_invoice():
    return frappe.db.count('Consignment Note', {'workflow_state': 'Payment Received and Issued Invoice'})

# POD Confirmed
@frappe.whitelist()
def get_count_pod_confirmed():
    return frappe.db.count('Consignment Note', {'workflow_state': 'POD Confirmed'})



# ////////////////////////Customer count////////////////////


@frappe.whitelist()
def get_monthly_unique_cash_customers():
    """Count unique Cash customers in Consignment Note for the last 30 days."""
    today = datetime.today().date()
    start_date = today - timedelta(days=30)

    count = frappe.db.sql("""
        SELECT COUNT(DISTINCT customer_name) AS total
        FROM `tabConsignment Note`
        WHERE customer_type = 'Cash'
          AND `datetime` >= %s
    """, (start_date,), as_dict=True)[0].get("total", 0) or 0

    return count


@frappe.whitelist()
def get_monthly_unique_corporate_customers():
    """Count unique Corporate customers in Consignment Note for the last 30 days."""
    today = datetime.today().date()
    start_date = today - timedelta(days=30)

    count = frappe.db.sql("""
        SELECT COUNT(DISTINCT customer_name) AS total
        FROM `tabConsignment Note`
        WHERE customer_type = 'Corporate'
          AND `datetime` >= %s
    """, (start_date,), as_dict=True)[0].get("total", 0) or 0

    return count



@frappe.whitelist()
def get_mtd_total_cash_bookings():
    """Month-to-date total Cash customer bookings (count each booking)."""
    today = datetime.today().date()
    start_of_month = today.replace(day=1)

    count = frappe.db.sql("""
        SELECT COUNT(*) AS total
        FROM `tabConsignment Note`
        WHERE customer_type = 'Cash'
          AND `datetime` >= %s
    """, (start_of_month,), as_dict=True)[0].get("total", 0) or 0

    return count


@frappe.whitelist()
def get_mtd_total_corporate_bookings():
    """Month-to-date total Corporate customer bookings (count each booking)."""
    today = datetime.today().date()
    start_of_month = today.replace(day=1)

    count = frappe.db.sql("""
        SELECT COUNT(*) AS total
        FROM `tabConsignment Note`
        WHERE customer_type = 'Corporate'
          AND `datetime` >= %s
    """, (start_of_month,), as_dict=True)[0].get("total", 0) or 0

    return count


# /////////////////////////sales invoice amounts////////////////////
import frappe

@frappe.whitelist()
def get_total_invoice_amount_till_date():
    """Sum of total invoiced amount (grand_total) from all submitted Sales Invoices."""
    total = frappe.db.sql("""
        SELECT SUM(grand_total) AS total
        FROM `tabSales Invoice`
        WHERE docstatus = 1
    """, as_dict=True)[0].get("total", 0) or 0
    return total


@frappe.whitelist()
def get_total_outstanding_amount_till_date():
    """Sum of outstanding amount from all submitted Sales Invoices."""
    total = frappe.db.sql("""
        SELECT SUM(outstanding_amount) AS total
        FROM `tabSales Invoice`
        WHERE docstatus = 1
    """, as_dict=True)[0].get("total", 0) or 0
    return total


@frappe.whitelist()
def get_total_receipt_amount_till_date():
    """
    Sum of all received payments applied to Sales Invoices.
    This uses Payment Entry linked to Sales Invoices 
    and sums paid amounts from submitted payments.
    """
    total = frappe.db.sql("""
        SELECT SUM(pe.paid_amount) AS total
        FROM `tabPayment Entry` pe
        INNER JOIN `tabPayment Entry Reference` per ON pe.name = per.parent
        WHERE pe.docstatus = 1
          AND per.reference_doctype = 'Sales Invoice'
    """, as_dict=True)[0].get("total", 0) or 0
    return total
# /////////////////////////////manifest order workflow state////////////////////////

@frappe.whitelist()
def get_count_manifest_generated():
    return frappe.db.count('Manifest Order', {'workflow_state': 'Manifest Generated'})

@frappe.whitelist()
def get_count_assigned_for_airport_delivery():
    return frappe.db.count('Manifest Order', {'workflow_state': 'Assigned For Airport Delivery'})

@frappe.whitelist()
def get_count_delivered_to_origin_airport():
    return frappe.db.count('Manifest Order', {'workflow_state': 'Delivered to Origin Airport'})

@frappe.whitelist()
def get_count_uplifted():
    return frappe.db.count('Manifest Order', {'workflow_state': 'Uplifted'})

@frappe.whitelist()
def get_count_arrived_at_destination_airport():
    return frappe.db.count('Manifest Order', {'workflow_state': 'Arrived at Destination Airport'})


# # /////////////////////////Debjit Dashboard Cards End///////////////////////////
