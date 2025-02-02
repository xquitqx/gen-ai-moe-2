#!/usr/bin/env bash
echo "Deploying project"

source ~/.bashrc
nohup dockerd &
docker version
echo "Before npm Install@@@@@@@@@@@"
npm install
echo "Done from npm Install@@@@@@@@@@@@"
echo "Before react-dropzone install@@@@@@@@@@@@@"
npm install react-dropzone
echo "After react-dropzone install@@@@@@@@@@@@"
echo "Before @heroicons/react install@@@@@@@@@@@@@"
npm install @heroicons/react
echo "After @heroicons/react install@@@@@@@@@@@@"
echo "Before chart.js install@@@@@@@@@@@@@"
npm install chart.js
echo "After chart.js install@@@@@@@@@@@@"
echo "Starting Deploy sst npx@@@@@@@@@@@@"
npx sst deploy --stage prod
echo "Done from Deploy sst npx@@@@@@@@@@@"
