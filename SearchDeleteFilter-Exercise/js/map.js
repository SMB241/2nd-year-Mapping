$(document).ready(function () {
    var map = L.map('map').setView([10.669644, 122.948844], 17);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    var geocoder = L.Control.Geocoder.photon();

    L.Control.geocoder({
        collapsed: false,
        placeholder: "Search for a place",
        geocoder: geocoder
    }).addTo(map);

    var tempMarker = null;
    var markers = [];         
    var latlngs = [];         
    var polygons = [];        
    var distanceLabels = [];  
    var markerMap = {};       
    var markerID = null;
 
    function clearForm() {
        $("#lat").val('');
        $("#lng").val('');
        $("#category").val('');
        $("#name").val('');
        $("#description").val('');
    }

    var customControl = L.control({ position: 'topright' });
    customControl.onAdd = function () {
        var div = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
        L.DomEvent.disableClickPropagation(div);

        var resetBtn = L.DomUtil.create('button', '', div);
        resetBtn.innerHTML = "Reset Zoom";
        resetBtn.style.display = "block";
        resetBtn.style.width = "100%";
        resetBtn.onclick = function (e) {
            L.DomEvent.stopPropagation(e);
            map.setView([10.669644, 122.948844], 17);
        };

        var plotBtn = L.DomUtil.create('button', '', div);
        plotBtn.innerHTML = "Plot";
        plotBtn.style.display = "block";
        plotBtn.style.width = "100%";
        plotBtn.onclick = function (e) {
            L.DomEvent.stopPropagation(e);
            clearForm();
            $("#plotForm").show();
        };

        var postBtn = L.DomUtil.create('button', '', div);
        postBtn.innerHTML = "Post";
        postBtn.style.display = "block";
        postBtn.style.width = "100%";
        postBtn.onclick = function (e) {
            L.DomEvent.stopPropagation(e);
            markers.forEach(m => map.removeLayer(m));
            polygons.forEach(p => map.removeLayer(p));
            distanceLabels.forEach(l => map.removeLayer(l));
            markers = [];
            latlngs = [];
            polygons = [];
            distanceLabels = [];
            markerMap = {};

            $.ajax({
                url: "forms/fetch_location.php",
                type: "GET",
                success: function (response) {
                    var res = JSON.parse(response);
                    if (res.status === "success") {
                        res.data.forEach(function (loc) {
                            let lat = parseFloat(loc.latitude);
                            let lng = parseFloat(loc.longitude);
                            let category = loc.category;
                            let name = loc.name;
                            let description = loc.description;
                            let id = loc.id;

                            let iconpath = '';
                            if (category === 'Restaurant') {
                                iconpath = 'assets/images/restaurant.png';
                            } else if (category === 'Church') {
                                iconpath = 'assets/images/church.png';
                            } else if (category === 'Mall') {
                                iconpath = 'assets/images/mall.png';
                            } else if (category === 'School') {
                                iconpath = 'assets/images/school.png';
                            } else {
                                iconpath = 'assets/images/park.png';
                            }

                            var customIcon = L.icon({
                                iconUrl: iconpath,
                                iconSize: [50, 50],
                                iconAnchor: [25, 50],
                                popupAnchor: [0, -50]
                            });

                            var marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);

                            marker.bindPopup(
                                "<b>" + name.toUpperCase() + "</b><br>" + category + "<br>" + description,
                                { autoClose: false, closeOnClick: false }
                            ).openPopup();

                            markers.push(marker);
                            latlngs.push([lat, lng]);

                            markerMap[name.toLowerCase()] = { marker: marker, id: id };
                        });

                        if (latlngs.length >= 2) {
                            for (let i = 1; i < latlngs.length; i++) {
                                let p1 = latlngs[i - 1];
                                let p2 = latlngs[i];

                                var segment = L.polygon([p1, p2], {
                                    color: 'blue',
                                    weight: 3,
                                    fillColor: 'lightblue',
                                    fillOpacity: 0.3
                                }).addTo(map);
                                polygons.push(segment);
                            }

                            map.fitBounds(L.polyline(latlngs).getBounds());
                        }
                    } else {
                        alert("No locations found.");
                    }
                },
                error: function () {
                    alert("Error fetching locations.");
                }
            });
        };

        var clearBtn = L.DomUtil.create('button', '', div);
        clearBtn.innerHTML = "Clear";
        clearBtn.style.display = "block";
        clearBtn.style.width = "100%";
        clearBtn.onclick = function (e) {
            L.DomEvent.stopPropagation(e);

            markers.forEach(m => map.removeLayer(m));
            markers = [];
            latlngs = [];

            polygons.forEach(p => map.removeLayer(p));
            polygons = [];

            distanceLabels.forEach(l => map.removeLayer(l));
            distanceLabels = [];

            if (tempMarker) {
                map.removeLayer(tempMarker);
                tempMarker = null;
            }

            clearForm();
            map.setView([10.669644, 122.948844], 17);
        };

        return div;
    };

    customControl.addTo(map);

    $("#newBtn").click(function (e) {
        e.stopPropagation();
        clearForm();
        if (tempMarker) {
            map.removeLayer(tempMarker);
            tempMarker = null;
        }
    });

    $("#closeForm").click(function (e) {
        e.stopPropagation();
        $("#plotForm").hide();
        if (tempMarker) {
            map.removeLayer(tempMarker);
            tempMarker = null;
        }
    });

    map.on("movestart", function () {
        if ($("#plotForm").is(":visible")) {
            if (tempMarker) {
                map.removeLayer(tempMarker);
                tempMarker = null;
            }
            $("#plotForm").hide();
        }
    });

    map.on("click", function (e) {
        if ($(e.originalEvent.target).closest("#plotForm, .leaflet-control").length > 0) {
            return;
        }

        var lat = e.latlng.lat.toFixed(6);
        var lng = e.latlng.lng.toFixed(6);

        if (tempMarker) {
            map.removeLayer(tempMarker);
        }

        tempMarker = L.marker([lat, lng]).addTo(map);

        clearForm();
        $("#plotForm").show();
        $("#lat").val(lat);
        $("#lng").val(lng);
    });

    $("#saveBtn").click(function (e) {
        e.stopPropagation();
        var lat = parseFloat($("#lat").val());
        var lng = parseFloat($("#lng").val());
        var category = $("#category").val();
        var name = $("#name").val();
        var description = $("#description").val();

        if (!isNaN(lat) && !isNaN(lng) && category !== "") {
            $.ajax({
                url: "forms/save_location.php",
                type: "POST",
                data: {
                    latitude: lat,
                    longitude: lng,
                    category: category,
                    name: name,
                    description: description
                },
                success: function (response) {
                    var res = JSON.parse(response);

                    if (res.status === "success") {
                        if (tempMarker) {
                            map.removeLayer(tempMarker);
                            tempMarker = null;
                        }

                        let iconpath = '';
                        if (category === 'Restaurant') {
                            iconpath = 'assets/images/restaurant.png';
                        } else if (category === 'Church') {
                            iconpath = 'assets/images/church.png';
                        } else if (category === 'Mall') {
                            iconpath = 'assets/images/mall.png';
                        } else if (category === 'School') {
                            iconpath = 'assets/images/school.png';
                        } else {
                            iconpath = 'assets/images/park.png';
                        }

                        var customIcon = L.icon({
                            iconUrl: iconpath,
                            iconSize: [50, 50],
                            iconAnchor: [25, 50],
                            popupAnchor: [0, -50]
                        });

                        var marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);

                        marker.bindPopup(
                            "<b>" + name.toUpperCase() + "</b><br>" + category + "<br>" + description,
                            { autoClose: false, closeOnClick: false }
                        ).openPopup();

                        markers.push(marker);
                        markerMap[name.toLowerCase()] = marker; 

                        $("#plotForm").hide();
                        alert("Saved successfully!");
                    } else {
                        alert(res.message);
                    }
                },
                error: function () {
                    alert("Error connecting to server.");
                }
            });
        } else {
            alert("Please enter valid latitude, longitude, and category.");
        }
    });

    $("#searchBtn").click(function () {
        var query = $("#searchInput").val().trim().toLowerCase();
        if (query === "") {
            alert("Please enter a location name.");
            return;  
        }

        if (markerMap[query]) {
            $("#deleteBtn").prop("disabled", false)

            var marker = markerMap[query].marker;  
            var latlng = marker.getLatLng();
            var markerIndex = markers.indexOf(marker);
            var temp = [];

            $.each(markerMap, function(value, marker){
                temp.push(marker);
            });

            temp.forEach((element, index) => {
                if(index === markerIndex){
                    markerID = element.id;
                }
            });

            map.flyTo(latlng, 18, {
                animate: true,       
                duration: 1.5        
            });

            marker.openPopup();
        } else {
            alert("Location not found.");
        }
    });

    const fetchData = (e)=>{
         L.DomEvent.stopPropagation(e);
                    markers.forEach(m => map.removeLayer(m));
            polygons.forEach(p => map.removeLayer(p));
            distanceLabels.forEach(l => map.removeLayer(l));
            markers = [];
            latlngs = [];
            polygons = [];
            distanceLabels = [];
            markerMap = {};

            $.ajax({
                url: "forms/fetch_location.php",
                type: "GET",
                success: function (response) {
                    var res = JSON.parse(response);
                    if (res.status === "success") {
                        res.data.forEach(function (loc) {
                            let lat = parseFloat(loc.latitude);
                            let lng = parseFloat(loc.longitude);
                            let category = loc.category;
                            let name = loc.name;
                            let description = loc.description;
                            let id = loc.id;

                            let iconpath = '';
                            if (category === 'Restaurant') {
                                iconpath = 'assets/images/restaurant.png';
                            } else if (category === 'Church') {
                                iconpath = 'assets/images/church.png';
                            } else if (category === 'Mall') {
                                iconpath = 'assets/images/mall.png';
                            } else if (category === 'School') {
                                iconpath = 'assets/images/school.png';
                            } else {
                                iconpath = 'assets/images/park.png';
                            }

                            var customIcon = L.icon({
                                iconUrl: iconpath,
                                iconSize: [50, 50],
                                iconAnchor: [25, 50],
                                popupAnchor: [0, -50]
                            });

                            var marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);

                            marker.bindPopup(
                                "<b>" + name.toUpperCase() + "</b><br>" + category + "<br>" + description,
                                { autoClose: false, closeOnClick: false }
                            ).openPopup();

                            markers.push(marker);
                            latlngs.push([lat, lng]);

                            markerMap[name.toLowerCase()] = { marker: marker, id: id };
                        });

                        if (latlngs.length >= 2) {
                            for (let i = 1; i < latlngs.length; i++) {
                                let p1 = latlngs[i - 1];
                                let p2 = latlngs[i];

                                var segment = L.polygon([p1, p2], {
                                    color: 'blue',
                                    weight: 3,
                                    fillColor: 'lightblue',
                                    fillOpacity: 0.3
                                }).addTo(map);
                                polygons.push(segment);
                            }

                            map.fitBounds(L.polyline(latlngs).getBounds());
                        }
                    } else {
                        alert("No locations found.");
                    }
                },
                error: function () {
                    alert("Error fetching locations.");
                }
            });
    }


    $("#deleteBtn").click(function (e) {
        // -- B O N U S   R O U N D --

        // .. Your coding journey starts here ..  
        // .. You are FREE to add or modify the given code ..  
        // .. You may use the internet, but accessing AI-related websites is strictly prohibited.
              // (0 score for violator)

        // .. Instructions ..  

        // 1.) Write your name, date, and section in a 1/8 crosswise format (per group).   
        // 2.) Please communicate with your group quietly to avoid disturbing others.
        // 3.) One-time checking only — all group members must produce identical output.   
        // 4.) When finished, please remain seated and continue working on your project, or quietly leave the room.

        // Do not erase the provided comment lines.
        // Read all instructions carefully before asking a question.

        // Finished or not – NO INTERACTION with other groups. (-10 pts for violator)
        // NO ROAMING AROUND – stay in your designated area. (-10 pts for violator)
        // Avoid making UNNECESSARY NOISE. (-10 pts for violator)

        // DURATION = 2 Hours
        // By 3:30, stay outside and wait until your group is called for checking."


        // ----------------------------------------------------------
        // [1] DELETE Routine - using id field (+1.5 pts final grade)

        // .. get id
        // .. code backend processing - delete_location.php inside forms folder

         $.ajax({
            url: "forms/delete_location.php",
            type: "POST",
            data:{markerID: markerID},
            success: (response)=>{
                const res = JSON.parse(response)

                if(res.status === "success"){
                    alert(res.message)
                    fetchData(e)
                }
                else{
                    alert("error")
                }
            },
            error: (response)=>{
                const res = JSON.parse(response)
                alert(res.message)
            }
        })

    });

    $('#filterCategory').select2({
        placeholder: 'Select category...',
        allowClear: true,
        width: '400px'
    });

   // Assuming you have global variables:
