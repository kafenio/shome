<importtourdata>
	<div if={opts.title} class="card">
		<ul class="table-view">
			<li class="table-view-cell"><b>{opts.title}</b></li>
			<li class="table-view-cell">
				<textarea rows="5" id="importdata">{opts.content}</textarea>
			</li>
			<li class="table-view-cell"><p><button if={ !opts.hideokbtn } class="btn btn-positive btn-block" onclick={ okaction } target="_new">Import JSON</button>
			<button if={ !opts.hideokbtn } class="btn btn-negative btn-block" onclick={ cancelaction }>Cancel</button>
			<button if={ opts.showclosebtn } class="btn btn-primary btn-block" onclick={ saveasfile }>Save as File</button>
			<button if={ opts.showclosebtn } class="btn btn-positive btn-block" onclick={ cancelaction }>Close</button></p>
			</li>
		</ul>
	</div>

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

</importtourdata>