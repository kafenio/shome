# Disclaimer
This Project is still a work in progress and a spare time project. If you find bugs, feel welcome to submit a pull-request (which might take some time to integrate) or wait until it is fixed (which might take some time, too).

# About
ShoMe is an App intended to share your current Location. It can be compiled as a native Android or ios app using cordova or run as a web-app inside a browser. If compiled as a native App ShoMe supports intents on Android and App Extensions on ios.

# Prerequisites:
	sudo npm install riot -g
	sudo npm install riotify -g
	sudo npm install browser-pack -g
	sudo npm install cordova -g

# Run App locally in a server:
	#switch to this directory, then
	sudo npm install http-server -g
	http-server native/www/

# Precompile and watch Resources
	cd native/www/
	riot js/ compapps.js -w

# build android app
	cd native
	./build-android.sh

# build ios app
	cd native
	./build-ios.sh

