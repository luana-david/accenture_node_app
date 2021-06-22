const Logger = require("./emitter");

const logger = new Logger();

// register event
logger.on("messageloaded", function (args) {
  console.log(args);
});

function xyz() {
  return "xyz";
}

module.exports = xyz;

// OS
// HTTP
// FS
