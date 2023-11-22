const jwt = require("jsonwebtoken");
const User = require("../models/user");

const { ACCESS_TOKEN_SECRET_KEY } = process.env;

const verifyToken = (req, res, next) => {
  const accessToken = req.cookies.jwt_access;

  if (!accessToken) {
    return res.sendStatus(401);
  }

  jwt.verify(accessToken, ACCESS_TOKEN_SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.sendStatus(403);
    }
    req.user = decoded.id;
    next();
  });
};

const verifyRole = (roles) => async (req, res, next) => {
  const userId = req.user;
  const user = await User.findById(userId);
  if (!roles.includes(user.role)) {
    return res.sendStatus(403);
  }
  next();
};

module.exports = { verifyToken, verifyRole };
