frappe.ui.form.on('Consignment Note', {
    customer_name: function (frm) {
        frm.set_value('payers_name', frm.doc.customer_name);
        console.log(frm.doc.customer_name);
        console.log(frm.doc.payers_name);
         frm.set_value('shipping_company_name', frm.doc.customer_name);
    },
    origin_branch: function (frm) {
        if (frm.doc.origin_branch == frm.doc.destination_branch) {
            frm.set_value('origin_branch', "");
            frm.set_value('origin_address', "");
            frappe.throw("Origin Branch and Destination Branch can't be the same");
        }
    },
    destination_branch: function (frm) {
        if (frm.doc.origin_branch == frm.doc.destination_branch) {
            frm.set_value('destination_branch', "");
            frm.set_value('destination_address', "");
            frappe.throw("Origin Branch and Destination Branch can't be the same");
        }
    },

    expected_delivery_date: function(frm) {
        if (frm.doc.expected_delivery_date && frm.doc.datetime && frm.doc.expected_delivery_date < frm.doc.datetime) {
            frappe.throw(__('Expected Date cannot be earlier than Date'));
            // frm.set_value('expected_delivery_date', '');
        }
    },

    origin_address: function(frm) {
        if (frm.doc.origin_address) {
            frappe.call({
                method: "frappe.client.get",
                args: {
                    doctype: "Address",
                    name: frm.doc.origin_address
                },
                callback: function(r) {
                    if (r.message) {
                        let addr = r.message;
                         console.log(r.message);
                        frm.set_value('address', addr.address_line1 || '');                        
                        frm.set_value('shipping_post_code', addr.pincode || '');
                        frm.set_value('shipper_email', addr.email_id || '');
                         frm.set_value('contact_number', addr.phone || '');
                     frappe.call({
                        method: "frappe.client.get_list",
                        args: {
                            doctype: "Contact",
                            filters: {
                                address: frm.doc.origin_address
                            },
                            fields: ["name"],
                            limit_page_length: 1
                        },
                        callback: function(res) {
                            console.log(res.message);
                            if (res.message && res.message.length > 0) {
                                frm.set_value("contact_name", res.message[0].name || '');
                                // frm.set_value("shipper_email", res.message[0].email_id || '');
                            } else {
                                frm.set_value("contact_name", "");
                                // frm.set_value("shipper_email",  "");
                            }
                        }
                    });

                    }
                }
            });
        } else {           
            frm.set_value('address', '');         
            frm.set_value('shipping_post_code', '');
            frm.set_value('shipper_email',  '');
            frm.set_value('contact_number', '');


        }
    },

    destination_address: function(frm) {
        if (frm.doc.destination_address) {
            frappe.call({
                method: "frappe.client.get",
                args: {
                    doctype: "Address",
                    name: frm.doc.destination_address
                },
                callback: function(r) {
                    if (r.message) {
                        let addr = r.message;
                        frm.set_value('receivers_address', addr.address_line1 || '');                        
                        frm.set_value('receiving_post_code', addr.pincode || '');
                        frm.set_value('receiver_email', addr.email_id || '');
                        frm.set_value('receiver_contact_number', addr.phone || '');

                        frappe.call({
                        method: "frappe.client.get_list",
                        args: {
                            doctype: "Contact",
                            filters: {
                                address: frm.doc.destination_address
                            },
                            fields: ["name"],
                            limit_page_length: 1
                        },
                        callback: function(res) {
                            console.log(res.message);
                            if (res.message && res.message.length > 0) {
                                frm.set_value("receiver_contact_name", res.message[0].name);
                            } else {
                                frm.set_value("receiver_contact_name", "");
                            }
                        }
                    });
                    }
                }
            });
        } else {           
            frm.set_value('receivers_address', '');         
            frm.set_value('receiving_post_code', '');
            frm.set_value('receiver_email','');
             frm.set_value('receiver_contact_number', '');
        }
    },
    setup: function (frm) {
        frm.calculate_total_weight = function () {
            let totalWeight = 0;
            let totalVolume = 0;
            let totalPieces = 0;
        
            frm.doc.check_shipment_details.forEach(d => {
                const pieceWeight = parseFloat(d.piece_weight_kg) || 0;
                const pieces = parseInt(d.pieces_no) || 0;
                const length = parseFloat(d.lengthcm) || 0;
                const width = parseFloat(d.widthcm) || 0;
                const height = parseFloat(d.heightcm) || 0;
        
                totalWeight += pieceWeight * pieces;
                totalVolume += (length * width * height * pieces) / 6000;
                totalPieces += pieces;
            });
        
            const finalWeight = Math.max(totalWeight, totalVolume);
        
            frm.set_value('total_weight', parseFloat(finalWeight).toFixed(2));
            console.log("Pura Weight", frm.doc.total_weight)
            frm.set_value('total_number_of_pieces', totalPieces);
        };
        

        frm.generate_tracking_id = function () {
            if (!frm.doc.tracking_id) {
                const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
                let trackingNumber = '';

                for (let i = 0; i < 12; i++) {
                    const randomIndex = Math.floor(Math.random() * characters.length);
                    trackingNumber += characters[randomIndex];
                }

                frm.set_value('tracking_id', trackingNumber);
                frm.set_df_property('tracking_id', 'read_only', 1);
            }
        };
        
        // Flag to track dialog display for each workflow state - defined at setup to persist
        frm.pickup_dialog_displayed = false;
        frm.airport_dialog_displayed = false;
        frm.delivery_dialog_displayed = false;
        
        // Check localStorage to see if we've already marked this consignment as having schedules
        const pickupStored = localStorage.getItem(`pickup_scheduled_${frm.doc.name}`);
        const airportStored = localStorage.getItem(`airport_scheduled_${frm.doc.name}`);
        const deliveryStored = localStorage.getItem(`delivery_scheduled_${frm.doc.name}`);
        
        frm.pickup_scheduled = pickupStored === 'true';
        frm.airport_scheduled = airportStored === 'true';
        frm.delivery_scheduled = deliveryStored === 'true';
    },
    onload: function (frm) {
        console.log("ONLOAD............");

        // Check if document is new and "Shipment Drafted" entry doesn't exist
        if (frm.is_new()) {
            let shipmentDraftedExists = false;

            if (frm.doc.tracking_table && frm.doc.tracking_table.length > 0) {
                shipmentDraftedExists = frm.doc.tracking_table.some(function (row) {
                    return row.status === "Shipment Drafted";
                });
            }

            if (!shipmentDraftedExists) {
                // add_tracking_entry_without_save(frm, "Shipment Drafted");
                
            }
        }
        
        // Check if schedule has already been created for the current workflow state
        if (!frm.is_new()) {
            if (frm.doc.workflow_state === "Assigned for Pickup") {
                check_if_schedule_exists(frm, "Assigned for Pickup");
            } 
            else if (frm.doc.workflow_state === "Picked Up from Airport") {
                check_if_schedule_exists(frm, "Picked Up from Airport");
            }
            else if (frm.doc.workflow_state === "Delivery Scheduled") {
                check_if_schedule_exists(frm, "Delivery Scheduled");
            }
        }
    },

    workflow_state: function (frm) {
        console.log("Workflow state changed to:", frm.doc.workflow_state);
        
        // Reset specific flags when workflow state changes
        if (frm.doc.workflow_state === "Assigned for Pickup") {
            frm.pickup_dialog_displayed = false;
            frm.pickup_scheduled = false;
            localStorage.removeItem(`pickup_scheduled_${frm.doc.name}`);
            
            // Use setTimeout to ensure workflow state change is fully processed before showing dialog
            setTimeout(function() {
                console.log("Delayed check for schedule after workflow state change");
                check_if_schedule_exists(frm, "Assigned for Pickup");
            }, 500);
        } 
        else if (frm.doc.workflow_state === "Picked Up from Airport") {
            frm.airport_dialog_displayed = false;
            frm.airport_scheduled = false;
            localStorage.removeItem(`airport_scheduled_${frm.doc.name}`);
            
            // Use setTimeout for this state too
            setTimeout(function() {
                check_if_schedule_exists(frm, "Picked Up from Airport");
            }, 500);
        }
        else if (frm.doc.workflow_state === "Delivery Scheduled") {
            frm.delivery_dialog_displayed = false;
            frm.delivery_scheduled = false;
            localStorage.removeItem(`delivery_scheduled_${frm.doc.name}`);
            
            // Use setTimeout for this state too
            setTimeout(function() {
                check_if_schedule_exists(frm, "Delivery Scheduled");
            }, 500);
        }
        else {
            // For other states, update tracking as before
            if(cur_frm.doc.__unsaved){
                update_tracking_based_on_workflow(frm);
            }
            
        }

        
    },

    recheck_shipment_details: function (frm) {
        frm.generate_tracking_id();
    },

    origin: function (frm) {
        frm.set_query('origin_branch', () => {
            return {
                filters: {
                    location: frm.doc.origin,
                    customer_name: frm.doc.customer_name
                }
            }
        });
    
        frm.set_query('origin_address', () => {
            return {
                filters: {
                    city: frm.doc.origin
                }
            }
        });
    
        frm.set_value('shipping_city', frm.doc.origin);
    
        frappe.call({
            method: "frappe.client.get_list",
            args: {
                doctype: "Customer Branch",
                filters: {
                    location: frm.doc.origin,
                    customer_name: frm.doc.customer_name
                },
                fieldname: ['*']
            },
            callback: function(r) {
                console.log("Calling Branch", r);
                console.log("Calling form data", frm);
                
                if (frm.doc.customer_type === "Cash") {
                    frm.set_df_property('origin_branch', 'hidden', 1);
                    frm.set_df_property('origin_branch', 'reqd', 0);
                    frm.set_df_property('origin_address', 'reqd', 0);
                } else if (frm.doc.customer_type === "Corporate") {
                    frm.set_df_property('origin_branch', 'hidden', 0);
                    if (r.message.length > 0) {
                        frm.set_df_property('origin_branch', 'reqd', 1);
                        frm.set_df_property('origin_address', 'reqd', 1);
                    } else {
                        frm.set_df_property('origin_branch', 'reqd', 0);
                        frm.set_df_property('origin_address', 'reqd', 0);
                    }
                }
            }
        });
    
        console.log("Origin ", frm.doc.origin);
    },

    before_save: function (frm) {
        if(!frm.doc.service_type_feature) {
        update_service_type_feature(frm);
        }
    },

    destination: function (frm) {
        frm.set_query('destination_branch', () => {
            return {
                filters: {
                    location: frm.doc.destination,
                    customer_name: frm.doc.customer_name
                }
            }
        });
    
        frm.set_query('destination_address', () => {
            return {
                filters: {
                    city: frm.doc.destination
                }
            }
        });
    
        frm.set_value('receiving_city', frm.doc.destination);
        
        frappe.call({
            method: "frappe.client.get_list",
            args: {
                doctype: "Customer Branch",
                filters: {
                    location: frm.doc.destination,
                    customer_name: frm.doc.customer_name
                },
                fieldname: ['*']
            },
            callback: function(r) {
                console.log("Calling Branch", r);
                
                if (frm.doc.customer_type === "Cash") {
                    frm.set_df_property('destination_branch', 'hidden', 1);
                    frm.set_df_property('destination_branch', 'reqd', 0);
                    frm.set_df_property('destination_address', 'reqd', 0);
                } else if (frm.doc.customer_type === "Corporate") {
                    frm.set_df_property('destination_branch', 'hidden', 0);
                    if (r.message.length > 0) {
                        console.log("Fetching the destination branch", r.message);
                        frm.set_df_property('destination_branch', 'reqd', 1);
                        frm.set_df_property('destination_address', 'reqd', 1);
                    } else {
                        frm.set_df_property('destination_branch', 'reqd', 0);
                        frm.set_df_property('destination_address', 'reqd', 0);
                    }
                }
            }
        });
    },

    value_of_shipment: function (frm) {
        if(frm.doc.value_of_shipment < 500) {
            frm.set_df_property('proof_of_value', 'reqd', 0);
            
        }
        if(frm.doc.value_of_shipment){
            const insuranceValue =(frm.doc.value_of_shipment * 0.03).toFixed(2);
            frm.set_value('insurance_value', insuranceValue);
          } 
        if(frm.doc.value_of_shipment > 500) {
            frm.set_df_property('proof_of_value', 'reqd', 1);
            
        } else {
            frm.set_df_property('proof_of_value', 'reqd', 0);
        }

        console.log("Value of shipment", frm.doc.value_of_shipment)
    },

    service_type: function (frm) {
        // update_service_type_feature(frm);
        if(!frm.doc.service_type_feature) {
        update_service_type_feature(frm);
        }

        if(frm.doc.service_type === "DG Air Cargo") {
            frm.set_df_property('attachment', 'reqd', 1);
        } else {
            frm.set_df_property('attachment', 'reqd', 0);
        }
    },

    refresh: function (frm) {
        frm.generate_tracking_id();
        // update_service_type_feature(frm);
        
        if(!frm.doc.service_type_feature) {
        update_service_type_feature(frm);
        }
        if(frm.doc.sales_invoice){
            frm.add_custom_button('View sales invoice', function () {
                    frappe.msgprint(
                        // `Invoice Number: <a href="http://adv.anantdv.com/app/sales-invoice/${frm.doc.sales_invoice}" target="_blank">${frm.doc.sales_invoice}</a>`
                        `Invoice Number: <a href="http://182.71.135.110:8888/app/sales-invoice/${frm.doc.sales_invoice}" target="_blank">${frm.doc.sales_invoice}</a>`

                    );
                    // frappe.set_route("Sales Invoive", frm.doc.sales_invoice);
                },);
        }
        if(frm.doc.workflow_state === "Payment Received and Issued Invoice" && frm.doc.customer_type == 'Cash' ) {
                frappe.call({
                    method: 'shipping.shipping.doctype.consignment_note.make_payment_entry.create_payment_entry_from_sales_invoice',
                    args: {
                        sales_invoice_name: frm.doc.sales_invoice
                    },
                    freeze: true,
                    callback: (r) => {
                        if (r) {
                            console.log(r) 
                        }
                    },
                    error: (r) => {
                        console.log(r);
                    }
                });
            }
        if(frm.doc.workflow_state === "Delivered To Customer" && frm.doc.customer_type === "Corporate") {
            // console.log(123);
            generate_sales_invoice(frm);
        }
        if(frm.doc.workflow_state === "Invoice Generated" && frm.doc.customer_type === "Cash") {
            generate_sales_invoice(frm);
        }
        
         if(frm.doc.workflow_state === "Delivered To Customer" ){
            frm.set_value('custom_proof_of_delivery', frm.doc.modified);
         }
        // Check for each dialog-triggering state separately
        if (frm.doc.workflow_state === "Assigned for Pickup") {
            check_if_schedule_exists(frm, "Assigned for Pickup");
        }
        else if (frm.doc.workflow_state === "Picked Up from Airport") {
            check_if_schedule_exists(frm, "Picked Up from Airport");
        }
        else if (frm.doc.workflow_state === "Delivery Scheduled") {
            check_if_schedule_exists(frm, "Delivery Scheduled");
        }
        else {
            // For other states, update tracking
            // update_tracking_based_on_workflow(frm);
            if(cur_frm.doc.__unsaved){
                update_tracking_based_on_workflow(frm);
            }

        }




        //  frappe.call({
        //     method: "shipping.shipping.doctype.consignment_note.get_sales_invoice.get_cash_consignment_with_overdue_invoice",
        //     callback: function (r) {
        //         console.log(r.message); // list of consignment notes
        //     }
        // });
  
    if (frm.doc.workflow_state === "Verified Weight/Dimension") {
        //// use Any type of shorting algo  (dipu er kaj)
            let drafted = frm.doc.drafted_shipment_details || [];
            let final = frm.doc.check_shipment_details || [];

            if (drafted.length !== final.length) {
                frappe.msgprint(__('Number of rows differ between Drafted and Final Shipment Details.'));
                return;
            }

            let mismatchDetails = [];

            for (let i = 0; i < drafted.length; i++) {
                let d = drafted[i];
                let f = final[i];
                let rowMismatch = [];

                 if (d.pieces_no !== f.pieces_no) {
                    rowMismatch.push(`Pieces No (Drafted: ${d.pieces_no}, Final: ${f.pieces_no})`);
                }
                if (d.piece_weight_kg !== f.piece_weight_kg) {
                    rowMismatch.push(`Weight (Drafted: ${d.piece_weight_kg}, Final: ${f.piece_weight_kg})`);
                }
                if (d.heightcm !== f.heightcm) {
                    rowMismatch.push(`Height (Drafted: ${d.heightcm}, Final: ${f.heightcm})`);
                }
                if (d.lengthcm !== f.lengthcm) {
                    rowMismatch.push(`Length (Drafted: ${d.lengthcm}, Final: ${f.lengthcm})`);
                }
                if (d.widthcm !== f.widthcm) {
                    rowMismatch.push(`Width (Drafted: ${d.widthcm}, Final: ${f.widthcm})`);
                }
                if (rowMismatch.length > 0) {
                    mismatchDetails.push(`Row ${i + 1}:\n` + rowMismatch.join('\n'));
                    // mismatchDetails.push(`Row ${i + 1}:<br>${rowMismatch.join('<br>')}`);
                }
            }

           

            if (mismatchDetails.length > 0) {
                frappe.msgprint({
                    title: __('Shipment Detail Differences'),
                    indicator: 'red',
                    // message: mismatchDetails.join('\n------------------\n')
                    //  message: mismatchDetails.join('\n')
                    //  message: `<pre>${mismatchDetails.join('\n------------------\n')}</pre>`
                    message: mismatchDetails.join('<hr>')

                });
            }
        }


    },

    customer_type: function(frm) {
        
        if (frm.doc.customer_type === "Cash") {
            frm.set_df_property('origin_branch', 'hidden', 1);
            frm.set_df_property('destination_branch', 'hidden', 1);
            frm.set_df_property('origin_branch', 'reqd', 0);
            frm.set_df_property('destination_branch', 'reqd', 0);
        } else if (frm.doc.customer_type === "Corporate") {
            frm.set_df_property('origin_branch', 'hidden', 0);
            frm.set_df_property('destination_branch', 'hidden', 0);
            
            
            if (frm.doc.origin) {
                frm.trigger('origin');
            }
            if (frm.doc.destination) {
                frm.trigger('destination');
            }
        }
    },

    before_workflow_action: function(frm) {
        console.log("Before workflow action triggered");
        
    },

    after_workflow_action: function(frm) {
        
    },
});

