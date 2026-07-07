import { MongoClient } from "mongodb";

const URI = process.env.URI;
const client = new MongoClient(URI);

async function run() {
  try {
    await client.connect();
    console.log("Client Connected.");

    const db = client.db('learning_zone');
    const studentCollection = db.collection('students');

    await studentCollection.insertMany([
      { name: "Alice", level: "Beginner", coreLang: "JavaScript" },
      { name: "Bob", level: "Intermediate", coreLang: "Java" },
      { name: "Charlie", level: "Mastering Fundamentals", coreLang: "C" }
    ]);
    console.log("Data Added!");

    const cursor = studentCollection.find({name: 'Alice'});
    console.log("Raw cursor object", cursor.constructor.name);

    await cursor.forEach((student) => {
      console.log("Name", student.name);
    })
  } catch (err) {
    console.error("An error occurred", err);
  } finally {
    await client.close();
  }
}

run();