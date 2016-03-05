#!/bin/bash

export ROOT_URL="${APP_ORIGIN}"
export MONGO_URL="${MONGODB_URL}"
export MAIL_URL="smtp://${MAIL_SMTP_SERVER}:${MAIL_SMTP_PORT}"
export PORT=3000

mongo_cli="mongo ${MONGODB_HOST}:${MONGODB_PORT}/${MONGODB_DATABASE} -u ${MONGODB_USERNAME} -p ${MONGODB_PASSWORD}"

# LDAP
${mongo_cli} --eval "db.rocketchat_settings.update({ _id: \"LDAP_Enable\" }, { \$set: { value: true }}, { upsert: true })"
${mongo_cli} --eval "db.rocketchat_settings.update({ _id: \"LDAP_Url\" }, { \$set: { value: \"ldap://${LDAP_SERVER}\" }}, { upsert: true })"
${mongo_cli} --eval "db.rocketchat_settings.update({ _id: \"LDAP_Port\" }, { \$set: { value: \"${LDAP_PORT}\" }}, { upsert: true })"
${mongo_cli} --eval "db.rocketchat_settings.update({ _id: \"LDAP_DN\" }, { \$set: { value: \"${LDAP_USERS_BASE_DN}\" }}, { upsert: true })"
${mongo_cli} --eval "db.rocketchat_settings.update({ _id: \"LDAP_Bind_Search\" }, { \$set: { value: '{\"filter\": \"(&(objectCategory=person)(|(username=#{username})(mail=#{username})))\"}' }}, { upsert: true })"
${mongo_cli} --eval "db.rocketchat_settings.update({ _id: \"LDAP_Sync_User_Data\" }, { \$set: { value: true }}, { upsert: true })"
# ldap -> user
${mongo_cli} --eval "db.rocketchat_settings.update({ _id: \"LDAP_Sync_User_Data_FieldMap\" }, { \$set: { value: '{\"username\":\"name\", \"mail\":\"email\"}' }}, { upsert: true })"

# Settings
${mongo_cli} --eval "db.rocketchat_settings.update({ _id: \"Site_Url\" }, { \$set: { value: \"${APP_ORIGIN}\" }}, { upsert: true })"
${mongo_cli} --eval "db.rocketchat_settings.update({ _id: \"Accounts_AllowUsernameChange\" }, { \$set: { value: false }}, { upsert: true })"
${mongo_cli} --eval "db.rocketchat_settings.update({ _id: \"Accounts_AllowPasswordChange\" }, { \$set: { value: false }}, { upsert: true })"

# Email
${mongo_cli} --eval "db.rocketchat_settings.update({ _id: \"SMTP_Host\" }, { \$set: { value: \"${MAIL_SMTP_SERVER}\" }}, { upsert: true })"
${mongo_cli} --eval "db.rocketchat_settings.update({ _id: \"SMTP_Port\" }, { \$set: { value: \"${MAIL_SMTP_PORT}\" }}, { upsert: true })"
# do not set mail username and password, will result in wrong MAIL_URL
# ${mongo_cli} --eval "db.rocketchat_settings.update({ _id: \"SMTP_Username\" }, { \$set: { value: \"${MAIL_SMTP_USERNAME}\" }}, { upsert: true })"
# ${mongo_cli} --eval "db.rocketchat_settings.update({ _id: \"SMTP_Password\" }, { \$set: { value: \"\" }}, { upsert: true })"
${mongo_cli} --eval "db.rocketchat_settings.update({ _id: \"From_Email\" }, { \$set: { value: \"${MAIL_SMTP_USERNAME}@${MAIL_DOMAIN}\" }}, { upsert: true })"

chown -R cloudron:cloudron /app/data

echo "Starting Rocket.Chat"
exec /usr/local/bin/gosu cloudron:cloudron node /app/code/bundle/main.js
