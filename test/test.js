#!/usr/bin/env node

'use strict';

var execSync = require('child_process').execSync,
    ejs = require('ejs'),
    expect = require('expect.js'),
    fs = require('fs'),
    mkdirp = require('mkdirp'),
    path = require('path'),
    rimraf = require('rimraf'),
    superagent = require('superagent');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

describe('Application life cycle test', function () {
    this.timeout(0);

    var LOCATION = 'test' + Date.now();
    var app;

    it('build app', function () {
        execSync('cloudron build', { cwd: path.resolve(__dirname, '..'), stdio: 'inherit' });
    });

    it('install app', function () {
        execSync('cloudron install --new --location ' + LOCATION, { cwd: path.resolve(__dirname, '..'), stdio: 'inherit' });
    });

    it('can get app information', function () {
        var inspect = JSON.parse(execSync('cloudron inspect'));

        app = inspect.apps.filter(function (a) { return a.location === LOCATION; })[0];

        expect(app).to.be.an('object');
    });

    it('can get the main page', function (done) {
        superagent.get('https://' + app.fqdn).end(function (error, result) {
            expect(error).to.be(null);
            expect(result.status).to.eql(200);

            done();
        });
    });

    // TODO test ldap login
    // TODO test chat message

    it('backup app', function () {
        execSync('cloudron backup --app ' + app.id, { cwd: path.resolve(__dirname, '..'), stdio: 'inherit' });
    });

    it('restore app', function () {
        execSync('cloudron restore --app ' + app.id, { cwd: path.resolve(__dirname, '..'), stdio: 'inherit' });
    });

    it('can get the main page after restore', function (done) {
        superagent.get('https://' + app.fqdn).end(function (error, result) {
            expect(error).to.be(null);
            expect(result.status).to.eql(200);

            done();
        });
    });

    // TODO test previously posted chat message

    it('uninstall app', function () {
        execSync('cloudron uninstall --app ' + app.id, { cwd: path.resolve(__dirname, '..'), stdio: 'inherit' });
    });
});
