$(document).ready(function () {
    var map = L.map('map').setView([10.669644, 122.948844], 17);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    var tempMarker = null;
    var markers = [];           

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
            $.ajax({
                url: "forms/fetch_location.php",
                type: "GET",
                success: function (response) {
                    var res = JSON.parse(response);
                    if (res.status === "success") {
                        res.data.forEach(function (loc) {
                            let lat = parseFloat(loc.latitude);
                            let lng = parseFloat(loc.longitude);
                            let desc =loc.description ;
                            let cat = loc.category;
                            let name = loc.name;

                            if (tempMarker) {
                            map.removeLayer(tempMarker);
                            tempMarker = null;
                        }

                        let iconpath = '';
                        if (cat === 'Gas Station') {
                            iconpath = 'assets/images/gas.png';
                        } else {
                            iconpath = 'assets/images/EV.png';
                        }

                        var customIcon = L.icon({
                            iconUrl: iconpath,
                            iconSize: [50, 50],
                            iconAnchor: [25, 50],
                            popupAnchor: [0, -50]
                        });
                        var marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);
                        marker.bindPopup(
                            "<b>" + name.toUpperCase() + "</b><br>" + cat + "<br>" + desc,
                            { autoClose: false, closeOnClick: false }
                        ).openPopup();
                        markers.push(marker);                       
                        });
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

        // Code clear routine here...
        clearBtn.onclick = function (e) {
            L.DomEvent.stopPropagation(e);
            map.setView([10.669644, 122.948844], 17);
            for(let i = 0; i<markers.length; i++){
                map.removeLayer(markers[i]);
            }
            markers=[];
             for(var i = 0; i<poly.length; i++){
                map.removeLayer(poly[i]);
            }
            poly=[];
    
           
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
                        if (category === 'Gas Station') {
                            iconpath = 'assets/images/gas.png';
                        } else {
                            iconpath = 'assets/images/EV.png';
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
});
