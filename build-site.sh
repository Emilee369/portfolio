#!/bin/sh
# Assemble the static website from readable pages and browser-upload asset bundles.
set -eu
mkdir -p _site
cp ./*.html ./*.css ./*.js _site/
for archive in ./assets-part-*.zip; do
  unzip -qo "$archive" -d _site
done
# New media can be uploaded directly alongside the existing bundled assets.
for pdf in ./*.pdf; do
  [ -f "$pdf" ] && cp "$pdf" _site/
done
if [ -d assets ]; then
  mkdir -p _site/assets
  cp -R assets/. _site/assets/
fi
touch _site/.nojekyll
test -s _site/index.html
test -s _site/assets/emily-wu-logo.jpg
test -s _site/Emily_Wu_UX_Resume.pdf
