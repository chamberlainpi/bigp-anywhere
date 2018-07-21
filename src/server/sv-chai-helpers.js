const chai = require('chai');

module.exports = function(GLOBALS) {
    GLOBALS.assert = chai.assert;
    GLOBALS.test = function(name, testObj) {
        describe(name, function() {
            _.keys(testObj).forEach(testKey => {
                it(testKey, testObj[testKey]);
            })
        })
    }
}