// Updated function to check if schedule exists and show appropriate dialog
function check_if_schedule_exists(frm, workflowState) {
    console.log(`Checking if schedule exists for ${workflowState} state`);
    
    // Make sure document name is available
    if (!frm.doc.name || frm.doc.__islocal) {
        console.log("Document not yet saved, can't check for schedules");
        // For new/unsaved docs, don't show dialog yet
        return;
    }
    
    // Determine which flags to use based on the workflow state
    let dialogDisplayed, scheduleExistsFlag;
    
    if (workflowState === "Assigned for Pickup") {
        dialogDisplayed = frm.pickup_dialog_displayed;
        scheduleExistsFlag = frm.pickup_scheduled;
    } else if (workflowState === "Picked Up from Airport") {
        dialogDisplayed = frm.airport_dialog_displayed;
        scheduleExistsFlag = frm.airport_scheduled;
    } else if (workflowState === "Delivery Scheduled") {
        dialogDisplayed = frm.delivery_dialog_displayed;
        scheduleExistsFlag = frm.delivery_scheduled;
    }
    
    // Double-check that we are actually in the expected workflow state
    if (frm.doc.workflow_state !== workflowState) {
        console.log(`Current workflow state ${frm.doc.workflow_state} doesn't match expected ${workflowState}`);
        return;
    }
    
    // If we've already shown a dialog or confirmed schedule exists, don't show again
    if (dialogDisplayed || scheduleExistsFlag) {
        console.log(`Dialog already displayed or schedule confirmed for ${workflowState}`);
        return;
    }
    
    // Mark dialog as displayed to prevent multiple dialogs
    if (workflowState === "Assigned for Pickup") {
        frm.pickup_dialog_displayed = true;
    } else if (workflowState === "Picked Up from Airport") {
        frm.airport_dialog_displayed = true;
    } else if (workflowState === "Delivery Scheduled") {
        frm.delivery_dialog_displayed = true;
    }
    
    // Add no_cache parameter to ensure fresh data
    frappe.call({
        method: "frappe.client.get_list",
        args: {
            doctype: "Pickup-Delivery Schedule",
            filters: {
                consignment_id: frm.doc.name,
                status: workflowState
            },
            fields: ["name"],
            no_cache: 1
        },
        callback: function (r) {
            if (r.message && r.message.length > 0) {
                console.log(`Schedule already exists for ${workflowState} state:`, r.message);
                
                // Mark as scheduled to prevent dialog from showing again
                if (workflowState === "Assigned for Pickup") {
                    frm.pickup_scheduled = true;
                    localStorage.setItem(`pickup_scheduled_${frm.doc.name}`, 'true');
                } else if (workflowState === "Picked Up from Airport") {
                    frm.airport_scheduled = true;
                    localStorage.setItem(`airport_scheduled_${frm.doc.name}`, 'true');
                } else if (workflowState === "Delivery Scheduled") {
                    frm.delivery_scheduled = true;
                    localStorage.setItem(`delivery_scheduled_${frm.doc.name}`, 'true');
                }
            } else {
                console.log(`No schedule exists for ${workflowState} state, showing dialog`);
                show_appropriate_dialog(frm, workflowState);
                // Ensure the document is saved before showing dialog
                // if (frm.is_dirty()) {
                //     frm.save().then(() => {
                //         // Show appropriate dialog after save
                //         show_appropriate_dialog(frm, workflowState);
                //     });
                // } else {
                //     // Document is already saved, show dialog right away
                //     show_appropriate_dialog(frm, workflowState);
                // }
            }
        }
    });
}

