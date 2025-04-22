// Copyright (c) 2024, Frappe Technologies Pvt. Ltd. and contributors
// For license information, please see license.txt





// frappe.ui.form.on('Manifest Order', {
// 	refresh: function(frm) {
        
//         if(frm.doc.workflow_state === "Arrived at Destination Airport") {
//             frm.doc.shipment_details.forEach(element => {
//                 let consignmentData = frappe.db.get_doc('Consignment Note', element.cal_awb).then((consignment) => {
//                     console.log("Refresh....", consignment);
//                 let updatedField = frappe.db.set_value('Consignment Note', element.cal_awb, 'is_manifest_check', 1);
//                 console.log("Updated field", updatedField)
//                 })
//             });
            
//         }
		
// 	}
// });

// frappe.ui.form.on('Manifest Order', {
//     setup: function(frm) {
//         var Current_User = frappe.session.user;
        
//         // Only set prepared_by on new docs to avoid unnecessary form changes
//         if (frm.is_new()) {
//             calculate_totals(frm);
            
//             frappe.call({
//                 method: "frappe.client.get",
//                 args: {
//                     doctype: "User",
//                     filters: {'email': Current_User },
//                 },
//                 callback: function(r) {
//                     frm.set_value("prepared_by", r.message["full_name"]);
//                 }
//             });
//         }
        
//         // Store the initial workflow state to detect changes
//         frm.previous_workflow_state = frm.doc.workflow_state;
        
//         // Flags to track dialog display - defined at setup to persist
//         frm.delivery_dialog_displayed = false;
        
//         // Set initial hold status if not defined
//         if (frm.doc.is_on_hold === undefined) {
//             frm.set_value("is_on_hold", 0);
//         }
//     },
    
//     shipment_details_add: function(frm, cdt, cdn) {
//         calculate_totals(frm);
//     },
    
//     shipment_details_remove: function(frm, cdt, cdn) {
//         calculate_totals(frm);
//     },
    
//     shipment_details: function(frm, cdt, cdn) {
//         calculate_totals(frm);
//     },
    
//     validate: function(frm) {
//         // Ensure totals are calculated before saving
//         calculate_totals(frm);
//     },
    
//     after_save: function(frm) {
//         // Check if this is a newly created document
//         if (frm.doc.__islocal === undefined && frm.doc.workflow_state === "Manifest Order Generated") {
//             console.log("New Manifest Order created. Adding initial tracking entries.");
            
//             // Delay the tracking update to avoid document conflicts
//             setTimeout(() => {
//                 update_consignment_tracking(frm);
//             }, 1500);
//         }
        
//         // Reset processing flags after save
//         frm.processing_state_change = false;
//     },
    
//     workflow_state: function(frm) {

//         if(frm.doc.workflow_state === "Manifest Generated") {
//             frm.set_df_property('airline_awb_numbber', 'reqd', 1);
//         } 
//         // Set flag to indicate we're processing a state change
//         frm.processing_state_change = true;
        
//         console.log("Workflow state changed to:", frm.doc.workflow_state);
        
//         // If manifest is on hold, don't update tracking
//         if (frm.doc.is_on_hold) {
//             console.log("Skipping tracking update because manifest is on hold");
//             frm.processing_state_change = false;
//             return;
//         }
        
//         // Clear any existing tracking keys for this state to ensure refresh will update tracking
//         const trackingKey = `tracking_refresh_${frm.doc.name}_${frm.doc.workflow_state}`;
//         sessionStorage.removeItem(trackingKey);
        
//         // Skip tracking update here for states with dialogs
//         // The refresh event will handle updating tracking for all states
//         if (frm.doc.workflow_state !== "Assigned For Airport Delivery") {
//             console.log("Workflow state changed - tracking will be updated on refresh");
//         }
        
//         // IMPORTANT: Reset dialog display flags to ensure dialogs appear
//         frm.delivery_dialog_displayed = false;
        
//         // CRITICAL ADDITION: Immediately show dialog when state changes to Assigned For Airport Delivery
//         if (frm.doc.workflow_state === "Assigned For Airport Delivery" && 
//             !frm.doc.is_on_hold && !frm.is_new()) {
            
//             console.log("Showing delivery dialog immediately after state change");
//             setTimeout(function() {
//                 // handle_delivery_dialog(frm);
//                 frm.delivery_dialog_displayed = true;
//             }, 500); // Small delay to ensure form state is fully updated
//         }
        
//         // Update the previous state
//         frm.previous_workflow_state = frm.doc.workflow_state;
//         frm.processing_state_change = false;
//     },
    
//     refresh: function(frm) {

//         if(frm.doc.workflow_state === "Manifest Generated") {
//             frm.set_df_property('airline_awb_numbber', 'reqd', 1);
//         } 
//         // Add Hold/Unhold button
//         add_hold_button(frm);
        
//         // Skip remaining operations if we're processing a state change
//         if (frm.processing_state_change) {
//             return;
//         }
        
//         // CRITICAL FIX: ALWAYS update tracking for all states on refresh
//         // This ensures states like "Uplifted" and "Arrived at Destination Airport" get tracked
//         if (!frm.is_new() && !frm.doc.is_on_hold && frm.doc.workflow_state !== "Assigned For Airport Delivery") {
//             // Create a key that's specific to this workflow state to prevent duplicates
//             const trackingKey = `tracking_refresh_${frm.doc.name}_${frm.doc.workflow_state}`;
            
//             // Only update once per workflow state
//             if (!sessionStorage.getItem(trackingKey)) {
//                 sessionStorage.setItem(trackingKey, "done");
                
//                 console.log("Updating tracking on refresh for state:", frm.doc.workflow_state);
                
//                 // Delay slightly to allow page to fully load
//                 setTimeout(() => {
//                     update_consignment_tracking(frm);
//                 }, 1000);
//             }
//         }
        
//         // Handle updating is_manifest_check for Arrived at Destination Airport state
//         if (frm.doc.workflow_state === "Arrived at Destination Airport" && 
//             frm.doc.shipment_details && 
//             frm.doc.shipment_details.length > 0) {
            
//             // Create a key to track this update
//             const manifestCheckKey = `manifest_check_${frm.doc.name}`;
            
//             // Only run this once per session
//             if (!sessionStorage.getItem(manifestCheckKey)) {
//                 sessionStorage.setItem(manifestCheckKey, "done");
                
//                 // Delay operation to avoid conflicts
//                 setTimeout(() => {
//                     // Process shipment details sequentially using promises
//                     const updatePromises = [];
                    
//                     frm.doc.shipment_details.forEach(element => {
//                         if (element.cal_awb) {
//                             const updatePromise = new Promise((resolve) => {
//                                 frappe.db.set_value('Consignment Note', element.cal_awb, 'is_manifest_check', 1)
//                                     .then((r) => {
//                                         console.log(`Updated is_manifest_check for ${element.cal_awb}`);
//                                         resolve();
//                                     })
//                                     .catch((err) => {
//                                         console.error(`Error updating ${element.cal_awb}:`, err);
//                                         resolve(); // Resolve anyway to continue processing
//                                     });
//                             });
                            
//                             updatePromises.push(updatePromise);
//                         }
//                     });
                    
//                     // When all updates are done, reload the document
//                     Promise.all(updatePromises).then(() => {
//                         console.log("All consignment notes updated with is_manifest_check");
//                     });
//                 }, 2000); // Delay to avoid conflicts
//             }
//         }
        
//         // For newly loaded docs, check if it has shipment details but no previous state
//         if (frm.doc.workflow_state === "Manifest Order Generated" && 
//             (!frm.previous_workflow_state || frm.previous_workflow_state === "") && 
//             frm.doc.shipment_details && 
//             frm.doc.shipment_details.length > 0) {
            
//             console.log("Checking for initial tracking entries on existing manifest");
            
//             // Set a flag in sessionStorage to prevent multiple executions
//             const key = `manifest_initial_check_${frm.doc.name}`;
//             if (!sessionStorage.getItem(key)) {
//                 sessionStorage.setItem(key, "done");
                
