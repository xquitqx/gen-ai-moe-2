#!/usr/bin/env bash
echo "Deploying project"
pwd
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

echo "cdk version and update check @@@@@@@@@@@@@@@@@@@@@"
npx cdk --version
npm install -g aws-cdk
npx sst version

echo "new code for deploying new cdk cdktoolkit and sstbootstrap @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@"

# ***** Custom Bootstrap Step with Least-Privilege Policy *****
echo "Bootstrapping CDK with custom execution policy @@@@@@@@@@@@@@@@@"
npx cdk bootstrap aws://571600842703/us-east-1 --force --cloudformation-execution-policies arn:aws:iam::571600842703:policy/cdk-toolkit-jamal-least-privillege --no-public-access-block-configuration
# Explicitly run SST's bootstrap command (instead of letting it auto-bootstrap):

echo "Starting Deploy sst npx@@@@@@@@@@@@"
npx sst deploy --stage prod
echo "Done from Deploy sst npx@@@@@@@@@@@"
