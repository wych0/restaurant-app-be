const nodemailer = require("nodemailer");
const handlebars = require("handlebars");
const fs = require("fs");
const path = require("path");
const { format } = require("date-fns");

const { EMAIL_NAME, EMAIL_PASS } = process.env;

const config = {
  service: "gmail",
  auth: {
    user: EMAIL_NAME,
    pass: EMAIL_PASS,
  },
};

const transporter = nodemailer.createTransport(config);

const from = `"Navbar" <${EMAIL_NAME}>`;
const link = "http://localhost:4200";

const sendVerificationEmail = async (email, token) => {
  const source = fs.readFileSync(
    path.join(__dirname, "./templates/verificationEmail.handlebars"),
    "utf8"
  );
  const compiledTemplate = handlebars.compile(source);
  const fullLink = `${link}/auth/activate/${token}`;
  await transporter.sendMail({
    from,
    to: email,
    subject: "Confirm registration",
    text: `Hello, You just created an account on the Navbar website. You will need to active your account by pasting this link into your browser. ${fullLink}`,
    html: compiledTemplate({ fullLink }),
  });
};

const sendRecoverPasswordEmail = async (email, token) => {
  const source = fs.readFileSync(
    path.join(__dirname, "./templates/recoveryPassword.handlebars"),
    "utf8"
  );
  const compiledTemplate = handlebars.compile(source);
  const fullLink = `${link}/auth/recover/${token}`;
  await transporter.sendMail({
    from,
    to: email,
    subject: "Password reset",
    text: `Hello, You just requested a password reset. You can do it by pasting this link into your browser. ${fullLink}`,
    html: compiledTemplate({ fullLink }),
  });
};

const sendConfirmationReservationEmail = async (
  email,
  token,
  reservation,
  personalData,
  tableNumber
) => {
  const source = fs.readFileSync(
    path.join(__dirname, "./templates/confirmationReservation.handlebars"),
    "utf8"
  );
  const compiledTemplate = handlebars.compile(source);
  const fullLink = `${link}/confirm-reservation/${token}`;
  const date = format(new Date(reservation.date), "EEEE, MMMM dd yyyy");
  const hour = reservation.hour;
  const id = reservation._id;
  const peopleNumber = reservation.peopleNumber;
  const fullName = formatName(personalData.firstName, personalData.secondName);
  const contact = `${email}, ${personalData.phone}`;
  await transporter.sendMail({
    from,
    to: email,
    subject: "Confirm reservation",
    text: `Hello, You just made reservation at Navbar restaurant, confirm your reservation by pasting this link into your browser. ${fullLink}`,
    html: compiledTemplate({
      fullLink,
      hour,
      date,
      tableNumber,
      id,
      peopleNumber,
      fullName,
      contact,
    }),
  });
};

const sendCancellationReservationEmail = async (email, id, reason) => {
  const source = fs.readFileSync(
    path.join(__dirname, "./templates/cancellationReseravtion.handlebars"),
    "utf8"
  );
  const compiledTemplate = handlebars.compile(source);
  await transporter.sendMail({
    from,
    to: email,
    subject: "Reservation cancelled",
    text: `Hello, Your reservation in Navbar restaurant has just been canceled. Reservation: ${id}, Reason: ${reason}`,
    html: compiledTemplate({ id, reason }),
  });
};

function formatName(firstName, secondName) {
  const formattedFirstName =
    firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
  const formattedSecondName =
    secondName.charAt(0).toUpperCase() + secondName.slice(1).toLowerCase();

  return formattedFirstName + " " + formattedSecondName;
}

module.exports = {
  sendVerificationEmail,
  sendRecoverPasswordEmail,
  sendConfirmationReservationEmail,
  sendCancellationReservationEmail,
};
