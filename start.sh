#!/bin/bash

export ROOT_URL=https://$(hostname -f)
export MONGO_URL="${MONGODB_URL}"

node /app/bundle/main.js

