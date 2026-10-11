# Codeyoung Trial Class Booking System

A full-stack web application for scheduling trial classes between parents and mentors. Parents can select a preferred date, time, and timezone, while the system checks availability, assigns an eligible mentor, stores the booking in MongoDB, and sends confirmation emails to both parties.

## Features

- **Trial class booking:** Parents can book a 30-minute trial class by providing their name, email, timezone, and preferred time.
- **Automatic mentor assignment:** Selects an eligible mentor based on scheduling constraints.
- **Real-time availability checks:** Retrieves available and unavailable slots from the backend.
- **Daily booking limits:** Enforces a maximum of two confirmed demo classes per mentor per local calendar day by default.
- **Conflict prevention:** Checks for overlapping bookings and validates availability again when a booking is submitted.
- **Timezone-aware scheduling:** Supports different parent and mentor timezones using IANA timezone identifiers.
- **Daylight saving time validation:** Rejects ambiguous and nonexistent local times.
- **Email notifications:** Sends booking details to the parent and assigned mentor.
- **Optimized email delivery:** Reuses the Nodemailer transporter and sends both notification emails concurrently.
- **Booking confirmation:** Displays booking information, assigned mentor, booking ID, and demo-class link.
- **Responsive interface:** Built with React and Tailwind CSS.

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React 19, Vite |
| Styling | Tailwind CSS 4 |
| Icons | Lucide React |
| Backend | Node.js, Express 5 |
| Database | MongoDB |
| Date and timezone handling | Luxon |
| Email delivery | Nodemailer |
| Environment configuration | dotenv |
| Cross-origin requests | CORS |

## Project Structure

```text
codeyoung-booking/
├── client/
│   ├── public/
│   └── src/
│       ├── assets/
│       ├── components/
│       ├── data/
│       │   └── constants.js
│       ├── hooks/
│       │   └── useBooking.js
│       ├── App.jsx
│       ├── App.css
│       ├── index.css
│       └── main.jsx
├── server/
│   ├── services/
│   │   ├── bookingService.js
│   │   └── mailer.js
│   ├── .env.example
│   ├── seed.js
│   ├── server.js
│   ├── check-bookings.js
│   ├── test-booking-server.js
│   └── test-concurrent.js
├── .gitignore
└── README.md
```

## Prerequisites

Install the following before running the project:

