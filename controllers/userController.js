const User = require("../models/user");
const bcrypt = require("bcryptjs");

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

module.exports = { changePassword };
