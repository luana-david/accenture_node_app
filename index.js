const mongoose = require("mongoose");

mongoose
  .connect("mongodb://localhost/playground", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("mongodb is connected"))
  .catch((err) => console.error("could not connect to Mongodb", err));

const courseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 100,
    // match: /pattern/
  },
  author: { type: String },
  tags: [String],
  date: { type: Date, default: Date.now },
  isPublished: Boolean,
  category: {
    type: String,
    enum: ["tech", "fiction", "scifi"],
  },
  price: {
    type: Number,
    required: function () {
      return this.isPublished;
    },
  },
});

// Created Class
const Course = mongoose.model("Course", courseSchema);

async function CreateCourse() {
  try {
    const course = new Course({
      name: "React.js Training",
      author: "Rohit",
      tags: ["react", "backedn"],
      isPublished: true,
      category: "tech",
      price: 80,
    });
    await course.validate();
    const result = await course.save();
    console.log(result);
  } catch (error) {
    console.log(error);
  }
}

CreateCourse();

// async function updateCourse(id) {
//   const result = await Course.updateOne(
//     { _id: id },
//     {
//       $set: {
//         isPublished: false,
//       },
//     }
//   );

//   //   const course = await Course.findById(id);
//   //   if (!course) return;

//   //   course.isPublished = true;

//   //   // course.set({
//   //   //     isPublished: true;
//   //   // })

//   //   const result = await course.save();
//   //   console.log(result);
// }

// updateCourse("60cc7e9461ff46391891d393");

async function GetCourses() {
  // eq (equal)
  // ne (not equal)
  // gt (grater then)
  // gte (greater then or equal)
  // lt (less then)
  // lte(less then or equal)
  // in
  // nin (not in)

  // or
  // and
  // nor

  const pageNumber = 2;
  const pageSize = 1;

  const courses = await Course
    //   .find({ category: "tech"})
    // .find()
    // .and([
    //   { author: "Yagnesh" },
    //   {
    //     price: { $eq: 100 },
    //   },
    // ])
    // .skip(1)
    // .limit(1)

    // 0 * 10 => 0
    // 1 * 10 => 10
    .find()
    .skip((pageNumber - 1) * pageSize)
    .limit(pageSize)
    .sort({ name: 1 })
    .select({ name: 1, author: 1, price: 1 });
  console.log(courses);
}

// GetCourses();

// Created instance

// String
// Number
// Date,
// Buffer
// Boolean
// ObjectID
// Array
