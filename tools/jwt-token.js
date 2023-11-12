const jwt = require("jsonwebtoken");

const createToken = (id, secretKey, maxAge) => {
  return jwt.sign({ id }, secretKey, {
    expiresIn: maxAge,
  });
};

module.exports = { createToken };
