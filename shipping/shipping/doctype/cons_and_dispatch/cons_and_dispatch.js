// frappe.ui.form.on('Cons and Dispatch', {
//     setup: function(frm) {
//         // Fetching user details
//         var Current_User = frappe.session.user;
//         console.log(Current_User);
//         frappe.call({
//             method: "frappe.client.get",
//             args: {
//                 doctype: "User",
//                 filters: {
//                     'email': Current_User
//                 },
//             },
//             callback: function(r) {
//                 frm.set_value("name1", r.message["full_name"]);
//             }
//         });
//     },

//     refresh: function(frm) {
//         if (frm.doc.docstatus === 1) {
//             frm.add_custom_button(__('Go to Manifest Order'), function() { 
//                 createManifestOrders(frm);
//             });
//         }
//     },

//     date: function(frm) {
//         // Clear the existing dispatch items to avoid duplicates
//         frm.clear_table('dispatch_item');
//         frm.refresh_field('dispatch_item');

//         // Fetch the Consignment Notes for the selected date
//         frappe.call({
//             method: "frappe.client.get_list",
//             args: {
//                 doctype: "Consignment Note",
//                 filters: {
//                     'datetime': frm.doc.date
//                 },
//                 fields: ['name', 'destination', 'total_weight']
//             },
//             callback: function(r) {
//                 if (r.message && r.message.length > 0) {
//                     r.message.forEach(item => {
//                         frm.add_child('dispatch_item', {
//                             awb: item.name,
//                             destination: item.destination,
//                             net_weight: item.total_weight
//                         });
//                     });
//                 }

//                 frm.refresh_field("dispatch_item");

//                 // Fetch and add pending AWB items
//                 frappe.call({
//                     method: "frappe.client.get_list",
//                     args: {
//                         doctype: "Cons and Dispatch Item",
//                         filters: {
//                             'dispatch': 'No'
//                         },
//                         parent: 'Cons and Dispatch',
//                         fields: ['name', 'destination', 'net_weight', 'remarks']
//                     },
//                     callback: function(r) {
//                         if (r.message && r.message.length > 0) {
//                             r.message.forEach(item => {
//                                 frm.add_child('dispatch_item', {
//                                     awb: item.name,
//                                     destination: item.destination,
//                                     net_weight: item.net_weight,
//                                     remarks: item.remarks
//                                 });
//                             });
//                         }

//                         frm.refresh_field('dispatch_item');
//                     }
//                 });
//             }
//         });
//     }
// });

// function createManifestOrders(frm) {
//     console.log("Processing consignment notes for manifest orders...");

//     // Fetch valid locations
//     frappe.call({
//         method: "frappe.client.get_list",
//         args: {
//             doctype: "Location",
//             fields: ["name", "location_name"],
//             limit: 0 // Fetch all locations
//         },
//         callback: function(r) {
//             if (!r.message || r.message.length === 0) {
//                 frappe.throw(__("No locations found. Please set up locations first."));
//                 return;
//             }

//             console.log("Available locations:", r.message);

//             // Create a mapping of location names to valid location values
//             const locationMapping = {};
//             r.message.forEach(location => {
//                 // Store both the name and location_name in the mapping
//                 if (location.location_name) {
//                     locationMapping[location.location_name.toLowerCase().trim()] = location.name;
//                 }
//                 locationMapping[location.name.toLowerCase().trim()] = location.name;
                
//                 // Log each mapping for debugging
//                 console.log(`Location mapping - Original: ${location.name}, Lowercase: ${location.name.toLowerCase().trim()}`);
//                 if (location.location_name) {
//                     console.log(`Location name mapping - Original: ${location.location_name}, Lowercase: ${location.location_name.toLowerCase().trim()}`);
//                 }
//             });

//             console.log("Full location mapping:", locationMapping);

//             let packages_by_destination = {};

//             // Grouping dispatch items by destination
//             frm.doc.dispatch_item.forEach(item => {
//                 if (item.dispatch === "Yes") {
//                     const destinationKey = item.destination.toLowerCase().trim();
//                     console.log(`Processing destination: ${item.destination}, Lowercase: ${destinationKey}`);
                    
//                     if (!packages_by_destination[destinationKey]) {
//                         packages_by_destination[destinationKey] = [];
//                     }
//                     packages_by_destination[destinationKey].push(item);
//                 }
//             });

//             console.log("Packages grouped by destination:", packages_by_destination);

//             // Creating Manifest Orders
//             for (let destination in packages_by_destination) {
//                 const validLocationValue = locationMapping[destination];
                
//                 console.log(`Checking destination: ${destination}`);
//                 console.log(`Found valid location value: ${validLocationValue}`);
                
//                 if (!validLocationValue) {
//                     frappe.msgprint(__(`Warning: No matching location found for destination "${destination}". Available locations are: ${Object.keys(locationMapping).join(", ")}`));
//                     continue;
//                 }

//                 let manifest_order = frappe.model.get_new_doc('Manifest Order');
//                 manifest_order.port_of_destination = validLocationValue;

//                 manifest_order.shipment_details = [];

