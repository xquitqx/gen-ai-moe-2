#!/usr/bin/env bash
echo "Deploying project"

source ~/.bashrc
nohup dockerd &
docker version
npm install
npm install react-dropzone
npm install @heroicons/react
npx sst deploy --stage prod