'use strict';

const mqtt = require('mqtt');
const uuid = require('node-uuid');
const util = require('util');
const EventEmitter = require('events');

const ContextStack = require('./context-stack');
const TOPIC = require('./topic/context-stack');

function parseJSONMessage(buffer) {
  return JSON.parse(buffer.toString());
}

function stringifyJSONMessage(json) {
  return JSON.stringify(json);
}

function ContextStackClient(opts) {
  if (!(this instanceof ContextStackClient)) return new ContextStackClient(opts);
  opts = opts || {};
  this.mqttClient = opts.mqttClient || mqtt.connect();
  this._initialize();
}

util.inherits(ContextStackClient, EventEmitter);

ContextStackClient.prototype._initialize = function initialize() {
  const mqttClient = this.mqttClient;
  mqttClient.subscribe(TOPIC.GET_CURRENT_CONTEXT_RESPONSE);

  mqttClient.on('message', (topic, message, packet) => {
    console.log('resp');
    const msg = parseJSONMessage(message);
    this.emit('response', msg);
  });
};

ContextStackClient.prototype.begin = function begin(appId) {
  const mqttClient = this.mqttClient;
  mqttClient.publish(TOPIC.BEGIN, stringifyJSONMessage({appId}));
};

ContextStackClient.prototype.end = function end() {
  const mqttClient = this.mqttClient;
  mqttClient.publish(TOPIC.END);
};

ContextStackClient.prototype.getCurrentContext = function getCurrentContext(callback) {
  const mqttClient = this.mqttClient;
  const correlationId = uuid.v4();
  const self = this;
  mqttClient.publish(TOPIC.GET_CURRENT_CONTEXT_REQUEST, stringifyJSONMessage({
    ticket: correlationId
  }));
  this.on('response', responseHandler);

  return;

  function responseHandler(msg) {
    if (msg.ticket !== correlationId) return;
    self.removeListener('response', responseHandler);
    return callback(null, msg.appId);
  }
};

module.exports = ContextStackClient;