//                 packages_by_destination[destination].forEach(item => {
//                     manifest_order.shipment_details.push({
//                         doctype: 'Shipment Details',
//                         cal_awb: item.awb,
//                         weight: item.net_weight,
//                         pieces_number: item.no_of_pieces || 1,
//                         remarks: item.remarks || ""
//                     });
//                 });

//                 // Calculate and set totals
//                 let total_weight = 0;
//                 let total_pieces = 0;
//                 manifest_order.shipment_details.forEach(item => {
//                     total_weight += parseFloat(item.weight || 0);
//                     total_pieces += parseInt(item.pieces_number || 0);
//                 });
//                 manifest_order.total_weight = total_weight;
//                 manifest_order.total_no_of_pieces = total_pieces;

//                 console.log("Creating manifest order with data:", manifest_order);

//                 frappe.db.insert(manifest_order)
//                     .then(() => {
//                         frappe.show_alert({
//                             message: __(`Manifest Order created for destination: ${destination}`),
//                             indicator: 'green'
//                         });
//                     })
//                     .catch(err => {
//                         console.error(`Error creating Manifest Order for destination: ${destination}`, err);
//                         frappe.show_alert({
//                             message: __(`Error creating Manifest Order for ${destination}: ${err.message}`),
//                             indicator: 'red'
//                         });
//                     });
//             }
//         }
//     });
// }


// frappe.ui.form.on('Cons and Dispatch Item', {
//      bag_no: function(frm, cdt, cdn) {
//         let child = locals[cdt][cdn];
        
//         // Create the bag map if it doesn't exist
//         if (!frm.bag_weight_map) {
//             frm.bag_weight_map = {};
//         }

//         // If the selected bag number exists in the map, auto-set the bag weight
//         if (frm.bag_weight_map[child.bag_no]) {
//             frappe.model.set_value(cdt, cdn, 'bag_weightkg', frm.bag_weight_map[child.bag_no]);
//         }
//      },

//      bag_weightkg: function(frm, cdt, cdn) {
//         let child = locals[cdt][cdn];

//         // Create the map if it doesn't exist
//         if (!frm.bag_weight_map) {
//             frm.bag_weight_map = {};
//         }

//         // Save the selected weight for the bag number
//         if (child.bag_no) {
//             frm.bag_weight_map[child.bag_no] = child.bag_weightkg;
//         }
//     }
// })



// frappe.ui.form.on('Cons and Dispatch Item', {
//     bag_no: function(frm, cdt, cdn) {
//         let child = locals[cdt][cdn];

//         if (!frm.bag_weight_map) frm.bag_weight_map = {};

//         // Auto-fill saved bag weight if exists
//         if (frm.bag_weight_map[child.bag_no]) {
//             frappe.model.set_value(cdt, cdn, 'bag_weightkg', frm.bag_weight_map[child.bag_no]);
//         }

//         // Calculate remaining for this specific row only
//         calculate_remaining_for_row(frm, cdt, cdn);
//     },

//     bag_weightkg: function(frm, cdt, cdn) {
//         let child = locals[cdt][cdn];

//         if (!frm.bag_weight_map) frm.bag_weight_map = {};

//         // Save weight only if bag_no is selected
//         if (child.bag_no) {
//             frm.bag_weight_map[child.bag_no] = flt(child.bag_weightkg);
//         }

//         // Recalculate remaining for all rows when bag weight changes
//         calculate_remaining_for_all_rows(frm);
//     },

//     net_weight: function(frm, cdt, cdn) {
//         // Check only this specific row
//         check_bag_capacity(frm, cdt, cdn);
//     }
// });

// function calculate_remaining_for_row(frm, cdt, cdn) {
//     let child = locals[cdt][cdn];
//     let bag_capacity_map = frm.bag_weight_map || {};

//     if (child.bag_no && bag_capacity_map[child.bag_no]) {
//         let bag_no = child.bag_no;
//         let total_capacity = flt(bag_capacity_map[bag_no]);

//         // Sum weights of all OTHER rows with same bag number (excluding current row)
//         let other_rows_total = frm.doc.dispatch_item
//             .filter(r => r.name !== child.name && r.bag_no === bag_no)
//             .reduce((sum, r) => sum + flt(r.net_weight), 0);

//         // Calculate available space
//         let available_space = total_capacity - other_rows_total;
        
//         // Update remaining bag weight for current row
//         frappe.model.set_value(cdt, cdn, 'remaining_bag_weight', Math.max(0, available_space));
//     } else {
//         frappe.model.set_value(cdt, cdn, 'remaining_bag_weight', 0);
//     }
// }

// function calculate_remaining_for_all_rows(frm) {
//     let bag_capacity_map = frm.bag_weight_map || {};

//     frm.doc.dispatch_item.forEach(current_row => {
//         if (current_row.bag_no && bag_capacity_map[current_row.bag_no]) {
//             let bag_no = current_row.bag_no;
//             let total_capacity = flt(bag_capacity_map[bag_no]);

//             // Sum weights of all OTHER rows with same bag number
//             let other_rows_total = frm.doc.dispatch_item
//                 .filter(r => r.name !== current_row.name && r.bag_no === bag_no)
//                 .reduce((sum, r) => sum + flt(r.net_weight), 0);

//             let available_space = total_capacity - other_rows_total;
            
