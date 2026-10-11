const { DateTime, IANAZone } = require("luxon");
const { ObjectId } = require("mongodb");

const DEMO_DURATION_MINUTES = 30;

class BookingValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "BookingValidationError";
    this.statusCode = 400;
  }
}

function prepareBookingRequest(input) {
  const {
    parentName,
    parentEmail,
    parentTimeZone,
    localStartTime,
  } = input ?? {};

  if (
    typeof parentName !== "string" ||
    parentName.trim().length < 2 ||
    parentName.trim().length > 100
  ) {
    throw new BookingValidationError("Please enter a valid parent name.");
  }

  if (
    typeof parentEmail !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(parentEmail.trim())
  ) {
    throw new BookingValidationError("Please enter a valid email address.");
  }

  if (
    typeof parentTimeZone !== "string" ||
    !IANAZone.isValidZone(parentTimeZone)
  ) {
    throw new BookingValidationError("Please select a valid time zone.");
  }

  if (
    typeof localStartTime !== "string" ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(localStartTime)
  ) {
    throw new BookingValidationError(
      "Please provide a valid local date and time."
    );
  }

  const parentStart = DateTime.fromFormat(
    localStartTime,
    "yyyy-MM-dd'T'HH:mm",
    { zone: parentTimeZone }
  );

  if (
    !parentStart.isValid ||
    parentStart.toFormat("yyyy-MM-dd'T'HH:mm") !== localStartTime
  ) {
    throw new BookingValidationError(
      "That date or local time is invalid. Please choose another time."
    );
  }

  if (parentStart.getPossibleOffsets().length > 1) {
    throw new BookingValidationError(
      "That time occurs twice because of a daylight-saving change. Please select another time."
    );
  }

  if (parentStart <= DateTime.now()) {
    throw new BookingValidationError(
      "Please choose a future date and time."
    );
  }

  if (parentStart.minute % 30 !== 0) {
    throw new BookingValidationError(
      "Please choose a time on the hour or half-hour."
    );
  }

  const parentEnd = parentStart.plus({
    minutes: DEMO_DURATION_MINUTES,
  });

  return {
    parentName: parentName.trim(),
    parentEmail: parentEmail.trim().toLowerCase(),
    parentTimeZone,
    startTimeUtc: parentStart.toUTC().toJSDate(),
    endTimeUtc: parentEnd.toUTC().toJSDate(),
    durationMinutes: DEMO_DURATION_MINUTES,
  };
}

/**
 * Returns the mentor-local calendar day for a proposed class.
 * Scheduling is allowed throughout the day; classes must start on a
 * 30-minute boundary and must not cross the mentor's local midnight.
 */
function getMentorSlot(mentor, booking) {
  if (!mentor || !IANAZone.isValidZone(mentor.timeZone)) {
    return null;
  }

  const start = DateTime.fromJSDate(booking.startTimeUtc, {
    zone: "utc",
  }).setZone(mentor.timeZone);

  const end = DateTime.fromJSDate(booking.endTimeUtc, {
    zone: "utc",
  }).setZone(mentor.timeZone);

  if (!start.isValid || !end.isValid) {
    return null;
  }

  // A demo must remain within one mentor-local calendar day.
  if (
    start.toISODate() !==
    end.minus({ milliseconds: 1 }).toISODate()
  ) {
    return null;
  }

  if (
    start.minute % 30 !== 0 ||
    start.second !== 0 ||
    start.millisecond !== 0
  ) {
    return null;
  }

  return {
    mentorLocalDate: start.toISODate(),
    mentorStartTime: start.toISO(),
    mentorEndTime: end.toISO(),
  };
}

