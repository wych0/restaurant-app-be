const { Schema, model } = require("mongoose");

const personalDataSchema = new Schema({
  firstName: {
    type: String,
    required: true,
  },
  secondName: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
});

personalDataSchema.pre("save", async function (next) {
  const noSpacesPhoneNumber = this.phone.replace(/\D/g, "");
  const formattedPhoneNumber = noSpacesPhoneNumber.replace(
    /(\d{3})(\d{3})(\d{3})/,
    "$1 $2 $3"
  );

  this.firstName = this.firstName.toLowerCase();
  this.secondName = this.secondName.toLowerCase();
  this.email = this.email.toLowerCase();
  this.phone = formattedPhoneNumber;

  next();
});

module.exports = model("personalData", personalDataSchema);
