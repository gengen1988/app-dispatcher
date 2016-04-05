'use strict';

const ContextStack = require('../context-stack');
const ContextStackClient = require('../context-stack-client');

const stack = ContextStack()
const stackClient = ContextStackClient();

// stackClient.begin('aaxx');
stackClient.getCurrentContext(function(err, scope) {
  console.log(scope);
});
