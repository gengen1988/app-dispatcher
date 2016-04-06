'use strict';

const mqtt = require('mqtt');
const redis = require('redis');
const EventEmitter = require('events');
const util = require('util');

const TOPIC = require('../topic/context-stack');

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

ContextStack.prototype._initialize = function initialize() {
  const mqttClient = this.mqttClient;

  mqttClient.subscribe([
    TOPIC.BEGIN,
    TOPIC.END,
    TOPIC.GET_CURRENT_CONTEXT_REQUEST
  ], (err, granted) => {
    this.emit('ready');
  });

  mqttClient.on('message', (topic, message, packet) => {
    console.log(topic);
    switch (topic) {
    case TOPIC.BEGIN:
      this._begin(parseJSONMessage(message));
      break;
    case TOPIC.END:
      this._end();
      break;
    case TOPIC.GET_CURRENT_CONTEXT_REQUEST:
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
    mqttClient.publish(TOPIC.GET_CURRENT_CONTEXT_RESPONSE, stringifyJSONMessage(msg));
  });
};

module.exports = ContextStack;
