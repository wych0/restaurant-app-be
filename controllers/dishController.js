const Dish = require("../models/Dish");
const User = require("../models/user");

create = async (req, res) => {
  const { name, ingredients, price, type, isVegan, isSpicy } = req.body;
  const userId = req.user;
  if (
    !name ||
    !ingredients ||
    !price ||
    !type ||
    typeof isVegan === "undefined" ||
    typeof isSpicy === "undefined"
  ) {
    return res.status(400).json({ message: "Invalid data provided." });
  }
  try {
    const user = await User.findById(userId);

    const dish = await Dish.create({
      name,
      ingredients,
      price,
      type,
      isVegan,
      isSpicy,
      createdBy: user.email,
    });

    res.status(201).json({ dish: dish._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

update = async (req, res) => {
  const { name, ingredients, price, type, isVegan, isSpicy, isDisplayed } =
    req.body;
  const userId = req.user;
  const { id } = req.params;
  if (
    !name ||
    !ingredients ||
    !price ||
    !type ||
    typeof isVegan === "undefined" ||
    typeof isSpicy === "undefined" ||
    typeof isDisplayed === "undefined"
  ) {
    return res.status(400).json({ message: "Invalid data provided." });
  }
  try {
    const user = await User.findById(userId);
    await Dish.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          name,
          ingredients,
          price,
          type,
          isVegan,
          isSpicy,
          isDisplayed,
          editedBy: user.email,
        },
      }
    );

    res.status(200).json({ message: "Dish updated." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

remove = async (req, res) => {
  const { id } = req.params;
  try {
    await Dish.findByIdAndDelete(id);

    res.status(200).json({ message: "Dish deleted." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// getDish = async (req, res) => {
//   const { id } = req.params;
//   const userId = req.user;
//   try {
//     const dish = await Dish.findById(id);
//     const user = await User.findById(userId);

//     const dishResponse = {
//       name: dish.name,
//       ingredients: dish.ingredients,
//       price: dish.price,
//       type: dish.type,
//       isSpicy: dish.isSpicy,
//       isVegan: dish.isVegan,
//       editedBy: user.role === "MANAGER" ? dish.editedBy : undefined,
//       createdBy: user.role === "MANAGER" ? dish.createdBy : undefined,
//     };

//     res.status(200).json(dishResponse);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

getAllToDisplay = async (req, res) => {
  try {
    const dishes = await Dish.find({ isDisplayed: true });
    const dishesResponse = [];

    for (const dish of dishes) {
      const dishResponse = {
        name: dish.name,
        ingredients: dish.ingredients,
        price: dish.price,
        type: dish.type,
        isSpicy: dish.isSpicy,
        isVegan: dish.isVegan,
      };
      dishesResponse.push(dishResponse);
    }

    res.status(200).json(dishesResponse);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

getAll = async (req, res) => {
  const { sort, dir, page, term, size, type, isDisplayed } = req.query;
  const userId = req.user;
  try {
    const sortOptions = {};
    const query = {};

    if (type) {
      query.type = type;
    }

    if (isDisplayed) {
      query.isDisplayed = isDisplayed;
    }

    if (term) {
      query.$or = [{ name: { $regex: term, $options: "i" } }];
    }

    if (!sort) {
      sortOptions["name"] = -1;
    }

    if (sort) {
      sortOptions[sort] = dir === "desc" ? -1 : 1;
    }

    const dishesResponse = [];
    const totalCount = (await Dish.find(query)).length;
    const user = await User.findById(userId);

    const dishes = await Dish.find(query)
      .sort(sortOptions)
      .skip((page - 1) * size)
      .limit(+size);

    for (const dish of dishes) {
      const dishResponse = {
        id: dish._id,
        name: dish.name,
        ingredients: dish.ingredients,
        price: dish.price,
        type: dish.type,
        isSpicy: dish.isSpicy,
        isVegan: dish.isVegan,
        isDisplayed: dish.isDisplayed,
        editedBy: user.role === "MANAGER" ? dish.editedBy : undefined,
        createdBy: user.role === "MANAGER" ? dish.createdBy : undefined,
      };
      dishesResponse.push(dishResponse);
    }

    res.status(200).json({ dishes: dishesResponse, totalCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getAllToDisplay, create, update, getAll, remove };
