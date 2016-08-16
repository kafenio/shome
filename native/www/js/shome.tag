<shome>

  <popuppanel></popuppanel>
  <titlebar></titlebar>
  <footernav></footernav>
  <maincontent></maincontent>

  <script>
    window.app = riot.observable();
    
    /** 
    * @param {Number} degree - UIInterfaceOrientationPortrait: 0, UIInterfaceOrientationLandscapeRight: 90, UIInterfaceOrientationLandscapeLeft: -90, UIInterfaceOrientationPortraitUpsideDown: 180
    * @returns {Boolean} Indicating if rotation should be allowed.
    */
    window.shouldRotateToOrientation = function(degrees) {
      return true;
    }

    // curious about all events ?
    app.on('mount update unmount', function(eventName) {
      // console.info(eventName)
    })

    riot.mount('titlebar, footernav, maincontent, popuppanel');

  </script>

</shome>