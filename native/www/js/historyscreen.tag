<historyscreen>
	<div if={ is_visible } class="scroller con">
		<tourlist></tourlist>
		<ul if={ is_visible } class="table-view">
			<poitem timestamp="{timestamp}" lat="{latitude}" lon="{longitude}" description="{description}" each="{poiItems}"/>
		</ul>
		<br/>
		<br/>
		<br/>
		<br/>
	</div>

	riot.mount("formatpos, poitem");
	var that = this;

	var poiItems = window.svc.findAll();

	this.on('update', function() {
		riot.route.exec(function(collection, bla, blub){
			is_visible = (collection == "History");
			if (is_visible) {
				app.trigger("updateTitle", "Tour History");
				// app.trigger("addIcon", '<a class="icon icon-compose pull-right" onclick={exportPoiList}></a>');
			}
			that.poiItems = window.svc.findAll();
		});
	});
</historyscreen>

<poitem>
	<li class="table-view-cell">
		<p class="small"><b>{opts.description}</b></p>
		<p class="small" if={opts.timestamp}><b>Date:</b> <formatdate timestamp={opts.timestamp} format="local"/><p>
		<p class="small" if={opts.lat}><b>Position:</b> <formatpos lat={opts.lat} lon={opts.lon}/></p>
	</li>
	<li class="table-view-cell"><p><button class="btn btn-primary btn-outlined show-map-btn" id="{opts.timestamp}" onclick={showPoiOnMap}>Map</button>
		<button class="btn btn-primary btn-outlined del-pos-btn" id="del{opts.timestamp}" onclick={deletePoi}>Delete</button>
		<button class="btn btn-primary btn-outlined share-btn" id="s{opts.timestamp}" onclick={sharePoi}>Share</button>
		<button class="btn btn-primary btn-outlined" id="edit{opts.timestamp}" onclick={ editPoi } >Edit</button>
		<!-- a href="mailto:?subject=Position for you&body=I'm here: ##lat##, ##lon## http://pv2.org/map/?/##lat##/##lon##/##description##" class="btn btn-primary btn-outlined">Send E-Mail</a-->
		</p>
	</li>
	<map class="smap hidden" id="map{opts.timestamp}" latitude="{opts.lat}" longitude="{opts.lon}" desc="{opts.description}"/>	
	<script>
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

	</script>
</poitem>