// Helper function to show the right dialog based on workflow state
function show_appropriate_dialog(frm, workflowState) {
    if (workflowState === "Assigned for Pickup") {
        handle_pickup_assignment_dialog(frm);
    } else if (workflowState === "Picked Up from Airport") {
        handle_picked_up_from_airport_dialog(frm);
    } else if (workflowState === "Delivery Scheduled") {
        handle_delivery_scheduled_dialog(frm);
    }
}

frappe.ui.form.on('Shipment_item', {
    piece_weight_kg: function (frm) {
        frm.calculate_total_weight();
    },
    lengthcm: function (frm) {
        frm.calculate_total_weight();
    },
    widthcm: function (frm) {
        frm.calculate_total_weight();
    },
    heightcm: function (frm) {
        frm.calculate_total_weight();
    },
    pieces_no: function (frm) {
        frm.calculate_total_weight();
    }
});

function update_tracking_based_on_workflow(frm) {
    // if (!frm.doc.workflow_state) return;

    // const currentState = frm.doc.workflow_state;
    
    // // Skip states that are handled separately with user input
    // if (currentState === "Assigned for Pickup" || 
    //     currentState === "Picked Up from Airport" || 
    //     currentState === "Delivery Scheduled") {
    //     return;
    // }
    
    // // Check if tracking entry for current state already exists
    // let statusEntryExists = false;
    
    // if (frm.doc.tracking_table && frm.doc.tracking_table.length > 0) {
    //     statusEntryExists = frm.doc.tracking_table.some(function (row) {
    //         return row.status === currentState;
    //     });
    // }

    // // If entry doesn't exist, add it
    // if (!statusEntryExists) {
    //     add_tracking_entry_without_save(frm, currentState);
        
    //     // Save if not a new document
    //     if (!frm.is_new()) {
    //         frm.save();
    //     }
    // }
}

