const mongoose = require("mongoose");
const { genreSchema } = require("./genres");

const moviesSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  genre: genreSchema,
});

const Movie = mongoose.model("Movie", moviesSchema);

module.exports = Movie;