//             // Update remaining bag weight
//             frappe.model.set_value(current_row.doctype, current_row.name, 'remaining_bag_weight', Math.max(0, available_space));
//         } else {
//             frappe.model.set_value(current_row.doctype, current_row.name, 'remaining_bag_weight', 0);
//         }
//     });
// }

// function check_bag_capacity(frm, cdt, cdn) {
//     let child = locals[cdt][cdn];
//     let bag_capacity_map = frm.bag_weight_map || {};

//     if (child.bag_no && bag_capacity_map[child.bag_no] && flt(child.net_weight) > 0) {
//         let bag_no = child.bag_no;
//         let total_capacity = flt(bag_capacity_map[bag_no]);

//         // Sum weights of all OTHER rows with same bag number
//         let other_rows_total = frm.doc.dispatch_item
//             .filter(r => r.name !== child.name && r.bag_no === bag_no)
//             .reduce((sum, r) => sum + flt(r.net_weight), 0);

//         let available_space = total_capacity - other_rows_total;
//         let current_weight = flt(child.net_weight);

//         // Check if current weight exceeds available space
//         if (current_weight > available_space) {
//             frappe.msgprint({
//                 title: 'Insufficient Bag Space',
//                 message: `Bag No ${bag_no} does not have enough space for this item. Available: ${available_space} kg, Required: ${current_weight} kg`,
//                 indicator: 'red'
//             });

//             // Reset only this specific row
//             frappe.model.set_value(cdt, cdn, 'net_weight', 0);
//             frappe.model.set_value(cdt, cdn, 'bag_no', '');
//             frappe.model.set_value(cdt, cdn, 'bag_weightkg', 0);
//             frappe.model.set_value(cdt, cdn, 'remaining_bag_weight', 0);
            
//             return; // Don't update remaining weights if there's an error
//         }
//     }

//     // Update remaining weights for all rows after successful validation
//     calculate_remaining_for_all_rows(frm);
// }

// // Define createManifestOrders function first
// function createManifestOrders(frm) {
//     console.log("Processing consignment notes for manifest orders...");
//     let packages_by_destination = {};
//     let processed_awbs = [];
    
//     // First, group by destination
//     frm.doc.dispatch_item.forEach(item => {
//         if (item.dispatch === "Yes") {
//             if (!packages_by_destination[item.destination]) {
//                 packages_by_destination[item.destination] = [];
//             }
            
//             packages_by_destination[item.destination].push(item);
//             processed_awbs.push(item.awb);
//         }
//     });
    
//     console.log("Packages grouped by destination:", packages_by_destination);
    
//     // For each destination, further group by airline_name
//     for (let destination in packages_by_destination) {
//         let packages_by_airline = {};
        
//         // Group items by airline_name
//         packages_by_destination[destination].forEach(item => {
//             const airline = item.airline_name || "Unknown";
            
//             if (!packages_by_airline[airline]) {
//                 packages_by_airline[airline] = [];
//             }
            
//             packages_by_airline[airline].push(item);
//         });
        
//         console.log(`Packages for destination ${destination} grouped by airline:`, packages_by_airline);
        
//         // Create a manifest order for each airline within this destination
//         for (let airline in packages_by_airline) {
//             let manifest_order = frappe.model.get_new_doc('Manifest Order');
            
//             manifest_order.port_of_destination = destination;
//             manifest_order.airline_name = airline !== "Unknown" ? airline : "";
//             manifest_order.date = frappe.datetime.get_today();
//             manifest_order.workflow_state = "Manifest Generated"; // Explicitly set workflow state
            
//             // Get first item to set origin (if available)
//             let first_item = packages_by_airline[airline][0];
//             if (first_item.origin) {
//                 manifest_order.port_of_origin = first_item.origin;
//                 manifest_order.branch_flag = first_item.branch_flag;
//             }
            
//             manifest_order.shipment_details = [];
//             let total_pieces = 0;
//             let total_weight = 0;
            
//             packages_by_airline[airline].forEach(item => {
//                 const pieces = item.no_of_pieces || 1;
//                 const weight = parseFloat(item.net_weight) || 0;
                
//                 total_pieces += parseInt(pieces);
//                 total_weight += weight;
                
//                 manifest_order.shipment_details.push({
//                     doctype: 'Shipment Details',
//                     cal_awb: item.awb,
//                     weight: item.net_weight,
//                     length: item.length,
//                     width: item.width,
//                     height: item.height,
//                     pieces_number: pieces,
//                     remarks: item.remarks || ""
//                 });
//             });
            
//             manifest_order.total_no_of_pieces = total_pieces;
//             manifest_order.total_weight = total_weight.toFixed(2);
            
//             // Insert manifest order and then update workflow state separately to ensure it's saved correctly
//             frappe.db.insert(manifest_order).then((doc) => {
//                 console.log(`Manifest Order created for destination: ${destination}, airline: ${airline}`);
                
//                 // Explicitly update the workflow state after insertion
//                 frappe.call({
//                     method: "frappe.client.set_value",
//                     args: {
//                         doctype: "Manifest Order",
//                         name: doc.name,
//                         fieldname: "workflow_state",
//                         value: "Manifest Generated"
//                     },
//                     callback: function(r) {
//                         if (r.message) {
//                             console.log(`Updated workflow_state for Manifest Order ${doc.name} to "Manifest Generated"`);
//                         }
//                     }
//                 });
                
