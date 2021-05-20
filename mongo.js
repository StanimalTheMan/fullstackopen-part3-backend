const mongoose = require("mongoose");

if (process.argv.length < 3) {
  console.log(
    "Please provide the password, <name>, and <number> as arguments (name and number are optional if you don't want to add entry): node mongo.js <password> <name> <number>"
  );
  process.exit(1);
}

const password = process.argv[2];
const url = `mongodb+srv://fullstack:${password}@cluster0.h7k73.mongodb.net/person-app?retryWrites=true&w=majority`;

mongoose.connect(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true,
});

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
});

const Person = mongoose.model("Person", personSchema);

// naive way of differentiating from adding a new entry vs displaying all entries based on arguments given
if (process.argv.length == 5) {
  const name = process.argv[3];
  const number = process.argv[4];
  const person = new Person({
    name,
    number,
  });
  person.save().then((result) => {
    console.log(`added ${person.name} number ${person.number} to phonebook`);
    mongoose.connection.close();
  });
} else {
  // display all entries if arguments' length is 3
  console.log("phonebook:");
  Person.find({}).then((persons) => {
    persons.forEach((person) => {
      console.log(person.name + " " + person.number);
    });
    mongoose.connection.close();
  });
}
