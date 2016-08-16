<settingsscreen>
    <div if={ is_visible } class="scroller con">
		<form class="input-group" onsubmit={submi}>
			<ul class="table-view">
				<li class="table-view-cell table-view-divider">Tour Config</li>
				<li class="table-view-cell">
					<tourlist></tourlist>
					<p><input type="text" id="newTourName" placeholder="z.B. Reise 2014" if={showTourForm} onkeydown={submi}/></p>
					<p>
						<button class="btn btn-positive btn-outlined" if={ !showTourForm} onclick={ showAddTour }>Add new Tour</button>
						<button class="btn btn-negative" if={showTourForm} onclick={cancelTour}>Cancel</button>
						<button class="btn btn-positive" if={showTourForm} onclick={addTour}>Add Tour</button>
						<button class="btn btn-negative btn-outlined" if={ !showTourForm} onclick={ delTour }>Remove selected Tour</button>
					</p>
				</li>
				<li class="table-view-cell table-view-divider">Mapsources:</li>
				<li class="table-view-cell" each={name, n in window.mapsources}>
					{name}
					<div class={toggle: true, active: n.show } onclick={ toggleMapSrc }>
						<div class="toggle-handle"></div>
					</div>
				</li>
				<li class="table-view-cell">
					<p class="small">Default Mapsource:</p>
					<select size="1" id="currentMapSrc" onchange={updateDefaultMap}>
						<option each={mapsrc, t in availableMapSources} selected={ window.defaultMapSrc == mapsrc}>{mapsrc}</option>
					</select>						
				</li>
				<li class="table-view-cell table-view-divider">Export / Import</li>
				<li class="table-view-cell">
					<p><button class="btn btn-positive" onclick={exportTourdata}>Export Tourdata</button>
					<button class="btn" onclick={importTourdata}>Import Tourdata</button></p>
				</li>
				<li class="table-view-cell table-view-divider">URLs:</li>
				<li class="table-view-cell">
					<div class="input-row">
						<label>Backend URL:</label>
						<input id="backendUrl" type="text" placeholder="" value={ window.svc.backendUrl }></input>
					</div>
				</li>
				<li class="table-view-cell">
					<div class="input-row">
						<label>Viewer URL:</label>
						<input id="viewerUrl" type="text" placeholder="" value={ window.svc.viewerUrl }></input>
					</div>
				</li>
			</ul>
		</form>
		<br>
		<br>
		<br>
		<br>
	</div>


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

</settingsscreen>