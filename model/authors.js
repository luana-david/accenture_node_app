const mongoose = require("mongoose");

const authorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
  },
  bio: String,
  website: String,
});

const Author = mongoose.model("Author", authorSchema);

module.exports = Author;
