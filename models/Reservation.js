const { Schema, model, ObjectId } = require("mongoose");

const reservationSchema = new Schema({
  date: {
    type: Date,
    required: true,
  },
  hour: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"],
    default: "PENDING",
  },
  peopleNumber: {
    type: Number,
    required: true,
  },
  tableId: {
    type: ObjectId,
    ref: "Table",
  },
});

module.exports = model("Reservation", reservationSchema);
