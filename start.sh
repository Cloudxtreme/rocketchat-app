#!/bin/bash

export ROOT_URL=https://$(hostname -f)
export MONGO_URL="${MONGODB_URL}"
export PORT=3000

mongo_cli="mongo ${MONGODB_HOST}:${MONGODB_PORT}/${MONGODB_DATABASE} -u ${MONGODB_USERNAME} -p ${MONGODB_PASSWORD}"

${mongo_cli} --eval 'db.rocketchat_settings.update({ _id: "LDAP_Enable" }, { $set: { value: true }}, { upsert: true })'
${mongo_cli} --eval 'db.rocketchat_settings.update({ _id: "LDAP_Url" }, { $set: { value: "ldap://172.17.42.1" }}, { upsert: true })'
${mongo_cli} --eval 'db.rocketchat_settings.update({ _id: "LDAP_Port" }, { $set: { value: "3002" }}, { upsert: true })'
${mongo_cli} --eval 'db.rocketchat_settings.update({ _id: "LDAP_DN" }, { $set: { value: "ou=users,dc=cloudron" }}, { upsert: true })'
${mongo_cli} --eval 'db.rocketchat_settings.update({ _id: "LDAP_Bind_Search" }, { $set: { value: "{\"filter\": \"(&(objectCategory=person)(username=#{username}))\"}" }}, { upsert: true })'

node /app/code/bundle/main.js || sleep 10000
