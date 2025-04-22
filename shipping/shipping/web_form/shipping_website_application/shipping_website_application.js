// // var location

// frappe.ready(function() {
// 	if (navigator.geolocation) {
// 		navigator.geolocation.getCurrentPosition((position) => {
// 			var location
// 			fetch(`https://api.geoapify.com/v1/geocode/reverse?lat=${position.coords.latitude}&lon=${position.coords.longitude}&apiKey=dda23c30773142718c67fb2cca5c4c6c`)
// 				.then(response => response.json())
// 				.then(result => {
// 				if (result.features.length) {
// 				  location = result.features[0].properties.city
// 				  frappe.web_form.set_value('location', `${location}`);
// 				} else {
// 				  console.log("No address found");
// 				}
// 			});
// 			}, (error) => {
// 				console.error("Error getting location:", error);
// 			});
// 			} else {
// 			console.error("Geolocation is not supported by this browser.");
// 	}
	// // bind events here
	// function success(position) {
	// 	const latitude = position.coords.latitude;
	// 	const longitude = position.coords.longitude;
	
	// }
	// function error(err) {
	// 	console.warn(`ERROR(${err.code}): ${err.message}`);
	// }
	// const options = {
	// 	enableHighAccuracy: true,
	// 	timeout: 5000,
	// 	maximumAge: 0,
	// };
	// navigator.geolocation.getCurrentPosition(success);
	// console.log(123)
// // })

// frappe.web_form.on([location], [location])
// frappe.web_form.on('location', (field, value) => {
//     if (navigator.geolocation) {
//         navigator.geolocation.getCurrentPosition((position) => {
//             frappe.web_form.set_value('location', 
//                 `${position.coords.latitude}, ${position.coords.longitude}`);
//         }, (error) => {
//             console.error("Error getting location:", error);
//         });
//     } else {
//         console.error("Geolocation is not supported by this browser.");
//     }
// });

frappe.ready(function() {
    // Function to get query parameters
    // function getQueryParams() {
    //     const params = {};
    //     const queryString = window.location.search.substring(1);
    //     const regex = /([^&=]+)=([^&]*)/g;
    //     let m;
    //     while (m = regex.exec(queryString)) {
    //         params[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
    //     }
    //     return params;
    // }
	function getAllLinks() {
		//Array of unique links
		var arrLinks = [];
		//HTML collection of links
		var lc = document.links;
		for (var i = 0; i < lc.length; i++) {
			arrLinks.indexOf(lc[i].href) === -1 ? arrLinks.push(lc[i].href) : "";
		}
		return arrLinks;
	}

    // Get query parameters
    const params = getAllLinks();
    console.log("Query Parameters:", params); // Debugging statement

    // Set the value of the form fields with the query parameters
    if (params.id) {
        console.log("Setting id:", params.id); // Debugging statement
        frappe.web_form.set_value('id', params.id);
    }
    // if (params.destination) {
    //     console.log("Setting destination:", params.destination); // Debugging statement
    //     frappe.web_form.set_value('destination', params.destination);
    // }
    // if (params.branch_flag) {
    //     console.log("Setting branch_flag:", params.branch_flag); // Debugging statement
    //     frappe.web_form.set_value('branch_flag', params.branch_flag);
    // }

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            var location;
            fetch(`https://api.geoapify.com/v1/geocode/reverse?lat=${position.coords.latitude}&lon=${position.coords.longitude}&apiKey=dda23c30773142718c67fb2cca5c4c6c`)
                .then(response => response.json())
                .then(result => {
                    if (result.features.length) {
                        location = result.features[0].properties.city;
                        frappe.web_form.set_value('location', `${location}`);
                    } else {
                        console.log("No address found");
                    }
                });
        }, (error) => {
            console.error("Error getting location:", error);
        });
    } else {
        console.error("Geolocation is not supported by this browser.");
    }
});