const AppDispatcher = require('./lib/app-dispatcher');
const ContextStack = require('./lib/context-stack');
const ContextStackClient = require('./lib/context-stack-client');

const mqtt = require('mqtt');
const redis = require('redis');

const mqttClient = mqtt.connect();
const redisClient = redis.createClient();

const contextStackClient = ContextStackClient({mqttClient});
const contextStack = ContextStack({mqttClient, redisClient});
const appDispatcher = AppDispatcher({mqttClient, contextStackClient});
