const { ObjectId } = require("mongodb");
const Reservation = require("../models/Reservation");
const Table = require("../models/Table");
const User = require("../models/user");
const { isSameDay } = require("date-fns");
const {
  notPastDate,
  notPastHour,
  isValidHour,
  isCancellable,
} = require("../validators/reservation");
const { createToken } = require("../tools/jwt-token");
const {
  sendConfirmationReservationEmail,
  sendCancellationReservationEmail,
} = require("../tools/email/sendEmail");
const jwt = require("jsonwebtoken");

const { CONFIRMATION_TOKEN_SECRET_KEY } = process.env;

const maxConfirmationTokenAge = 15 * 60;

create = async (req, res) => {
  const {
    date,
    hour,
    peopleNumber,
    additionalOptions,
    personalData,
    requests,
    userId,
  } = req.body;
  if (!date || !hour || !peopleNumber || !personalData) {
    return res.status(400).json({ message: "Invalid data provided." });
  }
  try {
    const user = await User.findOne({ email: personalData.email });
    if (user && user._id != userId) {
      return res.status(409).json({
        message:
          "Probably you have an account, please log in before making reservation.",
      });
    }
    if (!isValidHour(hour)) {
      return res
        .status(422)
        .json({ message: "Invalid hour provided. (12-22)" });
    }
    const maxPeopleNumber =
      +peopleNumber % 2 === 0 ? +peopleNumber : +peopleNumber + 1;
    const availableTable = await findAvailableTable(
      date,
      hour,
      maxPeopleNumber
    );
    if (!availableTable) {
      return res.status(404).json({ message: "No tables available." });
    }
    if (!notPastDate(date)) {
      return res.status(422).json({ message: "Past date provided." });
    }
    const todaysDate = new Date();
    const providedDate = new Date(date);
    if (!notPastHour(hour) && isSameDay(todaysDate, providedDate)) {
      return res.status(422).json({ message: "Past hour provided." });
    }
    const reservation = await Reservation.create({
      date,
      hour,
      peopleNumber,
      requests,
      personalData,
      additionalOptions,
      tableId: availableTable._id,
      userId,
    });
    const confirmationToken = createToken(
      reservation._id,
      CONFIRMATION_TOKEN_SECRET_KEY,
      maxConfirmationTokenAge
    );
    await Reservation.findOneAndUpdate(
      { _id: reservation._id },
      { confirmationToken }
    );
    const reservationResponse = {
      date: reservation.date,
      hour: reservation.hour,
      peopleNumber: reservation.peopleNumber,
      tableNumber: availableTable.number,
      personalData: reservation.personalData,
    };
    sendConfirmationReservationEmail(
      personalData.email,
      confirmationToken,
      reservation,
      availableTable.number
    );
    res.status(201).json(reservationResponse);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

confirm = async (req, res) => {
  const { token } = req.params;
  try {
    jwt.verify(
      token,
      CONFIRMATION_TOKEN_SECRET_KEY,
      async (err, decodedToken) => {
        if (err) {
          return res.status(403).json({
            message:
              "Confirmation reservation failed. Probably the link has expired or is invalid.",
          });
        }
        const reservation = await Reservation.findById(decodedToken.id);
        if (!reservation || reservation.status !== "PENDING") {
          return res.status(403).json({
            message:
              "Confirmation reservation failed. Probably the link has expired or is invalid.",
          });
        }
        await Reservation.findOneAndUpdate(
          { _id: reservation._id },
          { $set: { status: "CONFIRMED", confirmationToken: "" } }
        );
        res.status(200).json({ message: "Reservation confirmed." });
      }
    );
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

cancel = async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  const userId = req.user;
  try {
    const _id = new ObjectId(id);
    const reservation = await Reservation.findById(_id);
    if (!reservation) {
      return res.status(404).json({
        message: "Cancelling reservation failed. We couldn't find reservation.",
      });
    }
    const user = await User.findById(userId);
    if (
      user.role === "CLIENT" &&
      user._id.toString() != reservation.userId.toString()
    ) {
      return res.status(403).json({
        message:
          "Cancelling reservation failed. You can't cancel this reservation.",
      });
    }
    if (
      reservation.status === "CANCELLED" ||
      reservation.status === "COMPLETED"
    ) {
      return res.status(403).json({
        message:
          "Cancelling reservation failed. Probably reservation is cancelled or completed.",
      });
    }

    if (!isCancellable(reservation.date, reservation.hour)) {
      return res.status(403).json({
        message:
          "Cancelling reservation failed. You can cancel your reservation at least 12 hours before it's date.",
      });
    }

    let cancellationReason = reason;

    if (user.role === "CLIENT") {
      cancellationReason = "Reservation cancelled by client.";
    }

    if (!cancellationReason) {
      return res.status(403).json({
        message:
          "Cancelling reservation failed. No cancellation reason provided by worker.",
      });
    }

    await Reservation.findOneAndUpdate(
      { _id },
      {
        $set: {
          status: "CANCELLED",
          confirmationToken: "",
          cancellationReason,
        },
      }
    );
    sendCancellationReservationEmail(
      reservation.personalData.email,
      _id,
      cancellationReason
    );
    res.status(200).json({ message: "Reservation cancelled." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

getAll = async (req, res) => {
  const { sort, dir, page, term, size } = req.query;
  try {
    const sortOptions = {};
    const query = {};

    if (sort) {
      sortOptions[sort] = dir === "DESC" ? -1 : 1;
    }

    const reservations = await Reservation.find(query)
      .sort(sortOptions)
      .skip((page - 1) * size)
      .limit(size);
    res.status(200).json(reservations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

getReservation = async (req, res) => {
  const { id } = req.params;
  try {
    const reservation = await Reservation.findById(id);
    if (!reservation) {
      return res.status(404).json({ message: "Couldn't find reservation." });
    }
    const table = await Table.findById(reservation.tableId);
    const reservationDetails = {
      id: reservation._id,
      date: reservation.date,
      hour: reservation.hour,
      status: reservation.status,
      peopleNumber: reservation.peopleNumber,
      tableNumber: table.number,
      personalData: reservation.personalData,
      additionalOptions: reservation.additionalOptions,
      requests: reservation.requests,
      cancellationReason: reservation.cancellationReason,
    };
    res.status(200).json(reservationDetails);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

getUserReservations = async (req, res) => {
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

availableHours = async (req, res) => {
  const { date, peopleNumber } = req.query;

  if (!date || !peopleNumber) {
    return res.status(400).json({ message: "Invalid data provided." });
  }
  try {
    const todaysDate = new Date();
    const currentHour = new Date().getHours();
    const providedDate = new Date(date);

    if (!notPastDate(date)) {
      return res.status(422).json({ message: "Past date provided." });
    }
    const maxPeopleNumber =
      +peopleNumber % 2 === 0 ? +peopleNumber : +peopleNumber + 1;
    const tables = await Table.find({ maxPeopleNumber });
    const reservations = await Reservation.find({
      date,
      peopleNumber: { $in: [maxPeopleNumber, maxPeopleNumber - 1] },
      status: { $ne: "CANCELLED" },
    });

    const firstAvailableHour =
      isSameDay(todaysDate, providedDate) && currentHour >= 12
        ? currentHour + 2
        : 12;
    const lastAvailableHour = 22;
    const availableHours = [];

    for (let hour = firstAvailableHour; hour <= lastAvailableHour; hour++) {
      const reservedTablesForHour = reservations
        .filter((reservation) => {
          const reservationHour = parseInt(reservation.hour.split(":")[0]);
          return Math.abs(reservationHour - hour) <= 1;
        })
        .map((reservation) => reservation.tableId);

      const setReservedTablesForHours = [...new Set(reservedTablesForHour)];

      if (setReservedTablesForHours.length < tables.length) {
        availableHours.push(`${hour}:00`);
      }
    }
    res.status(200).json(availableHours);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

async function findAvailableTable(date, hour, maxPeopleNumber) {
  const reservations = await Reservation.find({
    date,
    status: { $ne: "CANCELLED" },
  });
  const tables = await Table.find({ maxPeopleNumber });
  const intHour = parseInt(hour.split(":")[0]);

  const reservedTables = reservations.map((reservation) => ({
    tableId: reservation.tableId.toString(),
    hour: parseInt(reservation.hour.split(":")[0]),
  }));

  const availableTable = tables.find((table) => {
    const isTableAvailable = !reservedTables.some((reservedTable) => {
      const { tableId, hour: reservedHour } = reservedTable;
      if (tableId === table._id.toString()) {
        if (Math.abs(reservedHour - intHour) <= 1) {
          return true;
        }
        return false;
      }
    });
    return isTableAvailable;
  });

  return availableTable;
}

module.exports = {
  create,
  availableHours,
  getAll,
  getUserReservations,
  confirm,
  getReservation,
  cancel,
};
