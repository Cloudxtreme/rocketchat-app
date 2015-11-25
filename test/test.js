#!/usr/bin/env node

'use strict';

var execSync = require('child_process').execSync,
    expect = require('expect.js'),
    path = require('path'),
    webdriver = require('selenium-webdriver');

var by = webdriver.By,
    Keys = webdriver.Key,
    until = webdriver.until;

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

if (!process.env.USERNAME || !process.env.PASSWORD) {
    console.log('USERNAME and PASSWORD env vars need to be set');
    process.exit(1);
}

describe('Application life cycle test', function () {
    this.timeout(0);

    var firefox = require('selenium-webdriver/firefox');
    var server, browser = new firefox.Driver();

    before(function (done) {
        var seleniumJar= require('selenium-server-standalone-jar');
        var SeleniumServer = require('selenium-webdriver/remote').SeleniumServer;
        server = new SeleniumServer(seleniumJar.path, { port: 4444 });
        server.start();

        done();
    });

    after(function (done) {
        browser.quit();
        server.stop();
        done();
    });

    // var LOCATION = 'test' + Date.now();
    var LOCATION = 'test';
    var TEST_MESSAGE = 'Hello Test!';
    var TEST_CHANNEL = 'general';
    var TEST_TIMEOUT = 5000;
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

    it('can login', function (done) {
        browser.get('https://' + app.fqdn + '/home');
        browser.wait(until.elementLocated(by.name('emailOrUsername')), TEST_TIMEOUT).then(function () {
            browser.findElement(by.name('emailOrUsername')).sendKeys(process.env.USERNAME);
            browser.findElement(by.name('pass')).sendKeys(process.env.PASSWORD);
            browser.findElement(by.id('login-card')).submit();
            browser.wait(until.elementLocated(by.className('room-title')), TEST_TIMEOUT).then(function () { done(); });
        });
    });

    it('can join channel', function (done) {
        browser.get('https://' + app.fqdn + '/channel/' + TEST_CHANNEL);
        browser.wait(until.elementLocated(by.className('join')), TEST_TIMEOUT).then(function () {
            browser.findElement(by.className('join')).click();
            browser.wait(until.elementLocated(by.name('msg')), TEST_TIMEOUT).then(function () { done(); });
        });
    });

    it('can send message', function (done) {
        browser.get('https://' + app.fqdn + '/channel/' + TEST_CHANNEL);
        browser.wait(until.elementLocated(by.name('msg')), TEST_TIMEOUT).then(function () {
            browser.findElement(by.name('msg')).sendKeys(TEST_MESSAGE);
            browser.findElement(by.name('msg')).sendKeys(Keys.RETURN);
            browser.wait(browser.findElement(by.xpath("//*[contains(text(), '" + TEST_MESSAGE + "')]")), TEST_TIMEOUT).then(function () { done(); });
        });
    });

    it('backup app', function () {
        execSync('cloudron backup --app ' + app.id, { cwd: path.resolve(__dirname, '..'), stdio: 'inherit' });
    });

    it('restore app', function () {
        execSync('cloudron restore --app ' + app.id, { cwd: path.resolve(__dirname, '..'), stdio: 'inherit' });
    });

    it('message is still there', function (done) {
        browser.get('https://' + app.fqdn + '/channel/' + TEST_CHANNEL);
        browser.wait(until.elementLocated(by.name('msg')), TEST_TIMEOUT).then(function () {
            browser.wait(browser.findElement(by.xpath("//*[contains(text(), '" + TEST_MESSAGE + "')]")), TEST_TIMEOUT).then(function () { done(); });
        });
    });

    it('uninstall app', function () {
        execSync('cloudron uninstall --app ' + app.id, { cwd: path.resolve(__dirname, '..'), stdio: 'inherit' });
    });
});
