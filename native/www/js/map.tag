<map>

	<script>
		var self = this;

		try { 
			window.lastpos = JSON.parse(window.localStorage.getItem("lastpos")); 
		} catch(e) {
			window.lastpos = { latitude: 11.5678, longitude: 48.1234 };
		}

        window.defaultMapSrc = window.localStorage.getItem("defaultMapSrc");
        if (typeof window.defaultMapSrc === "undefined" || window.defaultMapSrc === null || window.defaultMapSrc === "") {
        		window.defaultMapSrc = "Openstreetmap";
        		window.localStorage.setItem("defaultMapSrc", "Openstreetmap");
        }

		try { 
			window.mapsources = JSON.parse(window.localStorage.getItem("mapsources")); 
		} catch(e) {
			console.log("error when loading mapsources");
		}
		window.mapsources = {
			"Openstreetmap": { 
				show: true,
				layer: "L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; <a href=\"http://osm.org/copyright\">OpenStreetMap</a> contributors'});"
			},
			"Google Satellit": { 
				show: true,
				layer: "new L.Google('SATELLITE');"
			},
			"Google Terrain": { 
				show: true,
				layer: "new L.Google('TERRAIN');"
			},
			"Google Roadmap": { 
				show: true,
				layer: "new L.Google('ROADMAP');"
			},
			"Google Hybrid": { 
				show: true,
				layer: "new L.Google('HYBRID');"
			},
		};
		window.localStorage.setItem("mapsources", JSON.stringify(window.mapsources));

		// Eventmanagement...
		app.on('updateMapSources', function(tmap, show) {
			window.mapsources[tmap].show = show;
			var showableMaps = [];
			for (i in window.mapsources) {
				if (window.mapsources[i].show) showableMaps.push(i);
			}
			if (tmap == window.defaultMapSrc) {	
				if (showableMaps.length > 0) {
					window.defaultMapSrc = showableMaps[0];
					window.localStorage.setItem("defaultMapSrc", showableMaps[0]);
					alert("New default map is now "+window.defaultMapSrc);
				} else {
					alert("Can't hide this map. It's the only one selected.");
					window.mapsources[tmap].show = true;
				}
			}
			window.localStorage.setItem("mapsources", JSON.stringify(window.mapsources));
			app.trigger("redrawMap");
		});

		app.on('updateDefaultMapSrc', function(tmap) {
			window.defaultMapSrc = tmap;
			window.localStorage.setItem("defaultMapSrc", tmap);
		});

		app.on('updatePosition', function(coords, desc, elem) {
			window.lastpos = coords;
			if (! window.currentPosMarker) {
				window.currentPosMarker = self.mapview.addMarker(coords, desc);
			} else {
				self.mapview.updateMarker(coords, desc, window.currentPosMarker);
			}
			setTimeout(function() {
				app.trigger("redrawMap");
			},100);
		});
		
		app.on('redrawMap', function() {
			var sm = self.mapview;
			sm.map.invalidateSize();
			if (sm.marker) {
				sm.marker.closePopup();
				sm.marker.openPopup();
			}
		});

		this.on('mount', function() {
			if (! this.mapview) {
				var mapelem = document.createElement("div");
				mapelem.setAttribute("name", "map");
				this.root.appendChild(mapelem);
				this.mapview = new MapAgent(mapelem, opts.readonly, opts);
			}
		});

		riot.route(function(collection, bla, blub) {
		});


	</script>
</map>