//                 // Use setTimeout to delay this operation and avoid conflicts
//                 setTimeout(() => {
//                     // Check if tracking entries need to be created
//                     check_and_create_initial_tracking(frm);
//                 }, 1500);
//             }
//         }
        
//         // Only show dialogs if not already displayed and not currently processing state change
//         if (!frm.processing_state_change) {
//             // Handle special workflow state: Assigned For Airport Delivery
//             if (frm.doc.workflow_state === "Assigned For Airport Delivery" && 
//                 !frm.delivery_dialog_displayed && 
//                 !frm.is_new() && 
//                 !frm.doc.is_on_hold) {
                
//                 console.log("Should display delivery assignment dialog");
                
//                 // Set the flag immediately to prevent duplicate dialogs
//                 frm.delivery_dialog_displayed = true;
                
//                 // Display the dialog
//                 handle_delivery_dialog(frm);
//             }
//         }
//     },

//     // before_workflow_action: function(frm) {
//     //     if (!frm.doc.airline_awb_numbber) {
//     //       frappe.throw(__("Please fill the mandatory field before changing status"));
//     //       return false;
//     //     }
//     // },
// });

// // Function to add the Hold/Unhold button
// function add_hold_button(frm) {
//     // Only add button if document is not new and has been saved
//     if (frm.is_new()) return;
    
//     // Only show hold button in the "Delivered to Origin Airport" state
//     if (frm.doc.workflow_state !== "Delivered to Origin Airport") {
//         return;
//     }
    
//     // Add the Hold/Unhold button based on current status
//     if (!frm.doc.is_on_hold) {
//         frm.add_custom_button(__('Hold Shipment'), function() {
//             set_hold_status(frm, true);
//         }).addClass('btn-danger');
//     } else {
//         frm.add_custom_button(__('Unhold Shipment'), function() {
//             set_hold_status(frm, false);
//         }).addClass('btn-success');
//     }
// }

// // Function to set hold status and update consignment notes
// function set_hold_status(frm, hold_status) {
//     frappe.confirm(
//         hold_status ? 
//             __('Are you sure you want to put this manifest on hold? This will pause all workflow activities.') : 
//             __('Are you sure you want to remove the hold? This will resume normal workflow processing.'),
//         function() {
//             // User confirmed, proceed with hold/unhold
//             frm.set_value("is_on_hold", hold_status ? 1 : 0);
            
//             // First save the document to ensure field is updated
//             frm.save().then(() => {
//                 // Update all consignment notes with hold/unhold status
//                 update_hold_status_in_consignments(frm, hold_status);
                
//                 frappe.show_alert({
//                     message: hold_status ? 
//                         __('Manifest has been put on hold') : 
//                         __('Hold has been removed, normal processing resumed'),
//                     indicator: hold_status ? 'red' : 'green'
//                 });
//             });
//         }
//     );
// }

// // Function to update hold status in all consignment notes
// function update_hold_status_in_consignments(frm, hold_status) {
//     if (!frm.doc.shipment_details || frm.doc.shipment_details.length === 0) {
//         console.log("No shipment details to update hold status for");
//         return;
//     }
    
//     console.log(hold_status ? "Setting hold status" : "Removing hold status");
    
//     // Get unique AWBs to avoid duplicate updates
//     const consignmentNotes = frm.doc.shipment_details.map(item => item.cal_awb);
//     const uniqueConsignmentNotes = [...new Set(consignmentNotes.filter(Boolean))];
    
//     // Create an array of promises for tracking updates
//     const updatePromises = [];
    
//     // Update each AWB with hold/unhold status
//     uniqueConsignmentNotes.forEach(awb => {
//         // Skip invalid AWBs
//         if (!awb || typeof awb !== 'string' || awb.trim() === '') {
//             console.log("Skipping invalid AWB");
//             return;
//         }
        
//         const updatePromise = new Promise((resolve) => {
//             frappe.call({
//                 method: "frappe.client.get_value",
//                 args: {
//                     doctype: "Consignment Note",
//                     filters: { "name": awb.trim() },
//                     fieldname: ["name"]
//                 },
//                 callback: function(result) {
//                     if (result.message) {
//                         // Get the document for updating
//                         frappe.model.with_doc("Consignment Note", awb.trim(), function() {
//                             var doc = frappe.model.get_doc("Consignment Note", awb.trim());
                            
//                             if (hold_status) {
//                                 // Add hold status entry
//                                 var new_row = frappe.model.add_child(doc, "Tracking Table", "tracking_table");
//                                 new_row.status = `On Hold`;
//                                 new_row.timestamp = frappe.datetime.now_datetime();
//                                 new_row.manifest_id = frm.doc.name;
//                                 new_row.notes = `Shipment processing paused at ${frm.doc.workflow_state} stage`;
//                             } else {
//                                 // Add unhold status entry
//                                 var new_row = frappe.model.add_child(doc, "Tracking Table", "tracking_table");
//                                 new_row.status = `Hold Removed`;
//                                 new_row.timestamp = frappe.datetime.now_datetime();
//                                 new_row.manifest_id = frm.doc.name;
//                                 new_row.notes = `Shipment processing resumed at ${frm.doc.workflow_state} stage`;
//                             }
                            
//                             // Save the document
//                             frappe.call({
//                                 method: "frappe.desk.form.save.savedocs",
//                                 args: {
//                                     doc: doc,
//                                     action: "Save"
//                                 },
//                                 callback: function(r) {
//                                     if (r.message) {
//                                         console.log(`Successfully updated hold status for ${awb}`);
//                                     } else {
//                                         console.error(`Failed to update hold status for ${awb}`);
//                                     }
//                                     resolve();
//                                 }
//                             });
//                         });
//                     } else {
//                         console.error(`Could not find consignment note with ID: ${awb}`);
//                         resolve();
//                     }
//                 }
//             });
//         });
        
//         updatePromises.push(updatePromise);
//     });
    
//     // When all updates are complete, reload the doc if needed
//     Promise.all(updatePromises).then(() => {
//         console.log("All hold status updates completed");
//     });
// }

// // Function to calculate totals for the manifest
// function calculate_totals(frm) {
//     try {
//         // Skip calculation if doc is not fully initialized
//         if (!frm.doc || !frm.doc.shipment_details) {
//             return;
//         }
        
//         let total_weight = 0;
//         let total_pieces = 0;

//         if (Array.isArray(frm.doc.shipment_details)) {
//             frm.doc.shipment_details.forEach(function(item) {
//                 if (item.weight) {
//                     total_weight += parseFloat(item.weight);
//                 }
//                 if (item.pieces_number) {
//                     total_pieces += parseInt(item.pieces_number);
//                 }
//             });
//         }

//         // Only update form values if the calculated values are different
//         // to prevent unnecessary form state changes
//         if (frm.doc.total_weight !== total_weight) {
//             frm.set_value('total_weight', total_weight);
//         }
//         if (frm.doc.total_no_of_pieces !== total_pieces) {
//             frm.set_value('total_no_of_pieces', total_pieces);
//         }

//         console.log("Calculated totals: weight =", total_weight, "pieces =", total_pieces);
//     } catch (error) {
//         console.error("Error in calculate_totals:", error);
//     }
// }

// // Handle delivery assignment dialog
// function handle_delivery_dialog(frm) {
//     console.log("Showing delivery assignment dialog");
    
//     // Check if there is already an active dialog to prevent duplicates
//     if (frm.delivery_dialog && frm.delivery_dialog.display) {
//         console.log("Dialog is already open, not creating a new one");
//         return;
//     }
    
//     // Set dialog title based on state
//     let dialogTitle = "Assign For Airport Delivery";
    
//     let dialog = new frappe.ui.Dialog({
//         title: __(dialogTitle),
//         fields: [
//             {
//                 label: __('Pickup DateTime'),
//                 fieldname: 'datetime',
//                 fieldtype: 'Datetime',
//                 reqd: 1,
//             },
//             {
//                 label: __('Origin Airport'),
//                 fieldname: 'origin_airport',
//                 fieldtype: 'Link',
//                 options: 'Branch',
//                 default: frm.doc.origin_airport || '',
//             },
//             {
//                 label: __('Priority'),
//                 fieldname: 'priority',
//                 fieldtype: 'Select',
//                 options: "Low\nMedium\nHigh",
//                 reqd: 1
//             },
//             {
//                 label: __('Assign To'),
//                 fieldname: 'assigned_to',
//                 fieldtype: 'Link',
//                 options: 'User',
//                 reqd: 1
//             },
//         ],
//         primary_action_label: __('Assign'),
//         primary_action: function(values) {
//             // Mark we're in a dialog processing operation
//             frm.processing_dialog = true;
            
