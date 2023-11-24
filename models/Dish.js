const { Schema, model } = require("mongoose");

const dishSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  ingredients: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    enum: ["appetizer", "pizza", "pasta", "soup", "dessert", "drink"],
    required: true,
  },
  isSpicy: {
    type: Boolean,
    required: true,
  },
  isVegan: {
    type: Boolean,
    required: true,
  },
  isDisplayed: {
    type: Boolean,
    default: false,
  },
  editedBy: {
    type: String,
  },
  createdBy: {
    type: String,
    required: true,
  },
});

module.exports = model("Dish", dishSchema);
