
riot.tag('addpositionform', '<div if="{opts.title}" class="card"> <ul class="table-view"> <li class="table-view-cell"><b>{opts.title}</b></li> <li class="table-view-cell"> <form class="main input-group"> <div class="input-row"> <tourlist name="{opts.name}"></tourlist> </div> <div if="{!opts.edit}" class="input-row"> <label>Position:</label> <input type="text" id="position" value="{ window.pos2text(opts.position.latitude, opts.position.longitude)}" onkeydown="{enter}"> <input type="hidden" id="latitude" value="{opts.position.latitude}"> <input type="hidden" id="longitude" value="{opts.position.longitude}"> </div> <div if="{opts.edit}" class="input-row"> <label>Latitude:</label> <input type="text" id="latitude" value="{opts.position.latitude}" onkeydown="{enter}"> </div> <div if="{opts.edit}" class="input-row"> <label>Longitude:</label> <input type="text" id="longitude" value="{opts.position.longitude}" onkeydown="{enter}"> </div> <div class="input-row"> <label>Date: </label> <input type="text" id="timestamp" value="{new Date(opts.timestamp).toISOString()}" onkeydown="{enter}"> </div> <div class="input-row"> <label onclick="{ geocode }">Description:</label> <input type="text" id="description" placeholder="Click \'Description:\' to Autofill" value="{opts.description}" onkeydown="{enter}"> </div> </form> </li> <li class="table-view-cell"><p><button class="btn btn-positive btn-block" onclick="{ okaction }">Ok</button> <button class="btn btn-negative btn-block" onclick="{ cancelaction }">Cancel</button></p> </li> </ul> </div>', function(opts) {

		geocode = function() {
			if (typeof opts.description == 'undefined') {
				window.rgeo = L.Control.Geocoder.nominatim({ serviceUrl: 'https://nominatim.openstreetmap.org/', reverseQueryParams: "addressdetails=1" });

				rgeo.reverse( {lat: opts.position.latitude, lng: opts.position.longitude}, 18, function(results) {
					var r = results[0];

					if (r) {
						var addressobj = r.properties.address;
						var addrname = Object.keys(addressobj).filter(function(val) {
							return !(	val === "road" ||
										val === "suburb" ||
										val === "city_district" ||
										val === "city" ||
										val === "state_district" ||
										val === "neighbourhood" ||
										val === "county" ||
										val === "state" ||
										val === "postcode" ||
										val === "country" ||
										val === "country_code" ||
										val === "house_number");
						})

						var a_text = [ 	addressobj[addrname[0]],
										addressobj['road'],
										addressobj['house_number'],
										addressobj['postcode'],
										addressobj['city'],
										addressobj['state'],
										addressobj['country'] ].filter(function(v) {
											return !( typeof v == 'undefined' || v == "" || v == "undefined");
										}).join(", ");

						$('#description').val(a_text);
					}
				});
			}
		}
		cancelaction = function() {
			app.trigger("closePopup");
		}
		enter = function(e) {
			if (e.which == 13) {
				okaction();
			} else {
				return true;
			}
		}
		okaction = function() {
			try {
				window.svc.delById("del"+opts.timestamp, opts.poitourid);
			} catch(e) {}
			window.svc.addLocation({"description": $('#description').val(), "latitude": parseFloat($('#latitude').val()), "longitude": parseFloat($('#longitude').val()),"timestamp":Date.parse($('#timestamp').val())});
			app.trigger("closePopup");
			window.location = "#History";
			riot.update();
		}
	
});
riot.tag('exporttourdata', '<div if="{opts.title}" class="card"> <ul class="table-view"> <li class="table-view-cell"><b>{opts.title}</b></li> <li class="table-view-cell" each="{tour, i in tours}"> {tour.name} <div class="{toggle: true, active: tour.show }" onclick="{ toggleTour }"> <div class="toggle-handle"></div> </div> </li> <li class="table-view-cell"><p><button class="btn btn-positive btn-block" onclick="{ exportjson }" target="_new">Export JSON</button> <button class="btn btn-primary btn-block" onclick="{ exportgpx }" target="_new">Export GPX</button> <button class="btn btn-negative btn-block" onclick="{ cancelaction }">Cancel</button></p> </li> </ul> </div>', function(opts) {

	var that = this;
	this.tours = [];
	this.toursForExport = [];
	this.outJson = "";

	for (i in window.svc.tourIds) {
		this.tours.push({ name: window.svc.tourIds[i], show: true });
		this.toursForExport.push(window.svc.tourIds[i]);
	};

	var out = [];

	
	encodeEntities = function(value) {
		return value.
		replace(/&/g, '&amp;').
		replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, function(value) {
		  var hi = value.charCodeAt(0);
		  var low = value.charCodeAt(1);
		  return '&#' + (((hi - 0xD800) * 0x400) + (low - 0xDC00) + 0x10000) + ';';
		}).
		replace(/([^\#-~| |!])/g, function(value) {
		  return '&#' + value.charCodeAt(0) + ';';
		}).
		replace(/</g, '&lt;').
		replace(/>/g, '&gt;');
	}

	toggleTour = function(e) {
		that.toursForExport = [];
		if (e) that.tours[e.item.i].show = !e.item.tour.show;
		
		for (i in that.tours) {
			if (that.tours[i].show) {
				that.toursForExport.push(that.tours[i].name);
			}
		}

		out = [];
		for (k in that.toursForExport) {
			var ct = that.toursForExport[k];
			try {
				out.push({ tourname: ct, content: window.localStorage.getItem("locations--"+ct)});
			} catch(e) {}
		}
		that.outJson = JSON.stringify(out);
		that.outGpx = createGpx(out);
		that.update();
	}

	createGpx = function(e) {
		var gpxout = '<?xml version="1.0" encoding="UTF-8" standalone="no" ?>'+
				 '<gpx version="1.1" creator="Ersteller der Datei">'+
  				 '<metadata><name>ShoMe-Export</name>'+
  				 '<desc>GPX Track export from ShoMe App</desc>'+
				 '<author><name>ShoMe Locations</name></author></metadata>';
		for (k in out) {
			var name = encodeEntities(out[k].tourname);
			var content = JSON.parse(out[k].content);
			gpxout += '<rte><name>'+name+'</name>';
			for (j in content) {
				var item = content[j];
				var time = new Date(item.timestamp).toISOString();
				gpxout += 	'<rtept lat="'+item.latitude+'" lon="'+item.longitude+'">'+
							'<time>'+time+'</time>'+
							'<name>'+encodeEntities(item.description)+'</name>'+
							'</rtept>';
			}
			gpxout += '</rte>';
		}
		gpxout += '</gpx>';
		return gpxout;
	}

	exportjson = function(e) {
		app.trigger("closePopup");
		app.trigger("openPopup", '<importtourdata/>');
		riot.mount("importtourdata", {title: "Export Tourdata as JSON", content: that.outJson, hideokbtn: true, showclosebtn: true, filetype: 'text/json', filename: 'export.js'});
	}

	exportgpx = function(e) {
		app.trigger("closePopup");
		app.trigger("openPopup", '<importtourdata/>');
		riot.mount("importtourdata", {title: "Export Tourdata as GPX", content: that.outGpx, hideokbtn: true, showclosebtn: true, filetype: 'text/xml', filename: 'export.gpx' });
	}

	cancelaction = function(e) {
		app.trigger("closePopup");
	}

	toggleTour();


});