//             let assigned_to_email = values.assigned_to;
            
//             // Create a new Pickup-Delivery Schedule document
//             let new_doc = frappe.model.get_new_doc('Pickup-Delivery Schedule');
            
//             new_doc.assigned_to = assigned_to_email;
//             new_doc.origin = frm.doc.origin || values.origin;
//             new_doc.origin_airport = values.origin_airport;
//             new_doc.manifest_id = frm.doc.name;
//             new_doc.status = frm.doc.workflow_state;
//             new_doc.priority = values.priority;
//             new_doc.pickup_datetime = values.datetime;
            
//             // Process all consignment notes in the manifest
//             if (frm.doc.shipment_details && frm.doc.shipment_details.length > 0) {
//                 // Count of successful updates
//                 let updatesCompleted = 0;
                
//                 // Total AWBs to process
//                 const consignmentNotes = frm.doc.shipment_details.map(item => item.cal_awb);
//                 const uniqueConsignmentNotes = [...new Set(consignmentNotes.filter(Boolean))]; // Remove nulls and duplicates
//                 const totalAwbs = uniqueConsignmentNotes.length;
                
//                 if (totalAwbs === 0) {
//                     // No valid AWBs to process, just create the schedule
//                     save_pickup_delivery_schedule(new_doc);
//                     return;
//                 }
                
//                 // Create tracking entries for each AWB
//                 uniqueConsignmentNotes.forEach(awb => {
//                     // Check if AWB is valid format
//                     if (!awb || typeof awb !== 'string' || awb.trim() === '') {
//                         console.log("Skipping invalid AWB:", awb);
//                         updatesCompleted++;
//                         checkIfComplete();
//                         return;
//                     }
                    
//                     frappe.call({
//                         method: "frappe.client.get_value",
//                         args: {
//                             doctype: "Consignment Note",
//                             filters: { "name": awb.trim() },
//                             fieldname: ["name"]
//                         },
//                         callback: function(result) {
//                             if (result.message) {
//                                 // Get the document for updating
//                                 frappe.model.with_doc("Consignment Note", awb.trim(), function() {
//                                     var doc = frappe.model.get_doc("Consignment Note", awb.trim());
                                    
//                                     // Check if ANY tracking entry exists for this manifest and workflow state
//                                     // (with or without assigned_to value)
//                                     let anyStatusExists = false;
//                                     if (doc.tracking_table && doc.tracking_table.length > 0) {
//                                         anyStatusExists = doc.tracking_table.some(function(row) {
//                                             return (row.status === `${frm.doc.workflow_state}` || 
//                                                    row.status === ` ${frm.doc.workflow_state}`) && 
//                                                   row.manifest_id === frm.doc.name;
//                                         });
//                                     }
                                    
//                                     // If any status entry exists, remove it first
//                                     if (anyStatusExists) {
//                                         console.log(`Removing existing entry for ${awb} before adding new one with assigned_to`);
//                                         // Filter out the existing entries for this state and manifest
//                                         doc.tracking_table = doc.tracking_table.filter(function(row) {
//                                             return !(
//                                                 (row.status === `${frm.doc.workflow_state}` || 
//                                                  row.status === ` ${frm.doc.workflow_state}`) && 
//                                                 row.manifest_id === frm.doc.name
//                                             );
//                                         });
//                                     }
                                    
//                                     // Always add a fresh row with the assigned_to value
//                                     var new_row = frappe.model.add_child(doc, "Tracking Table", "tracking_table");
//                                     new_row.status = `${frm.doc.workflow_state}`;
//                                     new_row.timestamp = frappe.datetime.now_datetime();
//                                     new_row.manifest_id = frm.doc.name;
//                                     new_row.assigned_to = assigned_to_email;
                                    
//                                     // Save the document
//                                     frappe.call({
//                                         method: "frappe.desk.form.save.savedocs",
//                                         args: {
//                                             doc: doc,
//                                             action: "Save"
//                                         },
//                                         callback: function(r) {
//                                             if (r.message) {
//                                                 console.log(`Successfully updated tracking for ${awb}`);
//                                             } else {
//                                                 console.error(`Failed to update tracking for ${awb}`);
//                                             }
//                                             updatesCompleted++;
//                                             checkIfComplete();
//                                         }
//                                     });
//                                 });
//                             } else {
//                                 console.error(`Could not find consignment note with ID: ${awb}`);
//                                 updatesCompleted++;
//                                 checkIfComplete();
//                             }
//                         }
//                     });
//                 });
                
//                 function checkIfComplete() {
//                     if (updatesCompleted >= totalAwbs) {
//                         // All AWBs processed, now save the Pickup-Delivery Schedule
//                         save_pickup_delivery_schedule(new_doc);
//                     }
//                 }
//             } else {
//                 // No shipment details, just create the Pickup-Delivery Schedule
//                 save_pickup_delivery_schedule(new_doc);
//             }
            
//             function save_pickup_delivery_schedule(doc) {
//                 frappe.db.insert(doc)
//                 .then(() => {
//                     console.log("Pickup-Delivery Schedule created");
                    
//                     // Close dialog before saving to prevent conflicts
//                     dialog.hide();
                    
//                     // Only save if there were changes
//                     if (frm.is_dirty()) {
//                         frm.save().then(() => {
//                             frm.reload_doc();
//                             frappe.show_alert({
//                                 message: __('Assignment completed successfully'),
//                                 indicator: 'green'
//                             });
//                             frm.processing_dialog = false;
//                         });
//                     } else {
//                         frappe.show_alert({
//                             message: __('Assignment completed successfully'),
//                             indicator: 'green'
//                         });
//                         frm.processing_dialog = false;
//                     }
//                 })
//                 .catch(err => {
//                     console.log("Error", err);
//                     frappe.show_alert({
//                         message: __('Error creating assignment: ' + err.message),
//                         indicator: 'red'
//                     });
//                     frm.processing_dialog = false;
//                 });
//             }
//         },
//         onhide: function() {
//             // IMPORTANT: Set a longer timeout to prevent immediate re-showing
//             // and allow for proper state update after dialog is closed
//             console.log("Dialog hidden, resetting flag");
            
//             // Store a reference to the dialog
//             frm.delivery_dialog = null;
            
//             setTimeout(() => {
//                 // Only reset the flag if still in the same state
//                 if (frm.doc.workflow_state === "Assigned For Airport Delivery") {
//                     frm.delivery_dialog_displayed = false;
//                     console.log("Flag reset for delivery dialog");
//                 }
//             }, 2000);
//         }
//     });
    
//     // Store a reference to the dialog
//     frm.delivery_dialog = dialog;
    
//     dialog.show();
// }

// // Function to check and create initial tracking entries if needed
// function check_and_create_initial_tracking(frm) {
//     if (!frm.doc.shipment_details || frm.doc.shipment_details.length === 0) {
//         return;
//     }
    
//     // Get unique AWBs
//     const consignmentNotes = frm.doc.shipment_details.map(item => item.cal_awb);
//     const uniqueConsignmentNotes = [...new Set(consignmentNotes.filter(Boolean))]; // Remove nulls
    
//     if (uniqueConsignmentNotes.length === 0) {
//         console.log("No valid AWBs to check for tracking");
//         return;
//     }
    
//     // Check if any consignment note already has a tracking entry for this manifest
//     let checkCount = 0;
//     let needsTracking = false;
    
//     // Array to hold all promises
//     const checkPromises = [];
    
//     uniqueConsignmentNotes.forEach(awb => {
//         if (!awb || typeof awb !== 'string' || awb.trim() === '') {
//             checkCount++;
//             return;
//         }
        