// New function that adds tracking entry without saving
function add_tracking_entry_without_save(frm, status, assigned_to = "") {
    // let new_row = frm.add_child("tracking_table");
    // new_row.status = status;
    // new_row.timestamp = frappe.datetime.now_datetime();
    
    // if (assigned_to && assigned_to.trim() !== "") {
    //     new_row.assigned_to = assigned_to;
    // }

    // frm.refresh_field("tracking_table");
}

// Original function that includes save - ONLY use when you want to save immediately
// function add_tracking_entry(frm, status, assigned_to = "") {
//     add_tracking_entry_without_save(frm, status, assigned_to);
//     frm.save();
// }

function update_service_type_feature(frm) {
    let mapping = {
        "General Air Cargo": "Highly Valuable Goods",
        "DG Air Cargo": "Lithium-Ion Batteries (Class 9)"
    };

    if (frm.doc.service_type in mapping) {
        frm.set_value('service_type_feature', mapping[frm.doc.service_type]);

        if (frm.doc.service_type === "General Air Cargo") {
            frm.set_df_property('service_type_feature', 'read_only', 1);
        } else {
            frm.set_df_property('service_type_feature', 'read_only', 0);
        }
    } else {
        frm.set_value('service_type_feature', '');
    }

    frm.refresh_field('service_type_feature');
}

