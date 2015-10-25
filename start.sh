#!/bin/bash

export ROOT_URL=https://$(hostname -f)
export MONGO_URL="${MONGODB_URL}"
export PORT=3000

mkdir -p /app/data/www/

mongo_cli="mongo ${MONGODB_HOST}:${MONGODB_PORT}/${MONGODB_DATABASE} -u ${MONGODB_USERNAME} -p ${MONGODB_PASSWORD}"

# LDAP
${mongo_cli} --eval "db.rocketchat_settings.update({ _id: \"LDAP_Enable\" }, { \$set: { value: true }}, { upsert: true })"
${mongo_cli} --eval "db.rocketchat_settings.update({ _id: \"LDAP_Url\" }, { \$set: { value: \"ldap://${LDAP_SERVER}\" }}, { upsert: true })"
${mongo_cli} --eval "db.rocketchat_settings.update({ _id: \"LDAP_Port\" }, { \$set: { value: \"${LDAP_PORT}\" }}, { upsert: true })"
${mongo_cli} --eval "db.rocketchat_settings.update({ _id: \"LDAP_DN\" }, { \$set: { value: \"${LDAP_USERS_BASE_DN}\" }}, { upsert: true })"
${mongo_cli} --eval "db.rocketchat_settings.update({ _id: \"LDAP_Bind_Search\" }, { \$set: { value: '{\"filter\": \"(&(objectCategory=person)(|(username=#{username})(mail=#{username})))\"}' }}, { upsert: true })"

# Settings
${mongo_cli} --eval "db.rocketchat_settings.update({ _id: \"Accounts_AllowUsernameChange\" }, { \$set: { value: false }}, { upsert: true })"
${mongo_cli} --eval "db.rocketchat_settings.update({ _id: \"Accounts_AllowPasswordChange\" }, { \$set: { value: false }}, { upsert: true })"

# Email
${mongo_cli} --eval "db.rocketchat_settings.update({ _id: \"SMTP_Host\" }, { \$set: { value: \"${MAIL_SMTP_SERVER}\" }}, { upsert: true })"
${mongo_cli} --eval "db.rocketchat_settings.update({ _id: \"SMTP_Port\" }, { \$set: { value: \"${MAIL_SMTP_PORT}\" }}, { upsert: true })"
${mongo_cli} --eval "db.rocketchat_settings.update({ _id: \"SMTP_Username\" }, { \$set: { value: \"${MAIL_SMTP_USERNAME}\" }}, { upsert: true })"
${mongo_cli} --eval "db.rocketchat_settings.update({ _id: \"SMTP_Password\" }, { \$set: { value: \"\" }}, { upsert: true })"
${mongo_cli} --eval "db.rocketchat_settings.update({ _id: \"From_Email\" }, { \$set: { value: \"no-reply@${MAIL_DOMAIN}\" }}, { upsert: true })"

node /app/code/bundle/main.js
