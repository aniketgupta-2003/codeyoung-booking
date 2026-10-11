
const { prepareBookingRequest } = require("./services/bookingService");

const request = {
  parentName: "Alex Smith",
  parentEmail: "Alex@example.com",
  parentTimeZone: "America/New_York",
  localStartTime: "2026-10-12T10:00",
};

try {
  const booking = prepareBookingRequest(request);

  console.log("Booking request validated!");
  console.log("Parent:", booking.parentName);
  console.log("Parent time zone:", booking.parentTimeZone);
  console.log("Start (UTC):", booking.startTimeUtc.toISOString());
  console.log("End (UTC):", booking.endTimeUtc.toISOString());
  console.log("Duration:", booking.durationMinutes, "minutes");
} catch (error) {
  console.error("Validation failed:", error.message);
}
