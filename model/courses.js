const mongoose = require("mongoose");
const Joi = require("joi");
Joi.objectId = require("joi-objectId")(Joi);

const authorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
  },
  bio: String,
  website: String,
});

const courseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    minlength: [3, "Minimum length is 3"],
    maxlength: 100,
    trim: true,
    // match: /pattern/
  },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "Author" },
  tags: {
    type: Array,
    validate: {
      validator: function (data) {
        return true;
      },
      message: "at least 1 tag is required",
    },
  },
  date: { type: Date, default: Date.now },
  isPublished: Boolean,
  category: {
    type: String,
    enum: ["tech", "fiction", "scifi"],
    // uppercase: true
    lowercase: true,
  },
  price: {
    type: Number,
    required: function () {
      return this.isPublished;
    },
    get: (v) => Math.round(v),
    set: (v) => Math.round(v),
  },
});

const Course = mongoose.model("Course", courseSchema);

const courseValidSch = (course) => {
  const schema = Joi.object({
    _id: Joi.objectId(),
    name: Joi.string().alphanum().min(3).max(30).required(),
    author: Joi.string().required(),
  });
  return schema.validate(course);
};

module.exports = Course;
