<tourscreen>
	<map if={ is_visible } id="tourmap" readonly="true"></map>

	<script>
	var that = this;

	this.on('mount', function() {
		app.trigger("redrawTourMap");
	})

	this.on('update', function() {
		riot.route.exec(function(collection, bla, blub){
			is_visible = (collection == "Tour");
			if (is_visible) {
				app.trigger("updateTitle", "Tour Data");
				window.stopLocating();
			}
		});
	});

	app.on("updateTour", function() {
		var tmm = that.tags.map.mapview;

		$.each(tmm.map._layers, function(ml) {
	        	if (tmm.map._layers[ml]._icon) {
	        		tmm.map.removeLayer(this);
	        	}
	    });
	    that.marker = [];
	});

	app.on("redrawTourMap", function() {
		var poiItems = window.svc.findAll();
		var tmm = that.tags.map.mapview;
		var bounds = [];

		if (!that.marker) that.marker = [];

		var startIcon = L.icon({ 
			iconUrl: 'assets/css/images/marker-icon.png',
			iconSize: [33,50],
			iconAnchor: [15,45],
			popupAnchor: [2, -35],
			shadowUrl: 'assets/css/images/marker-shadow.png',
		    shadowSize: [31],
		    shadowAnchor: [8,28]
		});
		
		poiItems.forEach(function(item){
			bounds.push([item.latitude,item.longitude]);

			if (!that.marker[item.timestamp]) {
				that.marker[item.timestamp] = new L.marker([item.latitude,item.longitude],{id: item.description });
				that.marker[item.timestamp].setIcon(startIcon).bindPopup("<b>"+item.description+"</b><br/>"+millis2date(item.timestamp)+"<br/>"+pos2text(item.latitude,item.longitude));
				tmm.map.addLayer(that.marker[item.timestamp]);
			}
		});

		setTimeout(function() {
			tmm.map.invalidateSize();
			tmm.map.fitBounds(bounds);
		},300);
	});

	riot.route(function(coll, bla, blub){
		if (coll == "Tour") app.trigger("redrawTourMap");
	});
	</script>
</tourscreen>