// Handle pickup assignment separately
function handle_pickup_assignment_dialog(frm) {
    console.log("Showing pickup assignment dialog");
    
    let dialog = new frappe.ui.Dialog({
        title: __('Assign Pickup-Delivery Schedule'),
        fields: [
            {
                label: __('Pickup DateTime'),
                fieldname: 'datetime',
                fieldtype: 'Datetime',
                reqd: 1,
            },
            {
                label:__('Priority'),
                fieldname: "priority",
                fieldtype: "Select",
                options: "Low\nMedium\nHigh",
                reqd: 1
            },
            {
                label: __('Delivery Branch'),
                fieldname: 'delivery_branch',
                fieldtype: 'Link',
                options: 'Location',
                reqd: 1
            },
            // {
            //     label: __('Assign To'),
            //     fieldname: 'assigned_to',
            //     fieldtype: 'Link',
            //     options: 'User',
            //     reqd: 1
                
            // },
            {
    label: __('Assign To'),
    fieldname: 'assigned_to',
    fieldtype: 'Link',
    options: 'User',
    reqd: 1,
    get_query: function() {
        return {
            query: "frappe.core.doctype.user.user.get_users_with_role",
            filters: {
                role: "Driver"
            }
        };
    }
},

        ],
        primary_action_label: __('Assign'),
        primary_action: function(values) {
            // Hide dialog immediately
            dialog.hide();
            
            // First create a tracking entry
            let assigned_to_email = values.assigned_to;
            
            // Check if this assignment already exists
            let assignmentExists = false;
            if (frm.doc.tracking_table && frm.doc.tracking_table.length > 0) {
                assignmentExists = frm.doc.tracking_table.some(function(row) {
                    return row.status === "Assigned for Pickup" && 
                           row.assigned_to === assigned_to_email;
                });
            }
            
            if (!assignmentExists) {
                // Create new tracking entry with assigned_to value
                // let new_row = frm.add_child("tracking_table");
                // new_row.status = "Assigned for Pickup";
                // new_row.timestamp = frappe.datetime.now_datetime();
                // new_row.assigned_to = assigned_to_email;
                // frm.refresh_field("tracking_table");
            }
            
            // Then create pickup-delivery document
            let new_doc = frappe.model.get_new_doc('Pickup-Delivery Schedule');
            new_doc.status = frm.doc.workflow_state;
            new_doc.assigned_to = assigned_to_email;
            new_doc.origin = frm.doc.origin;
            new_doc.destination = frm.doc.destination;
            new_doc.pickup_branch = frm.doc.origin_branch;
            new_doc.pickup_address = frm.doc.origin_address
            new_doc.datetime = values.datetime;
            new_doc.priority = values.priority;
            new_doc.company_branch = values.delivery_branch;
            new_doc.consignment_id = frm.doc.name;

            frappe.db.insert(new_doc)
            .then(() => {
                console.log("Pickup-Delivery Schedule created");
                
                // Set scheduled flag to true to prevent dialog from showing again
                frm.pickup_scheduled = true;
                
                // Store this in localStorage to persist across page reloads
                localStorage.setItem(`pickup_scheduled_${frm.doc.name}`, 'true');
                
                // Save the form to ensure tracking table is updated
                // frm.save().then(() => {
                //     frm.reload_doc();
                //     frappe.show_alert({
                //         message: __('Assignment completed successfully'),
                //         indicator: 'green'
                //     });
                // });
            })
            .catch(err => {
                console.log("Error", err);
                frappe.show_alert({
                    message: __('Error creating assignment: ' + err.message),
                    indicator: 'red'
                });
            });
        },
        onhide: function() {
            // If dialog is closed without action, reset the display flag
            // after a delay to prevent immediate reopening
            setTimeout(() => {
                frm.pickup_dialog_displayed = false;
            }, 1000);
        }
    });
    
    dialog.show();
}

