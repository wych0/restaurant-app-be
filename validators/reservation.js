const { isBefore } = require("date-fns");

const notPastDate = (date) => {
  const todaysDate = new Date();
  const providedDate = new Date(date);

  todaysDate.setHours(0, 0, 0, 0);

  if (isBefore(providedDate, todaysDate)) {
    return false;
  }
  return true;
};

const notPastHour = (hour) => {
  const currentHour = new Date().getHours();
  const providedHour = parseInt(hour.split(":")[0]);
  if (currentHour + 1 > providedHour) {
    return false;
  }
  return true;
};

const isValidHour = (hour) => {
  const providedHour = parseInt(hour.split(":")[0]);
  if (12 <= providedHour && providedHour <= 21) {
    return true;
  }
  return false;
};

const isCancellableByClient = (date, hour, status) => {
  if (status === "CANCELLED" || status === "COMPLETED") {
    return false;
  }
  const maxDate = new Date();
  maxDate.setHours(maxDate.getHours() + 12);
  const providedHour = parseInt(hour.split(":")[0]);
  const providedDate = new Date(date);
  providedDate.setHours(providedDate.getHours() + providedHour);

  if (providedDate < maxDate) {
    return false;
  }

  return true;
};

const isCancellable = (status) => {
  if (status === "CANCELLED" || status === "COMPLETED") {
    return false;
  }

  return true;
};

const canComplete = (date, hour, status) => {
  if (status != "CONFIRMED") {
    return false;
  }
  const currentDate = new Date();
  const reservationDate = new Date(date);
  const resevationHour = parseInt(hour.split(":")[0]);
  reservationDate.setHours(reservationDate.getHours() + resevationHour);

  if (reservationDate > currentDate) {
    return false;
  }

  return true;
};

module.exports = {
  notPastDate,
  notPastHour,
  isValidHour,
  isCancellable,
  canComplete,
  isCancellableByClient,
};
