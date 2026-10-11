
require("dotenv").config();

const { MongoClient } = require("mongodb");

async function checkDailyCounts() {
  const client = new MongoClient(process.env.MONGO_URI);

  try {
    await client.connect();

    const db = client.db("codeyoung");

    const results = await db.collection("bookings").aggregate([
      {
        $match: {
          status: "confirmed",
          mentorLocalDate: "2026-10-14",
        },
      },
      {
        $group: {
          _id: "$mentorName",
          count: { $sum: 1 },
          times: { $push: "$startTimeUtc" },
        },
      },
      { $sort: { _id: 1 } },
    ]).toArray();

    console.log(JSON.stringify(results, null, 2));
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await client.close();
  }
}

checkDailyCounts();
