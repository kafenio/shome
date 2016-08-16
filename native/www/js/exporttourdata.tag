<exporttourdata>
	<div if={opts.title} class="card">
		<ul class="table-view">
			<li class="table-view-cell"><b>{opts.title}</b></li>
			<li class="table-view-cell" each={tour, i in tours}>
				{tour.name}
				<div class={toggle: true, active: tour.show } onclick={ toggleTour }>
					<div class="toggle-handle"></div>
				</div>
			</li>
			<li class="table-view-cell"><p><button class="btn btn-positive btn-block" onclick={ exportjson } target="_new">Export JSON</button>
			<button class="btn btn-primary btn-block" onclick={ exportgpx } target="_new">Export GPX</button>
			<button class="btn btn-negative btn-block" onclick={ cancelaction }>Cancel</button></p>
			</li>
		</ul>
	</div>

	var that = this;
	this.tours = [];
	this.toursForExport = [];
	this.outJson = "";

	for (i in window.svc.tourIds) {
		this.tours.push({ name: window.svc.tourIds[i], show: true });
		this.toursForExport.push(window.svc.tourIds[i]);
	};

	var out = [];

	/**
	* Escapes all potentially dangerous characters, so that the
	* resulting string can be safely inserted into attribute or
	* element text.
	* @param value
	* @returns {string} escaped text
	*/
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

</exporttourdata>
