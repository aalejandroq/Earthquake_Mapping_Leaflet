// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojson"


// Perform a GET request to the query URL
d3.json(queryUrl, function (data) {
    // Once we get a response, send the data.features object to the createFeatures function
    createFeatures(data.features);
});

function getColor(mg) {
    return mg >= 8 ? "#800026":
           mg > 7 ? "#BD0026":
           mg > 6 ? "#E31A1C":
           mg > 5 ? "#FC4E2A":
           mg > 4 ?  "#FD8D3C":
           mg >= 3 ? "#FEB24C":
                      '#FED976';
}


function createFeatures(earthquakeData) {

    // Define a function we want to run once for each feature in the features array
    // Give each feature a popup describing the place and time of the earthquake
    function onEachFeature(feature, layer) {
        layer.bindPopup("<h3>" + feature.properties.place +
            "</h3><hr><p>" + new Date(feature.properties.time) + "</p>" +
            "<p> Magnitude: " + feature.properties.mag + "</p>");
    }

    function markerSize(mag) {

        return mag * Math.sqrt(mag);
    }


    function createCircleMarker(feature, latlng) {
        // Change the values of these options to change the symbol's appearance
        let options = {
            radius: markerSize(feature.properties.mag),
            fillColor: getColor(feature.properties.mag),
            color: "black",
            weight: 1,
            opacity: 0.75,
            fillOpacity: 0.8
        }
        return L.circleMarker(latlng, options);
    }
    // Create a GeoJSON layer containing the features array on the earthquakeData object
    // Run the onEachFeature function once for each piece of data in the array
    var earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: onEachFeature,
        pointToLayer: createCircleMarker

    });

    // Sending our earthquakes layer to the createMap function
    createMap(earthquakes);

}

function createMap(earthquakes) {

    // Define grayscaleMap and satelliteMap layers
    var grayscaleMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.light",
        accessToken: API_KEY
    });

    var satelliteMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.satellite",
        accessToken: API_KEY
    });

    var outdoorMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.outdoors",
        accessToken: API_KEY
    });

    // Define a baseMaps object to hold our base layers
    var baseMaps = {
        "Gray Scale Map": grayscaleMap,
        "Outdoor Map": outdoorMap,
        "Satellite Map": satelliteMap

    };

    // Create overlay object to hold our overlay layer
    var overlayMaps = {
        Earthquakes: earthquakes
    };

    // Create our map, giving it the grayscaleMap and earthquakes layers to display on load
    var myMap = L.map("map", {
        center: [
            10.5994, -7.6731
        ],
        zoom: 2.0,
        layers: [grayscaleMap, earthquakes]
    });

    // Create a layer control
    // Pass in our baseMaps and overlayMaps
    // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);


    // Custom Legend Control
    var legend = L.control({position: 'bottomright'});

    legend.onAdd = function () {

        var div = L.DomUtil.create('div', 'info legend'),
        magnitudes = [3, 4, 5, 6, 7];
           
        div.innerHTML += '<b>Magnitudes</b><br><hr>'   

        for (var i = 0; i < magnitudes.length; i++) {
            div.innerHTML +=
                '<i style="background:' + getColor(magnitudes[i] + 1) + '"></i> ' +
                + magnitudes[i] + (magnitudes[i + 1] ? "&ndash;" + magnitudes[i + 1] + '<br>' : ' + ');
        }

        return div;
    };

    legend.addTo(myMap);

}
