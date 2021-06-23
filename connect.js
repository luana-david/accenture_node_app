const mongoose = require("mongoose");

const connect = async () => {
  try {
    mongoose.connect("mongodb://localhost/playground", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("mongoose connected");
  } catch (error) {
    console.log("connection error");
  }
};

module.exports = connect;
