const express = require("express");
const morgan = require("morgan");
const config = require("config");
const startupDebugger = require("debug")("app:startup");
const dbDebugger = require("debug")("app:db");
const app = express();
const logger = require("./logger");
const Joi = require("joi");
const Course = require("./model/courses");
const connect = require("./connect");
const Author = require("./model/authors");

const Fawn = require("fawn");

const mongoose = require("mongoose");

app.set("view engine", "pug");
app.set("views", "./views");

const dbConfig = config.get("Customer.dbConfig");
const password = config.get("mail.password");
console.log(dbConfig);
console.log(password);

app.use(express.json({ extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

console.log(process.env.NODE_ENV);
console.log(app.get("env"));

if (app.get("env") === "development") {
  app.use(logger);
  app.use(morgan("tiny"));
  startupDebugger("morgan started");
}

connect();

Fawn.init(mongoose);

const errorRes = (error) => {
  const newError = {};
  for (const key in error) {
    console.log(key);
    newError[key] = {
      message: error[key].message,
    };
    if (error[key].properties.type === "enum") {
      newError[key] = {
        ...newError[key],
        validValues: error[key].properties.enumValues,
      };
    }
  }
  return newError;
};

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

// app.get("/api/todos/:year/:month", function (req, res) {
//   // {
//   //     year: '',
//   //     month: ""
//   // }
//   res.send(req.params);
// });

app.get("/api/courses", async (req, res) => {
  try {
    const author = req.query.author;
    const tags = req.query.tags?.split(",");
    let query = {};
    if (author) {
      query["author.name"] = new RegExp(`.*${author}.*`, "i");
    }
    if (tags) {
      query.tags = { $in: tags };
    }
    const courses = await Course.find({ ...query });
    courses.length !== 0
      ? res.status(200).send(courses)
      : res.status(400).send({ message: "no courses found" });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

app.get("/api/courses/:id", async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    console.log(course);
    res.status(200).send(course);
  } catch (error) {
    if (error.path === "_id") {
      res.status(404).send({ message: "id not matching" });
    } else {
      res.status(500).send({ message: error });
    }
  }
});

app.post("/api/courses", async (req, res) => {
  try {
    const { author, ...data } = req.body;
    const authorPost = new Author(author);
    const course = new Course(data);
    await Fawn.Task().save("Author", authorPost).save("Course", course).run();

    // await authorPost.validate();
    // const aut = await authorPost.save();

    // const { error } = courseValidSch.validate();
    // if (error) {
    //   throw mongoose.Error("");
    // }

    // for (let i = 0; i < author.length; i++) {
    //   course.author.push(new Author(author[i]));
    // }
    // await course.validate();
    // const resp = await course.save();
    res.status(201).send({ succes: true });
  } catch (error) {
    console.log(error);
    res.status(500).send({ err: errorRes(error.errors) });
  }
});

app.put("/api/courses/:id", async (req, res) => {
  try {
    const data = req.body;
    const { id } = req.params;
    const course = await Course.findOne({ _id: id });
    course.author.name = req.body.author.name;
    await course.save();
    // const updated = await Course.updateOne(
    //   { _id: id },
    //   {
    //     $set: data,
    //   },
    //   { runValidators: true }
    // );
    console.log(course);
    res.status(201).send(course);
  } catch (error) {
    res.status(500).send({ message: error });
  }
});

app.delete("/api/courses/:courseId/:authorId", async (req, res) => {
  try {
    const { courseId, authorId } = req.params;
    const course = await Course.findOne({ _id: courseId });
    const author = course.author.id(authorId);
    await author.remove();
    await course.save();
    res.status(202).send(course);
  } catch (error) {
    res.status(500).send({ message: error });
  }
});

var port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`${port} port is ready`);
});
