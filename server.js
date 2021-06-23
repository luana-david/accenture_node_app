const express = require("express");
const morgan = require("morgan");
const config = require("config");
const startupDebugger = require("debug")("app:startup");
const dbDebugger = require("debug")("app:db");
const app = express();
const logger = require("./logger");
const Joi = require("joi");
const mongoose = require("mongoose");
const connect = require("./connect");
const Course = require("./model/courses");
const Author = require("./model/authors");

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

app.get("/", function (req, res) {
  // database
  res.render("index", { pageTitle: "Node.js Training", youAreUsingPug: true });
});

const errRes = (errors) => {
  const newErrors = {};
  for (const err in errors) {
    newErrors[err] = errors[err].message;
    if (errors[err].properties.type === "enum") {
      newErrors[err] = {
        message: errors[err].message,
        validValues: errors[err].properties.enumValues,
      };
    } else {
      newErrors[err] = errors[err].message;
    }
  }
  return newErrors;
};

const courseValidationSchema = Joi.object({
  name: Joi.string().alphanum().min(3).max(30).required(),
});

// app.get("/api/courses", async (req, res) => {
//   try {
//     const courses = await Course.find();
//     res.status(200).send(courses);
//   } catch (error) {
//     res.status(500).send({ message: error.message });
//   }
// });

app.post("/api/courses", async (req, res) => {
  try {
    const { author: authorData, ...courseData } = req.body;
    const author = new Author(authorData);
    await author.validate();
    await author.save();

    const course = new Course({ ...courseData, author: author._id });
    await course.validate();
    await course.save();
    res.status(201).send(course);
  } catch (error) {
    if (error.name === "ValidationError") {
      res.status(400).send({
        message: "attached filed has wrong data",
        data: errRes(error.errors),
      });
    } else {
      res.status(500).send({ message: error.message });
    }
  }
});

app.put("/api/courses/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const updatedCourse = await Course.updateOne(
      { _id: id },
      {
        $set: req.body,
      },
      { runValidators: true }
    );
    res.status(201).send(updatedCourse);
  } catch (error) {
    if (error.name === "ValidationError") {
      res.status(400).send({
        message: "attached filed has wrong data",
        data: errRes(error.errors),
      });
    } else {
      res.status(500).send({ message: error.message });
    }
  }
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

    const courses = await Course.find(query).populate("author", "name -_id");
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
