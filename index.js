

// Function to geocode address
function addMarkerByAddress(address) {
    var encodedAddress = encodeURIComponent(address);
    // Use a geocoding service to get coordinates
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}`)
        .then(response => response.json())
        .then(data => {
            if(data.length > 0) {
                var latLng = [data[0].lat, data[0].lon];
                L.marker(latLng).addTo(map);
            } else {
                console.log("Address not found");
            }
        });
}

// Usage
// addMarkerByAddress("上海市中山东一路27号");
// addMarkerByAddress("上海市黄浦区南京东路");
// addMarkerByAddress("上海市黄浦区南京东路街道黄河路50号");
// addMarkerByAddress("上海市四川北路1569弄");
// addMarkerByAddress("上海市虹口区长阳路65号");
// addMarkerByAddress("上海市进贤路");
// addMarkerByAddress("上海市东大名路649弄");

// set boundaries
// var map = L.map('map').setView([31.2304, 121.4737], 13);
var southWest = L.latLng(31.1, 121.1),
    northEast = L.latLng(31.3, 121.7);
var bounds = L.latLngBounds(southWest, northEast);

var map = L.map('map', {
    maxBounds: bounds,
    maxZoom: 19,
    minZoom: 4
});
map.setView([31.2304, 121.4737], 13)

L.tileLayer('https://tile.thunderforest.com/atlas/{z}/{x}/{y}.png?apikey=7ae6b66816a642f2a8366db832e95b4b', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);


// enable drop pin
map.on('click', function(e) {
    var coord = e.latlng;
    var lat = coord.lat;
    var lng = coord.lng;

    // Creating a marker and adding it to the map
    var newMarker = L.marker([lat, lng]).addTo(map);

    // Optionally, you can add a popup to the marker
    newMarker.bindPopup("You clicked the map at latitude: " + lat + " and longitude: " + lng).openPopup();
});

// get marker from json
fetch('places.json')
    .then(response => response.json())
    .then(data => {
        data.forEach(place => {
            L.marker([place.latitude, place.longitude]).addTo(map)
              .bindPopup(place.name);  // Assuming each place has 'lat', 'lng', and 'name' properties
        });
    })
    .catch(error => {
        console.error('Error loading the JSON data:', error);
    });

// pop up effect
