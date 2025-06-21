var assign = require('object-assign');

var globalObject = (typeof window !== 'undefined') ? window :
                   (typeof global !== 'undefined') ? global :
                   this;

var ROSLIB = (globalObject && globalObject.ROSLIB) || {
  REVISION: '1.4.1'
};

// Add core components
assign(ROSLIB, require('./core'));
assign(ROSLIB, require('./actionlib'));
assign(ROSLIB, require('./math'));
assign(ROSLIB, require('./tf'));
assign(ROSLIB, require('./urdf'));

module.exports = ROSLIB;
