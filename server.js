require("dotenv").config();
require("./config/database").connect();
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:4200",
  })
);

app.use(cookieParser());

const dishRouter = require("./routes/dish");
const userRouter = require("./routes/user");
const authRouter = require("./routes/auth");
const reservationRouter = require("./routes/reservation");

app.use("/dish", dishRouter);
app.use("/user", userRouter);
app.use("/auth", authRouter);
app.use("/reservation", reservationRouter);

app.listen(8000, () => console.log("Server Started"));
