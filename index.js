

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
      var marker = L.marker([place.latitude, place.longitude]).addTo(map);

      marker.on('click', function(e) {

        console.log("Clicked marker for " + place.name);
        infoBox.style.display = 'block';
        flipBoxInner.classList.remove('clicked');
        flipBoxInner.style.backgroundImage = 'url("/static/' + place.icon + '")'

        currentActiveMarkerLatlng = e.latlng;
        updateInfoBoxPosition(currentActiveMarkerLatlng);
        addCharacters(currentActiveMarkerLatlng, place.characters);
        addDescription(currentActiveMarkerLatlng, place);

        setTimeout(function() {
          flipBoxInner.classList.add('clicked');
        }, 100)

        disableMapInteraction();

      });
    });
  })
  .catch(error => {
      console.error('Error loading the JSON data:', error);
  });

// pop up effect
var currentActiveMarkerLatlng = null;
var flipBoxInner = document.querySelector('.flip-box-inner');
var infoBox = document.getElementById('infoBox');


map.on('moveend', function() {
  var currentLatLng = currentActiveMarkerLatlng;
  updateInfoBoxPosition(currentLatLng);
  updateCustomElements()
});

function updateInfoBoxPosition(latlng) {
  var point = map.latLngToContainerPoint(latlng);
  var infoBoxHeight = infoBox.offsetHeight;

  infoBox.style.left = point.x + 'px';
  infoBox.style.top = point.y - 25 - infoBoxHeight + 'px';
  infoBox.style.zIndex = 1000;
  console.log(infoBox.style.bottom)
}

// Add character cluster and description
var currentCircles = [];
function addCharacters(latlng, imageArray) {
  // clearCircle();
  var offset = 80;

  imageArray.forEach(function(imageUrl){
    var element = document.createElement('div');
    element.style.width = '70px';
    element.style.height = '70px';
    element.style.backgroundImage = 'url("/static/' + imageUrl + '")';
    element.style.backgroundSize = 'cover';
    element.style.borderRadius = '50%';
    element.style.position = 'absolute';
    element.className = 'character-circle';
  
    var point = map.latLngToLayerPoint(latlng);
    element.style.left = point.x + offset + 'px';
    element.style.top = point.y + 'px';
    offset += 80;
  
    map.getPanes().overlayPane.appendChild(element);
    currentCircles.push(element);
  })
}


function updateCustomElements() {
    var elements = document.querySelectorAll('.character-circle');
    var latlng = currentActiveMarkerLatlng;
    var point = map.latLngToLayerPoint(latlng);
    var offset = 80;

    elements.forEach(function(element) {
        element.style.left = point.x + offset + 'px';
        element.style.top = point.y + 'px';
        offset += 80;
    });
}

function clearCircle() {
  currentCircles.forEach(function(element) {
    if (element.parentNode) {
      element.parentNode.removeChild(element);
    }
  });
  currentCircles = [];
}

function addDescription(latlng, place) {
  var textBoxTitle = document.getElementById('textBoxTitle')
  textBoxTitle.textContent = place.name;
  textBoxTitle.style.width = '300px';
  textBoxTitle.style.position = 'absolute';
  textBoxTitle.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
  textBoxTitle.style.fontSize = '20px';
  textBoxTitle.style.padding = '10px';
  textBoxTitle.zIndex = 1000;
  textBoxTitle.style.display = 'block';

  var textBox = document.getElementById('textBox');
  textBox.textContent = place.description;
  textBox.style.width = '300px';
  textBox.style.position = 'absolute';
  textBox.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
  textBox.style.fontSize = '16px';
  textBox.style.padding = '10px';
  textBox.zIndex = 1000;
  textBox.style.display = 'block';

  var closeButton = document.createElement('button');
  closeButton.innerText = 'X';
  closeButton.onclick = function(e) {
    e.stopPropagation()

    textBoxTitle.style.display = 'none';
    textBox.style.display = 'none';

    flipBoxInner.style.backgroundImage = ''
    clearCircle();

    enableMapInteraction();
    infoBox.style.zIndex = 0;

  }
  closeButton.style.position = 'absolute';
  closeButton.style.top = '5px';
  closeButton.style.right = '5px';

  textBoxTitle.appendChild(closeButton);

  var point = map.latLngToLayerPoint(latlng);
  textBoxTitle.style.left = point.x + 80 + 'px';
  textBoxTitle.style.top = point.y + 80 + 'px';
  map.getPanes().popupPane.appendChild(textBoxTitle);
  textBox.style.left = point.x + 80 + 'px';
  textBox.style.top = point.y + 130 + 'px';
  map.getPanes().popupPane.appendChild(textBox);
};

function disableMapInteraction() {
  map.dragging.disable();
  map.touchZoom.disable();
  map.doubleClickZoom.disable();
  map.scrollWheelZoom.disable();
  map.boxZoom.disable();
  map.keyboard.disable();
  if (map.tap) map.tap.disable();
};

function enableMapInteraction() {
  map.dragging.enable();
  map.touchZoom.enable();
  map.doubleClickZoom.enable();
  map.scrollWheelZoom.enable();
  map.boxZoom.enable();
  map.keyboard.enable();
  if (map.tap) map.tap.enable();
}