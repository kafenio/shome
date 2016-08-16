<footernav>
  <div class="bar bar-tab" id="footer">
    <a class={ tab-item: true, active: title == parent.currentRoute} href="#{title}"  each={ navitem }>
      <span class="icon {icon}"></span>
      <span class="tab-label">{ title }</span>
    </a>
  </div>

  <script>
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
  </script>

</footernav>