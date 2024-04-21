#!/bin/sh

TEXT="Alexander Kuznetsov Frontend developer CV"

ENC_TEXT=$(echo "$TEXT" | jq -sRr @uri)

rm -rf alexkuz.me/fonts

npx webfont-dl "https://fonts.googleapis.com/css2?family=Jost:wght@300;400&display=swap&text=$ENC_TEXT" \
	--css-rel "fonts" \
	-o alexkuz.me/fonts/font.css

npx html-inline-external --src src/index.html --dest alexkuz.me/index.html 
