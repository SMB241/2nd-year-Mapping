$(document).ready(function () {
    var map = L.map('map').setView([10.669644, 122.948844], 17);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    var customControl = L.control({ position: 'topright' });
    customControl.onAdd = function () {
        var div = L.DomUtil.create('div', 'leaflet-bar leaflet-control');

        var resetBtn = L.DomUtil.create('button', '', div);
        resetBtn.innerHTML = "Reset Zoom";
        resetBtn.style.display = "block";
        resetBtn.style.width = "100%";
        resetBtn.onclick = function (e) {
            map.setView([10.669644, 122.948844], 17);
        };

        var plotBtn = L.DomUtil.create('button', '', div);
        plotBtn.innerHTML = "Plot";
        plotBtn.style.display = "block";
        plotBtn.style.width = "100%";
        plotBtn.onclick = function (e) {
            $("#plotForm").show();
        };
        return div;
    };

    customControl.addTo(map);

    $("#newBtn").click(function (e) {
        $("#lat").val('');
        $("#lng").val('');
        $("#category").val(1);
    });

    $("#closeForm").click(function (e) {
        $("#lat").val('');
        $("#lng").val('');
        $("#category").val(1);
        $("#plotForm").hide();
    });

    let marker;

    map.on("click", function (e) {

        if (marker) {
            map.removeLayer(marker);
        }

        marker = L.marker([e.latlng.lat, e.latlng.lng]).addTo(map);

        $("#lat").val(e.latlng.lat);
        $("#lng").val(e.latlng.lng);
    });


    $("#saveBtn").click(function () {
    let category = $("#category").val();

    if (category == 1) {
        alert("Please enter valid Latitude, Longitude, and Category");
    }

    $("#lat").val('');
    $("#lng").val('');
    $("#category").val(1);
});

});
