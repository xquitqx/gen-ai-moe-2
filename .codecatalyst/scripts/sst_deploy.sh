#!/usr/bin/env bash
echo "Deploying project"

source ~/.bashrc
nohup dockerd &
docker version
echo "Before npm Install"
npm install
echo "Done from npm Install"
npm install react-dropzone
npm install @heroicons/react
npm install chart.js
npx sst deploy --stage prod
