var watchId;


onLocError = function(e) {
  if (e.code === e.PERMISSION_DENIED) {
    watchId = navigator.geolocation.clearWatch(watchId);
    alert('Unable to get location. Please turn on GPS.');
    if (navigator.app){
          navigator.app.exitApp();
    } else if (navigator.device){
          navigator.device.exitApp();
    }
  } else if (e.code === e.POSITION_UNAVAILABLE) {
    watchId = navigator.geolocation.clearWatch(watchId);
    alert('Position currently unavailable: ' + e.code);
  } else if (e.code === e.TIMEOUT) {
    watchId = navigator.geolocation.clearWatch(watchId);
    // alert('Unable to get location within a reasonable amount of time. Please turn on GPS. ' + e.code);
  } else {
    watchId = navigator.geolocation.clearWatch(watchId);
    alert('Unable to get location. Please turn on GPS.');
  }
};

startLocating = function() {
  var that = this;
  try {
    if (!watchId) {
      watchId = navigator.geolocation.watchPosition(
        function(posdata) {
          if (typeof watchId != 'undefined') {
            app.trigger("updatePosition",  posdata.coords, "I'm here");
            window.lastpos = posdata.coords;
            window.localStorage.setItem("lastpos", JSON.stringify({ latitude: posdata.coords.latitude, longitude: posdata.coords.longitude }));
          }
        },
        onLocError,
        { timeout: 5000, enableHighAccuracy: false }
      );
    }
  } catch(e) {
    window.stopLocating();
  }
  return false;
}

stopLocating = function() {
  watchId = navigator.geolocation.clearWatch(watchId);
}

window.pos2text = function(lati, loni) {
  if (lati && loni) {
    lat = lati.toFixed(6);
    lon = loni.toFixed(6);
    if (lat > 0 ) {
      lat = lat + " N"
    } else {
      lat = lat * -1 + " S"
    }
    if (lon > 0 ) {
      lon = lon + " E"
    } else {
      lon = lon * -1 + " W"
    }
    return lat + ', ' + lon;
  }
}

window.millis2date = function(millis) {
  if(millis) {
    da = new Date(millis);
    dat = da.getDate()+"."+(da.getMonth()+1)+"."+da.getFullYear()+", "+("0" + da.getHours()).slice(-2)+":"+("0" + da.getMinutes()).slice(-2);
  } else {
    dat = "";
  }
  return dat;
}
