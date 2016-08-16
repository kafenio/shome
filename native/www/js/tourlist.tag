<tourlist>
	<p class="small">{name}</p>
	<select size="1" id="currentTourId" onchange={updateTour}>
		<option each={tour, t in window.svc.tourIds} selected={ window.svc.currentTourId == tour}>{tour}</option>
	</select>

	this.name = opts.name;
	if (!this.name) this.name = "Tour ID:";

	updateTour = function() {
		app.trigger("updateTour", { oldtour: window.svc.currentTourId, newtour: $('#currentTourId').val() } );
		window.svc.setCurrentTourId($('#currentTourId').val());
		riot.update();
	}
</tourlist>