const { Schema, model, ObjectId } = require("mongoose");

const additionalOptionsSchema = new Schema({
  wheelchair: {
    type: Boolean,
  },
  baby: {
    type: Boolean,
  },
  cake: {
    type: Boolean,
  },
});

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
    required: true,
  },
  personalDataId: {
    type: ObjectId,
    ref: "PersonalData",
  },
  additionalOptions: {
    type: additionalOptionsSchema,
  },
  requests: {
    type: String,
  },
  confirmationToken: {
    type: String,
  },
  userId: {
    type: ObjectId,
    ref: "User",
  },
  cancellationReason: {
    type: String,
  },
  cancelledBy: {
    type: String,
  },
  completedBy: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: {
      expireAfterSeconds: 900,
      partialFilterExpression: { status: "PENDING" },
    },
  },
});

module.exports = model("Reservation", reservationSchema);
