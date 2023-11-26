const User = require("../models/user");
const jwt = require("jsonwebtoken");
const {
  sendVerificationEmail,
  sendRecoverPasswordEmail,
} = require("../tools/email/sendEmail");
const { createToken } = require("../tools/jwt-token");
const validator = require("email-validator");

const {
  REFRESH_TOKEN_SECRET_KEY,
  ACCESS_TOKEN_SECRET_KEY,
  VERIFICATION_TOKEN_SECRET_KEY,
  RECOVERY_TOKEN_SECRET_KEY,
} = process.env;

const maxAccessTokenAge = 60 * 60;
const maxRefreshTokenAge = 7 * 24 * 60 * 60;
const maxVerificationTokenAge = 24 * 60 * 60;
const maxRecoveryTokenAge = 24 * 60 * 60;

register = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password || !validator.validate(email)) {
    return res.status(400).json({ message: "Invalid data provided." });
  }
  try {
    const userExist = await User.findOne({ email });
    if (userExist) {
      return res.status(409).json({ message: "E-mail already used." });
    }
    const user = await User.create({
      email,
      password,
    });
    const verificationToken = createToken(
      user._id,
      VERIFICATION_TOKEN_SECRET_KEY,
      maxVerificationTokenAge
    );
    sendVerificationEmail(email, verificationToken);
    res.status(201).json({
      message: "Account created. We sent you email with activation link.",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

resendActivationEmail = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: "Invalid data provided." });
  }
  try {
    const user = await User.findOne({ email });
    if (!user || user.isVerified) {
      return res.status(403).json({
        message:
          "We couldn't find user with provided email or this account is already activated.",
      });
    }
    const verificationToken = createToken(
      user._id,
      VERIFICATION_TOKEN_SECRET_KEY,
      maxVerificationTokenAge
    );
    sendVerificationEmail(email, verificationToken);
    res.status(200).json({
      message:
        "We have successfully sent you an email with an activation link.",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Invalid data provided." });
  }
  try {
    const user = await User.login(email, password);
    if (!user) {
      return res.status(401).json({
        message: "Something went wrong, please try enter your data again.",
      });
    }
    if (!user.isVerified) {
      return res
        .status(403)
        .json({ message: "Activate your account before login." });
    }
    const accessToken = createToken(
      user._id,
      ACCESS_TOKEN_SECRET_KEY,
      maxAccessTokenAge
    );
    const refreshToken = createToken(
      user._id,
      REFRESH_TOKEN_SECRET_KEY,
      maxRefreshTokenAge
    );
    await User.findOneAndUpdate({ email }, { refreshToken });
    const userResponse = {
      email: user.email,
      role: user.role,
      id: user._id,
    };
    res
      .cookie("jwt_refresh", refreshToken, {
        httpOnly: true,
        maxAge: maxRefreshTokenAge * 1000,
        path: "/auth",
      })
      .cookie("jwt_access", accessToken, {
        httpOnly: true,
        maxAge: maxAccessTokenAge * 1000,
      });
    res.status(200).json(userResponse);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

autologin = async (req, res) => {
  const refreshToken = req.cookies.jwt_refresh;
  if (!refreshToken) {
    return res.status(200).json(null);
  }
  try {
    const user = await User.findOne({ refreshToken });
    if (!user) {
      return res.status(200).json(null);
    }
    const responseUser = {
      email: user.email,
      role: user.role,
      id: user._id,
    };
    jwt.verify(refreshToken, REFRESH_TOKEN_SECRET_KEY, (err, decodedToken) => {
      if (err) {
        return res.status(200).json(null);
      }
      const accessToken = createToken(
        decodedToken.id,
        ACCESS_TOKEN_SECRET_KEY,
        maxAccessTokenAge
      );
      res.cookie("jwt_access", accessToken, {
        httpOnly: true,
        maxAge: maxAccessTokenAge * 1000,
      });
      res.status(200).json(responseUser);
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

logout = async (req, res) => {
  const refreshToken = req.cookies.jwt_refresh;
  try {
    await User.findOneAndUpdate({ refreshToken }, { refreshToken: "" });
    res
      .clearCookie("jwt_refresh", {
        httpOnly: true,
        path: "/auth",
      })
      .clearCookie("jwt_access", {
        httpOnly: true,
      });
    res.status(200).json({ message: "Successfully logged out." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

refresh = async (req, res) => {
  const refreshToken = req.cookies.jwt_refresh;
  if (!refreshToken) {
    return res.sendStatus(403);
  }
  try {
    const user = await User.findOne({ refreshToken });
    if (!user) {
      return res.sendStatus(403);
    }
    jwt.verify(refreshToken, REFRESH_TOKEN_SECRET_KEY, (err, decodedToken) => {
      if (err) {
        return res.sendStatus(403);
      }
      const accessToken = createToken(
        decodedToken.id,
        ACCESS_TOKEN_SECRET_KEY,
        maxAccessTokenAge
      );
      res.cookie("jwt_access", accessToken, {
        httpOnly: true,
        maxAge: maxAccessTokenAge * 1000,
      });
      res.status(200).json({ message: "Access token refreshed." });
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

activateAccount = async (req, res) => {
  const { token } = req.params;

  try {
    jwt.verify(
      token,
      VERIFICATION_TOKEN_SECRET_KEY,
      async (err, decodedToken) => {
        if (err) {
          return res.status(403).json({
            message:
              "Activation account failed. Probably the link has expired or is invalid.",
          });
        }
        const user = await User.findById(decodedToken.id);
        if (!user || user.isVerified) {
          return res.status(403).json({
            message:
              "Activation account failed. Probably the link has expired or is invalid.",
          });
        }
        await User.findOneAndUpdate(
          { _id: decodedToken.id },
          { isVerified: true }
        );
        res
          .status(200)
          .json({ message: "Account activated. Since now you can log in." });
      }
    );
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

recoverPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ message: "Invalid data provided." });
  }
  try {
    jwt.verify(token, RECOVERY_TOKEN_SECRET_KEY, async (err) => {
      if (err) {
        return res.status(403).json({
          message:
            "Password recover failed. Probably the link has expired or is invalid.",
        });
      }
      const user = await User.findOne({ recoveryToken: token });
      if (!user) {
        return res.status(403).json({
          message:
            "Password recover failed. Probably the link has expired or is invalid.",
        });
      }
      user.password = password;
      user.recoveryToken = "";
      user.refreshToken = "";

      await user.save();
      res.status(200).json({ message: "Password reset was successful." });
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

recoverPasswordEmail = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: "Invalid data provided." });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(403).json({
        message: "Something went wrong, please try enter your data again.",
      });
    }
    const recoveryToken = createToken(
      user._id,
      RECOVERY_TOKEN_SECRET_KEY,
      maxRecoveryTokenAge
    );
    await User.findOneAndUpdate({ _id: user._id }, { recoveryToken });
    sendRecoverPasswordEmail(email, recoveryToken);
    res.status(200).json({
      message:
        "We have successfully sent you an email with an link to reset your password.",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

checkRecoveryToken = async (req, res) => {
  const { token } = req.params;
  try {
    jwt.verify(token, RECOVERY_TOKEN_SECRET_KEY, async (err) => {
      if (err) {
        return res.status(403).json({
          message:
            "Password recover failed. Probably the link has expired or is invalid.",
        });
      }
      const user = await User.findOne({ recoveryToken: token });
      if (!user) {
        return res.status(403).json({
          message:
            "Password recover failed. Probably the link has expired or is invalid.",
        });
      }
      res.status(200).json({ message: "Recovery token is valid." });
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

isAuth = async (req, res) => {
  const refreshToken = req.cookies.jwt_refresh;
  if (!refreshToken) {
    return res.status(200).json(false);
  }
  try {
    const user = await User.findOne({ refreshToken });
    if (!user) {
      return res.status(200).json(false);
    }
    jwt.verify(refreshToken, REFRESH_TOKEN_SECRET_KEY, (err, decodedToken) => {
      if (err) {
        return res.status(200).json(false);
      }
      const accessToken = createToken(
        decodedToken.id,
        ACCESS_TOKEN_SECRET_KEY,
        maxAccessTokenAge
      );
      res.cookie("jwt_access", accessToken, {
        httpOnly: true,
        maxAge: maxAccessTokenAge * 1000,
      });
      res.status(200).json(true);
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  login,
  register,
  logout,
  refresh,
  autologin,
  activateAccount,
  resendActivationEmail,
  recoverPassword,
  recoverPasswordEmail,
  checkRecoveryToken,
  isAuth,
};
