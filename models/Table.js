const { Schema, model } = require("mongoose");

const tableSchema = new Schema({
  maxPeopleNumber: {
    type: Number,
    required: true,
  },
  number: {
    type: Number,
    required: true,
  },
});

module.exports = model("Table", tableSchema);