//         // Create a promise for checking this consignment
//         const checkPromise = new Promise((resolve) => {
//             frappe.call({
//                 method: "frappe.client.get",
//                 args: {
//                     doctype: "Consignment Note",
//                     name: awb.trim(),
//                 },
//                 callback: function(r) {
//                     checkCount++;
                    
//                     if (r.message) {
//                         const doc = r.message;
//                         const hasTracking = doc.tracking_table && doc.tracking_table.some(
//                             row => row.manifest_id === frm.doc.name
//                         );
                        
//                         if (!hasTracking) {
//                             needsTracking = true;
//                         }
//                     }
                    
//                     resolve();
//                 }
//             });
//         });
        
//         checkPromises.push(checkPromise);
//     });
    
//     // Wait for all checks to complete
//     Promise.all(checkPromises).then(() => {
//         // If tracking is needed, create it with a delay
//         if (needsTracking) {
//             console.log("Creating initial tracking entries for manifest");
//             setTimeout(() => {
//                 update_consignment_tracking(frm);
//             }, 1000);
//         }
//     });
// }

// // Function to update consignment tracking for all AWBs in a manifest
// function update_consignment_tracking(frm) {
//     if (!frm.doc.shipment_details || frm.doc.shipment_details.length === 0) {
//         console.log("No shipment details to update tracking for");
//         return;
//     }
    
//     // Skip tracking updates if manifest is on hold
//     if (frm.doc.is_on_hold) {
//         console.log("Skipping tracking update because manifest is on hold");
//         return;
//     }
    
//     console.log("Updating consignment tracking for workflow state:", frm.doc.workflow_state);
    
//     // Get unique AWBs to avoid duplicate updates
//     const consignmentNotes = frm.doc.shipment_details.map(item => item.cal_awb);
//     const uniqueConsignmentNotes = [...new Set(consignmentNotes.filter(Boolean))]; // Remove nulls and duplicates
    
//     if (uniqueConsignmentNotes.length === 0) {
//         console.log("No valid AWBs to update tracking for");
//         return;
//     }
    
//     // Create an array to keep track of all update promises
//     let updatePromises = [];
    
//     // Update tracking for each AWB
//     uniqueConsignmentNotes.forEach(awb => {
//         // Skip invalid AWBs
//         if (!awb || typeof awb !== 'string' || awb.trim() === '') {
//             console.log("Skipping invalid AWB");
//             return;
//         }
        
//         // Create a promise for this update
//         const updatePromise = new Promise((resolve, reject) => {
//             frappe.call({
//                 method: "frappe.client.get_value",
//                 args: {
//                     doctype: "Consignment Note",
//                     filters: { "name": awb.trim() },
//                     fieldname: ["name"]
//                 },
//                 callback: function(result) {
//                     if (result.message) {
//                         // Get the document for updating
//                         frappe.model.with_doc("Consignment Note", awb.trim(), function() {
//                             var doc = frappe.model.get_doc("Consignment Note", awb.trim());
                            
//                             // Check if this status already exists
//                             let statusExists = false;
//                             if (doc.tracking_table && doc.tracking_table.length > 0) {
//                                 statusExists = doc.tracking_table.some(function(row) {
//                                     // Improved matching - allow for status with or without spaces
//                                     return (row.status === `${frm.doc.workflow_state}` || 
//                                            row.status === ` ${frm.doc.workflow_state}`) && 
//                                           row.manifest_id === frm.doc.name;
//                                 });
//                             }
                            
//                             // If status doesn't exist, add it
//                             if (!statusExists) {
//                                 // Add new row to tracking_table child table
//                                 var new_row = frappe.model.add_child(doc, "Tracking Table", "tracking_table");
//                                 // No space before status
//                                 new_row.status = `${frm.doc.workflow_state}`;
//                                 new_row.timestamp = frappe.datetime.now_datetime();
//                                 new_row.manifest_id = frm.doc.name;
                                
//                                 // Special handling for Arrived at Destination Airport
//                                 if (frm.doc.workflow_state === "Arrived at Destination Airport") {
//                                     // Set is_manifest_check to 1 directly
//                                     doc.is_manifest_check = 1;
//                                 }
                                
//                                 // Save the document
//                                 frappe.call({
//                                     method: "frappe.desk.form.save.savedocs",
//                                     args: {
//                                         doc: doc,
//                                         action: "Save"
//                                     },
//                                     callback: function(r) {
//                                         if (r.message) {
//                                             console.log(`Successfully updated tracking for ${awb}`);
//                                             resolve();
//                                         } else {
//                                             console.error(`Failed to update tracking for ${awb}`);
//                                             resolve(); // Still resolve to continue with other operations
//                                         }
//                                     }
//                                 });
//                             } else {
//                                 console.log(`Tracking entry already exists for ${awb}`);
                                
//                                 // Even if tracking exists, ensure is_manifest_check is set for Arrived at Destination Airport
//                                 if (frm.doc.workflow_state === "Arrived at Destination Airport" && !doc.is_manifest_check) {
//                                     doc.is_manifest_check = 1;
                                    
//                                     frappe.call({
//                                         method: "frappe.desk.form.save.savedocs",
//                                         args: {
//                                             doc: doc,
//                                             action: "Save"
//                                         },
//                                         callback: function(r) {
//                                             if (r.message) {
//                                                 console.log(`Updated is_manifest_check for ${awb}`);
//                                             } else {
//                                                 console.error(`Failed to update is_manifest_check for ${awb}`);
//                                             }
//                                             resolve();
//                                         }
//                                     });
//                                 } else {
//                                     resolve();
//                                 }
//                             }
//                         });
//                     } else {
//                         console.error(`Could not find consignment note with ID: ${awb}`);
//                         resolve(); // Still resolve to continue with other operations
//                     }
//                 }
//             });
//         });
        
//         updatePromises.push(updatePromise);
//     });
    
//     // Wait for all updates to complete before proceeding
//     Promise.all(updatePromises).then(() => {
//         console.log("All tracking updates completed");
        
//         // Only reload if we're in one of these critical states to avoid conflicts
//         if (frm.doc.workflow_state === "Manifest Order Generated" || 
//             frm.doc.workflow_state === "Uplifted" ||
//             frm.doc.workflow_state === "Arrived at Destination Airport") {
            
//             // Use a small delay before reloading to prevent conflicts
//             setTimeout(() => {
//                 // Reload the document to get fresh state and avoid conflicts
//                 frm.reload_doc();
//             }, 1000);
//         }
//     });
// }

