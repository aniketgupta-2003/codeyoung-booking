
const nodemailer = require("nodemailer");
const { DateTime } = require("luxon");

async function createTransporter() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  if (SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS) {
    return nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: Number(SMTP_PORT) === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });
  }

  // Safe development fallback: messages are captured in a test inbox.
  const testAccount = await nodemailer.createTestAccount();

  return nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
}

// Cache the transporter so it is reused across bookings.
let transporterPromise;

async function getTransporter() {
  if (!transporterPromise) {
    transporterPromise = createTransporter().catch((error) => {
      // Allow a later attempt if transporter creation fails.
      transporterPromise = null;
      throw error;
    });
  }

  return transporterPromise;
}

function formatLocalTime(utcDate, timeZone) {
  return DateTime.fromJSDate(utcDate, { zone: "utc" })
    .setZone(timeZone)
    .toFormat("cccc, dd LLL yyyy 'at' hh:mm a ZZZZ");
}

async function sendBookingEmails(booking, mentorEmail) {
  const transporter = await getTransporter();

  const parentTime = formatLocalTime(
    booking.startTimeUtc,
    booking.parentTimeZone
  );

  const mentorTime = formatLocalTime(
    booking.startTimeUtc,
    booking.mentorTimeZone
  );

  const [parentEmail, mentorResult] = await Promise.all([
    transporter.sendMail({
      from:
        process.env.MAIL_FROM ||
        '"Codeyoung Demo Booking" <no-reply@example.com>',
      to: booking.parentEmail,
      subject: "Your Codeyoung trial class is confirmed",
      text: [
        `Hi ${booking.parentName},`,
        "",
        "Your trial class has been booked successfully.",
        `Time: ${parentTime}`,
        `Time zone: ${booking.parentTimeZone}`,
        `Mentor: ${booking.mentorName}`,
        `Class link: ${booking.classLink}`,
        "",
        "We look forward to seeing you!",
      ].join("\n"),
    }),

    transporter.sendMail({
      from:
        process.env.MAIL_FROM ||
        '"Codeyoung Demo Booking" <no-reply@example.com>',
      to: mentorEmail,
      subject: "New Codeyoung trial class assigned",
      text: [
        `Hi ${booking.mentorName},`,
        "",
        "A new trial class has been assigned to you.",
        `Parent: ${booking.parentName}`,
        `Parent email: ${booking.parentEmail}`,
        `Time: ${mentorTime}`,
        `Time zone: ${booking.mentorTimeZone}`,
        `Class link: ${booking.classLink}`,
      ].join("\n"),
    }),
  ]);

  return {
    parentPreviewUrl: nodemailer.getTestMessageUrl(parentEmail),
    mentorPreviewUrl: nodemailer.getTestMessageUrl(mentorResult),
  };
}

module.exports = {
  sendBookingEmails,
};
