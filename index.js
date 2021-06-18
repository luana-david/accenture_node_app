// Create Database Movies

// create table Genres

// name => required, min: 2, max: 50, lowercase,
// // subGenre => array, min: 1, it will not duplicate record

// // get records

// const mongoose = require("mongoose");

// const wait = (time) =>
//   new Promise((resolve, reject) => setTimeout(() => resolve, time));

// mongoose
//   .connect("mongodb://localhost/playground", {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })
//   .then(() => console.log("mongodb is connected"))
//   .catch((err) => console.error("could not connect to Mongodb", err));

// const courseSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: true,
//     minlength: 3,
//     maxlength: 100,
//     trim: true,
//     // match: /pattern/
//   },
//   author: { type: String },
//   tags: {
//     type: Array,
//     validate: {
//       validator: function (data) {
//         return data.length > 0;
//       },
//       message: "at least 1 tag is required",
//     },
//   },
//   date: { type: Date, default: Date.now },
//   isPublished: Boolean,
//   category: {
//     type: String,
//     enum: ["tech", "fiction", "scifi"],
//     // uppercase: true
//     lowercase: true,
//   },
//   price: {
//     type: Number,
//     required: function () {
//       return this.isPublished;
//     },
//     get: (v) => Math.round(v),
//     set: (v) => Math.round(v),
//   },
// });

// // Created Class
// const Course = mongoose.model("Course", courseSchema);

// async function CreateCourse() {
//   try {
//     const course = new Course({
//       name: " React.js Training     ",
//       author: "Rohit",
//       tags: [],
//       isPublished: true,
//       category: "TECH",
//       price: 80.8,
//     });
//     await course.validate();
//     const result = await course.save();
//     console.log(result);
//   } catch (error) {
//     console.log(error);
//   }
// }

// CreateCourse();

// // async function updateCourse(id) {
// //   const result = await Course.updateOne(
// //     { _id: id },
// //     {
// //       $set: {
// //         isPublished: false,
// //       },
// //     }
// //   );

// //   //   const course = await Course.findById(id);
// //   //   if (!course) return;

// //   //   course.isPublished = true;

// //   //   // course.set({
// //   //   //     isPublished: true;
// //   //   // })

// //   //   const result = await course.save();
// //   //   console.log(result);
// // }

// // updateCourse("60cc7e9461ff46391891d393");

// async function GetCourses() {
//   // eq (equal)
//   // ne (not equal)
//   // gt (grater then)
//   // gte (greater then or equal)
//   // lt (less then)
//   // lte(less then or equal)
//   // in
//   // nin (not in)

//   // or
//   // and
//   // nor

//   const pageNumber = 2;
//   const pageSize = 1;

//   const courses = await Course
//     //   .find({ category: "tech"})
//     // .find()
//     // .and([
//     //   { author: "Yagnesh" },
//     //   {
//     //     price: { $eq: 100 },
//     //   },
//     // ])
//     // .skip(1)
//     // .limit(1)

//     // 0 * 10 => 0
//     // 1 * 10 => 10
//     .find()
//     .skip((pageNumber - 1) * pageSize)
//     .limit(pageSize)
//     .sort({ name: 1 })
//     .select({ name: 1, author: 1, price: 1 });
//   console.log(courses);
// }

// GetCourses();

// Created instance

// String
// Number
// Date,
// Buffer
// Boolean
// ObjectID
// Array

// Create Database Movies

// create table Genres

// name => required, min: 2, max: 50, lowercase,
// // subGenre => array, min: 1, it will not duplicate record

// // get records

const { countReset } = require("console");
const mongoose = require("mongoose");
mongoose
  .connect("mongodb://localhost:27017/movies", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("mongoose connected"))
  .catch((err) => console.log("there is an error", err));

const genreSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 50,
    lowercase: true,
  },
  subGenre: {
    type: Array,
    validate: [
      {
        validator: (data) => data.length > 0,
        message: "Please provide at least one sub genre",
      },
      {
        validator: (data) =>
          data.filter((item, index) => data.indexOf(item) !== index).length ===
          0,
        message: "Duplicate genres",
      },
    ],
  },
});

const Genres = mongoose.model("Genre", genreSchema);

async function createGenre() {
  const genre = new Genres({
    name: "comedy",
    subGenre: ["romantic comedy", "black comedy"],
  });

  await genre.validate();
  const result = await genre.save();
  console.log(genre);
}

createGenre();

async function getGenres() {
  const res = await Genres.find();
  console.log(res);
}

getGenres();
