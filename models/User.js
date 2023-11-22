const { Schema, model, ObjectId } = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["CLIENT", "WORKER"],
    default: "CLIENT",
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  personalDataId: {
    type: ObjectId,
    ref: "PersonalData",
  },
  refreshToken: {
    type: String,
  },
  recoveryToken: {
    type: String,
  },
});

userSchema.pre("save", async function (next) {
  const salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.statics.login = async function (email, password) {
  const user = await this.findOne({ email });
  if (user) {
    const auth = await bcrypt.compare(password, user.password);
    if (auth) {
      return user;
    }
    return null;
  }
  return null;
};

module.exports = model("User", userSchema);
