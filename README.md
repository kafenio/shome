# Disclaimer
This Project is still a work in progress and a spare time project. If you find bugs, feel welcome to submit a pull-request (which might take some time to integrate) or wait until it is fixed (which might take some time, too).

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