- [Node.js](https://nodejs.org/) and npm
- [MongoDB](https://www.mongodb.com/try/download/community)
- Git

The booking service uses MongoDB transactions, so MongoDB must run as a replica set. The example connection string uses a local replica set named `rs0`.

## Installation and Setup

### 1. Clone the repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd codeyoung-booking
```

### 2. Install dependencies

Install the frontend dependencies:

```bash
cd client
npm install
```

Open a second terminal from the project root and install the backend dependencies:

```bash
cd server
npm install
```

### 3. Configure environment variables

Create a `.env` file inside the `server` directory using `.env.example` as a template.

Example configuration:

```env
PORT=5000

MONGO_URI=mongodb://127.0.0.1:27017/codeyoung?replicaSet=rs0
DB_NAME=codeyoung

# Optional SMTP configuration
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=

# Optional sender address
MAIL_FROM=
```

The mailer reads `MAIL_FROM` for the sender address. SMTP credentials can be configured to use an SMTP provider; otherwise, the development fallback uses Ethereal for test emails.

**Security:** Never commit `.env` files, passwords, or SMTP credentials to the repository. Only the example environment file should be committed.

### 4. Start MongoDB

Ensure MongoDB is running and the `rs0` replica set is configured and initialized.

### 5. Seed the mentor data

From the `server` directory, run:

```bash
node seed.js
```

The seed script initializes ten mentors with their email addresses, timezones, active status, and daily demo-class limits. If the mentors collection already contains records, the script skips seeding.

### 6. Start the backend

From the `server` directory, run:

```bash
node server.js
```

The backend runs at `http://localhost:5000` by default.

### 7. Start the frontend

Open another terminal:

```bash
cd client
npm run dev
```

Open the local URL displayed by Vite.

## Application Workflow

1. The parent enters their name, email address, and preferred timezone.
2. The parent selects a date and an available 30-minute slot.
3. The frontend requests availability from the backend.
4. The backend validates the booking request and checks active mentors.
5. The booking service evaluates mentor eligibility, daily limits, and existing bookings.
6. The selected mentor is assigned and the booking is saved in MongoDB.
7. A demo-class URL is generated for the booking.
8. The backend sends confirmation emails to the parent and assigned mentor.
9. After the email operations finish, the backend returns the booking confirmation to the frontend.

Availability displayed by the frontend is advisory. The backend validates the request again during booking to prevent conflicting appointments when multiple users attempt to book simultaneously.

## Timezone and Scheduling Logic

The application uses Luxon and IANA timezone identifiers, including:

- `Europe/London`
- `America/New_York`
- `America/Los_Angeles`
- `America/Chicago`
- `Asia/Kolkata`

The scheduling service:

- Converts the parent's selected local time to UTC.
- Stores booking start and end timestamps in UTC.
- Evaluates the mentor's local calendar date for daily booking limits.
- Validates future dates and 30-minute time boundaries.
- Rejects invalid, ambiguous, or nonexistent local times around daylight saving transitions.
- Checks for overlapping confirmed bookings.
- Prevents a demo class from crossing the mentor's local midnight.

Each trial class lasts 30 minutes.

## API Documentation

The backend exposes the following endpoints.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Confirms the booking API is running |
| GET | `/api/health` | Returns backend health information |
| GET | `/api/mentors` | Retrieves active mentors |
| GET | `/api/availability` | Retrieves availability for a date and timezone |
| POST | `/api/bookings` | Validates and creates a booking |

### Check availability

Example request:

```http
GET /api/availability?date=2026-10-20&timeZone=Europe/London
```

The response includes the date, timezone, demo duration, and candidate 30-minute slots with their availability status.

### Create a booking

Endpoint:

```http
POST /api/bookings
Content-Type: application/json
```

Example request body:

```json
{
  "parentName": "Alex Johnson",
  "parentEmail": "alex@example.com",
  "parentTimeZone": "Europe/London",
  "localStartTime": "2026-10-20T15:00"
}
```

The values are illustrative. A booking succeeds only when the request is valid and an eligible mentor is available.

A successful response contains the booking details, notification status, and—when available—email preview URLs. Invalid requests return validation errors, while unavailable slots return a conflict response.

## Email Notifications and Optimization

The application uses Nodemailer to send two notifications for each successful booking:

- **Parent confirmation:** Includes the scheduled time in the parent's timezone, assigned mentor, and demo-class link.
- **Mentor notification:** Includes parent details, the scheduled time in the mentor's timezone, and the demo-class link.

Two optimizations are implemented in `server/services/mailer.js`:

1. **Transporter caching:** Reuses the Nodemailer transporter across booking requests to avoid unnecessary repeated initialization.
2. **Concurrent email sending:** Uses `Promise.all()` to send the parent and mentor notifications concurrently rather than sequentially.

The current API waits for both email operations to complete before returning the booking response. If email delivery fails, the booking can remain confirmed while its notification status is marked as failed.

### Development email testing

When SMTP environment variables are configured, the application uses the configured SMTP server. Otherwise, it creates an Ethereal test account and returns preview URLs for inspecting the messages.

Ethereal is a test-email service; preview URLs do not represent delivery to real recipients' inboxes.

## Frontend Commands

Run these commands from the `client` directory.

| Command | Description |
|---|---|
| `npm run dev` | Starts the development server |
| `npm run build` | Builds the frontend for production |
| `npm run preview` | Previews the production build locally |
| `npm run lint` | Runs ESLint |

Build the frontend:

```bash
npm run build
```

The frontend API URL is currently configured in `client/src/data/constants.js` as `http://localhost:5000`. Update it for the target environment when deploying the application.

## Testing and Verification

The backend contains scripts for inspecting bookings and testing booking behavior:

- `check-bookings.js`
- `test-booking-server.js`
- `test-concurrent.js`

Review each script before execution to understand its database connection and effects. Use a development database for testing.

Important scenarios to verify include:

- Successful booking and mentor assignment
- Invalid names, email addresses, and timezones
- Unavailable slots and overlapping bookings
- Mentor daily booking limits
- Daylight saving time edge cases
- Concurrent booking attempts
- Successful and failed email notifications

## Limitations and Future Improvements

- The demo-class URL is currently a placeholder and should be replaced with a real meeting integration.
- The frontend currently uses a local backend URL and requires configuration for deployment.
- The development email fallback uses Ethereal rather than real recipient delivery.
- Durable background email processing, retries, and an outbox or job-queue mechanism could improve reliability in production.
- Automated unit and integration test coverage can be expanded.
- Production deployment would require appropriate CORS, logging, authentication, and secret management.

## Author

Developed as a full-stack trial-class booking system assignment for Codeyoung.
