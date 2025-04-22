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

