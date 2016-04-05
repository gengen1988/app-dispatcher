'use strict';

const mqtt = require('mqtt');
const redis = require('redis');
const EventEmitter = require('events');
const util = require('util');

const COMMAND = {
  BEGIN: 'contextstack.begin',
  END: 'contextstack.end',
  GET_CURRENT_CONTEXT_REQUEST: 'contextstack.getcurrentcontext.request',
  GET_CURRENT_CONTEXT_RESPONSE: 'contextstack.getcurrentcontext.response'
};

function parseJSONMessage(buffer) {
  return JSON.parse(buffer.toString());
}

function stringifyJSONMessage(json) {
  return JSON.stringify(json);
}

function ContextStack(opts) {
  if (!(this instanceof ContextStack)) return new ContextStack(opts);
  opts = opts || {};
  this.mqttClient = opts.mqttClient || mqtt.connect();
  this.redisClient = opts.redisClient || redis.createClient();
  this._initialize();
}

util.inherits(ContextStack, EventEmitter);

ContextStack.COMMAND = COMMAND;

ContextStack.prototype._initialize = function initialize() {
  const mqttClient = this.mqttClient;

  mqttClient.subscribe([
    COMMAND.BEGIN,
    COMMAND.END,
    COMMAND.GET_CURRENT_CONTEXT_REQUEST
  ], (err, granted) => {
    this.emit('ready');
  });

  mqttClient.on('message', (topic, message, packet) => {
    console.log(topic);
    switch (topic) {
    case COMMAND.BEGIN:
      this._begin(parseJSONMessage(message));
      break;
    case COMMAND.END:
      this._end();
      break;
    case COMMAND.GET_CURRENT_CONTEXT_REQUEST:
      this._getCurrentContext(parseJSONMessage(message));
      break;
    }
  });
};

ContextStack.prototype._begin = function begin(msg) {
  const redisClient = this.redisClient;
  redisClient.lpush('contextstack', msg.appId, console.log);
};

ContextStack.prototype._end = function end() {
  const redisClient = this.redisClient;
  redisClient.lpop('contextstack', console.log);
};

ContextStack.prototype._getCurrentContext = function getCurrentContext(msg) {
  const redisClient = this.redisClient;
  const mqttClient = this.mqttClient;
  redisClient.lrange('contextstack', 0, 0, function(err, appIds) {
    if (err) return console.error(err);
    msg.appId = appIds[0];
    mqttClient.publish(COMMAND.GET_CURRENT_CONTEXT_RESPONSE, stringifyJSONMessage(msg));
  });
};

module.exports = ContextStack;
