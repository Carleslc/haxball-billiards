#!/bin/bash

# ./start.sh [dev|staging|prod] TOKEN
# . .env && ./start.sh [dev|staging|prod]
# envsource .env && ./start.sh [dev|staging|prod]

# Tasks
DEV="dev"
STAGING="staging"
PROD="prod"

DEV_TASK="dev-node"
STAGING_TASK="staging"
PROD_TASK="prod"

# Sources
DEV_SOURCE="./output/haxball-billiards.dev.js"
PROD_SOURCE="./output/haxball-billiards.prod.js"
MIN_SOURCE="./output/haxball-billiards.min.js"

# Exit on error
set -e

# Set the TOKEN environment variable from the first argument if it is set (otherwise you need to provide it with the .env file)
if [[ ! -z $2 ]]; then
  export TOKEN=$2
elif [[ -z $TOKEN ]]; then
  echo "❌ Missing TOKEN environment variable"
  echo "🔑 https://www.haxball.com/headlesstoken"
  echo "Run this command as:"
  echo "./start.sh [dev|staging|prod] TOKEN"
  echo "Alternative: . .env && ./start.sh [dev|staging|prod]"
  exit 1
fi

# Select task
TASK=$1

if [[ $TASK = $DEV ]]; then
  TASK=$DEV_TASK
  SOURCE=$DEV_SOURCE
elif [[ $TASK = $STAGING ]]; then
  TASK=$STAGING_TASK
  SOURCE=$PROD_SOURCE
else
  TASK=$PROD_TASK
  SOURCE=$MIN_SOURCE
fi

# Build task
grunt $TASK

if [[ ! -f $SOURCE ]]; then
  echo "❌ Cannot build $SOURCE"
  exit 1
fi

echo "🎛  $SOURCE"

echo "🔑 $TOKEN"

# Run the room script
node $SOURCE