riot.tag('footernav', '<div class="bar bar-tab" id="footer"> <a class="{ tab-item: true, active: title == parent.currentRoute}" href="#{title}" each="{ navitem }"> <span class="icon {icon}"></span> <span class="tab-label">{ title }</span> </a> </div>', function(opts) {
  	this.navitem = [
  			{"title": "Home", "icon": "icon-home"},
  			{"title": "History", "icon": "icon-list"},
  			{"title": "Tour", "icon": "icon-star-filled"},
  			{"title": "Settings", "icon": "icon-gear"}
  		];

  	this.currentRoute = "Home";

    riot.update();

  	var that = this;
    riot.route.exec(function(collection, bla, blub){
      that.currentRoute = collection;
      riot.update();
    });
  	riot.route(function(collection, bla, blubb){
  		that.currentRoute = collection;
  		riot.update();
  	});
  
});
riot.tag('formatpos', '{formattedPos}', function(opts) {
		this.formattedPos = window.pos2text(opts.lat, opts.lon);
	
});

riot.tag('formatdate', '{formattedDate}', function(opts) {
		formatDate = function(ts) {
			var dat = new Date(ts);

   			if (opts.format == "short") {
   				return dat.parse;
   			} else {
   				return dat.toLocaleDateString() + ", " + dat.toLocaleTimeString();
   			}

		}
		this.formattedDate = formatDate(opts.timestamp);
	
});
riot.tag('historyscreen', '<div if="{ is_visible }" class="scroller con"> <tourlist></tourlist> <ul if="{ is_visible }" class="table-view"> <poitem timestamp="{timestamp}" lat="{latitude}" lon="{longitude}" description="{description}" each="{poiItems}"></poitem> </ul> <br> <br> <br> <br> </div>', function(opts) {

	riot.mount("formatpos, poitem");
	var that = this;

	var poiItems = window.svc.findAll();

	this.on('update', function() {
		riot.route.exec(function(collection, bla, blub){
			is_visible = (collection == "History");
			if (is_visible) {
				app.trigger("updateTitle", "Tour History");

			}
			that.poiItems = window.svc.findAll();
		});
	});

});