//                 // Update dispatch_flag for all processed AWBs (consignment notes)
//                 updateConsignmentNotesDispatchFlag(packages_by_airline[airline]);
                
//             }).catch(err => {
//                 console.error(`Error creating Manifest Order for destination: ${destination}, airline: ${airline}`, err);
//             });
//         }
//     }
// }
// function updateConsignmentNotesDispatchFlag(items) {
//     items.forEach(item => {
//         frappe.call({
//             method: "frappe.client.set_value",
//             args: {
//                 doctype: "Consignment Note",
//                 name: item.awb,
//                 fieldname: "dispatch_flag",
//                 value: 1
//             },
//             callback: function(r) {
//                 if (r.message) {
//                     console.log(`Updated dispatch_flag for ${item.awb} to true`);
//                 }
//             }
//         });
//     });
// }

// // Function to set the username
// function setUserName(frm) {
//     var Current_User = frappe.session.user;
//     console.log(Current_User);
//     frappe.call({
//         method: "frappe.client.get",
//         args: {
//             doctype: "User",
//             filters: {
//                 'email': Current_User
//             },
//         },
//         callback: function(r) {
//             if (r.message && r.message.full_name) {
//                 frm.set_value("name1", r.message.full_name);
//             }
//         }
//     });
// }

// function loadConsignmentNotes(frm) {
//     // Store current dispatch and airline values before clearing the table
//     let savedValues = {};
//     if (frm.doc.dispatch_item && frm.doc.dispatch_item.length > 0) {
//         frm.doc.dispatch_item.forEach(item => {
//             if (item.awb) {
//                 savedValues[item.awb] = {
//                     dispatch: item.dispatch,
//                     airline_name: item.airline_name
//                 };
//             }
//         });
//     }

//     // Clear the existing dispatch items to avoid duplicates
//     frm.clear_table('dispatch_item');
//     frm.refresh_field('dispatch_item');

//     // Fetch ALL Consignment Notes with dispatch_flag = false, regardless of date
//     frappe.call({
//         method: "frappe.client.get_list",
//         args: {
//             doctype: "Consignment Note",
//             filters: {
//                 'dispatch_flag': 0  
//             },
//             fields: ['name', 'origin', 'destination', 'branch_flag', 'total_weight', 'total_number_of_pieces']
//         },
//         callback: function(r) {
//             console.log("Fetched consignment notes:", r);
            
//             // Create an array of promises for all the get_doc calls
//             let promises = [];
            
//             if (r.message && r.message.length > 0) {
//                 r.message.forEach(item => {
//                     let promise = frappe.db.get_doc("Consignment Note", item.name).then((val) => {
//                         let no_of_pieces = 0;
//                         let total_length = 0;
//                         let total_width = 0;
//                         let total_height = 0;
                        
//                         for(let i = 0; i < val.check_shipment_details.length; i++) {
//                             no_of_pieces += parseFloat(val.check_shipment_details[i].pieces_no || 0);
//                             total_length += parseFloat(val.check_shipment_details[i]?.lengthcm || 0);
//                             total_width += parseFloat(val.check_shipment_details[i].widthcm || 0);
//                             total_height += parseFloat(val.check_shipment_details[i].heightcm || 0);
//                         }
                        
//                         // Restore saved values if they existed before
//                         let savedItem = savedValues[item.name] || {};
                        
//                         frm.add_child('dispatch_item', {
//                             branch_flag: item.branch_flag,
//                             awb: item.name,
//                             origin: item.origin,
//                             destination: item.destination,
//                             net_weight: item.total_weight,
//                             length: total_length,
//                             width: total_width,
//                             height: total_height,
//                             no_of_pieces: no_of_pieces,
//                             dispatch: savedItem.dispatch || null,
//                             airline_name: savedItem.airline_name || null
//                         });
//                     });
                    
//                     promises.push(promise);
//                 });
//             }
            
//             // Wait for all promises to resolve before refreshing the field
//             Promise.all(promises).then(() => {
//                 frm.refresh_field("dispatch_item");
                
//                 // Now fetch and add pending AWB items
//                 loadPendingItems(frm, savedValues);
//             }).catch(err => {
//                 console.error("Error loading consignment notes:", err);
//                 frm.refresh_field("dispatch_item");
//                 // Still try to load pending items even if there was an error
//                 loadPendingItems(frm, savedValues);
//             });
//         }
//     });
// }
// // Updated function to load pending AWB items with saved values preservation
// // function loadPendingItems(frm, savedValues) {
// //     frappe.call({
// //         method: "frappe.client.get_list",
// //         args: {
// //             doctype: "Cons and Dispatch Item",
// //             filters: {
// //                 'dispatch': 'No'
// //             },
// //             parent: 'Cons and Dispatch',
// //             fields: ['name', 'origin', 'destination', 'branch_flag', 'net_weight', 'no_of_pieces', 'remarks']
// //         },
// //         callback: function(r) {
// //             if (r.message && r.message.length > 0) {
// //                 r.message.forEach(item => {
// //                     // Restore saved values if they existed before
// //                     let savedItem = savedValues[item.name] || {};
                    
