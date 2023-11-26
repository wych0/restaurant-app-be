const User = require("../models/user");
const PersonalData = require("../models/PersonalData");
const Reservation = require("../models/Reservation");
const bcrypt = require("bcryptjs");
const validator = require("email-validator");

create = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password || !validator.validate(email)) {
    return res.status(400).json({ message: "Invalid data provided." });
  }
  try {
    const userExist = await User.findOne({ email });
    if (userExist) {
      return res.status(409).json({ message: "E-mail already used." });
    }
    await User.create({
      email,
      password,
      role: "WORKER",
      isVerified: true,
    });
    res.status(201).json({
      message: "Worker account created.",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

deleteWorker = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findOne({ _id: id, role: "WORKER" });
    if (!user) {
      return res.status(404).json({ message: "Couldn't find worker account." });
    }
    await User.findByIdAndDelete(user._id);

    res.status(200).json({
      message: "Worker account deleted.",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

getWorkers = async (req, res) => {
  const { sort, dir, page, term, size } = req.query;
  try {
    const sortOptions = {};
    const query = {
      role: "WORKER",
    };

    if (term) {
      query.$or = [{ email: { $regex: term, $options: "i" } }];
    }

    if (!sort) {
      sortOptions["email"] = -1;
    }

    if (sort) {
      sortOptions[sort] = dir === "desc" ? -1 : 1;
    }
    const workersResponse = [];
    const totalCount = (await User.find(query)).length;
    const workers = await User.find(query)
      .sort(sortOptions)
      .skip((page - 1) * size)
      .limit(+size);
    for (const worker of workers) {
      const workerResponse = {
        email: worker.email,
        id: worker._id,
      };
      workersResponse.push(workerResponse);
    }
    res.status(200).json({ workers: workersResponse, totalCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

changePassword = async (req, res) => {
  const { password, newPassword } = req.body;
  const userId = req.user;
  if (!password || !newPassword) {
    return res.status(400).json({ message: "Invalid data provided." });
  }
  try {
    const user = await User.findById(userId);
    const isCorrectPassword = await bcrypt.compare(password, user.password);
    if (!isCorrectPassword) {
      return res.status(400).json({
        message: "Something went wrong, please try enter your password again.",
      });
    }
    user.password = newPassword;
    await user.save();
    res.status(200).json({ message: "Password changed." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

getPersonalData = async (req, res) => {
  const userId = req.user;
  try {
    const user = await User.findById(userId);
    const personalData = await PersonalData.findById(user.personalDataId);

    if (!personalData) {
      return res.status(200).json(personalData);
    }

    const personalDataResponse = {
      firstName: personalData.firstName,
      secondName: personalData.secondName,
      phone: personalData.phone,
      email: personalData.email,
    };

    res.status(200).json(personalDataResponse);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

getReservations = async (req, res) => {
  const { sort, dir, page, size, status } = req.query;
  const userId = req.user;
  try {
    const sortOptions = {};
    const query = {
      userId,
    };

    if (status) {
      query.status = status;
    }

    if (!sort) {
      sortOptions["date"] = -1;
      sortOptions["hour"] = -1;
    }

    if (sort) {
      sortOptions[sort] = dir === "desc" ? -1 : 1;
      if (sort === "date") {
        sortOptions["hour"] = dir === "desc" ? -1 : 1;
      }
    }
    const reservationsResponse = [];
    const totalCount = (await Reservation.find(query)).length;
    const reservations = await Reservation.find(query)
      .sort(sortOptions)
      .skip((page - 1) * size)
      .limit(+size);

    reservations.forEach((reservation) => {
      reservationResponse = {
        id: reservation._id,
        date: reservation.date,
        status: reservation.status,
        hour: reservation.hour,
      };
      reservationsResponse.push(reservationResponse);
    });
    res.status(200).json({ reservations: reservationsResponse, totalCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  create,
  deleteWorker,
  changePassword,
  getPersonalData,
  getReservations,
  getWorkers,
};