riot.tag('poitem', '<li class="table-view-cell"> <p class="small"><b>{opts.description}</b></p> <p class="small" if="{opts.timestamp}"><b>Date:</b> <formatdate timestamp="{opts.timestamp}" format="local"></formatdate><p> <p class="small" if="{opts.lat}"><b>Position:</b> <formatpos lat="{opts.lat}" lon="{opts.lon}"></formatpos></p> </li> <li class="table-view-cell"><p><button class="btn btn-primary btn-outlined show-map-btn" id="{opts.timestamp}" onclick="{showPoiOnMap}">Map</button> <button class="btn btn-primary btn-outlined del-pos-btn" id="del{opts.timestamp}" onclick="{deletePoi}">Delete</button> <button class="btn btn-primary btn-outlined share-btn" id="s{opts.timestamp}" onclick="{sharePoi}">Share</button> <button class="btn btn-primary btn-outlined" id="edit{opts.timestamp}" onclick="{ editPoi }" >Edit</button>  </p> </li> <map class="smap hidden" id="map{opts.timestamp}" latitude="{opts.lat}" longitude="{opts.lon}" desc="{opts.description}"></map>', function(opts) {
		var that = this
		that.millis = that.opts.timestamp;

		showPoiOnMap = function(evt) {
			var tid = evt.currentTarget.id;
			var el = $("#map"+tid);
			if(el.hasClass("hidden")) {
				el.removeClass("hidden");
			} else {
				el.addClass("hidden");
			}
			setTimeout(function() {
				app.trigger("redrawMap");
			},100);
		}
		
		deletePoi = function(e) {
			window.svc.delById(e.currentTarget.id);
			riot.update();
		}

		sharePoi = function(e) {
			var message = { text: opts.description+": "+window.pos2text(opts.lat, opts.lon)+", " + window.svc.getViewerUrl(opts.lat, opts.lon, encodeURIComponent(opts.description)) };
        	var has_intents = false;
        	try {
        		has_intents = (device.platform == "iOS" || device.platform == "Android");
        	} catch(e) {}
        	if (has_intents) {
        		window.socialmessage.send(message);
        	} else {
        		window.open( 'mailto:?subject=Location for you&body='+message.text+'', '_self' );
        	}
		}

		editPoi = function(e) {
			app.trigger("openPopup", '<addpositionform/>');
			var poiId = parseFloat(e.currentTarget.id.substring(4));
			console.log(poiId);
			var editItem = window.svc.findById(poiId);
			console.log(editItem);
			riot.mount("addpositionform", {title: "Edit Position", 
				name: "Move Position to Tour:", 
				position: { latitude: editItem[0].latitude, longitude: editItem[0].longitude }, 
				description: editItem[0].description, 
				timestamp: editItem[0].timestamp,
				poitourid: window.svc.currentTourId,
				edit: true});
			$('#description').focus();
		}

		exportPoiList = function(e) {
			console.log("export POI List called...");
		}

	
});
riot.tag('importtourdata', '<div if="{opts.title}" class="card"> <ul class="table-view"> <li class="table-view-cell"><b>{opts.title}</b></li> <li class="table-view-cell"> <textarea rows="5" id="importdata">{opts.content}</textarea> </li> <li class="table-view-cell"><p><button if="{ !opts.hideokbtn }" class="btn btn-positive btn-block" onclick="{ okaction }" target="_new">Import JSON</button> <button if="{ !opts.hideokbtn }" class="btn btn-negative btn-block" onclick="{ cancelaction }">Cancel</button> <button if="{ opts.showclosebtn }" class="btn btn-primary btn-block" onclick="{ saveasfile }">Save as File</button> <button if="{ opts.showclosebtn }" class="btn btn-positive btn-block" onclick="{ cancelaction }">Close</button></p> </li> </ul> </div>', function(opts) {

	okaction = function(e) {
		var impjson;
		try {
			impjson = JSON.parse($("#importdata").val());
			for (i in impjson) {
				var ci = impjson[i];
				var name = ci.tourname;
				var content = ci.content;

				if (name) {
					if (window.localStorage.getItem("locations--"+ci.tourname)) {
						console.log("adding POIs to tour"+name)
						var tour = JSON.parse(content);
						for (poi in tour) {
							window.svc.addLocation(tour[poi], name);
						}
					} else {
						console.log("adding tour"+name)
						window.svc.addTour(name);						
						window.localStorage.setItem("locations--"+name, content);
					}
				}
			}
		} catch(e) {
			alert("There was an Error while importing POI data. Import not possible.");
		}

		app.trigger("closePopup");
		window.location.reload();
	}

	saveasfile = function(e) {
		var filetype = 'text/xml';
		if(opts.filetype) filetype = opts.filetype;
		var filename = 'export.txt';
		if(opts.filename) filename = opts.filename;
		window.open('data:'+filetype+';charset=UTF-8,'+$('#importdata').val(), '_blank');
		app.trigger("closePopup");
	}

	cancelaction = function(e) {
		app.trigger("closePopup");
	}


});
riot.tag('maincontent', '<positionscreen></positionscreen> <historyscreen></historyscreen> <tourscreen></tourscreen> <settingsscreen></settingsscreen>', function(opts) {

		riot.mount("positionscreen, historyscreen, tourscreen, settingsscreen");

	
});
riot.tag('map', '', function(opts) {
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


	
});
riot.tag('popuppanel', '<div if="{ is_showPopup }" class="glass"> <raw></raw> </div>', function(opts) {
		var that = this;

		app.on("openPopup", function(con) {
			riot.mount("raw");
			that.is_showPopup = true;
			app.trigger("setRawContent", con);
			that.update();
		})

		app.on("closePopup", function(con) {
			that.is_showPopup = false;
			that.update();
		})

	
});
riot.tag('positionscreen', '<div if="{is_visible}" class="bar bar-standard bar-header-secondary"> <button if="{ !watchId }" class="btn btn-block" onclick="{ startLocating }">Update location</button> <button if="{ watchId }" class="btn btn-block " onclick="{ stopLocating }">Stop updating location</button> </div> <div if="{ is_visible }" class="scroller con"> <ul class="table-view"> <li class="table-view-cell"> <p class="small"><b>Position:</b></p> <p class="small">{ currentPos }</p></li> <li class="table-view-cell"><p><button class="btn btn-primary btn-outlined" onclick="{ savepos }">Save</button> <button if="{ !is_showmap }" class="btn btn-primary btn-outlined" onclick="{ showmap }">Map</button> <button if="{ is_showmap }" class="btn btn-primary" onclick="{ hidemap }">Close Map</button> <button class="btn btn-primary btn-outlined" onclick="{ sharepos }" >Share</button> </p></li> </ul> <span class="subcontent"> <map if="{ is_showmap }" id="mainmap"></map> </span> </div>', function(opts) {
		is_showmap = true;
		var that = this;
		currentPos = "Searching...";

		savepos = function() {
			window.stopLocating();
			app.trigger("openPopup", '<addpositionform/>');
			riot.mount("addpositionform", {title: "Add new Position", name: "Add Position to Tour:", position: that.coords, timestamp: new Date().toGMTString()});
			$('#description').focus();
		};

		showmap = function() {
			is_showmap = true;
			that.update();
		};

		hidemap = function() {
			is_showmap = false;
			that.update();
		};

		sharepos = function() {
			var message = { text: "I'm here: "+currentPos+", " + window.svc.getViewerUrl(that.coords.latitude, that.coords.longitude, encodeURIComponent("I'm here")) };
        	var has_intents = false;

        	try {
        		has_intents = (device.platform == "iOS" || device.platform == "Android");
        	} catch(e) {}
        	if (has_intents) {
        		window.socialmessage.send(message);
        	} else {
        		window.open( 'mailto:?subject=Position for you&body='+message.text, '_self' );
        	}
		};

		this.on('update', function() {
			riot.route.exec(function(collection, bla, blub){
				is_visible = (!collection || collection == "Home" || collection == "");
				if (is_visible) {
					app.trigger("updateTitle", "ShoMe Location");
					app.trigger("redrawMap");
				}
			});
		});

		this.on('mount', function() {
			startLocating();
		})

		riot.route(function(coll, bla, blub){
			if (coll == "Home" || coll == "") {
				setTimeout(function() {
					app.trigger("redrawMap");
				},200);
			} else {
				stopLocating();
			}
		});

		app.on('updatePosition', function(coords, desc) {
			currentPos = pos2text(coords.latitude, coords.longitude);
			that.coords = coords;
			that.update();
		});

	
});
riot.tag('raw', '<div></div>', function(opts) {

	var that = this;
	app.on("setRawContent", function(content) {
		that.root.innerHTML = content;
	})


});
riot.tag('settingsscreen', '<div if="{ is_visible }" class="scroller con"> <form class="input-group" onsubmit="{submi}"> <ul class="table-view"> <li class="table-view-cell table-view-divider">Tour Config</li> <li class="table-view-cell"> <tourlist></tourlist> <p><input type="text" id="newTourName" placeholder="z.B. Reise 2014" if="{showTourForm}" onkeydown="{submi}"></p> <p> <button class="btn btn-positive btn-outlined" if="{ !showTourForm}" onclick="{ showAddTour }">Add new Tour</button> <button class="btn btn-negative" if="{showTourForm}" onclick="{cancelTour}">Cancel</button> <button class="btn btn-positive" if="{showTourForm}" onclick="{addTour}">Add Tour</button> <button class="btn btn-negative btn-outlined" if="{ !showTourForm}" onclick="{ delTour }">Remove selected Tour</button> </p> </li> <li class="table-view-cell table-view-divider">Mapsources:</li> <li class="table-view-cell" each="{name, n in window.mapsources}"> {name} <div class="{toggle: true, active: n.show }" onclick="{ toggleMapSrc }"> <div class="toggle-handle"></div> </div> </li> <li class="table-view-cell"> <p class="small">Default Mapsource:</p> <select size="1" id="currentMapSrc" onchange="{updateDefaultMap}"> <option each="{mapsrc, t in availableMapSources}" __selected="{ window.defaultMapSrc == mapsrc}">{mapsrc}</option> </select> </li> <li class="table-view-cell table-view-divider">Export / Import</li> <li class="table-view-cell"> <p><button class="btn btn-positive" onclick="{exportTourdata}">Export Tourdata</button> <button class="btn" onclick="{importTourdata}">Import Tourdata</button></p> </li> <li class="table-view-cell table-view-divider">URLs:</li> <li class="table-view-cell"> <div class="input-row"> <label>Backend URL:</label> <input id="backendUrl" type="text" placeholder="" value="{ window.svc.backendUrl }"></input> </div> </li> <li class="table-view-cell"> <div class="input-row"> <label>Viewer URL:</label> <input id="viewerUrl" type="text" placeholder="" value="{ window.svc.viewerUrl }"></input> </div> </li> </ul> </form> <br> <br> <br> <br> </div>', function(opts) {


	var that = this;
	riot.mount("tourlist");
	that.availableMapSources = [];
	for (i in window.mapsources) {
		if (window.mapsources[i].show) {
			that.availableMapSources.push(i);
		}
	}

	toggleMapSrc = function(e) {
		app.trigger('updateMapSources', e.item.name, !e.item.n.show);
		that.availableMapSources = [];
		for (i in window.mapsources) {
			if (window.mapsources[i].show) {
				that.availableMapSources.push(i);
			}
		}
		app.trigger('mapConfigChanged', true);
		that.update();
	}

	showAddTour = function() {
		showTourForm = true;
		this.update();
		$('#newTourName').val("");
		$('#newTourName').focus();
	}
	submi = function(e) {
		if (e.which == 13) {
			addTour();
		} else {
			return true;
		}
	}
	addTour = function() {
		window.svc.addTour($('#newTourName').val());
		showTourForm = false;
		window.location.reload();
	}

	delTour = function() {
		window.svc.delTour($('#currentTourId').val());
		showTourForm = false;
		that.update();
	}

	cancelTour = function() {
		$('#newTourName').val("");
		showTourForm = false;
		that.update();
	}

	updateDefaultMap = function() {
		app.trigger('updateDefaultMapSrc', $('#currentMapSrc').val());
		app.trigger('mapConfigChanged', true);
		window.location.reload();
	}
	
	exportTourdata = function() {
		app.trigger("openPopup", '<exporttourdata/>');
		riot.mount("exporttourdata", {title: "Export Tourdata"});
	}

	importTourdata = function() {
		app.trigger("openPopup", '<importtourdata/>');
		riot.mount("importtourdata", {title: "Import Tourdata"});
	}

	this.on('update', function() {
		riot.route.exec(function(collection, bla, blub){
			ctour = window.svc.currentTourId;
			is_visible = (collection == "Settings");
			if (is_visible)	{
				window.stopLocating();
				app.trigger("updateTitle", "Settings");
			}
		});
	});


});
riot.tag('shome', '<popuppanel></popuppanel> <titlebar></titlebar> <footernav></footernav> <maincontent></maincontent>', function(opts) {
    window.app = riot.observable();
    
    
    window.shouldRotateToOrientation = function(degrees) {
      return true;
    }

    app.on('mount update unmount', function(eventName) {

    })

    riot.mount('titlebar, footernav, maincontent, popuppanel');

  
});
riot.tag('titlebar', '<div class="bar bar-nav"> <h1 class="title">{ title }</h1> </div>', function(opts) {

		this.title = opts.title;
		if (!this.title || this.title == "") this.title = "ShoMe Locations";

		var that = this;
		app.on('updateTitle', function(newTitle) {
			that.title = newTitle;
			that.update();
		});
	
});
riot.tag('tourlist', '<p class="small">{name}</p> <select size="1" id="currentTourId" onchange="{updateTour}"> <option each="{tour, t in window.svc.tourIds}" __selected="{ window.svc.currentTourId == tour}">{tour}</option> </select>', function(opts) {

	this.name = opts.name;
	if (!this.name) this.name = "Tour ID:";

	updateTour = function() {
		app.trigger("updateTour", { oldtour: window.svc.currentTourId, newtour: $('#currentTourId').val() } );
		window.svc.setCurrentTourId($('#currentTourId').val());
		riot.update();
	}

});
riot.tag('tourscreen', '<map if="{ is_visible }" id="tourmap" readonly="true"></map>', function(opts) {
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
	
});
