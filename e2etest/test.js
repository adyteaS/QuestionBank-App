const Application = require('spectron').Application;
const path = require('path');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

var electron = require('electron-prebuilt');

var app = new Application({
            path: electron,
            args: ["."]
        });

global.before(function () {
	chai.should();
  chai.use(chaiAsPromised);
});


describe('Test Example', function () {
	this.timeout(10000);

    beforeEach(function () {
        return app.start();
    });

    afterEach(function () {
        return app.stop();
    });

		it('opens a window', function () {
			return app.client.waitUntilWindowLoaded()
					.getWindowCount().should.eventually.equal(1)
    });
});