// //                     frm.add_child('dispatch_item', {
// //                         branch_flag: item.branch_flag,
// //                         awb: item.name,
// //                         origin: item.origin,
// //                         destination: item.destination,
// //                         net_weight: item.net_weight,
// //                         no_of_pieces: item.no_of_pieces,
// //                         remarks: item.remarks,
// //                         dispatch: savedItem.dispatch || null,
// //                         airline_name: savedItem.airline_name || null
// //                     });
// //                 });
// //                 frm.refresh_field('dispatch_item');
// //             }
// //         }
// //     });
// // }

// // Then define the form event handlers
// frappe.ui.form.on('Cons and Dispatch', {
//     setup: function(frm) {
//         // Set the username
//         setUserName(frm);
//     },
    
//     refresh: function(frm) {
//         // Set username on every refresh if not already set
//         let manifest_flag = true;
//         if (!frm.doc.name1) {
//             setUserName(frm);
//         }
        
//         if(frm.doc.workflow_state == "Approved") {
//             createManifestOrders(frm);
//         }
        
//         if(frm.doc.workflow_state=="Manifest Order Generated"){
//             frm.add_custom_button(__('Go to Manifest Order'), function() {
//                 frappe.set_route('List', 'Manifest Order', {});
//             })
//         }
//     },
    
//     date: function(frm) {
//         loadConsignmentNotes(frm);
//     },
// });

// Define createManifestOrders function first
function createManifestOrders(frm) {
    console.log("Processing consignment notes for manifest orders...");
    let packages_by_destination = {};
    let processed_awbs = [];
    
    // First, group by destination
    frm.doc.dispatch_item.forEach(item => {
        if (item.dispatch === "Yes") {
            if (!packages_by_destination[item.destination]) {
                packages_by_destination[item.destination] = [];
            }
            
            packages_by_destination[item.destination].push(item);
            processed_awbs.push(item.awb);
        }
    });
    
    console.log("Packages grouped by destination:", packages_by_destination);
    
    // For each destination, further group by airline_name
    for (let destination in packages_by_destination) {
        let packages_by_airline = {};
        
        // Group items by airline_name
        packages_by_destination[destination].forEach(item => {
            const airline = item.airline_name || "Unknown";
            
            if (!packages_by_airline[airline]) {
                packages_by_airline[airline] = [];
            }
            
            packages_by_airline[airline].push(item);
        });
        
        console.log(`Packages for destination ${destination} grouped by airline:`, packages_by_airline);
        
        // Create a manifest order for each airline within this destination
        for (let airline in packages_by_airline) {
            let manifest_order = frappe.model.get_new_doc('Manifest Order');
            
            manifest_order.port_of_destination = destination;
            manifest_order.airline_name = airline !== "Unknown" ? airline : "";
            manifest_order.date = frappe.datetime.get_today();
            manifest_order.workflow_state = "Manifest Generated"; // Explicitly set workflow state
            
            // Get first item to set origin (if available)
            let first_item = packages_by_airline[airline][0];
            if (first_item.origin) {
                manifest_order.port_of_origin = first_item.origin;
                manifest_order.branch_flag = first_item.branch_flag;
            }
            
            manifest_order.shipment_details = [];
            let total_pieces = 0;
            let total_weight = 0;
 
            // Unique bag number logic
            let bag_set = new Set();
            let blank_bag_flag = false;

            packages_by_airline[airline].forEach(item => {
            const pieces = item.no_of_pieces || 1;
            const weight = parseFloat(item.net_weight) || 0;

            total_pieces += parseInt(pieces);
            total_weight += weight;

            // Unique bag logic
            if (item.bag_no) {
        bag_set.add(item.bag_no);
    } else {
        blank_bag_flag = true;
    }

    manifest_order.shipment_details.push({
        doctype: 'Shipment Details',
        cal_awb: item.awb,
        bag_no : item.bag_no,
        weight: item.net_weight,
        length: item.length,
        width: item.width,
        height: item.height,
        pieces_number: pieces,
        remarks: item.remarks || ""
    });
});

// manifest_order.total_no_of_pieces = total_pieces;
manifest_order.total_weight = total_weight.toFixed(2);
console.log("Hellooooooo", bag_set.size)
manifest_order.total_no_of_pieces = bag_set.size + (blank_bag_flag ? 1 : 0);   

        frappe.call({
            method: "frappe.client.save",
            args: {
                doc: manifest_order
            },
            callback: function(r) { 
                if (r.message) {
                    console.log(`Manifest Order created for destination: ${destination}, airline: ${airline}`);
                    
                    // Explicitly update the workflow state after insertion
                    // frappe.call({
                    //     method: "frappe.client.set_value",
                    //     args: {
                    //         doctype: "Manifest Order",
                    //         name: r.message.name,
                    //         fieldname: "workflow_state",
                    //         value: "Manifest Generated"
                    //     },
                    //     callback: function(r) {
                    //         if (r.message) {
                    //             console.log(`Updated workflow_state for Manifest Order ${r.message.name} to "Manifest Generated"`);
                    //         }
                    //     }
                    // });
                    
                    // Update dispatch_flag for all processed AWBs (consignment notes)
                    updateConsignmentNotesDispatchFlag(packages_by_airline[airline]);
                }
            }
        })
            
            // frappe.db.insert(manifest_order).then((doc) => {
            //     console.log(`Manifest Order created for destination: ${destination}, airline: ${airline}`);
                
            //     // Explicitly update the workflow state after insertion
            //     frappe.call({
            //         method: "frappe.client.set_value",
            //         args: {
            //             doctype: "Manifest Order",
            //             name: doc.name,
            //             fieldname: "workflow_state",
            //             value: "Manifest Generated"
            //         },
            //         callback: function(r) {
            //             if (r.message) {
            //                 console.log(`Updated workflow_state for Manifest Order ${doc.name} to "Manifest Generated"`);
            //             }
            //         }
            //     });
                
            //     // Update dispatch_flag for all processed AWBs (consignment notes)
            //     updateConsignmentNotesDispatchFlag(packages_by_airline[airline]);
                
            // }).catch(err => {
            //     console.error(`Error creating Manifest Order for destination: ${destination}, airline: ${airline}`, err);
            // });
        }
    }
}

