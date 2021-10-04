const hasProperties = require("../errors/hasProperties");
const hasOnlyValidProperties = require("../errors/hasOnlyValidProperties");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");
const service = require("./reservations.service");


const REQUIRED_PROPERTIES = [
  "first_name",
  "last_name",
  "mobile_number",
  "reservation_date",
  "reservation_time",
  "people",
]

const VALID_PROPERTIES = [
  ...REQUIRED_PROPERTIES,
  "status",
  "reservation_id", 
  "created_at", 
  "updated_at",
]

// checks that the date is valid for a reservation
function validDate(req, res, next) {
  const { reservation_date } = req.body.data;
  const date = Date.parse(reservation_date);
  
  if (date && date > 0) {
    return next();
  } else {
    return next({
      status: 400,
      message: `reservation_date field formatted incorrectly: ${reservation_date}.`,
    });
  }
}

// checks that the time is valid for a reservation
function validTime(req, res, next) {
  const { reservation_time } = req.body.data;
  const regex = new RegExp("([01]?[0-9]|2[0-3]):[0-5][0-9]");
  
  if (regex.test(reservation_time)) {
    return next();
  } else {
    return next({
      status: 400, 
      message: `reservation_time field formatted incorrectly: ${reservation_time}`,
    });
  }
}

// checks that the party size is valid
function validPartySize(req, res, next) {
  const { people } = req.body.data;
  const numberOfPeople = parseInt(people)
  const partySize = Number.isInteger(numberOfPeople);
  
  if (partySize) {
    return next();
  } else {
    return next({
      status: 400, 
      message: `people field formatted incorrectly: ${people}. Needs to be a number.`,
    });
  }
}

// checks the date and time are current or future
function currentDateAndTime(req, res, next) {
  const { reservation_date, reservation_time } = req.body.data;
  const reservation = new Date(`${reservation_date} PDT`).setHours(reservation_time.substring(0, 2), reservation_time.substring(3));
  const now = Date.now();

  if (reservation > now) {
    return next();
  } else {
    return next({
      status: 400,
      message: "Reservation must be in the future.",
    });
  }
}


// checks that the reservation day is not a Tuesday
function notTuesday(req, res, next) {
  const { reservation_date } = req.body.data;
  const date = new Date(reservation_date);
  const day = date.getUTCDay();

  if (day === 2) {
    return next({
      status: 400,
      message: "The restaurant is closed on Tuesday.",
    });
  } else {
    return next();
  }
}


// checks that the reservation is during operating hours
function validOperatingHours(req, res, next) {
  const { reservation_time } = req.body.data;
  const openingTime = 1030;
  const closingTime = 2130;
  
  const reservation = reservation_time.substring(0, 2) + reservation_time.substring(3);
  
  if (reservation > openingTime && reservation < closingTime) {
    return next();
  } else {
    return next({
      status: 400,
      message: "Reservations are only allowed between 10:30am and 9:30pm",
    });
  }
}

// sets the status to a new reservation as "booked" 
function bookedTable(req, res, next) {
  const { status } = req.body.data;
  
  if (status) {
    if (status === "booked") {
      return next();
    } else {
      return next({
        status: 400, 
        message: `status cannot be set to ${status} when creating a new reservation.`,
      });
    }
  } else {
    return next();
  }
}



// checks for reservations for the selected date OR that match the entered mobile phone number
async function reservationCheck(req, res, next) {
  const { date, mobile_number } = req.query;
  
  if (date) {
    const reservations = await service.list(date);
    if (reservations.length) {
      res.locals.data = reservations;
      return next();
    } else {
      return next({
        status: 404, 
        message: `There are currently no pending reservations for ${date}`,
      });
    }
  } 
  if (mobile_number) {
    const reservation = await service.find(mobile_number);
    res.locals.data = reservation;
    return next();
  }
}

// checks if a reservation_id exists
async function reservationExists(req, res, next) {
  const { reservationId } = req.params;
  const data = await service.read(reservationId);

  if (data) {
    res.locals.reservation = data;
    return next();
  } else {
    return next({
      status: 404,
      message: `reservation_id: ${reservationId} does not exist.`
    });
  }
}

// checks that status is valid
function statusIsValid(req, res, next) {
  const { status } = req.body.data;
  const validValues = ["booked", "cancelled", "seated", "finished"];

  if (validValues.includes(status)) {
    res.locals.status = status;
    return next();
  } else {
    return next({
      status: 400, 
      message: `invalid status: ${status}. Status must be one of these options: ${validValues.join(", ")}`,
    });
  }
}

// checks that status is not set to finished
function statusNotFinished(req, res, next) {
  const { reservation } = res.locals;

  if (reservation.status === "finished") {
    return next({
      status: 400, 
      message: "A finished reservation cannot be updated.",
    });
  } else {
    return next();
  }
}


// list reservations by date
function list(req, res) {
  const { data } = res.locals;
  res.json({ data: data });
}

// create a reservation
async function create(req, res) {
  const reservation = await service.create(req.body.data);
  res.status(201).json({ data: reservation });
}

// read a reservation by reservation_id
function read(req, res) {
  const { reservation } = res.locals;
  res.json({ data: reservation });
}

// update reservation status
async function updateStatus(req, res) {
  const { reservation, status } = res.locals;
  const updatedReservationData = {
    ...reservation,
    status: status,
  }

  const updatedReservation = await service.update(updatedReservationData);
  res.json({ data: updatedReservation });
}

// update reservation information
async function updateReservation(req, res) {
  const { reservation } = res.locals;
  const { data } = req.body;
  const updatedReservationData = {
    ...reservation,
    ...data,
  }
  const updatedReservation = await service.update(updatedReservationData);
  res.json({ data: updatedReservation });
}

module.exports = {
  list: [
    asyncErrorBoundary(reservationCheck), 
    list,
  ],
  create: [
    hasProperties(...REQUIRED_PROPERTIES), 
    hasOnlyValidProperties(...VALID_PROPERTIES), 
    validDate,
    validTime,
    validPartySize,
    notTuesday,
    currentDateAndTime,
    validOperatingHours,
    bookedTable,
    asyncErrorBoundary(create),
  ],
  read: [
    asyncErrorBoundary(reservationExists), 
    read,
  ],
  updateStatus: [
    hasProperties("status"), 
    hasOnlyValidProperties("status"), 
    asyncErrorBoundary(reservationExists), 
    statusIsValid,
    statusNotFinished,
    asyncErrorBoundary(updateStatus),
  ],
  updateReservation: [
    hasProperties(...REQUIRED_PROPERTIES), 
    hasOnlyValidProperties(...VALID_PROPERTIES), 
    asyncErrorBoundary(reservationExists), 
    validDate,
    validTime,
    validPartySize,
    notTuesday,
    currentDateAndTime,
    validOperatingHours,
    asyncErrorBoundary(updateReservation),
  ]
};
