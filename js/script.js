// This script demonstrates some simple things one can do with leaflet.js


var map = L.map('map').setView([40.6881608,-73.9814856], 14);

var CartoDBTiles = L.tileLayer('http://tile.stamen.com/toner/{z}/{x}/{y}.png',{
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://stamen.com">Stamen</a>'
});



map.addLayer(CartoDBTiles);
// add in OSM Mapnik tiles
var OSMMapnikTiles = L.tileLayer('http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png',{
  attribution: 'Map Data and Tiles &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> Contributors'
});
// do not add to the map just yet, but add varible to the layer switcher control 

// add in MapQuest Open Aerial layer
var MapQuestAerialTiles = L.tileLayer('http://otile1.mqcdn.com/tiles/1.0.0/sat/{z}/{x}/{y}.png',{
  attribution: 'Tiles Courtesy of <a href="http://www.mapquest.com/" target="_blank">MapQuest</a> <img src="http://developer.mapquest.com/content/osm/mq_logo.png">'
});


var plutoGeoJSON;
var WBEbusinessGeoJSON;


addzoning();

function addzoning(){

    // let's add neighborhood data
    $.getJSON( "geojson/pluto_part.geojson", function(data) {
        // ensure jQuery has pulled all data out of the geojson file
    var dataset = data;

        var zoningstyle = function (features, latlng){
        var value = features.properties.allzoning1;

        // define zoning variables
        var M = "M";
        var C = "C";
        var R = "R";
        var P = "P";
            var fillColor = null;
            if(value.indexOf(M)>-1){
                fillColor = "#542788";
            }
            if(value.indexOf(R)>-1){
                fillColor = "#e08214";
            }
            if(value.indexOf(C)>-1){
                fillColor = "#b35806";
            }
            if(value.indexOf(P)>-1){
                fillColor = "#addd8e";
            }
            if(value.val === [null]){
                fillColor = "white";
            }

            console.log(P);

            var style = {
                weight: 0.5,
                opacity:1,
                color:fillColor,
                fillOpacity: 0.7,
                fillColor: fillColor
            };

            var fillColor = 0;
            return style;
            console.log(style);

        }
        var zoningClick = function (features, layer) {
            var value = features.properties.allzoning1;
            // let's bind some feature properties to a pop up
            layer.bindPopup("<strong>Zoning:</strong> " + features.properties.allzoning1+"<br><strong>Units:</strong> " + features.properties.unitstotal+"<br><strong>ZipCode:</strong> " + features.properties.zipcode);
        };

        // create Leaflet layer using L.geojson; don't add to the map just yet
        plutoGeoJSON = L.geoJson(dataset, {
            style: zoningstyle,
            onEachFeature: zoningClick
        });

        addWBEbusiness();

        });

}

function addWBEbusiness() {
    $.getJSON( "geojson/WBE_Brooklyn.geojson", function( data ) {
        var WBEbusiness = data;

        var WBEbusinessPointToLayer = function (Features, latlng){
            var WBEzipcode = Features.properties.zipcode;


            var WBEstyle= L.circle(latlng, 25,{
                fillColor: dotcolor(Features.properties.Ethnicity),
                stroke:0.25,
                fillOpacity: 0.75,
            });
            
            return WBEstyle;
            console.log(WBEzipcode)
           
        }

        function dotcolor (d){
            d == "ASIAN" ? '#006d2c':
            d == "BLACK" ? '#31a354':
            d == "HISPANIC" ? '#74c476':
                            '#edf8e9';
        }

        console.log (dotcolor);

        var WBEbusinessmouseover = function (Features, layer) {

            // let's bind some feature properties to a pop up
            layer.bindPopup("<strong>Name:</strong> " + Features.properties.Vendor_For+ "<br/><strong>Business Type: </strong>" + Features.properties.Goods_Mate +"<br/><strong>Address:</br></strong>" + Features.properties.Address1 + "<br/><strong>Area: </strong>" + Features.properties.MailingSta);
        }

        // create Leaflet layer using L.geojson; don't add to the map just yet
        WBEbusinessGeoJSON = L.geoJson(WBEbusiness, {
            pointToLayer: WBEbusinessPointToLayer,
            onEachFeature: WBEbusinessmouseover
        });


      // now lets add the data to the map in the order that we want it to appear

        // neighborhoods on the bottom
        plutoGeoJSON.addTo(map);
        //var bounds = plutoGeoJSON.getBounds();
        //map.fitBounds(bounds);

        WBEbusinessGeoJSON.addTo(map);

        // now create the layer controls!
        createLayerControls(); 

        });

}


var legend = L.control({position: 'bottomleft'});

legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend');
    
        div.innerHTML += 
            '<b>LandUse Type</b><br/>' +
            '<svg class="left" width="22" height="18"><circle cx="10" cy="9" r="8" class="legendSvg0"/></svg><span> Business Location </span><br />' +
            '<svg class="left" width="22" height="18"><rect width="300" height="100"class="legendSvg1"/></svg><span> Manufacturing</span><br />' +
            '<svg class="left" width="22" height="18"><rect width="300" height="100" class="legendSvg2"/></svg><span> Commercial</span><br />' +
            '<svg class="left" width="22" height="18"><rect width="300" height="100" class="legendSvg3"/></svg><span> Residential Area</span><br />' +
            '<b>Get the Data</b><br />' +
            '<span><a href=\"geojson/pluto_part.geojson\">Download Pluto GeoJson Data</a><br />' +
            '<a href=\"geojson/NYC_business.geojson\">Download NYC MBE/WBE Businesses in Brooklyn (CSV)</a><br />' +
            '</span><br />' +
            '<span>Data from the <a href=\"http://www1.nyc.gov/site/planning/index.page\">NYCityPlanning</a><br />' + 
            'Business data from <a href=\"https://nycopendata.socrata.com\">OpenData</a></span><br />';

;
    return div;
};

legend.addTo(map);

function createLayerControls(){

    // add in layer controls
    var baseMaps = {
        "CartoDB": CartoDBTiles,
        "OSM Mapnik": OSMMapnikTiles,
        "Mapquest Aerial": MapQuestAerialTiles
    };

    var overlayMaps = {
        "Zoning": plutoGeoJSON,
        "Small Businesses": WBEbusinessGeoJSON,
    };

    // add control
    L.control.layers(baseMaps, overlayMaps).addTo(map);
}

// add control

var Icon = L.icon({
    iconUrl: 'images/hivenlogo2.png',
    iconSize:     [40, 40], // size of the icon
    iconAnchor:   [22, 22], // point of the icon which will correspond to marker's location
    popupAnchor:  [0, -24] // point from which the popup should open relative to the iconAnchor
});
L.marker([40.692626, -73.964755],{icon: Icon}).addTo(map)
    .bindPopup('Pratt Institute')
    .openPopup();


//L.Control.geocoder().addTo(map);




