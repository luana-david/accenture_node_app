const Logger = require("./emitter");
const emitt = new Logger();

emitt.on("messageLoaded", function (args) {
  console.log("messageLoaded is fired", args);
});

module.exports = emitt;
