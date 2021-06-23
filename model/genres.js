const { string } = require("joi");
const mongoose = require("mongoose");

const genresSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name must be provided"],
  },
});

const Genre = mongoose.model("Genre", genresSchema);

module.exports.genreSchema = genresSchema;
module.exports.genreModel = Genre;
