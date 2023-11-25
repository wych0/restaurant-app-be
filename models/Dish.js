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
    enum: ["Appetizer", "Pizza", "Pasta", "Soup", "Dessert", "Drink"],
    required: true,
  },
  isSpicy: {
    type: Boolean,
  },
  isVegan: {
    type: Boolean,
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