function updateConsignmentNotesDispatchFlag(items) {
    items.forEach(item => {
        // Only update if it's a valid Consignment Note (starts with CAL-)
        if (item.awb && item.awb.startsWith("CAL-")) {
            frappe.call({
                method: "frappe.client.set_value",
                args: {
                    doctype: "Consignment Note",
                    name: item.awb,
                    fieldname: "dispatch_flag",
                    value: 1
                },
                callback: function(r) {
                    if (r.message) {
                        console.log(`Updated dispatch_flag for ${item.awb} to true`);
                    }
                }
            });
        }
    });
}

let userLocation = null;

// Function to set the username
function setUserName(frm) {
    var Current_User = frappe.session.user;
    console.log(Current_User);
    frappe.call({
        method: "frappe.client.get",
        args: {
            doctype: "User",
            filters: {
                'email': Current_User
            },
        },
        callback: function(r) {
            if (r.message && r.message.full_name) {
                frm.set_value("name1", r.message.full_name);
            }
            
            userLocation = r.message.location || null;
            console.log("Locationnnnnnnn", userLocation);
            
            // if(frm.doc.date && frm.doc.dispatch_item.length === 0) {
            //     loadConsignmentNotes(frm);
            // }
           
            
        }
    });
}

function loadConsignmentNotes(frm) {
    // Store current dispatch and airline values before clearing the table


    console.log("consignment notes")
    let savedValues = {};
    if (frm.doc.dispatch_item && frm.doc.dispatch_item.length > 0) {
        frm.doc.dispatch_item.forEach(item => {
            if (item.awb) {
                savedValues[item.awb] = {
                    dispatch: item.dispatch,
                    airline_name: item.airline_name
                };
            }
        });
    }

    // Clear the existing dispatch items to avoid duplicates
    frm.clear_table('dispatch_item');
    frm.refresh_field('dispatch_item');
    
     if (!userLocation) {
        frappe.msgprint("User location not found. Please ensure your location is set in your User profile.");
        return;
    }

    // Fetch only proper Consignment Notes with dispatch_flag = false
    // frappe.call({
    //     method: "frappe.client.get_list",
    //     args: {
    //         doctype: "Consignment Note",
    //         filters: {
    //             'dispatch_flag': 0,
    //             'origin': userLocation,
    //             // 'workflow_state': "Verified Weight/Dimension"
    //             'workflow_state': ['in', ["Verified Weight/Dimension", "Payment Received and Issued Invoice"]],
    //             // 'status': ['!=', 'Cancelled']
    //             'status': ['not in', ['Cancelled', 'Unconsolidation']]
    //         },
    //         fields: ['name', 'origin', 'destination' ,'branch_flag', 'total_weight', 'total_number_of_pieces', 'workflow_state'],
    //         // fields:['*'],
    //         limit_page_length: 1000
    //     },
    //     callback: function(r) {
    //         console.log("Fetched consignment notes:", r);
            
    //         // Create an array of promises for all the get_doc calls
    //         let promises = [];
            
    //         if (r.message && r.message.length > 0) {
    //             console.log("message", r.message)
    //             r.message.forEach(item => {
    //                 // Only process items that start with "CAL-" (valid consignment notes)
    //                 if (item.name && item.name.startsWith("CAL-")) {
    //                     let promise = frappe.db.get_doc("Consignment Note", item.name).then((val) => {
    //                         let no_of_pieces = 0;
    //                         let total_length = 0;
    //                         let total_width = 0;
    //                         let total_height = 0;
                            
    //                         for(let i = 0; i < val.check_shipment_details.length; i++) {
    //                             no_of_pieces += parseFloat(val.check_shipment_details[i].pieces_no || 0);
    //                             total_length += parseFloat(val.check_shipment_details[i]?.lengthcm || 0);
    //                             total_width += parseFloat(val.check_shipment_details[i].widthcm || 0);
    //                             total_height += parseFloat(val.check_shipment_details[i].heightcm || 0);
    //                         }
                            
    //                         // Restore saved values if they existed before
    //                         let savedItem = savedValues[item.name] || {};
                            
    //                         frm.add_child('dispatch_item', {
    //                             branch_flag: item.branch_flag,
    //                             awb: item.name,
    //                             origin: item.origin,
    //                             destination: item.destination,
    //                             net_weight: item.total_weight,
    //                             length: total_length,
    //                             width: total_width,
    //                             height: total_height,
    //                             no_of_pieces: no_of_pieces,
    //                             dispatch: savedItem.dispatch ,
    //                             airline_name: savedItem.airline_name || null
    //                         });
    //                     });
                        
    //                     promises.push(promise);
    //                 }
    //             });
    //         }
            
    //         // Wait for all promises to resolve before refreshing the field
    //         Promise.all(promises).then(() => {
    //             frm.refresh_field("dispatch_item");
                
    //             // We're removing this call as it's the source of the junk data
    //             // loadPendingItems(frm, savedValues);
    //         }).catch(err => {
    //             console.error("Error loading consignment notes:", err);
    //             frm.refresh_field("dispatch_item");
    //         });
    //     }
    // });
    
    // frappe.call({
    //     method: "shipping.shipping.doctype.cons_and_dispatch.cons_and_dispatch.get_consignment_notes",
    //     args: {
    //         userLocation: userLocation,
    //     },
    //     callback: function(r) {
    //         console.log("Fetched consignment notes:", r);
    //         let promises = [];
    //         if (r.message && r.message.length > 0) {
    //             console.log("message", r)
    //             r.message.forEach(item => {
    //                 // Only process items that start with "CAL-" (valid consignment notes)
    //                 if (item.name && item.name.startsWith("CAL-")) {
    //                     let promise = frappe.db.get_doc("Consignment Note", item.name).then((val) => {
    //                         let no_of_pieces = 0;
    //                         let total_length = 0;
    //                         let total_width = 0;
    //                         let total_height = 0;
                            
    //                         for(let i = 0; i < val.check_shipment_details.length; i++) {
    //                             no_of_pieces += parseFloat(val.check_shipment_details[i].pieces_no || 0);
    //                             total_length += parseFloat(val.check_shipment_details[i]?.lengthcm || 0);
    //                             total_width += parseFloat(val.check_shipment_details[i].widthcm || 0);
    //                             total_height += parseFloat(val.check_shipment_details[i].heightcm || 0);
    //                         }
                            
    //                         // Restore saved values if they existed before
    //                         let savedItem = savedValues[item.name] || {};
                            
    //                         frm.add_child('dispatch_item', {
    //                             branch_flag: item.branch_flag,
    //                             awb: item.name,
    //                             origin: item.origin,
    //                             destination: item.destination,
    //                             net_weight: item.total_weight,
    //                             length: total_length,
    //                             width: total_width,
    //                             height: total_height,
    //                             no_of_pieces: no_of_pieces,
    //                             dispatch: savedItem.dispatch ,
    //                             airline_name: savedItem.airline_name || null
    //                         });
    //                     });
                        
    //                     // promises.push(promise);
    //                     frm.refresh_field("dispatch_item");
    //                 }
    //             });
    //         }
            
    //         // Wait for all promises to resolve before refreshing the field
    //         // Promise.all(promises).then(() => {
    //         //     frm.refresh_field("dispatch_item");
                
    //         //     // We're removing this call as it's the source of the junk data
    //         //     // loadPendingItems(frm, savedValues);
    //         // }).catch(err => {
    //         //     console.error("Error loading consignment notes:", err);
    //         //     frm.refresh_field("dispatch_item");
    //         // });
    //     }
    // });
    // frappe.call({
    // method: "shipping.shipping.doctype.cons_and_dispatch.cons_and_dispatch.get_consignment_notes",
    // args: {
    //     userLocation: userLocation,
    // },
    // callback: function (r) {
    //     let promises = [];
    //     let valid_items = [];

    //     if (r.message && r.message.length > 0) {
            
    //         r.message.forEach(item => {
    //             if (item.name && item.name.startsWith("CAL-")) valid_items.push(item)
    //         });
    //         if (valid_items.length === 0) return;

    //         showProgressBar(frm); 

            
    //         valid_items.forEach((item, idx) => {
    //             let promise = frappe.db.get_doc("Consignment Note", item.name).then((val) => {
    //                 let no_of_pieces = 0, total_length = 0, total_width = 0, total_height = 0;
    //                 for (let i = 0; i < val.check_shipment_details.length; i++) {
    //                     no_of_pieces += parseFloat(val.check_shipment_details[i].pieces_no || 0);
    //                     total_length += parseFloat(val.check_shipment_details[i]?.lengthcm || 0);
    //                     total_width += parseFloat(val.check_shipment_details[i].widthcm || 0);
    //                     total_height += parseFloat(val.check_shipment_details[i].heightcm || 0);
    //                 }
    //                 let savedItem = savedValues[item.name] || {};
    //                 frm.add_child('dispatch_item', {
    //                     branch_flag: item.branch_flag,
    //                     awb: item.name,
    //                     origin: item.origin,
    //                     destination: item.destination,
    //                     net_weight: item.total_weight,
    //                     length: total_length,
    //                     width: total_width,
    //                     height: total_height,
    //                     no_of_pieces: no_of_pieces,
    //                     dispatch: savedItem.dispatch,
    //                     airline_name: savedItem.airline_name || null
    //                 });

                    
    //                 let percent_complete = Math.round(((idx + 1) / valid_items.length) * 100);
    //                 updateProgressBar(percent_complete);
    //             });
    //             promises.push(promise);
    //         });
    //         Promise.all(promises).then(() => {
    //             frm.refresh_field("dispatch_item");
    //         });
    //     }
    //     }
    // });
    frappe.call({
    method: "shipping.shipping.doctype.cons_and_dispatch.cons_and_dispatch.get_consignment_notes",
    args: {
        userLocation: userLocation,
    },
    callback: function(r) {
        let promises = [];
        let valid_items = [];

        if (r.message && r.message.length > 0) {
            r.message.forEach(item => {
                if (item.name && item.name.startsWith("CAL-")) valid_items.push(item);
            });
            if (valid_items.length === 0) return;

            let totalItems = valid_items.length;

            valid_items.forEach((item, idx) => {
                let promise = frappe.db.get_doc("Consignment Note", item.name).then(val => {
                    let no_of_pieces = 0, total_length = 0, total_width = 0, total_height = 0;
                    for (let i = 0; i < val.check_shipment_details.length; i++) {
                        no_of_pieces += parseFloat(val.check_shipment_details[i].pieces_no || 0);
                        total_length += parseFloat(val.check_shipment_details[i]?.lengthcm || 0);
                        total_width += parseFloat(val.check_shipment_details[i].widthcm || 0);
                        total_height += parseFloat(val.check_shipment_details[i].heightcm || 0);
                    }

                    let savedItem = savedValues[item.name] || {};
                    frm.add_child('dispatch_item', {
                        branch_flag: item.branch_flag,
                        awb: item.name,
                        origin: item.origin,
                        destination: item.destination,
                        net_weight: item.total_weight,
                        length: total_length,
                        width: total_width,
                        height: total_height,
                        no_of_pieces: no_of_pieces,
                        dispatch: savedItem.dispatch,
                        airline_name: savedItem.airline_name || null
                    });

                    frappe.show_progress(
                        'Loading Consignments',
                        idx + 1,
                        totalItems,
                        `Processing item ${idx + 1} of ${totalItems}`
                    );

                    if ((idx + 1) === totalItems) {
                        frm.refresh_field("dispatch_item");
                    }
                });

                promises.push(promise);
            });

            Promise.all(promises).catch(e => {
                console.error('Error processing consignment notes', e);
                frm.refresh_field("dispatch_item");
            });
        }
    }
});
}
//////////////////////////////////////////////

