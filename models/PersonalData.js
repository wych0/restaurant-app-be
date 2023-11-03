const { Schema, model } = require("mongoose");

const personalDataSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  secName: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
});

module.exports = model("personalData", personalDataSchema);
