// MapAgent

var L = window.L;

function MapAgent(e, is_readonly, defaultpos, description) {
	this.readonly = is_readonly;
	this.defaultpos = defaultpos;
	this.desc = description
	this.createMap(e);
	return this;
}

MapAgent.prototype = {
	createMap: function(el) {
		if (!this.map) {
			// create a map in the "map" div 18.556587,46.75407
			this.map = new L.map(el,{ fullscreenControl: true });

			// create layer control
			var lctl = new L.control.layers();
			var lyr = {};
			for (mapsrc in window.mapsources) {
				var csrc = window.mapsources[mapsrc];
				if (csrc.show) {
					lyr[mapsrc] = eval(csrc.layer);
					lctl.addBaseLayer(lyr[mapsrc], mapsrc);
					if (mapsrc == window.defaultMapSrc) {
						this.map.addLayer(lyr[mapsrc]);
					}
				}
			}
			lctl.addTo(this.map);

			if (!this.readonly) {
				// create geocoder control
				var geocoder = L.Control.Geocoder.nominatim({ serviceUrl: 'https://nominatim.openstreetmap.org/' });
				var gctl = L.Control.geocoder({	position: 'topleft', geocoder: geocoder });
				gctl.addTo(this.map);

				// override markGeocode to disable positionupdates from gps and set new location
				gctl.markGeocode = function(result) {
				    console.log(JSON.stringify(result));
				    stopLocating();
				    app.trigger('updatePosition', { 'latitude': result.center.lat, 'longitude': result.center.lng }, result.html);
				};
			}
			
			if(this.defaultpos && this.defaultpos.latitude) {
			 	this.marker = this.addMarker(this.defaultpos, this.desc);
			}
		}
	},

	addMarker: function(pos, description, id) {
		var elem = id;
		var bounds;
		try {
			bounds = this.map.getBounds();
		} catch(e) {
			bounds = [];
		}

		var lat, lon, desc, dat, marker;
		if (pos) {
			lat = pos.latitude;
			lon = pos.longitude;
			if(description) {
				desc = description;
			} else {
				desc = "I'm here";
			}
		} else {
			lat = window.lastpos.latitude;
			lon = window.lastpos.longitude;
			desc = "I'm here";
		}
		bounds.push([lat, lon]);
		
		var startIcon = L.icon({ 
			iconUrl: 'assets/css/images/marker-icon.png',
			iconSize: [33,50],
			iconAnchor: [15,45],
			popupAnchor: [2, -35],
			shadowUrl: 'assets/css/images/marker-shadow.png',
		    shadowSize: [31],
		    shadowAnchor: [8,28]
		});
		if (this.readonly) {
			marker = L.marker([lat,lon],{id: "posm" });
		} else {
			marker = L.marker([lat,lon],{id: "posm", draggable: true});
			marker.on('dragend', this.updateMarkerPos);
		}
		
		marker.setIcon(startIcon).bindPopup("<b>"+desc+"</b><br/>"+millis2date(pos.time)+"<br/>"+pos2text(lat, lon));
		marker.addTo(this.map);
		
		this.map.fitBounds(bounds);

		marker.openPopup();

		return marker;
	},

	updateMarkerPos: function(everett){
			stopLocating();
			var mymarker = everett.target;
			if (mymarker) {
				var newpos = mymarker.getLatLng();
				app.trigger('updatePosition', { 'latitude': newpos.lat, 'longitude': newpos.lng});
			}
	},

	updateMarker: function(coords, description, marker) {
		if (coords) {
			if (description && description !== "") {
				desc = description;
			} else {
				desc = "I'm here";
			}
			if (marker) {
				var mymarker = marker;
			} else {
				var mymarker = this.marker;
			}
			mymarker.closePopup();
			mymarker.setLatLng([ coords.latitude, coords.longitude ]);
			mymarker.setPopupContent("<b>"+desc+"</b><br/>"+millis2date(coords.time)+"<br/>"+pos2text(coords.latitude, coords.longitude));
			mymarker.openPopup();
			var same = this;
			setTimeout(function() {
				same.map.panTo({lon: coords.longitude, lat: coords.latitude});
				mymarker.openPopup();
			},100)
		}
	},

	destroy: function() {
		this.map.remove();
	}
}