frappe.ui.form.on('Manifest Order', {
    setup: function(frm) {
        var Current_User = frappe.session.user;
        
        // Only set prepared_by on new docs to avoid unnecessary form changes
        if (frm.is_new()) {
            calculate_totals(frm);
            
            frappe.call({
                method: "frappe.client.get",
                args: {
                    doctype: "User",
                    filters: {'email': Current_User },
                },
                callback: function(r) {
                    frm.set_value("prepared_by", r.message["full_name"]);
                }
            });
        }
        
        // Store the initial workflow state to detect changes
        frm.previous_workflow_state = frm.doc.workflow_state;
        
        // Flags to track dialog display - defined at setup to persist
        frm.delivery_dialog_displayed = false;
        
        // Set initial hold status if not defined
        if (frm.doc.is_on_hold === undefined) {
            frm.set_value("is_on_hold", 0);
        }
        
        // Setup conflict resolution handler
        setup_conflict_handler(frm);
    },
    
    shipment_details_add: function(frm, cdt, cdn) {
        calculate_totals(frm);
    },
    
    shipment_details_remove: function(frm, cdt, cdn) {
        calculate_totals(frm);
    },
    
    shipment_details: function(frm, cdt, cdn) {
        calculate_totals(frm);
    },
    
    validate: function(frm) {
        // Ensure totals are calculated before saving
        calculate_totals(frm);
    },
    
    after_save: function(frm) {
        // Check if this is a newly created document
        if (frm.doc.__islocal === undefined && frm.doc.workflow_state === "Manifest Order Generated") {
            console.log("New Manifest Order created. Adding initial tracking entries.");
            
            // Delay the tracking update to avoid document conflicts
            setTimeout(() => {
                update_consignment_tracking(frm);
            }, 1500);
        }
        
        // Reset processing flags after save
        frm.processing_state_change = false;
    },
    
    workflow_state: function(frm) {
        // Set flag to indicate we're processing a state change
        frm.processing_state_change = true;
        
        console.log("Workflow state changed to:", frm.doc.workflow_state);
        
        // If manifest is on hold, don't update tracking
        if (frm.doc.is_on_hold) {
            console.log("Skipping tracking update because manifest is on hold");
            frm.processing_state_change = false;
            return;
        }
        
        // Clear any existing tracking keys for this state to ensure refresh will update tracking
        const trackingKey = `tracking_refresh_${frm.doc.name}_${frm.doc.workflow_state}`;
        sessionStorage.removeItem(trackingKey);
        
        // Skip tracking update here for states with dialogs
        // The refresh event will handle updating tracking for all states
        if (frm.doc.workflow_state !== "Assigned For Airport Delivery") {
            console.log("Workflow state changed - tracking will be updated on refresh");
        }
        
        // IMPORTANT: Reset dialog display flags to ensure dialogs appear
        frm.delivery_dialog_displayed = false;
        
        // CRITICAL ADDITION: Immediately show dialog when state changes to Assigned For Airport Delivery
        if (frm.doc.workflow_state === "Assigned For Airport Delivery" && 
            !frm.doc.is_on_hold && !frm.is_new()) {
            
            console.log("Showing delivery dialog immediately after state change");
            setTimeout(function() {
                frm.delivery_dialog_displayed = true;
                handle_delivery_dialog(frm);
            }, 500); // Small delay to ensure form state is fully updated
        }
        
        // Update the previous state
        frm.previous_workflow_state = frm.doc.workflow_state;
        frm.processing_state_change = false;
    },
    
    refresh: function(frm) {
        // Add Hold/Unhold button
        add_hold_button(frm);
        
        // Skip remaining operations if we're processing a state change
        if (frm.processing_state_change) {
            return;
        }
        
        // CRITICAL FIX: ALWAYS update tracking for all states on refresh
        // This ensures states like "Uplifted" and "Arrived at Destination Airport" get tracked
        if (!frm.is_new() && !frm.doc.is_on_hold && frm.doc.workflow_state !== "Assigned For Airport Delivery") {
            // Create a key that's specific to this workflow state to prevent duplicates
            const trackingKey = `tracking_refresh_${frm.doc.name}_${frm.doc.workflow_state}`;
            
            // Only update once per workflow state
            if (!sessionStorage.getItem(trackingKey)) {
                sessionStorage.setItem(trackingKey, "done");
                
                console.log("Updating tracking on refresh for state:", frm.doc.workflow_state);
                
                // Delay slightly to allow page to fully load
                setTimeout(() => {
                    update_consignment_tracking(frm);
                }, 1000);
            }
        }
        
        // Handle updating is_manifest_check for Arrived at Destination Airport state
        if (frm.doc.workflow_state === "Arrived at Destination Airport" && 
            frm.doc.shipment_details && 
            frm.doc.shipment_details.length > 0) {
            
            // Create a key to track this update
            const manifestCheckKey = `manifest_check_${frm.doc.name}`;
            
            // Only run this once per session
            if (!sessionStorage.getItem(manifestCheckKey)) {
                sessionStorage.setItem(manifestCheckKey, "done");
                
                // Delay operation to avoid conflicts
                setTimeout(() => {
                    // Process shipment details sequentially using promises
                    const updatePromises = [];
                    
                    frm.doc.shipment_details.forEach(element => {
                        if (element.cal_awb) {
                            const updatePromise = new Promise((resolve) => {
                                safe_set_value('Consignment Note', element.cal_awb, 'is_manifest_check', 1, resolve);
                            });
                            
                            updatePromises.push(updatePromise);
                        }
                    });
                    
                    // When all updates are done, reload the document
                    Promise.all(updatePromises).then(() => {
                        console.log("All consignment notes updated with is_manifest_check");
                    });
                }, 2000); // Delay to avoid conflicts
            }
        }
        
        // For newly loaded docs, check if it has shipment details but no previous state
        if (frm.doc.workflow_state === "Manifest Order Generated" && 
            (!frm.previous_workflow_state || frm.previous_workflow_state === "") && 
            frm.doc.shipment_details && 
            frm.doc.shipment_details.length > 0) {
            
            console.log("Checking for initial tracking entries on existing manifest");
            
            // Set a flag in sessionStorage to prevent multiple executions
            const key = `manifest_initial_check_${frm.doc.name}`;
            if (!sessionStorage.getItem(key)) {
                sessionStorage.setItem(key, "done");
                
                // Use setTimeout to delay this operation and avoid conflicts
                setTimeout(() => {
                    // Check if tracking entries need to be created
                    check_and_create_initial_tracking(frm);
                }, 1500);
            }
        }
        
        // Only show dialogs if not already displayed and not currently processing state change
        if (!frm.processing_state_change) {
            // Handle special workflow state: Assigned For Airport Delivery
            if (frm.doc.workflow_state === "Assigned For Airport Delivery" && 
                !frm.delivery_dialog_displayed && 
                !frm.is_new() && 
                !frm.doc.is_on_hold) {
                
                console.log("Should display delivery assignment dialog");
                
                // Set the flag immediately to prevent duplicate dialogs
                frm.delivery_dialog_displayed = true;
                
                // Display the dialog
                handle_delivery_dialog(frm);
            }
        }
    },
    
    // Add validation before workflow action to enforce mandatory airline AWB number
    before_workflow_action: function(frm) {
        // No validation needed, proceed with workflow
        return true;
    }
});

// Helper function to get workflow state index for comparison
function get_workflow_state_index(state) {
    const workflowStates = [
        "Manifest Order Generated",
        "Manifest Generated",
        "Assigned For Airport Delivery",
        "Delivered to Origin Airport",
        "Uplifted",
        "Arrived at Destination Airport"
    ];
    
    const index = workflowStates.indexOf(state);
    return index !== -1 ? index : -1;
}

// Function to set up conflict resolution handler
function setup_conflict_handler(frm) {
    // Override the standard frappe conflict handler to handle timezone issues
    const originalShowConflictPrompt = frappe.ui.form.ShowConflictPrompt;
    
    frappe.ui.form.ShowConflictPrompt = function(args) {
        // Check if this is a timezone-related conflict (within reasonable time difference)
        const serverModifiedTime = moment(args.doc.modified);
        const clientModifiedTime = moment(args.frm.doc.modified);
        const timeDifference = Math.abs(serverModifiedTime.diff(clientModifiedTime, 'hours'));
        
        // If the difference is approximately matching a timezone difference (e.g., 5 hours)
        // we consider this a timezone conflict and auto-resolve it
        if (timeDifference > 0 && timeDifference <= 12) {
            console.log("Detected timezone conflict. Auto-resolving...");
            
            // Auto reload the document
            args.frm.reload_doc();
            
            // Mark that we handled this conflict
            frm.handled_timezone_conflict = true;
            
            // Return to prevent showing the standard conflict dialog
            return;
        }
        
        // If not a timezone conflict, proceed with standard handler
        originalShowConflictPrompt(args);
    };
}

// Add retry mechanism for set_value operations
function safe_set_value(doctype, docname, field, value, callback, attempts = 0) {
    const maxAttempts = 3;
    
    frappe.db.set_value(doctype, docname, field, value)
        .then((r) => {
            console.log(`Updated ${field} for ${docname}`);
            if (callback) callback();
        })
        .catch((err) => {
            console.error(`Error updating ${docname}:`, err);
            
            // If we have a document modified error and haven't exceeded max attempts
            if (err && err.message && 
                err.message.includes("Document has been modified after you have opened it") && 
                attempts < maxAttempts) {
                
                console.log(`Retrying update for ${docname} (Attempt ${attempts + 1}/${maxAttempts})`);
                
                // Wait a bit before retrying (exponential backoff)
                setTimeout(() => {
                    safe_set_value(doctype, docname, field, value, callback, attempts + 1);
                }, 1000 * (attempts + 1));
            } else {
                // Give up after max attempts or for other errors
                if (callback) callback();
            }
        });
}

