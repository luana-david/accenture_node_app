// const EventEmitter = require("events");

// const emitter = new EventEmitter();

// emitter.on("messageLoaded", function () {
//   console.log("event");
// });

// emitter.emit("messageLoaded");

// const app = require("./app");

// app.log("yay");

// const http = require("http");

// const server = http.createServer((req, res) => {
//   if (req.url === "/") {
//     res.write("hello");
//     res.end();
//   }
// });

// server.listen(3000);

// server.on("connection", () => {
//   console.log("listening to port 3000");
// });

const { json, urlencoded } = require("body-parser");
const express = require("express");
const app = express();
const Joi = require("joi");

app.use(json());
app.use(urlencoded());

const todos = [
  {
    id: 1,
    todoText: "get milk",
    isDone: false,
  },
  {
    id: 2,
    todoText: "get bread",
    isDone: false,
  },
  {
    id: 3,
    todoText: "get eggs",
    isDone: false,
  },
];

// app.get("/api/todos/:id", function (req, res) {
//   res.send(req.params.id);
// });

app.get("/api/todos/:year/:month", function (req, res) {
  res.send(req.params);
});

app.get("/api/todos", function (req, res) {
  const id = req.query.id;
  let response = todos;
  const todoText = req.query.todoText;

  if (id || todoText) {
    response = todos.filter((todo) => {
      if (id) {
        return todo.id === +id;
      }

      if (todoText) {
        return todo.todoText.includes(todoText);
      }
    });
  }
  res.status(200).send(response);
});

app.get("/api/todos/:id", (req, res) => {
  const todo = todos.find((todo) => todo.id == req.params.id);
  if (todo) {
    res.status(200).send(todo);
  } else {
    res.status(400).send({ message: "id is not defined" });
  }
});

app.post("/api/todos", (req, res) => {
  try {
    const schema = Joi.object({
      todoText: Joi.string().min(3).required(),
      isDone: Joi.boolean(),
    });

    const data = { ...req.body };

    const { error } = schema.validate(data);

    if (error) {
      return res.status(401).send(error.details);
    }

    if (!data.isDone) {
      data.isDone = false;
    }

    console.log(data, !data.isDone);
    const todo = {
      ...data,
      id: todos.length + 1,
    };

    todos.push(todo);
    res.status(201).send(todo);
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "something went wrong" });
  }
});

app.put("/api/todos/:id", (req, res) => {
  try {
    const id = +req.params.id;
    const data = req.body;
    const index = todos.findIndex((todo) => todo.id === id);
    if (index !== -1) {
      todos[index] = { ...data, id };
      res.status(201).send(data);
    } else {
      res.status(400).send({ message: "id does not exist" });
    }
  } catch (error) {
    res.status(500).send({ message: "smth went wrong" });
  }
});

app.delete("/api/todos/:id", (req, res) => {
  try {
    const { id } = req.params;
    const index = todos.findIndex((todo) => todo.id === +id);
    const deletedTodo = todos[index];
    if (index !== -1) {
      todos.splice(index, 1);
    } else {
      res.send(400).send({ message: "id does not exist" });
    }
    res.status(200).send(deletedTodo);
  } catch (error) {
    res.status(500).send({ message: "an error occured" });
  }
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`${port} port is ready`);
});
