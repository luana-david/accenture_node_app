const mongoose = require("mongoose");
const { genreSchema } = require("./genres");

const moviesSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  genres: [genreSchema],
});

const Movie = mongoose.model("Movie", moviesSchema);

module.exports = Movie;
