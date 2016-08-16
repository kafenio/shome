function _merge_obj(a, b) {
  var _ = {};
  for (var attr in a) { _[attr] = a[attr]; }
  for (var attr in b) { _[attr] = b[attr]; }
  return _;
};

var initMap = function () {

    // create a map in the "map" div
    var map = L.map('map').setView([59.8, 19], 8);

    // create an OpenStreetMap tile layer
    var osmLayer = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
    });
	// add OSM layer to the map
	osmLayer.addTo(map);
	
	// add OSM layer to layer control
	var lctl = new L.control.layers().addBaseLayer(osmLayer, "OSM");
	
	// add Google Satellite layer to layer control
	var ggl = new L.Google();
	lctl.addBaseLayer(ggl, 'Google Satellit');

	var kv = L.tileLayer('http://opencache.statkart.no/gatekeeper/gk/gk.open_gmaps?layers=sjo_hovedkart2&zoom={z}&x={x}&y={y}', {
		maxZoom: 20,
		attribution: '<a href="http://www.statkart.no/">Statens kartverk</a>'
	});    
    lctl.addBaseLayer(kv, 'Kartverket.no nautical chart');
	
	// add OpenSeaMap SeaMarks overlay
	var oseam = new L.TileLayer('http://tiles.openseamap.org/seamark/{z}/{x}/{y}.png', {
		maxZoom: 17, 
		attribution: '&copy; <a href="http://openseamap.org/copyright">OpenSeaMap</a> contributors'
	});
	oseam.addTo(map);
	lctl.addOverlay(oseam, "OpenSeaMap Seezeichen");
	
	var gpxfiles = {'02':'red',
					'03':'yellow',
					'04':'orange',
					'05':'red',
					'06':'purple',
					'08':'blue',
					'09':'cyan',
					'10':'magenta',
					'11':'green',
					'12':'gray',
					'13':'brown',
					'14':'black',
					'15':'magenta'};
	for(var entry in gpxfiles) {
	    var gpxlayer = new L.GPX("gpx/201408"+entry+".gpx", {
	        async: true,
	        marker_options: {
	            // define where the icons are
	            riseOnHover: true,
	            startIconUrl: 'images/pin-icon-start.png',
	            endIconUrl: 'images/pin-icon-end.png',
	            shadowUrl: 'images/pin-shadow.png'
	        },
	        // some more options passed to Leaflet Polyline http://leafletjs.com/reference.html#polyline
			polyline_options: {
				color: gpxfiles[entry],
				weight: 10
			},
	        clickable: true,
	    }).on('loaded', function(e) {
	        var gpx = e.target,
			distM = gpx.get_distance(),
			distNm = distM / 1852,
			distNmRnd = distNm.toFixed(1),
			avgSpd = gpx.get_moving_speed(),
			avgSpdKn = avgSpd / 1.852,
			avgSpdKnRnd = avgSpdKn.toFixed(1),
			startTime = gpx.get_start_time(),
			endTime = gpx.get_end_time();
			
			if (startTime == null) {
				startTime = new Date("00:00");
			}
			if (endTime == null) {
				endTime = new Date("00:00");
			}
			
			var avgSpdTxt = "";
			if (avgSpdKnRnd != "Infinity") {
				avgSpdTxt = "&empty;-Geschw.: " + avgSpdKnRnd + " kn";
			}
	        
	        gpx.getLayers()[0].bindPopup(
	        	"<b>" + gpx.get_name() + "</b><br/>" +
	        	"Datum: " + startTime.toLocaleDateString() + "<br/>" +
	            "L&auml;nge: " + distNmRnd + " sm </br>" + 
	            "Beginn: " + startTime.toLocaleTimeString() + "<br/>" +
	            "Ende: " + endTime.toLocaleTimeString() + "<br/>" +
	            "Dauer: " + gpx.get_duration_string(gpx.get_total_time(), false) + "<br/>" +
	            avgSpdTxt
	        );

	        lctl.addOverlay(e.target, gpx.get_name());
	        
	    }).addTo(map);
	};
	lctl.addTo(map);
}