const mongoose = require("mongoose");
const fs = require("fs");
const colors = require("colors");

const dotenv = require("dotenv");
dotenv.config({ path: "./config/config.env" });
const Bootcamps = require("./models/Bootcamp");
const Courses = require("./models/Course");
const User = require("./models/User");
const Reviews = require("./models/Review");

//connect to db
const db = require("./config/keys/keys").mongoURI;
mongoose
  .connect(db, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
  })
  .then(connections => {
    console.log(`mongodb connected `.cyan.underline.bold);
  })
  .catch(err => console.log(`${err.message}`.red.bold));

//Read the file to JSON
const bootcampRawData = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/bootcamps.json`, "utf-8")
);

const courseRawData = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/courses.json`, "utf-8")
);

const userRawData = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/users.json`, "utf-8")
);

const reviewRawData = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/reviews.json`, "utf-8")
);

//create the data in our db through the schema

const createData = async () => {
  try {
    await Bootcamps.create(bootcampRawData);
    await Courses.create(courseRawData);
    await User.create(userRawData);
    await Reviews.create(reviewRawData);
    console.log("data created".green.inverse);
    process.exit();
  } catch (error) {
    console.log(error);
  }
};

//delete the data
const deleteData = async () => {
  try {
    await Bootcamps.deleteMany();
    await Courses.deleteMany();
    await User.deleteMany();
    await Reviews.deleteMany();

    console.log("data deleted".red.inverse);
    process.exit();
  } catch (error) {
    console.log(error);
  }
};

//check what node argument called in the shell is nd how we respond to it

if (process.argv[2] === "-i") {
  createData();
} else if (process.argv[2] === "-d") {
  deleteData();
}
