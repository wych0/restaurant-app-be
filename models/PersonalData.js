const { Schema, model } = require("mongoose");

const personalDataSchema = new Schema({
  firstName: {
    type: String,
    required: true,
  },
  secondName: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
});

module.exports = model("personalData", personalDataSchema);
module.exports = personalDataSchema;
