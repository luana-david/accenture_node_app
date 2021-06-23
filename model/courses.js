const mongoose = require("mongoose");
const Joi = require("joi");

const courseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required."],
    minlength: [3, "Minimum length is 3."],
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

const validateCourse = (course) => {
  const schema = Joi.object({
    name: Joi.string().required().min(3).max(100),
    author: Joi.string().required().min(2).max(100),
  });

  return schema.validate(course);
};

const Course = mongoose.model("Course", courseSchema);

module.exports = Course;
