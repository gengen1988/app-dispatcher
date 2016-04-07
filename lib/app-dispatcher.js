'use strict';

const mqtt = require('mqtt');
const uuid = require('node-uuid');

const ContextStackClient = require('./context-stack-client');
const TOPIC = require('../topic/app-dispatcher');

const TIMEOUT = 1000;

const intervalStore = {};

function AppDispatcher(opts) {
  if (!(this instanceof AppDispatcher)) return new AppDispatcher(opts);

  opts = opts || {};
  this.mqttClient = opts.mqttClient || mqtt.connect();
  this.contextStackClient = opts.contextStackClient || ContextStackClient({
    mqttClient: this.mqttClient
  });
  this._initialize();
}

AppDispatcher.prototype._initialize = function initialize() {
  const mqttClient = this.mqttClient;
  const contextStackClient = this.contextStackClient;
  const self = this;

  mqttClient.subscribe([
    TOPIC.KEY_DOWN,
    TOPIC.BEGIN_CONTEXT,
    TOPIC.END_CONTEXT,
    TOPIC.VOICE,
    TOPIC.ACKNOWLEDGEMENT,
    TOPIC.REJECTION
  ]);

  mqttClient.on('message', this._onMessage.bind(this));
};

AppDispatcher.prototype._onMessage = function onMessage(topic, message) {
  try {
    var payload = JSON.parse(message.toString());
  } catch (err) {
    console.log(err);
  }

  switch (topic) {
  case TOPIC.ACKNOWLEDGEMENT:
    console.log('[app-dispatcher] handle ack');
    this._acknowledgement(payload);
    break;
  case TOPIC.REJECTION:
    console.log('[app-dispatcher] handle rejection');
    this._rejection(payload);
    break;
  default:
    if (this._isInput(topic)) {
      console.log('[app-dispatcher] pass in', topic);
      this._pass(topic, payload);
    }
  }
};

AppDispatcher.prototype._isInput = function isInput(topic) {
  return topic.indexOf('input.') === 0;
};

AppDispatcher.prototype._buildNodeREDTopic = function buildNodeREDTopic(topic) {
  return topic;
};

AppDispatcher.prototype._pass = function pass(topic, payload) {
  const self = this;
  const contextStackClient = this.contextStackClient;
  const mqttClient = this.mqttClient;

  contextStackClient.getCurrentContext(function(err, appId) {
    if (err) return console.error(err);

    const timeoutId = saveInterval(setTimeout(function() {
      console.log('[app-dispatcher] timeout resend', topic, payload);
      self._resend(topic, payload);
    }, TIMEOUT));

    const sendIn = {topic, payload, ticket: timeoutId};
    const sendInTopic = self._buildNodeREDTopic(appId);
    mqttClient.publish(sendInTopic, JSON.stringify(sendIn));
  });

};

AppDispatcher.prototype._acknowledgement = function acknowledgement(msg) {
  const timeoutId = msg.ticket;
  clearTimeout(loadInterval(timeoutId));
};

AppDispatcher.prototype._rejection = function rejection(msg) {
  const mqttClient = this.mqttClient;
  const timeoutId = msg.ticket;
  console.log('[app-dispatcher] timeout resend', msg);
  clearTimeout(loadInterval(timeoutId));
  this._resend(msg.topic, msg.payload);
};

AppDispatcher.prototype._resend = function resend(topic, payload) {
  const mqttClient = this.mqttClient;
  const segment = topic.split('.');
  if (segment[1] === 'system') {
    mqttClient.publish(`default.${topic}`, JSON.stringify(payload));
  }
};

function saveInterval(intervalObject) {
  const id = uuid.v4();
  intervalStore[id] = intervalObject;
  return id;
}

function loadInterval(id) {
  return intervalStore[id];
}

module.exports = AppDispatcher;
