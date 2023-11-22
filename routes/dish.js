const express = require("express");
const router = express.Router();
const Dish = require("../models/Dish");
const { ObjectId } = require("mongodb");

const { verifyToken } = require("../middleware/authMiddleware");

router.get("/", verifyToken, async (req, res) => {
  try {
    const dishes = await Dish.find();
    res.status(200).json({ dishes });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/:id", async (req, res) => {
  const dishId = req.params.id;
  const dish = await Dish.findById(new ObjectId(dishId));
  if (!dish) {
    return res.status(404).json({ message: "Dish not found" });
  }
  return res.status(200).json({ dish });
});

router.post("/", async (req, res) => {
  const { name, ingredients, price, type } = req.body;
  const dish = new Dish({
    name,
    ingredients,
    price,
    type,
  });
  try {
    const newDish = await dish.save();
    return res.status(201).json(newDish);
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
});

module.exports = router;
