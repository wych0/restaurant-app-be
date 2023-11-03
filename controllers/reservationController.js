const Reservation = require("../models/Reservation");
const Table = require("../models/Table");
const { isSameDay } = require("date-fns");
const {
  notPastDate,
  notPastHour,
  isValidHour,
} = require("../validators/reservation");

create = async (req, res) => {
  const { date, hour, peopleNumber } = req.body;
  if (!date || !hour || !peopleNumber) {
    return res.status(400).json({ message: "Invalid data provided." });
  }
  try {
    if (!isValidHour(hour)) {
      return res
        .status(422)
        .json({ message: "Invalid hour provided. (12-22)" });
    }
    const maxPeopleNumber =
      peopleNumber % 2 === 0 ? peopleNumber : peopleNumber + 1;
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
      tableId: availableTable._id,
    });
    res.status(201).json({ reservation: reservation._id });
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
    const reservations = await Reservation.find({ date });
    const firstAvailableHour =
      isSameDay(todaysDate, providedDate) && currentHour >= 12
        ? currentHour + 1
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
  const reservations = await Reservation.find({ date });
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

module.exports = { create, availableHours };
