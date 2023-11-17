const { Schema, model, ObjectId } = require("mongoose");
const personalDataSchema = require("./personalData");

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
  personalData: {
    type: personalDataSchema,
    required: true,
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
  createdAt: {
    type: Date,
    default: Date.now,
    index: {
      expireAfterSeconds: 900,
      partialFilterExpression: { status: "PENDING" },
    },
  },
});

reservationSchema.pre("save", async function (next) {
  const noSpacesPhoneNumber = this.personalData.phone.replace(/\D/g, "");
  const formattedPhoneNumber = noSpacesPhoneNumber.replace(
    /(\d{3})(\d{3})(\d{3})/,
    "$1 $2 $3"
  );
  const formattedEmail = this.personalData.email.toLowerCase();
  this.personalData.email = formattedEmail;
  this.personalData.phone = formattedPhoneNumber;

  next();
});

module.exports = model("Reservation", reservationSchema);
