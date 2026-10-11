const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { MongoClient, ObjectId } = require("mongodb");
const {
  createBooking,
  getAvailability,
  BookingValidationError,
} = require("./services/bookingService");
const { sendBookingEmails } = require("./services/mailer");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

async function startServer() {
  const client = new MongoClient(process.env.MONGO_URI);

  try {
    await client.connect();

    const db = client.db(process.env.DB_NAME);
    app.locals.db = db;

    app.get("/api/mentors", async (req, res) => {
      try {
        const mentors = await db
          .collection("mentors")
          .find(
            { active: true },
            {
              projection: {
                name: 1,
                timeZone: 1,
                dailyDemoLimit: 1,
              },
            }
          )
          .toArray();

        res.json({
          success: true,
          count: mentors.length,
          mentors,
        });
      } catch (error) {
        console.error("Failed to fetch mentors:", error);
        res.status(500).json({
          success: false,
          message: "Unable to fetch mentors right now.",
        });
      }
    });

    app.get("/api/availability", async (req, res) => {
      try {
        const { date, timeZone } = req.query;
        const availability = await getAvailability(db, date, timeZone);

        res.json({
          success: true,
          ...availability,
        });
      } catch (error) {
        if (error instanceof BookingValidationError) {
          return res.status(400).json({
            success: false,
            message: error.message,
          });
        }

        console.error("Failed to fetch availability:", error);
        res.status(500).json({
          success: false,
          message: "Unable to check availability right now.",
        });
      }
    });

    app.get("/", (req, res) => {
      res.json({
        success: true,
        message: "Codeyoung Booking API is running!",
      });
    });

    app.get("/api/health", (req, res) => {
      res.json({
        success: true,
        database: "connected",
      });
    });

    const PORT = process.env.PORT || 5000;

    app.post("/api/bookings", async (req, res) => {
      try {
        const booking = await createBooking(db, req.body);

        if (!booking) {
          return res.status(409).json({
            success: false,
            message:
              "Sorry, no mentor is available for that time. Please choose another time.",
          });
        }

        // This retains the existing notification flow and response structure.
        let notificationStatus = "sent";
        let emailPreviews = null;

        try {
          const savedBooking = await db.collection("bookings").findOne({
            _id: new ObjectId(booking.id),
          });

          if (!savedBooking) {
            throw new Error("Saved booking could not be found.");
          }

          emailPreviews = await sendBookingEmails(
            {
              ...savedBooking,
              mentorName: booking.mentorName,
              mentorTimeZone: booking.mentorTimeZone,
              classLink: booking.classLink,
            },
            booking.mentorEmail
          );

          await db.collection("bookings").updateOne(
            { _id: savedBooking._id },
            {
              $set: {
                notificationStatus: "sent",
                notificationUpdatedAt: new Date(),
              },
            }
          );
        } catch (emailError) {
          notificationStatus = "failed";
          console.error(
            "Booking confirmed, but email notification failed:",
            emailError
          );

          await db.collection("bookings").updateOne(
            { _id: new ObjectId(booking.id) },
            {
              $set: {
                notificationStatus: "failed",
                notificationUpdatedAt: new Date(),
              },
            }
          );
        }

        const { mentorEmail, ...publicBooking } = booking;
        return res.status(201).json({
          success: true,
          message: "Your demo class has been booked successfully!",
          booking: {
            ...publicBooking,
            notificationStatus,
            ...(emailPreviews ? { emailPreviews } : {}),
          },
        });
      } catch (error) {
        console.error("Booking request failed:", error);

        if (error instanceof BookingValidationError) {
          return res.status(400).json({
            success: false,
            message: error.message,
          });
        }

        return res.status(500).json({
          success: false,
          message: "Something went wrong while booking your demo class.",
        });
      }
    });

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    await client.close().catch(() => {});
    process.exit(1);
  }
}

startServer();
