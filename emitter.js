const EventEmitter = require("events");

// class
// const emitter = new EventEmitter();

class Logger extends EventEmitter {
  log(message) {
    console.log(message);

    this.emit("message", { message: message });
  }
}

module.exports = Logger;