// Handle airport pickup dialog
function handle_picked_up_from_airport_dialog(frm) {
    console.log("Showing airport pickup dialog");
    
    let dialog = new frappe.ui.Dialog({
        title: __('Pick Up From Airport'),
        fields: [
            {
                label: __('Pickup DateTime'),
                fieldname: 'datetime',
                fieldtype: 'Datetime',
                reqd: 1,
            },
            {
                label:__('Priority'),
                fieldname: "priority",
                fieldtype: "Select",
                options: "Low\nMedium\nHigh",
                reqd: 1
            },
            {
                label: __('Drop Off Branch'),
                fieldname: 'delivery_branch',
                fieldtype: 'Link',
                options: 'Branch',
                reqd: 1
            },
            {
                label: __('Assign To'),
                fieldname: 'assigned_to',
                fieldtype: 'Link',
                options: 'User',
                reqd: 1
            },
        ],
        primary_action_label: __('Assign'),
        primary_action: function(values) {
            // Hide dialog immediately
            dialog.hide();
            
            // First create a tracking entry
            let assigned_to_email = values.assigned_to;
            
            // Create new tracking entry with assigned_to value
            // let new_row = frm.add_child("tracking_table");
            // new_row.status = "Picked Up from Airport";
            // new_row.timestamp = frappe.datetime.now_datetime();
            // new_row.assigned_to = assigned_to_email;
            // frm.refresh_field("tracking_table");
            // frm.set_value('custom_proof_of_delivery', values.datetime);
            frm.set_value('custom_cal_staff_delivery', assigned_to_email);

            // Then create pickup-delivery document
            let new_doc = frappe.model.get_new_doc('Pickup-Delivery Schedule');
            new_doc.status = frm.doc.workflow_state;
            new_doc.assigned_to = assigned_to_email;
            new_doc.origin = frm.doc.origin;
            new_doc.destination = frm.doc.destination;
            new_doc.pickup_branch = frm.doc.origin_branch;
            new_doc.pickup_address = frm.doc.origin_address;
            new_doc.datetime = values.datetime;
            new_doc.priority = values.priority;
            new_doc.company_branch = values.delivery_branch;
            new_doc.consignment_id = frm.doc.name;
            
            frappe.db.insert(new_doc)
            .then(() => {
                console.log("Pickup-Delivery Schedule created for airport pickup");
                
                // Set scheduled flag to true to prevent dialog from showing again
                frm.airport_scheduled = true;
                
                // Store this in localStorage to persist across page reloads
                localStorage.setItem(`airport_scheduled_${frm.doc.name}`, 'true');
                
                // frm.save().then(() => {
                //     frm.reload_doc();
                //     frappe.show_alert({
                //         message: __('Airport pickup assignment completed successfully'),
                //         indicator: 'green'
                //     });
                // });
            })
            .catch(err => {
                console.log("Error", err);
                frappe.show_alert({
                    message: __('Error creating airport pickup assignment: ' + err.message),
                    indicator: 'red'
                });
            });
        },
        onhide: function() {
            // If dialog is closed without action, reset the display flag
            // after a delay to prevent immediate reopening
            setTimeout(() => {
                frm.airport_dialog_displayed = false;
            }, 1000);
        }
    });
    
    dialog.show();
}

