#!/usr/bin/env node

const mqtt = require('mqtt');

const mqttClient = mqtt.connect();

send('input.system.keydown', {
  keyCode: 1
});

function send(topic, payload) {
  mqttClient.publish(topic, JSON.stringify(payload));
}
