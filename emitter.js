const EventEmitter = require("events");

const emitter = new EventEmitter();

class Logger extends EventEmitter {
  log(message) {
    this.emit("messageLoaded", { id: 1, message });
  }
}

module.exports = Logger;
