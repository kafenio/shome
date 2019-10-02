#README

# Prerequisites:

		# install ionic (automatic splashscreen and icon generation)
		npm install -g ionic

		# install social message plugin (intent generator for ios and android)
		cordova plugin add https://github.com/leecrossley/cordova-plugin-social-message.git

		# create icons and splashscreens
		ionic resources

# Build Android:
		# build android release
		cordova build android --release

		# sign .apk
		jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore my-release-key.keystore platforms/android/ant-build/CordovaApp-release-unsigned.apk alias_name

		# move .apk
		mv platforms/android/ant-build/CordovaApp-release-unsigned.apk platforms/android/ant-build/ShoMe.apk
