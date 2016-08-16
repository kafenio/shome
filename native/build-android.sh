#!/bin/bash
riot www/js/ www/compapps.js

cordova build android --release
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore myrelease.keystore platforms/android/build/outputs/apk/android-release-unsigned.apk alias_name
mv platforms/android/build/outputs/apk/android-release-unsigned.apk platforms/android/build/ShoMe.apk
scp platforms/android/build/ShoMe.apk <servername>:<path_to>/htdocs/shome/