// Handle delivery scheduled dialog
function handle_delivery_scheduled_dialog(frm) {
    console.log("Showing delivery scheduled dialog");
    
    let dialog = new frappe.ui.Dialog({
        title: __('Schedule Delivery'),
        fields: [
            {
                label: __('Delivery DateTime'),
                fieldname: 'datetime',
                fieldtype: 'Datetime',
                reqd: 1,
            },
            {
                label:__('Priority'),
                fieldname: "priority",
                fieldtype: "Select",
                options: "Low\nMedium\nHigh",
                reqd: 1
            },
            {
                label: __('Delivery Branch'),
                fieldname: 'delivery_branch',
                fieldtype: 'Link',
                options: 'Branch',
                reqd: 1
            },
            {
                label: __('Delivery Address'),
                fieldname: 'delivery_address',
                fieldtype: 'Link',
                options: 'Address',
                 reqd: 1
            },
            {
                label: __('Assign To'),
                fieldname: 'assigned_to',
                fieldtype: 'Link',
                options: 'User',
                reqd: 1
            },
        ],
        primary_action_label: __('Assign'),
        primary_action: function(values) {
            // Hide dialog immediately
            dialog.hide();
            
            // First create a tracking entry
            let assigned_to_email = values.assigned_to;
            
            frm.set_value('custom_proof_of_delivery', values.datetime);
            frm.set_value('custom_cal_staff_delivery', assigned_to_email);
            // Create new tracking entry with assigned_to value
            // let new_row = frm.add_child("tracking_table");
            // new_row.status = "Delivery Scheduled";
            // new_row.timestamp = frappe.datetime.now_datetime();
            // new_row.assigned_to = assigned_to_email;
            // frm.refresh_field("tracking_table");
            
            // Then create pickup-delivery document
            let new_doc = frappe.model.get_new_doc('Pickup-Delivery Schedule');
            new_doc.status = frm.doc.workflow_state;
            new_doc.assigned_to = assigned_to_email;
            new_doc.origin = frm.doc.origin;
            new_doc.destination = frm.doc.destination;
            new_doc.pickup_branch = frm.doc.destination_branch;
            new_doc.pickup_address = frm.doc.destination_address;
            new_doc.datetime = values.datetime;
            new_doc.priority = values.priority;
            new_doc.company_branch = values.delivery_branch;
            new_doc.pickup_address = values.delivery_address;
            new_doc.consignment_id = frm.doc.name;
            
            frappe.db.insert(new_doc)
            .then(() => {
                console.log("Pickup-Delivery Schedule created for delivery");
                
                // Set scheduled flag to true to prevent dialog from showing again
                frm.delivery_scheduled = true;
                
                // Store this in localStorage to persist across page reloads
                localStorage.setItem(`delivery_scheduled_${frm.doc.name}`, 'true');
                
                // frm.save().then(() => {
                //     frm.reload_doc();
                //     frappe.show_alert({
                //         message: __('Delivery schedule assignment completed successfully'),
                //         indicator: 'green'
                //     });
                // });
            })
            .catch(err => {
                console.log("Error", err);
                frappe.show_alert({
                    message: __('Error creating delivery schedule assignment: ' + err.message),
                    indicator: 'red'
                });
            });
        },
        onhide: function() {
            // If dialog is closed without action, reset the display flag
            // after a delay to prevent immediate reopening
            setTimeout(() => {
                frm.delivery_dialog_displayed = false;
            }, 1000);
        }
    });
    
    dialog.show();
}

function generate_sales_invoice(frm) {
    frappe.call({
        method: "frappe.client.get_value",
        args: {
            doctype: "Consignment Note",
            filters: { name: frm.doc.name },
            fieldname: "sales_invoice"
        },
        callback: function (r) {
            if (r.message && r.message.sales_invoice) {
                // frappe.msgprint(`Sales Invoice already exists: <a href="/app/sales-invoice/${r.message.sales_invoice}" target="_blank">${r.message.sales_invoice}</a>`);
            } else {
                frappe.call({
                    method: 'shipping.shipping.doctype.consignment_note.make_sales_invoice.make_invoice',
                    args: {
                        data: cur_frm.doc
                    },
                    freeze: true,
                    callback: (r) => {
                        if (r.message.sales_invoice_name) {
                            frappe.msgprint(`Sales Invoice ${r.message.sales_invoice_name} created successfully.`);
                            frm.reload_doc(); 
                        }
                        else if(r.message.created_sales_invoice_name) {
                            console.log(r.message.created_sales_invoice_name);
                        }

                    },
                    error: (r) => {
                        console.log(r);
                    }
                });
            }
        }
    });
}