// map (Leaflet map instance), markers (array), polygons (array), latlngs (array), markerMap (object)

function clearMarkers() {
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];

    polygons.forEach(poly => map.removeLayer(poly));
    polygons = [];

    latlngs = [];
    markerMap = {};
}

$('#filterCategory').on('change', function () {
    const selectedCategories = $(this).val() || []; // get selected categories or empty array

    // AJAX request to fetch filtered markers
    $.ajax({
        url: "forms/filter_location.php",
        type: "POST",
        dataType: "json",
        data: { categoryList: selectedCategories },
        success: (response) => {
            if (response.status === "success") {
                clearMarkers();

                response.data.forEach(loc => {
                    const lat = parseFloat(loc.latitude);
                    const lng = parseFloat(loc.longitude);
                    const category = loc.category;
                    const name = loc.name;
                    const description = loc.description;
                    const id = loc.id;

                    // If categories selected, filter locally again just in case
                    if (selectedCategories.length > 0 && !selectedCategories.includes(category)) return;

                    const iconMap = {
                        "Restaurant": 'assets/images/restaurant.png',
                        "Church": 'assets/images/church.png',
                        "Mall": 'assets/images/mall.png',
                        "School": 'assets/images/school.png',
                        "Park": 'assets/images/park.png'
                    };
                    const iconPath = iconMap[category] || iconMap["Park"];

                    const customIcon = L.icon({
                        iconUrl: iconPath,
                        iconSize: [50, 50],
                        iconAnchor: [25, 50],
                        popupAnchor: [0, -50]
                    });

                    const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);

                    marker.bindPopup(
                        `<b>${name.toUpperCase()}</b><br>${category}<br>${description}`,
                        { autoClose: false, closeOnClick: false }
                    );

                    markers.push(marker);
                    latlngs.push([lat, lng]);
                    markerMap[name.toLowerCase()] = { marker, id };
                });

                // Draw polygons if 2 or more markers
                if (latlngs.length >= 2) {
                    for (let i = 1; i < latlngs.length; i++) {
                        const p1 = latlngs[i - 1];
                        const p2 = latlngs[i];

                        const segment = L.polygon([p1, p2], {
                            color: 'blue',
                            weight: 3,
                            fillColor: 'lightblue',
                            fillOpacity: 0.3
                        }).addTo(map);

                        polygons.push(segment);
                    }

                    map.fitBounds(L.polyline(latlngs).getBounds());
                }
            } else {
                console.error("Server error:", response.message);
            }
        },
        error: (xhr, status, error) => {
            console.error("AJAX error:", error);
        }
    });
});



    $("#searchInput").keypress(function (e) {
        if (e.which === 13) {
            $("#searchBtn").click();
        }
    });
});
