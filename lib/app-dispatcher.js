'use strict';

const mqtt = require('mqtt');

const ContextStackClient = require('./context-stack-client');
const TOPIC = require('../topic/app-dispatcher');

const TIMEOUT = 1000;

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

  mqttClient.on('message', function(topic, message) {
    try {
      var payload = JSON.parse(message.toString());
    } catch (err) {
      console.log(err);
    }

    if (topic === TOPIC.ACKNOWLEDGEMENT) {
      self._acknowledgement(payload);
      return;
    }

    if (topic === TOPIC.REJECTION) {
      self._rejection(payload);
      return;
    }

    self._pass(topic, payload);
  });
};

AppDispatcher.prototype._pass = function pass(topic, payload) {
  const self = this;
  const contextStackClient = this.contextStackClient;
  const mqttClient = this.mqttClient;

  contextStackClient.getCurrentContext(function(err, appId) {
    if (err) return console.error(err);

    var timeoutId = setTimeout(function() {
      this._resend(topic, payload);
    }, TIMEOUT);

    var sendIn = {topic, payload, ticket: timeoutId};
    mqttClient.publish(appId, JSON.stringify(sendIn));
  });

};

AppDispatcher.prototype._acknowledgement = function acknowledgement(msg) {
  const timeoutId = msg.ticket;
  clearTimeout(timeoutId);
};

AppDispatcher.prototype._rejection = function rejection(msg) {
  const mqttClient = this.mqttClient;
  const timeoutId = msg.ticket;
  clearTimeout(timeoutId);
  this._resend(msg.topic, msg.payload);
};

AppDispatcher.prototype._resend = function resend(topic, payload) {
  const segment = topic.split('.');
  if (segment[1] === 'system') {
    mqttClient.publish(`default.${topic}`, JSON.stringify(payload));
  }
};

module.exports = AppDispatcher;
