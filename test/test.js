#!/usr/bin/env node

'use strict';

var execSync = require('child_process').execSync,
    expect = require('expect.js'),
    path = require('path'),
    superagent = require('superagent'),
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
    var server, browser = new firefox.Driver(), uploadedImageUrl;

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

    var LOCATION = 'rctest';
    var TEST_MESSAGE = 'Hello Test!';
    var TEST_CHANNEL = 'general';
    var TEST_TIMEOUT = parseInt(process.env.TEST_TIMEOUT, 10) || 5000;
    var app;
    var email, token;

    xit('build app', function () {
        execSync('cloudron build', { cwd: path.resolve(__dirname, '..'), stdio: 'inherit' });
    });

    it('can login', function (done) {
        var inspect = JSON.parse(execSync('cloudron inspect'));

        superagent.post('https://' + inspect.apiEndpoint + '/api/v1/developer/login').send({
            username: username,
            password: password
        }).end(function (error, result) {
            if (error) return done(error);
            if (result.statusCode !== 200) return done(new Error('Login failed with status ' + result.statusCode));

            token = result.body.token;

            superagent.get('https://' + inspect.apiEndpoint + '/api/v1/profile')
                .query({ access_token: token }).end(function (error, result) {
                if (error) return done(error);
                if (result.statusCode !== 200) return done(new Error('Get profile failed with status ' + result.statusCode));

                email = result.body.email;
                done();
            });
        });
    });

    it('install app', function () {
        execSync('cloudron install --new --wait --location ' + LOCATION, { cwd: path.resolve(__dirname, '..'), stdio: 'inherit' });
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
        browser.wait(until.elementLocated(by.name('msg')), TEST_TIMEOUT).then(function () { done(); });
    });

    it('can send message', function (done) {
        browser.get('https://' + app.fqdn + '/channel/' + TEST_CHANNEL);
        browser.wait(until.elementLocated(by.name('msg')), TEST_TIMEOUT).then(function () {
            browser.findElement(by.name('msg')).sendKeys(TEST_MESSAGE);
            browser.findElement(by.name('msg')).sendKeys(Keys.RETURN);
            browser.wait(browser.findElement(by.xpath("//*[contains(text(), '" + TEST_MESSAGE + "')]")), TEST_TIMEOUT).then(function () { done(); });
        });
    });

    it('can upload file', function (done) {
        browser.get('https://' + app.fqdn + '/channel/' + TEST_CHANNEL);
        browser.wait(until.elementLocated(by.name('msg')), TEST_TIMEOUT).then(function () {
            browser.findElement(by.xpath('//input[@type="file"]')).sendKeys(path.resolve(__dirname, '../logo.png'));
            browser.wait(browser.findElement(by.xpath('//h2[contains(text(), "Upload file?")]')), TEST_TIMEOUT);
            browser.sleep(5000);
            browser.findElement(by.xpath('//button[contains(text(), "OK")]')).click();
            browser.sleep(5000);
            browser.findElement(by.xpath('//a[contains(text(), "File Uploaded")]')).getAttribute('href').then(function (val) {
                uploadedImageUrl = val;
                console.log('Image was uploaded to ', val);
                if (!val.startsWith('https://' + app.fqdn + '/file-upload/')) return done(new Error('Incorrect upload URL')); // these are per room (ea9d00835480)

                done();
            });
        });
    });

    it('backup app', function () {
        execSync('cloudron backup --app ' + app.id, { cwd: path.resolve(__dirname, '..'), stdio: 'inherit' });
    });

    it('restore app', function () {
        execSync('cloudron restore --app ' + app.id, { cwd: path.resolve(__dirname, '..'), stdio: 'inherit' });
    });

    it('can login', function (done) {
        browser.manage().deleteAllCookies();
        browser.get('javascript:localStorage.clear();')
        browser.get('https://' + app.fqdn + '/home');
        browser.wait(until.elementLocated(by.name('emailOrUsername')), TEST_TIMEOUT).then(function () {
            browser.findElement(by.name('emailOrUsername')).sendKeys(process.env.USERNAME);
            browser.findElement(by.name('pass')).sendKeys(process.env.PASSWORD);
            browser.findElement(by.id('login-card')).submit();
            browser.wait(until.elementLocated(by.className('room-title')), TEST_TIMEOUT).then(function () { done(); });
        });
    });

    it('message is still there', function (done) {
        browser.get('https://' + app.fqdn + '/channel/' + TEST_CHANNEL);
        browser.wait(until.elementLocated(by.name('msg')), TEST_TIMEOUT).then(function () {
            browser.wait(browser.findElement(by.xpath("//*[contains(text(), '" + TEST_MESSAGE + "')]")), TEST_TIMEOUT).then(function () { done(); });
        });
    });

    it('uploaded file is still there', function (done) {
        // cannot use superagent because it is protected by login
        browser.get('https://' + app.fqdn + '/channel/' + TEST_CHANNEL);
        browser.wait(until.elementLocated(by.xpath('//img[@src="' + uploadedImageUrl.replace('https://' + app.fqdn, '') + '"]')), TEST_TIMEOUT);
        var img = browser.findElement(by.xpath('//img[@src="' + uploadedImageUrl.replace('https://' + app.fqdn, '') + '"]'));
        browser.executeScript('return arguments[0].complete && arguments[0].naturalWidth', img).then(function (imageWidth) {
            done(imageWidth === 512 ? null : new Error('failed to load image'));
        });
    });

    it('can restart app', function (done) {
        execSync('cloudron restart');
        done();
    });

    it('can login', function (done) {
        browser.manage().deleteAllCookies();
        browser.get('javascript:localStorage.clear();')
        browser.get('https://' + app.fqdn + '/home');
        browser.wait(until.elementLocated(by.name('emailOrUsername')), TEST_TIMEOUT).then(function () {
            browser.findElement(by.name('emailOrUsername')).sendKeys(process.env.USERNAME);
            browser.findElement(by.name('pass')).sendKeys(process.env.PASSWORD);
            browser.findElement(by.id('login-card')).submit();
            browser.wait(until.elementLocated(by.className('room-title')), TEST_TIMEOUT).then(function () { done(); });
        });
    });

    it('message is still there', function (done) {
        browser.get('https://' + app.fqdn + '/channel/' + TEST_CHANNEL);
        browser.wait(until.elementLocated(by.name('msg')), TEST_TIMEOUT).then(function () {
            browser.wait(browser.findElement(by.xpath("//*[contains(text(), '" + TEST_MESSAGE + "')]")), TEST_TIMEOUT).then(function () { done(); });
        });
    });

    it('uploaded file is still there', function (done) {
        // cannot use superagent because it is protected by login
        browser.get('https://' + app.fqdn + '/channel/' + TEST_CHANNEL);
        browser.wait(until.elementLocated(by.xpath('//img[@src="' + uploadedImageUrl.replace('https://' + app.fqdn, '') + '"]')), TEST_TIMEOUT);
        var img = browser.findElement(by.xpath('//img[@src="' + uploadedImageUrl.replace('https://' + app.fqdn, '') + '"]'));
        browser.executeScript('return arguments[0].complete && arguments[0].naturalWidth', img).then(function (imageWidth) {
            done(imageWidth === 512 ? null : new Error('failed to load image'));
        });
    });

    it('move to different location', function () {
        browser.get('javascript:localStorage.clear();')
        browser.manage().deleteAllCookies();
        execSync('cloudron install --location ' + LOCATION + '2', { cwd: path.resolve(__dirname, '..'), stdio: 'inherit' });
        var inspect = JSON.parse(execSync('cloudron inspect'));
        app = inspect.apps.filter(function (a) { return a.location === LOCATION + '2'; })[0];
        expect(app).to.be.an('object');
        uploadedImageUrl = uploadedImageUrl.replace(LOCATION, LOCATION + '2');
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

    it('does not show warning', function (done) {
        browser.findElement(by.xpath('//h2[contains(text(), "Warning")]')).then(function () {
            done(new Error('warning is shown'));
        }).catch(function () {
            done();
        });
    });

    it('message is still there', function (done) {
        browser.get('https://' + app.fqdn + '/channel/' + TEST_CHANNEL);
        browser.wait(until.elementLocated(by.name('msg')), TEST_TIMEOUT).then(function () {
            browser.wait(browser.findElement(by.xpath("//*[contains(text(), '" + TEST_MESSAGE + "')]")), TEST_TIMEOUT).then(function () { done(); });
        });
    });

    it('uploaded file is still there', function (done) {
        // cannot use superagent because it is protected by login
        browser.get('https://' + app.fqdn + '/channel/' + TEST_CHANNEL);
        browser.wait(until.elementLocated(by.xpath('//img[@src="' + uploadedImageUrl.replace('https://' + app.fqdn, '') + '"]')), TEST_TIMEOUT);
        var img = browser.findElement(by.xpath('//img[@src="' + uploadedImageUrl.replace('https://' + app.fqdn, '') + '"]'));
        browser.executeScript('return arguments[0].complete && arguments[0].naturalWidth', img).then(function (imageWidth) {
            done(imageWidth === 512 ? null : new Error('failed to load image'));
        });
    });

    it('uninstall app', function () {
        execSync('cloudron uninstall --app ' + app.id, { cwd: path.resolve(__dirname, '..'), stdio: 'inherit' });
    });

    // check if the _first_ login via email succeeds
    it('can login via email', function (done) {
        execSync('cloudron install --new --wait --location ' + LOCATION, { cwd: path.resolve(__dirname, '..'), stdio: 'inherit' });
        var inspect = JSON.parse(execSync('cloudron inspect'));

        app = inspect.apps.filter(function (a) { return a.location === LOCATION; })[0];
        expect(app).to.be.an('object');

        browser.manage().deleteAllCookies();
        browser.get('javascript:localStorage.clear();')
        browser.get('https://' + app.fqdn + '/home');
        browser.wait(until.elementLocated(by.name('emailOrUsername')), TEST_TIMEOUT).then(function () {
            browser.findElement(by.name('emailOrUsername')).sendKeys(process.env.USERNAME);
            browser.findElement(by.name('pass')).sendKeys(process.env.PASSWORD);
            browser.findElement(by.id('login-card')).submit();
            browser.wait(until.elementLocated(by.className('room-title')), TEST_TIMEOUT).then(function () {
                execSync('cloudron uninstall --app ' + app.id, { cwd: path.resolve(__dirname, '..'), stdio: 'inherit' });
                done();
            });
        });
    });

});
