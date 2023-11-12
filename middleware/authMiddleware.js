const jwt = require("jsonwebtoken");

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

module.exports = { verifyToken };
