#!/bin/bash
riot www/js/ www/compapps.js
rm www/npm-debug.log
scp -r www/* <domain>:<path_to>/htdocs/shome/

