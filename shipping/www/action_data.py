# import frappe
import frappe
from frappe import _

@frappe.whitelist(allow_guest=True)
def get_workflow_state(consignment_note_id):
    current_state = frappe.db.get_value("Consignment Note", consignment_note_id, "workflow_state")
    customer_name = frappe.db.get_value("Consignment Note", consignment_note_id, "customer_name")
    if not current_state:
        return {"error": "No workflow state found"}

    transitions = frappe.get_all(
        "Workflow Transition",
        filters={"parent": "Consignment Note Workflow", "state": current_state},
        fields=["action", "next_state"]
    )

    return {
        "current_state": current_state,
        "next_states": [t["next_state"] for t in transitions],
        "actions": [t["action"] for t in transitions],
        "customer_name": customer_name
    }





@frappe.whitelist()
def update_workflow_state(consignment_note_id, new_state,location):
    try:
        if not consignment_note_id or not new_state:
            return {"status": "error", "message": _("Missing required parameters")}

        consignment_note = frappe.get_doc("Consignment Note", consignment_note_id)

        if not consignment_note:
            return {"status": "error", "message": _("Consignment Note not found")}

        max_length = frappe.get_meta("Consignment Note").get_field("workflow_state").length or 14000000
        truncated_state = new_state[:max_length]

        # consignment_note.workflow_state = truncated_state
        consignment_note.workflow_state = truncated_state
        consignment_note.append("tracking_table", {
            "status": new_state,
            "location": location,
            "timestamp": frappe.utils.now()
        })
        consignment_note.save(ignore_permissions=True)
        frappe.db.commit()

        return {"status": "success", "message": _("Workflow state updated successfully")}

    except Exception as e:
        frappe.log_error(f"Workflow Update Error: {str(e)}", "update_workflow_state")
        return {"status": "error", "message": str(e)}






@frappe.whitelist(allow_guest=True)
def get_workflow_state_man(manifest_order_id):
    current_state = frappe.db.get_value("Manifest Order", manifest_order_id, "workflow_state")
    # customer_name = frappe.db.get_value("Manifest Order", manifest_order_id, "customer_name")
    if not current_state:
        return {"error": "No workflow state found"}

    # current_state = frappe.db.get_value("Consignment Note", consignment_note_id, "workflow_state")
    # customer_name = frappe.db.get_value("Consignment Note", consignment_note_id, "customer_name")
    # if not current_state:
    #     return {"error": "No workflow state found"}

    transitions = frappe.get_all(
        "Workflow Transition",
        filters={"parent": "Manifest Order", "state": current_state},
        fields=["action", "next_state"]
    )

    return {
        "current_state": current_state,
        "next_states": [t["next_state"] for t in transitions],
        "actions": [t["action"] for t in transitions],
        # "customer_name": customer_name
    }


# @frappe.whitelist()
# def update_workflow_state_man(consignment_note_id, new_state):
#     if(not consignment_note_id or not new_state):
#         return {"status": "error", "message": _("Missing required parameters")} 
#     else:
#         Manifest_order = frappe.get_doc("Manifest Order", consignment_note_id)
#         if not Manifest_order:
#             return {"status": "error", "message": _("Manifest Order not found")}
#         max_length = frappe.get_meta("Manifest Order").get_field("workflow_state").length or 14000000
#         truncated_state = new_state[:max_length]
#         Manifest_order.workflow_state = truncated_state
#         if Manifest_order:
#             child = Manifest_order.shipment_details
#             for i in child:
#                 if i.cal_awb:
#                     Manifest_order_data = frappe.get_doc("Consignment Note", consignment_note_id)
#                     Manifest_order_data.append("tracking_table", {
#                         "status": new_state,
#                         # "location": location,
#                         "timestamp": frappe.utils.now()
#                     })
#                     Manifest_order_data.save(ignore_permissions=True)
#                     frappe.db.commit()
#         Manifest_order.save(ignore_permissions=True)
#         return {"status": "success", "message": _("Workflow state updated successfully")}
    #     else:      
    # try:
    #     if not consignment_note_id or not new_state:
    #         return {"status": "error", "message": _("Missing required parameters")}

    #     consignment_note = frappe.get_doc("Manifest Order", consignment_note_id)

        # if consignment_note:
        #     max_length = frappe.get_meta("Manifest Order").get_field("workflow_state").length or 14000000
        #     truncated_state = new_state[:max_length]
        #     child = consignment_note.shipment_details
        #     for i in child:
        #         if i.cal_awb:
        #             consignment_note_data = frappe.get_doc("Consignment Note", consignment_note_id)
        #             consignment_note_data.append("tracking_table", {
        #                 "status": new_state,
        #                 # "location": location,
        #                 "timestamp": frappe.utils.now()
        #             })
        #             consignment_note_data.save(ignore_permissions=True)
        #             frappe.db.commit()
        #     consignment_note.save(ignore_permissions=True)
        #     frappe.db.commit()

    #         return {"status": "success", "message": _("Workflow state updated successfully")}
    #     else:
    #         return {"status": "error", "message": _("Manifest Order not found")}
    # except Exception as e:
    #     frappe.log_error(f"Workflow Update Error: {str(e)}", "update_workflow_state")
    #     return {"status": "error", "message": str(e)}

@frappe.whitelist()
def update_workflow_state_man(consignment_note_id, new_state):
    if not consignment_note_id or not new_state:
        return {"status": "error", "message": _("Missing required parameters")}

    try:
        # Fetch the Manifest Order document
        manifest_order = frappe.get_doc("Manifest Order", consignment_note_id)

        # Ensure that the field length does not exceed the limit
        max_length = frappe.get_meta("Manifest Order").get_field("workflow_state").length or 14000000
        truncated_state = new_state[:max_length]
        manifest_order.workflow_state = truncated_state

        # Iterate through the child table `shipment_details`
        for child in manifest_order.get("shipment_details"):
            if child.cal_awb:
                # Fetch the related Consignment Note document using `child.cal_awb`
                consignment_note = frappe.get_value("Consignment Note", {"name": child.cal_awb}, "name")
                
                if consignment_note:
                    consignment_note_doc = frappe.get_doc("Consignment Note", consignment_note)
                    consignment_note_doc.append("tracking_table", {
                        "status": new_state,
                        # "location": location,  # Uncomment if you have this data
                        "timestamp": frappe.utils.now()
                    })
                    consignment_note_doc.save(ignore_permissions=True)
                    frappe.db.commit()

        # Save the parent document
        manifest_order.save(ignore_permissions=True)
        return {"status": "success", "message": _("Workflow state updated successfully")}

    except frappe.DoesNotExistError:
        return {"status": "error", "message": _("Manifest Order not found")}
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), "update_workflow_state_man")
        return {"status": "error", "message": str(e)}
