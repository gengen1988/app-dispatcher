'use strict';

const COMMAND = {
  KEY_DOWN: 'input.system.keydown',
  BEGIN_CONTEXT: 'input.system.begincontext',
  END_CONTEXT: 'input.system.endcontext',
  VOICE: 'input.user.unrecognizedvoice',

  ACKNOWNLEDGEMENT: 'appdispatcher.acknownledgement',
  REJECTION: 'appdispatcher.rejection'
};

function AppDispatcher(opts) {
  if (!(this instanceof AppDispatcher)) return new AppDispatcher(opts);

  opts = opts || {};
  this.mqttClient = opts.mqttClient || mqtt.connect();
  this._initialize();
}

AppDispatcher.prototype._initialize = function initialize() {
  mqtt.subscribe([
    COMMAND.KEY_DOWN,
    COMMAND.BEGIN_CONTEXT,
    COMMAND.END_CONTEXT,
    COMMAND.VOICE,
    COMMAND.ACKNOWNLEDGEMENT,
    COMMAND.REJECTION
  ]);

  mqtt.on('message', function() {
  });

};
