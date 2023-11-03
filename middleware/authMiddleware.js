const jwt = require("jsonwebtoken");

const { ACCESS_TOKEN_SECRET_KEY } = process.env;

const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.sendStatus(401);
  }

  const accessToken = authHeader.split(" ")[1];

  jwt.verify(accessToken, ACCESS_TOKEN_SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.sendStatus(403);
    }
    req.user = decoded.userId;
    next();
  });
};

module.exports = { verifyToken };
