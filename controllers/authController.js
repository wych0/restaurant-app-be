const User = require("../models/user");
const jwt = require("jsonwebtoken");

const { REFRESH_TOKEN_SECRET_KEY, ACCESS_TOKEN_SECRET_KEY } = process.env;

const maxAccessTokenAge = 2 * 60;
const maxRefreshTokenAge = 7 * 24 * 60 * 60;

const createAccessToken = (userId) => {
  return jwt.sign({ userId }, ACCESS_TOKEN_SECRET_KEY, {
    expiresIn: maxAccessTokenAge,
  });
};

const createRefreshToken = (userId) => {
  return jwt.sign({ userId }, REFRESH_TOKEN_SECRET_KEY, {
    expiresIn: maxRefreshTokenAge,
  });
};

register = async (req, res) => {
  const { email, password } = req.body;
  try {
    const userExist = await User.findOne({ email });
    if (userExist) {
      return res.status(409).json({ message: "E-mail already used" });
    }
    const user = await User.create({
      email,
      password,
    });
    const accessToken = createAccessToken(user._id);
    const refreshToken = createRefreshToken(user._id);
    res.header("Authorization", accessToken).cookie("jwt", refreshToken, {
      httpOnly: true,
      maxAge: maxRefreshTokenAge * 1000,
      path: "/auth",
    });
    res.status(201).json({ user: user._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.login(email, password);
    const accessToken = createAccessToken(user._id);
    const refreshToken = createRefreshToken(user._id);
    res.header("Authorization", accessToken).cookie("jwt", refreshToken, {
      httpOnly: true,
      maxAge: maxRefreshTokenAge * 1000,
      path: "/auth",
    });
    res.status(200).json({ user: user._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

logout = async (req, res) => {
  res.clearCookie("jwt", {
    httpOnly: true,
    path: "/auth",
  });
  res.sendStatus(200);
};

refresh = async (req, res) => {
  const refreshToken = req.cookies.jwt;
  jwt.verify(refreshToken, REFRESH_TOKEN_SECRET_KEY, (err, decodedToken) => {
    if (err) {
      return res.sendStatus(403);
    }
    const accessToken = createAccessToken(decodedToken.userId);
    res.header("Authorization", accessToken);
    res.sendStatus(200);
  });
};

module.exports = { login, register, logout, refresh };
