const express = require("express");
const router = express.Router();
const User = require("../models/user");

// router.get("/", async (req, res) => {
//   try {
//     const dishes = await Dish.find();
//     res.send(200).json({ dishes });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// router.get("/:id", async (req, res) => {
//   const dishId = req.params.id;
//   const dish = await Dish.findById(new ObjectId(dishId));
//   if (!dish) {
//     return res.status(404).json({ message: "Dish not found" });
//   }
//   return res.status(200).json({ dish });
// });

module.exports = router;
