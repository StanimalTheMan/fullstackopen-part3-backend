const express = require("express");
const app = express();
const morgan = require("morgan");
const cors = require("cors");
require("dotenv").config();
const Person = require("./models/person");

app.use(express.json());
app.use(cors());
app.use(express.static("build"));

const errorHandler = (error, request, response, next) => {
  console.log(error.message);
  console.log(error.name);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  } else if (error.name === "MongoError") {
    return response.status(500).json({ error: error.message });
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  }

  next(error);
};

morgan.token("post-body", function (req, res) {
  if (req.method == "POST") {
    return JSON.stringify(req.body);
  }
});

// app.use(morgan("tiny")); // ex. 3.7
app.use(
  morgan(
    ":method :url :status :res[content-length] - :response-time ms :post-body"
  )
);

// let persons = [
//   { id: 1, name: "Arto Hellas", number: "040-123456" },
//   { id: 2, name: "Ada Lovelace", number: "39-44-5323523" },
//   { id: 3, name: "Dan Abramov", number: "12-43-234345" },
//   { id: 4, name: "Mary Poppendick", number: "39-23-6423122" },
// ];

app.get("/", (request, response) => {
  response.send("<h1>Hello World!</h1>");
});

app.get("/api/persons", (request, response) => {
  Person.find({}).then((persons) => {
    response.json(persons);
  });
});

app.get("/api/persons/:id", (request, response, next) => {
  // const id = Number(request.params.id);
  // const person = persons.find((person) => person.id === id);

  // if (person) {
  //   response.json(person);
  // } else {
  //   response.status(404).end();
  // }
  Person.findById(request.params.id)
    .then((person) => {
      if (person) {
        response.json(person);
      } else {
        response.status(404).end();
      }
    })
    .catch((error) => {
      next(error);
    });
});

app.delete("/api/persons/:id", (request, response, next) => {
  // const id = Number(request.params.id);
  // persons = persons.filter((person) => person.id !== id);

  // response.status(204).end();
  Person.findByIdAndDelete(request.params.id)
    .then((result) => response.status(204).end())
    .catch((error) => next(error));
});

app.post("/api/persons", (request, response, next) => {
  const body = request.body;

  // if (!body.name) {
  //   return response.status(400).json({
  //     error: "name missing",
  //   });
  // } else if (!body.number) {
  //   return response.status(400).json({
  //     error: "phone number missing",
  //   });
  // }

  const person = new Person({
    name: body.name,
    number: body.number,
  });

  person
    .save()
    .then((savedPerson) => {
      response.json(savedPerson.toJSON());
    })
    .catch((error) => next(error));
});

app.put("/api/persons/:id", (request, response, next) => {
  const body = request.body;

  const person = {
    name: body.name,
    number: body.number,
  };

  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then((updatedPerson) => {
      response.json(updatedPerson);
    })
    .catch((error) => next(error));
});

app.get("/info", (request, response) => {
  Person.countDocuments({}, (err, count) => {
    response.send(
      `<p>Phonebook has info for ${count} people</p><p>${new Date()}</p>`
    );
  });
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);

app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
