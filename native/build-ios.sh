#!/bin/bash
riot www/js/ www/compapps.js

cordova build ios --release
open platforms/ios/ShoMe.xcodeproj
