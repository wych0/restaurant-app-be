const mongoose = require("mongoose");

const { DATABASE_URL } = process.env;

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

exports.connect = () => {
  mongoose.connect(DATABASE_URL, options);
  const databaseConnection = mongoose.connection;
  databaseConnection.on("connected", () => {
    console.log("Connected to database");
  });
  databaseConnection.on("error", (error) => {
    console.error(error);
    process.exit(1);
  });
  databaseConnection.on("disconnected", () => {
    console.log("Database connection disconnected");
  });
};
