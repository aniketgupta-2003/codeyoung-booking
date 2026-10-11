
require("dotenv").config();
const { MongoClient } = require("mongodb");

const mentors = [
  { name: "Aarav Sharma", email: "aarav@example.com", timeZone: "Asia/Kolkata" },
  { name: "Priya Singh", email: "priya@example.com", timeZone: "Asia/Kolkata" },
  { name: "Rohan Das", email: "rohan@example.com", timeZone: "Asia/Kolkata" },
  { name: "Ananya Roy", email: "ananya@example.com", timeZone: "Asia/Kolkata" },
  { name: "Ishita Verma", email: "ishita@example.com", timeZone: "Asia/Kolkata" },
  { name: "Kabir Mehta", email: "kabir@example.com", timeZone: "Asia/Kolkata" },
  { name: "Sneha Patel", email: "sneha@example.com", timeZone: "Asia/Kolkata" },
  { name: "Arjun Nair", email: "arjun@example.com", timeZone: "Asia/Kolkata" },
  { name: "Meera Joshi", email: "meera@example.com", timeZone: "Asia/Kolkata" },
  { name: "Vivaan Gupta", email: "vivaan@example.com", timeZone: "Asia/Kolkata" },
];

async function seedMentors() {
  const client = new MongoClient(process.env.MONGO_URI);

  try {
    await client.connect();

    const db = client.db(process.env.DB_NAME);
    const collection = db.collection("mentors");

    const count = await collection.countDocuments();

    if (count > 0) {
      console.log(
        `Mentors collection already contains ${count} records. No changes made.`
      );
      return;
    }

    const result = await collection.insertMany(
      mentors.map((mentor) => ({
        ...mentor,
        dailyDemoLimit: 2,
        active: true,
        createdAt: new Date(),
      }))
    );

    console.log(`Successfully inserted ${result.insertedCount} mentors.`);
  } catch (error) {
    console.error("Seeding failed:", error.message);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
}

seedMentors();
