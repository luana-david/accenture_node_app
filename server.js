const express = require("express");
const morgan = require("morgan");
const config = require("config");
const startupDebugger = require("debug")("app:startup");
const dbDebugger = require("debug")("app:db");
const app = express();
const logger = require("./logger");
const Joi = require("joi");
const mongoose = require("mongoose");

// new javascript
const connect = async () => {
  try {
    await mongoose.connect("mongodb://localhost/playground", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("mongodb is connected");
  } catch (error) {
    console.error("could not connect to Mongodb", err);
  }
};

connect();

app.set("view engine", "pug");
app.set("views", "./views");

const dbConfig = config.get("Customer.dbConfig");
const password = config.get("mail.password");
console.log(dbConfig);
console.log(password);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

console.log(process.env.NODE_ENV);
console.log(app.get("env"));

if (app.get("env") === "development") {
  app.use(logger);
  app.use(morgan("tiny"));
  startupDebugger("morgan started");
}

app.use(function (req, res, next) {
  console.log("authenticate....");
  next();
});

dbDebugger("db started");

const todos = [
  {
    id: 1,
    todoText: "Get Milk",
    isDone: false,
  },
  {
    id: 2,
    todoText: "Give Training",
    isDone: false,
  },
];

const courseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 100,
    trim: true,
    // match: /pattern/
  },
  author: { type: String },
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

// Created Class
const Course = mongoose.model("Course", courseSchema);

app.get("/", function (req, res) {
  // database
  res.render("index", { pageTitle: "Node.js Training", youAreUsingPug: true });
});

app.get("/api/todos", function (req, res) {
  console.log("get method...");
  const id = req.query.id;
  const todoText = req.query.todoText;
  let response = todos;
  if (id || todoText) {
    response = response.filter((x) => {
      if (id) {
        return x.id === Number(id);
      }
      if (todoText) {
        return x.todoText.includes(todoText);
      }
      return false;
    });
  }
  res.status(200).send(response);
});

app.get("/api/todos/:id", function (req, res) {
  const todo = todos.find((x) => x.id === Number(req.params.id));

  if (todo) {
    res.status(200).send(todo);
  } else {
    res.status(400).send({ message: "id is not available" });
  }
});

app.post("/api/todos", function (req, res) {
  try {
    const schema = Joi.object({
      todoText: Joi.string().min(3).required(),
      isDone: Joi.boolean(),
    });

    const { error } = schema.validate(req.body);

    if (error) {
      return res.status(401).send(error.details);
    }
    const data = req.body;

    if (!data.isDone) {
      data.isDone = false;
    }

    const todo = {
      id: todos.length + 1,
      ...data,
    };
    todos.push(todo);
    res.status(201).send(todo);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "something is wrong" });
  }
});

app.put("/api/todos/:id", function (req, res) {
  const index = todos.findIndex((x) => x.id === Number(req.params.id));
  if (index === -1)
    return res.status(404).send({ message: "record not found" });

  // TODO: use splice for update record as well
  todos.splice(index, 1);
  const updatedTodo = {
    ...req.body,
    id: req.params.id,
  };
  todos.push(updatedTodo);

  return res.status(201).send(updatedTodo);
});

app.delete("/api/todos/:id", function (req, res) {
  const index = todos.findIndex((x) => x.id === Number(req.params.id));
  if (index === -1)
    return res.status(404).send({ message: "record not found" });

  const deletedTodo = todos[index];
  // TODO: use splice for update record as well
  todos.splice(index, 1);

  return res.status(201).send(deletedTodo);
});

app.get("/api/courses", async (req, res) => {
  try {
    let query = {};
    const author = req.query.author;
    if (author) query.author = new RegExp(`.*${author}.*`, "i");
    const tags = req.query.tags?.split(",");
    if (tags) query.tags = { $in: tags };
    
    const courses = await Course.find(query);
    res.status(200).send(courses);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

app.get("/api/courses/:id", async (req, res) => {
  try {
    const course = await Course.findOne({ _id: req.params.id });
    res.status(200).send(course);
  } catch (error) {
    console.log(JSON.stringify(error));
    if (error.path === "_id") {
      res.status(400).send({ message: "Please Provide correct ID" });
    } else {
      res.status(500).send({ message: error.message });
    }
  }
});

// app.get("/api/todos/:year/:month", function (req, res) {
//   // {
//   //     year: '',
//   //     month: ""
//   // }
//   res.send(req.params);
// });

var port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`${port} port is ready`);
});
