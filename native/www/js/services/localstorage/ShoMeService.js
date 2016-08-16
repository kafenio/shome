window.svc = new function() {
    var locations,
        backendUrl,
        viewerUrl,
        defaultPos,
        currentTourId,
        tourIds;

    this.initialize = function() {
        // Todo: create config object for initialization, process programmatically...
        // { backendUrl: "url",
        // viewerUrl: "url",
        // currentTourId: ""}
        this.backendUrl = window.localStorage.getItem("backendUrl");
        if (!this.backendUrl || typeof this.backendUrl  === "undefined"|| this.backendUrl === "") this.setBackendUrl("https://pv2.org/shome/logger/");

        this.viewerUrl = window.localStorage.getItem("viewerUrl");
        if (!this.viewerUrl || typeof this.viewerUrl  === "undefined"|| this.viewerUrl === "") this.setViewerUrl("https://pv2.org/map/?/##lat##/##lon##/##desc##");

        this.currentTourId = window.localStorage.getItem("currentTourId");
        if (typeof this.currentTourId === "undefined"|| this.currentTourId === ""|| this.currentTourId === null) this.setCurrentTourId("Tour 1");

        try { 
            this.tourIds = JSON.parse(window.localStorage.getItem("tourIds"));
            if(this.tourIds === null) this.addTour("Tour 1");
        } catch(e) {
            this.addTour("Tour 1");
        }

        this.defaultPos = this.getDefaultPos();
        if (typeof this.defaultPos == "undefined" || !this.defaultPos || JSON.stringify(this.defaultPos) == "{}" || this.defaultPos == "") this.setDefaultPos({ coords: { latitude: 74.496413, longitude: 18.984375} });

        locations = this.findAll();
        if (locations === null) {
            // Pre populate
            window.localStorage.setItem("locations--"+this.currentTourId, JSON.stringify([]));
        }
    }

    this.getViewerUrl = function(lat, lon, desc) {
        var vUrl;
        vUrl = this.viewerUrl.replace("##lat##", lat);
        vUrl = vUrl.replace("##lon##", lon);
        vUrl = vUrl.replace("##desc##", desc);
        return vUrl;
    }

    this.setCurrentTourId = function(ctour) {
        this.currentTourId = ctour;
        window.localStorage.setItem("currentTourId", ctour);
    }

    this.setBackendUrl = function(burl) {
        this.backendUrl = burl;
        window.localStorage.setItem("backendUrl", burl);
    }

    this.setViewerUrl = function(vurl) {
        this.viewerUrl = vurl;
        window.localStorage.setItem("viewerUrl", vurl);
    }

    this.addTour = function(tour) {
        if (typeof this.tourIds === "undefined"|| this.tourIds === null) {
            this.tourIds = [];
        }
        if(tour && this.tourIds.indexOf(tour) == -1) this.tourIds.push(tour);
        window.localStorage.setItem("tourIds", JSON.stringify(this.tourIds));
        this.currentTourId = tour;
        window.localStorage.setItem("currentTourId", tour);
    }

    this.delTour = function(tour) {
        var d = tour;
        if (tour && tour != "Tour 1") {
            this.tourIds = $.grep(JSON.parse(window.localStorage.getItem("tourIds")), function(e){
                return e != d;
            });
            if (this.tourIds) window.localStorage.setItem("tourIds", JSON.stringify(this.tourIds));
            window.localStorage.removeItem("locations--"+tour);
        }
        this.setCurrentTourId("Tour 1");
    }

    this.addLocation = function(location, tourid) {
        var mytourid = this.currentTourId;
        if (tourid) mytourid = tourid;
        if (!location.timestamp) location.timestamp = new Date().getTime();
        locations = this.findAll();
        locations.push(location);
        window.localStorage.setItem("locations--"+mytourid, JSON.stringify(locations));
    }

    this.findAll = function(tourid) {
        var mytourid = this.currentTourId;
        if (tourid) mytourid = tourid;
        return JSON.parse(window.localStorage.getItem("locations--"+mytourid));
    }

    this.findById = function (id) {
        var d = id;
        return locations = $.grep(JSON.parse(window.localStorage.getItem("locations--"+this.currentTourId)), function(e){
            return e.timestamp == d;
        });
    }

    this.getDefaultPos = function() {
        var pos = JSON.parse(window.localStorage.getItem("defaultPos"));
        return pos;
    }

    this.setDefaultPos = function(pos) {
        window.localStorage.setItem("defaultPos", JSON.stringify(pos));
    }

    this.findByName = function (searchKey) {
        var deferred = $.Deferred(),
            locations = JSON.parse(window.localStorage.getItem("locations--"+this.currentTourId)),
            results = locations.filter(function (element) {
                return element.description.toLowerCase().indexOf(searchKey.toLowerCase()) > -1;
            });
        deferred.resolve(results);
        return deferred.promise();
    }

    this.delById = function(id, tourid) {
        var mytourid = this.currentTourId;
        if (tourid) mytourid = tourid;
        var d = id;
        var locations = $.grep(JSON.parse(window.localStorage.getItem("locations--"+mytourid)), function(e){
            return 'del'+e.timestamp != d;
        });
        window.localStorage.setItem("locations--"+mytourid, JSON.stringify(locations));
    }

}