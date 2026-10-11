
require("dotenv").config();

const { MongoClient } = require("mongodb");

async function runTest() {
  const client = new MongoClient(process.env.MONGO_URI);

  try {
    await client.connect();

    const db = client.db("codeyoung");

    const requests = [
      {
        parentName: "Concurrent Parent One",
        parentEmail: "concurrent1@example.com",
        parentTimeZone: "Asia/Kolkata",
        localStartTime: "2026-10-14T13:00",
      },
      {
        parentName: "Concurrent Parent Two",
        parentEmail: "concurrent2@example.com",
        parentTimeZone: "Asia/Kolkata",
        localStartTime: "2026-10-14T13:00",
      },
    ];

    const results = await Promise.all(
      requests.map(async (request) => {
        const response = await fetch(
          "http://localhost:5000/api/bookings",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(request),
          }
        );

        return {
          parent: request.parentName,
          statusCode: response.status,
          body: await response.json(),
        };
      })
    );

    console.log(JSON.stringify(results, null, 2));
  } catch (error) {
    console.error("Test failed:", error.message);
  } finally {
    await client.close();
  }
}

runTest();
