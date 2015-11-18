# Rocket.Chat Cloudron App

This repository contains the Cloudron app package source for [Rocket.Chat](https://github.com/RocketChat/Rocket.Chat).

## Installation

[![Install](https://cloudron.io/img/button32.png)](https://cloudron.io/button.html?app=chat.rocket.cloudronapp)

or using the [Cloudron command line tooling](https://cloudron.io/references/cli.html)

```
cloudron install --appstore-id chat.rocket.cloudronapp
```

## Building

The app package can be built using the [Cloudron command line tooling](https://cloudron.io/references/cli.html).

```
cd rocketchat-app
cloudron build
cloudron install
```

## Testing

The e2e tests are located in the `test/` folder and require [nodejs](http://nodejs.org/). They are creating a fresh build, install the app on your Cloudron, backup and restore. 

```
cd rocketchat-app/test

npm install
mocha test.js
```