// Function to add the Hold/Unhold button
function add_hold_button(frm) {
    // Only add button if document is not new and has been saved
    if (frm.is_new()) return;
    
    // Only show hold button in the "Delivered to Origin Airport" state
    if (frm.doc.workflow_state !== "Delivered to Origin Airport") {
        return;
    }
    
    // Add the Hold/Unhold button based on current status
    if (!frm.doc.is_on_hold) {
        frm.add_custom_button(__('Hold Shipment'), function() {
            set_hold_status(frm, true);
        }).addClass('btn-danger');
    } else {
        frm.add_custom_button(__('Unhold Shipment'), function() {
            set_hold_status(frm, false);
        }).addClass('btn-success');
    }
}

// Function to set hold status and update consignment notes
function set_hold_status(frm, hold_status) {
    frappe.confirm(
        hold_status ? 
            __('Are you sure you want to put this manifest on hold? This will pause all workflow activities.') : 
            __('Are you sure you want to remove the hold? This will resume normal workflow processing.'),
        function() {
            // User confirmed, proceed with hold/unhold
            frm.set_value("is_on_hold", hold_status ? 1 : 0);
            
            // First save the document to ensure field is updated
            frm.save().then(() => {
                // Update all consignment notes with hold/unhold status
                update_hold_status_in_consignments(frm, hold_status);
                
                frappe.show_alert({
                    message: hold_status ? 
                        __('Manifest has been put on hold') : 
                        __('Hold has been removed, normal processing resumed'),
                    indicator: hold_status ? 'red' : 'green'
                });
            }).catch((err) => {
                // If we have a conflict error, reload and try again
                if (err && err.message && err.message.includes("Document has been modified")) {
                    console.log("Conflict detected while setting hold status. Reloading document...");
                    frm.reload_doc();
                    
                    // Set a timeout to try again after reload
                    setTimeout(() => {
                        set_hold_status(frm, hold_status);
                    }, 1500);
                } else {
                    frappe.throw(__('Could not update hold status: ') + err.message);
                }
            });
        }
    );
}

// Function to get UTC timestamp
function get_utc_timestamp() {
    // Create a moment object in the current timezone
    const now = moment();
    // Convert to UTC and format as string that Frappe expects
    return now.utc().format('YYYY-MM-DD HH:mm:ss.SSS');
}

// Function to update hold status in all consignment notes
function update_hold_status_in_consignments(frm, hold_status) {
    if (!frm.doc.shipment_details || frm.doc.shipment_details.length === 0) {
        console.log("No shipment details to update hold status for");
        return;
    }
    
    console.log(hold_status ? "Setting hold status" : "Removing hold status");
    
    // Get unique AWBs to avoid duplicate updates
    const consignmentNotes = frm.doc.shipment_details.map(item => item.cal_awb);
    const uniqueConsignmentNotes = [...new Set(consignmentNotes.filter(Boolean))];
    
    // Create an array of promises for tracking updates
    const updatePromises = [];
    
    // Update each AWB with hold/unhold status
    uniqueConsignmentNotes.forEach(awb => {
        // Skip invalid AWBs
        if (!awb || typeof awb !== 'string' || awb.trim() === '') {
            console.log("Skipping invalid AWB");
            return;
        }
        
        const updatePromise = new Promise((resolve) => {
            frappe.call({
                method: "frappe.client.get_value",
                args: {
                    doctype: "Consignment Note",
                    filters: { "name": awb.trim() },
                    fieldname: ["name"]
                },
                callback: function(result) {
                    if (result.message) {
                        // Get the document for updating
                        frappe.model.with_doc("Consignment Note", awb.trim(), function() {
                            var doc = frappe.model.get_doc("Consignment Note", awb.trim());
                            
                            if (hold_status) {
                                // Add hold status entry
                                var new_row = frappe.model.add_child(doc, "Tracking Table", "tracking_table");
                                new_row.status = `On Hold`;
                                new_row.timestamp = get_utc_timestamp(); // Use UTC timestamp
                                new_row.manifest_id = frm.doc.name;
                                new_row.notes = `Shipment processing paused at ${frm.doc.workflow_state} stage`;
                            } else {
                                // Add unhold status entry
                                var new_row = frappe.model.add_child(doc, "Tracking Table", "tracking_table");
                                new_row.status = `Hold Removed`;
                                new_row.timestamp = get_utc_timestamp(); // Use UTC timestamp
                                new_row.manifest_id = frm.doc.name;
                                new_row.notes = `Shipment processing resumed at ${frm.doc.workflow_state} stage`;
                            }
                            
                            // Save the document with retry logic
                            save_doc_with_retry(doc, resolve);
                        });
                    } else {
                        console.error(`Could not find consignment note with ID: ${awb}`);
                        resolve();
                    }
                }
            });
        });
        
        updatePromises.push(updatePromise);
    });
    
    // When all updates are complete, reload the doc if needed
    Promise.all(updatePromises).then(() => {
        console.log("All hold status updates completed");
    });
}

// Function to save document with retry mechanism
function save_doc_with_retry(doc, callback, attempts = 0) {
    const maxAttempts = 3;
    
    frappe.call({
        method: "frappe.desk.form.save.savedocs",
        args: {
            doc: doc,
            action: "Save"
        },
        callback: function(r) {
            if (r.message) {
                console.log(`Successfully saved document ${doc.name}`);
                if (callback) callback(true);
            } else {
                console.error(`Failed to save document ${doc.name}`);
                if (callback) callback(false);
            }
        },
        error: function(err) {
            console.error(`Error saving document ${doc.name}:`, err);
            
            // Check if this is a conflict error and we haven't exceeded max attempts
            if (err && err.message && 
                err.message.includes("Document has been modified") && 
                attempts < maxAttempts) {
                
                console.log(`Retrying save for ${doc.name} (Attempt ${attempts + 1}/${maxAttempts})`);
                
                // Fetch the latest version and try again
                frappe.model.with_doc(doc.doctype, doc.name, function() {
                    var fresh_doc = frappe.model.get_doc(doc.doctype, doc.name);
                    
                    // Transfer our child table entries to the fresh doc
                    if (doc.tracking_table && doc.tracking_table.length > 0) {
                        // Get the last entry we tried to add
                        const lastEntry = doc.tracking_table[doc.tracking_table.length - 1];
                        
                        // Check if it already exists in the fresh document
                        const entryExists = fresh_doc.tracking_table && 
                                           fresh_doc.tracking_table.some(row => 
                                               row.status === lastEntry.status && 
                                               row.manifest_id === lastEntry.manifest_id && 
                                               Math.abs(moment(row.timestamp).diff(moment(lastEntry.timestamp), 'minutes')) < 5);
                        
                        // If it doesn't exist, add it to the fresh document
                        if (!entryExists) {
                            var new_row = frappe.model.add_child(fresh_doc, "Tracking Table", "tracking_table");
                            new_row.status = lastEntry.status;
                            new_row.timestamp = get_utc_timestamp(); // Fresh timestamp
                            new_row.manifest_id = lastEntry.manifest_id;
                            new_row.notes = lastEntry.notes;
                            if (lastEntry.assigned_to) new_row.assigned_to = lastEntry.assigned_to;
                        }
                    }
                    
                    // Also transfer is_manifest_check if it was set
                    if (doc.is_manifest_check) {
                        fresh_doc.is_manifest_check = 1;
                    }
                    
                    // Try saving again with the fresh document
                    setTimeout(() => {
                        save_doc_with_retry(fresh_doc, callback, attempts + 1);
                    }, 1000 * (attempts + 1)); // Exponential backoff
                });
            } else {
                // Give up after max attempts or for other errors
                if (callback) callback(false);
            }
        }
    });
}