async function createBooking(db, input) {
  const request = prepareBookingRequest(input);

  const mentors = await db
    .collection("mentors")
    .find({ active: true })
    .toArray();

  mentors.sort((a, b) =>
    a._id.toString().localeCompare(b._id.toString())
  );

  for (const mentor of mentors) {
    if (!IANAZone.isValidZone(mentor.timeZone)) {
      continue;
    }

    const slot = getMentorSlot(mentor, request);
    if (!slot) continue;

    const session = db.client.startSession();

    try {
      let result = null;

      await session.withTransaction(async () => {
        // Write to the mentor document so concurrent attempts for this
        // mentor contend on the same document inside the transaction.
        const lockResult = await db.collection("mentors").updateOne(
          { _id: mentor._id, active: true },
          { $inc: { bookingVersion: 1 } },
          { session }
        );

        if (lockResult.modifiedCount !== 1) {
          result = null;
          return;
        }

        const bookings = db.collection("bookings");

        const dailyCount = await bookings.countDocuments(
          {
            mentorId: mentor._id,
            status: "confirmed",
            mentorLocalDate: slot.mentorLocalDate,
          },
          { session }
        );

        if (dailyCount >= (mentor.dailyDemoLimit ?? 2)) {
          result = null;
          return;
        }

        const conflict = await bookings.findOne(
          {
            mentorId: mentor._id,
            status: "confirmed",
            startTimeUtc: { $lt: request.endTimeUtc },
            endTimeUtc: { $gt: request.startTimeUtc },
          },
          { session }
        );

        if (conflict) {
          result = null;
          return;
        }

        const bookingId = new ObjectId();
        const classLink = `https://example.com/demo/${bookingId}`;

        const booking = {
          _id: bookingId,
          parentName: request.parentName,
          parentEmail: request.parentEmail,
          parentTimeZone: request.parentTimeZone,
          mentorId: mentor._id,
          mentorName: mentor.name,
          mentorTimeZone: mentor.timeZone,
          mentorLocalDate: slot.mentorLocalDate,
          startTimeUtc: request.startTimeUtc,
          endTimeUtc: request.endTimeUtc,
          durationMinutes: request.durationMinutes,
          classLink,
          status: "confirmed",
          notificationStatus: "pending",
          createdAt: new Date(),
        };

        await bookings.insertOne(booking, { session });

        result = {
          id: bookingId.toString(),
          mentorName: mentor.name,
          mentorTimeZone: mentor.timeZone,
          mentorLocalDate: slot.mentorLocalDate,
          startTimeUtc: request.startTimeUtc.toISOString(),
          endTimeUtc: request.endTimeUtc.toISOString(),
          classLink,
          status: "confirmed",
          mentorEmail: mentor.email,
          bookingId: bookingId.toString(),
        };
      });

      if (result) return result;
    } finally {
      await session.endSession();
    }
  }

  return null;
}

/**
 * Returns candidate 30-minute slots in the parent's local time zone.
 * `available` is true if at least one active mentor can take the slot.
 * This is an advisory endpoint: createBooking rechecks capacity on submit.
 */
async function getAvailability(db, date, timeZone) {
  if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new BookingValidationError("Please provide a valid date (YYYY-MM-DD).");
  }

  if (typeof timeZone !== "string" || !IANAZone.isValidZone(timeZone)) {
    throw new BookingValidationError("Please provide a valid IANA time zone.");
  }

  const parsedDate = DateTime.fromFormat(date, "yyyy-MM-dd", { zone: timeZone });
  if (!parsedDate.isValid || parsedDate.toFormat("yyyy-MM-dd") !== date) {
    throw new BookingValidationError("That date is invalid.");
  }

  const mentors = await db.collection("mentors").find({ active: true }).toArray();
  mentors.sort((a, b) => a._id.toString().localeCompare(b._id.toString()));

  const now = DateTime.now();
  const slots = [];

  for (let minuteOfDay = 0; minuteOfDay < 24 * 60; minuteOfDay += 30) {
    const hour = Math.floor(minuteOfDay / 60);
    const minute = minuteOfDay % 60;
    const localTime = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
    const localDateTime = `${date}T${localTime}`;

    const start = DateTime.fromFormat(localDateTime, "yyyy-MM-dd'T'HH:mm", {
      zone: timeZone,
    });

    // Skips nonexistent wall-clock times during a spring-forward transition.
    if (
      !start.isValid ||
      start.toFormat("yyyy-MM-dd'T'HH:mm") !== localDateTime ||
      start <= now ||
      start.getPossibleOffsets().length > 1
    ) {
      continue;
    }

    const booking = {
      startTimeUtc: start.toUTC().toJSDate(),
      endTimeUtc: start.plus({ minutes: DEMO_DURATION_MINUTES }).toUTC().toJSDate(),
    };

    let available = false;

    for (const mentor of mentors) {
      const mentorSlot = getMentorSlot(mentor, booking);
      if (!mentorSlot) continue;

      const bookings = db.collection("bookings");
      const dailyCount = await bookings.countDocuments({
        mentorId: mentor._id,
        status: "confirmed",
        mentorLocalDate: mentorSlot.mentorLocalDate,
      });

      if (dailyCount >= (mentor.dailyDemoLimit ?? 2)) continue;

      const conflict = await bookings.findOne({
        mentorId: mentor._id,
        status: "confirmed",
        startTimeUtc: { $lt: booking.endTimeUtc },
        endTimeUtc: { $gt: booking.startTimeUtc },
      });

      if (!conflict) {
        available = true;
        break;
      }
    }

    slots.push({
      date,
      time: localTime,
      localStartTime: localDateTime,
      available,
    });
  }

  return {
    date,
    timeZone,
    durationMinutes: DEMO_DURATION_MINUTES,
    slots,
  };
}

module.exports = {
  prepareBookingRequest,
  getMentorSlot,
  createBooking,
  getAvailability,
  DEMO_DURATION_MINUTES,
  BookingValidationError,
};
