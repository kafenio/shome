
<addpositionform>
	<div if={opts.title} class="card">
		<ul class="table-view">
			<li class="table-view-cell"><b>{opts.title}</b></li>
			<li class="table-view-cell">
				<form class="main input-group">
					<div class="input-row">
						<tourlist name="{opts.name}"></tourlist>
					</div>
					<div if={!opts.edit} class="input-row">
						<label>Position:</label>
						<input type="text" id="position" value="{ window.pos2text(opts.position.latitude, opts.position.longitude)}"  onkeydown={enter}/>
						<input type="hidden" id="latitude" value="{opts.position.latitude}"/>
						<input type="hidden" id="longitude" value="{opts.position.longitude}"/>
					</div>
					<div if={opts.edit} class="input-row">
						<label>Latitude:</label>
						<input type="text" id="latitude" value="{opts.position.latitude}"  onkeydown={enter}/>
					</div>
					<div if={opts.edit} class="input-row">
						<label>Longitude:</label>
						<input type="text" id="longitude" value="{opts.position.longitude}"  onkeydown={enter}/>
					</div>
					<div class="input-row">
						<label>Date: </label>
						<input type="text" id="timestamp" value="{new Date(opts.timestamp).toISOString()}" onkeydown={enter}/>
					</div>
					<div class="input-row">
						<label  onclick={ geocode }>Description:</label>
						<input type="text" id="description" placeholder="Click 'Description:' to Autofill" value="{opts.description}" onkeydown={enter}/>
					</div>
				</form>
			</li>
			<li class="table-view-cell"><p><button class="btn btn-positive btn-block" onclick={ okaction }>Ok</button>
			<button class="btn btn-negative btn-block" onclick={ cancelaction }>Cancel</button></p>
			</li>
		</ul>
	</div>

	<script>

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
	</script>
</addpositionform>