// Function to calculate totals for the manifest
function calculate_totals(frm) {
    try {
        // Skip calculation if doc is not fully initialized
        if (!frm.doc || !frm.doc.shipment_details) {
            return;
        }
        
        let total_weight = 0;
        let total_pieces = 0;

        if (Array.isArray(frm.doc.shipment_details)) {
            frm.doc.shipment_details.forEach(function(item) {
                if (item.weight) {
                    total_weight += parseFloat(item.weight);
                }
                if (item.pieces_number) {
                    total_pieces += parseInt(item.pieces_number);
                }
            });
        }

        // Only update form values if the calculated values are different
        // to prevent unnecessary form state changes
        if (frm.doc.total_weight !== total_weight) {
            frm.set_value('total_weight', total_weight);
        }
        if (frm.doc.total_no_of_pieces !== total_pieces) {
            frm.set_value('total_no_of_pieces', total_pieces);
        }

        console.log("Calculated totals: weight =", total_weight, "pieces =", total_pieces);
    } catch (error) {
        console.error("Error in calculate_totals:", error);
    }
}

// Handle delivery assignment dialog
function handle_delivery_dialog(frm) {
    console.log("Showing delivery assignment dialog");
    
    // Check if there is already an active dialog to prevent duplicates
    if (frm.delivery_dialog && frm.delivery_dialog.display) {
        console.log("Dialog is already open, not creating a new one");
        return;
    }
    
    // Ensure we have the latest document before showing dialog
    frappe.model.with_doc(frm.doctype, frm.docname, function() {
        // Set dialog title based on state
        let dialogTitle = "Assign For Airport Delivery";
        
        let dialog = new frappe.ui.Dialog({
            title: __(dialogTitle),
            fields: [
                {
                    label: __('Pickup DateTime'),
                    fieldname: 'datetime',
                    fieldtype: 'Datetime',
                    reqd: 1,
                },
                {
                    label: __('Origin Airport'),
                    fieldname: 'origin_airport',
                    fieldtype: 'Link',
                    options: 'Branch',
                    default: frm.doc.origin_airport || '',
                },
                {
                    label: __('Priority'),
                    fieldname: 'priority',
                    fieldtype: 'Select',
                    options: "Low\nMedium\nHigh",
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
                // Mark we're in a dialog processing operation
                frm.processing_dialog = true;
                
                let assigned_to_email = values.assigned_to;
                
                // Create a new Pickup-Delivery Schedule document
                let new_doc = frappe.model.get_new_doc('Pickup-Delivery Schedule');
                
                new_doc.assigned_to = assigned_to_email;
                new_doc.origin = frm.doc.origin || values.origin;
                new_doc.origin_airport = values.origin_airport;
                new_doc.manifest_id = frm.doc.name;
                new_doc.status = frm.doc.workflow_state;
                new_doc.priority = values.priority;
                new_doc.pickup_datetime = values.datetime;
                
                // Process all consignment notes in the manifest
                if (frm.doc.shipment_details && frm.doc.shipment_details.length > 0) {
                    // Count of successful updates
                    let updatesCompleted = 0;
                    
                    // Total AWBs to process
                    const consignmentNotes = frm.doc.shipment_details.map(item => item.cal_awb);
                    const uniqueConsignmentNotes = [...new Set(consignmentNotes.filter(Boolean))]; // Remove nulls and duplicates
                    const totalAwbs = uniqueConsignmentNotes.length;
                    
                    if (totalAwbs === 0) {
                        // No valid AWBs to process, just create the schedule
                        save_pickup_delivery_schedule(new_doc);
                        return;
                    }
                    
                    // Create tracking entries for each AWB
                    uniqueConsignmentNotes.forEach(awb => {
                        // Check if AWB is valid format
                        if (!awb || typeof awb !== 'string' || awb.trim() === '') {
                            console.log("Skipping invalid AWB:", awb);
                            updatesCompleted++;
                            checkIfComplete();
                            return;
                        }
                        
                        frappe.call({
                            method: "frappe.client.get_value",
                            args: {
                                doctype: "Consignment Note",
                                filters: { "name": awb.trim() },
                                fieldname: ["name"],
                                // Force no-cache to get fresh data
                                no_cache: 1
                            },
                            callback: function(result) {
                                if (result.message) {
                                    // Get the document for updating
                                    frappe.model.with_doc("Consignment Note", awb.trim(), function() {
                                        var doc = frappe.model.get_doc("Consignment Note", awb.trim());
                                        
                                        // Check if ANY tracking entry exists for this manifest and workflow state
                                        // (with or without assigned_to value)
                                        let anyStatusExists = false;
                                        if (doc.tracking_table && doc.tracking_table.length > 0) {
                                            anyStatusExists = doc.tracking_table.some(function(row) {
                                                return (row.status === `${frm.doc.workflow_state}` || 
                                                       row.status === ` ${frm.doc.workflow_state}`) && 
                                                      row.manifest_id === frm.doc.name;
                                            });
                                        }
                                        
                                        // If any status entry exists, remove it first
                                        if (anyStatusExists) {
                                            console.log(`Removing existing entry for ${awb} before adding new one with assigned_to`);
                                            // Filter out the existing entries for this state and manifest
                                            doc.tracking_table = doc.tracking_table.filter(function(row) {
                                                return !(
                                                    (row.status === `${frm.doc.workflow_state}` || 
                                                     row.status === ` ${frm.doc.workflow_state}`) && 
                                                    row.manifest_id === frm.doc.name
                                                );
                                            });
                                        }
                                        
                                        // Always add a fresh row with the assigned_to value
                                        var new_row = frappe.model.add_child(doc, "Tracking Table", "tracking_table");
                                        new_row.status = `${frm.doc.workflow_state}`;
                                        new_row.timestamp = get_utc_timestamp(); // Use UTC timestamp
                                        new_row.manifest_id = frm.doc.name;
                                        new_row.assigned_to = assigned_to_email;
                                        
                                        // Save the document with retry logic
                                        save_doc_with_retry(doc, function(success) {
                                            if (success) {
                                                console.log(`Successfully updated tracking for ${awb}`);
                                            } else {
                                                console.error(`Failed to update tracking for ${awb}`);
                                            }
                                            updatesCompleted++;
                                            checkIfComplete();
                                        });
                                    });
                                } else {
                                    console.error(`Could not find consignment note with ID: ${awb}`);
                                    updatesCompleted++;
                                    checkIfComplete();
                                }
                            }
                        });
                    });
                    
                    function checkIfComplete() {
                        if (updatesCompleted >= totalAwbs) {
                            // All AWBs processed, now save the Pickup-Delivery Schedule
                            save_pickup_delivery_schedule(new_doc);
                        }
                    }
                } else {
                    // No shipment details, just create the Pickup-Delivery Schedule
                    save_pickup_delivery_schedule(new_doc);
                }
                
                function save_pickup_delivery_schedule(doc) {
                    frappe.db.insert(doc)
                    .then(() => {
                        console.log("Pickup-Delivery Schedule created");
                        
                        // Close dialog before saving to prevent conflicts
                        dialog.hide();
                        
                        // Only save if there were changes
                        if (frm.is_dirty()) {
                            frm.save().then(() => {
                                frm.reload_doc();
                                frappe.show_alert({
                                    message: __('Assignment completed successfully'),
                                    indicator: 'green'
                                });
                                frm.processing_dialog = false;
                            }).catch(err => {
                                // Handle document conflict gracefully
                                if (err && err.message && err.message.includes("Document has been modified")) {
                                    console.log("Document conflict detected. Reloading.");
                                    frm.reload_doc();
                                    frappe.show_alert({
                                        message: __('Assignment completed but document needed refresh'),
                                        indicator: 'green'
                                    });
                                } else {
                                    console.error("Error saving form:", err);
                                }
                                frm.processing_dialog = false;
                            });
                        } else {
                            frappe.show_alert({
                                message: __('Assignment completed successfully'),
                                indicator: 'green'
                            });
                            frm.processing_dialog = false;
                        }
                    })
                    .catch(err => {
                        console.log("Error", err);
                        
                        // If document conflict, retry with fresh data
                        if (err && err.message && err.message.includes("Document has been modified")) {
                            console.log("Conflict detected. Will retry with fresh data.");
                            
                            // Wait and try again
                            setTimeout(() => {
                                // Create a fresh document
                                let fresh_doc = frappe.model.get_new_doc('Pickup-Delivery Schedule');
                                fresh_doc.assigned_to = assigned_to_email;
                                fresh_doc.origin = frm.doc.origin || values.origin;
                                fresh_doc.origin_airport = values.origin_airport;
                                fresh_doc.manifest_id = frm.doc.name;
                                fresh_doc.status = frm.doc.workflow_state;
                                fresh_doc.priority = values.priority;
                                fresh_doc.pickup_datetime = values.datetime;
                                
                                save_pickup_delivery_schedule(fresh_doc);
                            }, 1500);
                        } else {
                            frappe.show_alert({
                                message: __('Error creating assignment: ' + err.message),
                                indicator: 'red'
                            });
                            frm.processing_dialog = false;
                        }
                    });
                }
            },
            onhide: function() {
                // IMPORTANT: Set a longer timeout to prevent immediate re-showing
                // and allow for proper state update after dialog is closed
                console.log("Dialog hidden, resetting flag");
                
                // Store a reference to the dialog
                frm.delivery_dialog = null;
                
                setTimeout(() => {
                    // Only reset the flag if still in the same state
                    if (frm.doc.workflow_state === "Assigned For Airport Delivery") {
                        frm.delivery_dialog_displayed = false;
                        console.log("Flag reset for delivery dialog");
                    }
                }, 2000);
            }
        });
        
        // Store a reference to the dialog
        frm.delivery_dialog = dialog;
        
        dialog.show();
    });
}

// Function to check and create initial tracking entries if needed
function check_and_create_initial_tracking(frm) {
    if (!frm.doc.shipment_details || frm.doc.shipment_details.length === 0) {
        return;
    }
    
    // Get unique AWBs
    const consignmentNotes = frm.doc.shipment_details.map(item => item.cal_awb);
    const uniqueConsignmentNotes = [...new Set(consignmentNotes.filter(Boolean))]; // Remove nulls
    
    if (uniqueConsignmentNotes.length === 0) {
        console.log("No valid AWBs to check for tracking");
        return;
    }
    
    // Check if any consignment note already has a tracking entry for this manifest
    let checkCount = 0;
    let needsTracking = false;
    
    // Array to hold all promises
    const checkPromises = [];
    
    uniqueConsignmentNotes.forEach(awb => {
        if (!awb || typeof awb !== 'string' || awb.trim() === '') {
            checkCount++;
            return;
        }
        
        // Create a promise for checking this consignment
        const checkPromise = new Promise((resolve) => {
            frappe.call({
                method: "frappe.client.get",
                args: {
                    doctype: "Consignment Note",
                    name: awb.trim(),
                    // Force no-cache to get fresh data
                    no_cache: 1
                },
                callback: function(r) {
                    checkCount++;
                    
                    if (r.message) {
                        const doc = r.message;
                        const hasTracking = doc.tracking_table && doc.tracking_table.some(
                            row => row.manifest_id === frm.doc.name
                        );
                        
                        if (!hasTracking) {
                            needsTracking = true;
                        }
                    }
                    
                    resolve();
                }
            });
        });
        
        checkPromises.push(checkPromise);
    });
    
    // Wait for all checks to complete
    Promise.all(checkPromises).then(() => {
        // If tracking is needed, create it with a delay
        if (needsTracking) {
            console.log("Creating initial tracking entries for manifest");
            setTimeout(() => {
                update_consignment_tracking(frm);
            }, 1000);
        }
    });
}

// Function to update consignment tracking for all AWBs in a manifest
function update_consignment_tracking(frm) {
    if (!frm.doc.shipment_details || frm.doc.shipment_details.length === 0) {
        console.log("No shipment details to update tracking for");
        return;
    }
    
    // Skip tracking updates if manifest is on hold
    if (frm.doc.is_on_hold) {
        console.log("Skipping tracking update because manifest is on hold");
        return;
    }
    
    console.log("Updating consignment tracking for workflow state:", frm.doc.workflow_state);
    
    // Get unique AWBs to avoid duplicate updates
    const consignmentNotes = frm.doc.shipment_details.map(item => item.cal_awb);
    const uniqueConsignmentNotes = [...new Set(consignmentNotes.filter(Boolean))]; // Remove nulls and duplicates
    
    if (uniqueConsignmentNotes.length === 0) {
        console.log("No valid AWBs to update tracking for");
        return;
    }
    
    // Create an array to keep track of all update promises
    let updatePromises = [];
    
    // Update tracking for each AWB
    uniqueConsignmentNotes.forEach(awb => {
        // Skip invalid AWBs
        if (!awb || typeof awb !== 'string' || awb.trim() === '') {
            console.log("Skipping invalid AWB");
            return;
        }
        
        // Create a promise for this update
        const updatePromise = new Promise((resolve, reject) => {
            frappe.call({
                method: "frappe.client.get_value",
                args: {
                    doctype: "Consignment Note",
                    filters: { "name": awb.trim() },
                    fieldname: ["name"],
                    // Force no-cache to get fresh data
                    no_cache: 1
                },
                callback: function(result) {
                    if (result.message) {
                        // Get the document for updating
                        frappe.model.with_doc("Consignment Note", awb.trim(), function() {
                            var doc = frappe.model.get_doc("Consignment Note", awb.trim());
                            
                            // Check if this status already exists
                            let statusExists = false;
                            if (doc.tracking_table && doc.tracking_table.length > 0) {
                                statusExists = doc.tracking_table.some(function(row) {
                                    // Improved matching - allow for status with or without spaces
                                    return (row.status === `${frm.doc.workflow_state}` || 
                                           row.status === ` ${frm.doc.workflow_state}`) && 
                                          row.manifest_id === frm.doc.name;
                                });
                            }
                            
                            // If status doesn't exist, add it
                            if (!statusExists) {
                                // Add new row to tracking_table child table
                                var new_row = frappe.model.add_child(doc, "Tracking Table", "tracking_table");
                                // No space before status
                                new_row.status = `${frm.doc.workflow_state}`;
                                new_row.timestamp = get_utc_timestamp(); // Use UTC timestamp
                                new_row.manifest_id = frm.doc.name;
                                
                                // Special handling for Arrived at Destination Airport
                                if (frm.doc.workflow_state === "Arrived at Destination Airport") {
                                    // Set is_manifest_check to 1 directly
                                    doc.is_manifest_check = 1;
                                }
                                
                                // Save the document with retry mechanism
                                save_doc_with_retry(doc, function(success) {
                                    if (success) {
                                        console.log(`Successfully updated tracking for ${awb}`);
                                        resolve();
                                    } else {
                                        console.error(`Failed to update tracking for ${awb}`);
                                        resolve(); // Still resolve to continue with other operations
                                    }
                                });
                            } else {
                                console.log(`Tracking entry already exists for ${awb}`);
                                
                                // Even if tracking exists, ensure is_manifest_check is set for Arrived at Destination Airport
                                if (frm.doc.workflow_state === "Arrived at Destination Airport" && !doc.is_manifest_check) {
                                    doc.is_manifest_check = 1;
                                    
                                    save_doc_with_retry(doc, function(success) {
                                        if (success) {
                                            console.log(`Updated is_manifest_check for ${awb}`);
                                        } else {
                                            console.error(`Failed to update is_manifest_check for ${awb}`);
                                        }
                                        resolve();
                                    });
                                } else {
                                    resolve();
                                }
                            }
                        });
                    } else {
                        console.error(`Could not find consignment note with ID: ${awb}`);
                        resolve(); // Still resolve to continue with other operations
                    }
                }
            });
        });
        
        updatePromises.push(updatePromise);
    });
    
    // Wait for all updates to complete before proceeding
    Promise.all(updatePromises).then(() => {
        console.log("All tracking updates completed");
        
        // Only reload if we're in one of these critical states to avoid conflicts
        if (frm.doc.workflow_state === "Manifest Order Generated" || 
            frm.doc.workflow_state === "Uplifted" ||
            frm.doc.workflow_state === "Arrived at Destination Airport") {
            
            // Use a small delay before reloading to prevent conflicts
            setTimeout(() => {
                // Reload the document to get fresh state and avoid conflicts
                frm.reload_doc();
            }, 1000);
        }
    });
}