// function showProgressBar(frm) {
//     if (!document.getElementById('consignment-progress-bar')) {
//         let barContainer = document.createElement('div');
//         barContainer.id = "consignment-progress-bar-container";
//         barContainer.style = "margin:10px 0;height:24px;width:300px;background:#e0e0e0;border-radius:12px;overflow:hidden;";

//         let bar = document.createElement('div');
//         bar.id = "consignment-progress-bar";
//         bar.style = "height:100%;width:0;background:#47a076;transition:width 0.3s;text-align:center;color:#fff;line-height:24px;font-size:14px;";

//         barContainer.appendChild(bar);

//         // Attach this above the field you'd like, here using the wrapper of the form's main container
//         frm.fields_dict.dispatch_item.grid.wrapper.prepend(barContainer);
//     }
// }
// function updateProgressBar(percent) {
//     let bar = document.getElementById('consignment-progress-bar');
//     if (bar) {
//         bar.style.width = percent + "%";
//         bar.innerText = percent + "%";
//         if (percent >= 100) setTimeout(() => bar.parentNode.remove(), 500); // Optional: remove after completion
//     }
// }
///////////////////////////////////////////////
// Removed loadPendingItems function as it's the source of the junk data

// Then define the form event handlers
frappe.ui.form.on('Cons and Dispatch', {
    setup: function(frm) {
        // Set the username
        setUserName(frm);
    },
   
    refresh: function(frm) {
        
        // Set username on every refresh if not already set
        let manifest_flag = true;
        if (!frm.doc.name1) {
            setUserName(frm);
        }
        
        // if(frm.doc.workflow_state == "Approved") {
            // createManifestOrders(frm);
        // }
        
        if(frm.doc.workflow_state=="Manifest Order Generated"){
            frm.add_custom_button(__('Go to Manifest Order'), function() {
                frappe.set_route('List', 'Manifest Order', {});
            })
        }
    },
   

    
    date: function(frm) {
        const selected_date = frm.doc.date;
        const today = frappe.datetime.get_today();
        
        // console.log("helooooooo kemchooo", today)


        if (selected_date > today) {
            frappe.msgprint(__('Future dates are not allowed'));
            // frm.set_value('date', today);
             frm.set_value('date', '');
              frm.clear_table('dispatch_item');
        frm.refresh_field('dispatch_item');
        }
        if(selected_date && (selected_date <= today)){
        loadConsignmentNotes(frm);
    }
    },
});



