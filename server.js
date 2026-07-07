import { MongoClient } from "mongodb";

const URI = process.env.URI;

const client = new MongoClient(URI);

async function run() { 
  try {
    console.log("Connecting to the databasae");
    await client.connect();

    console.log("Connected to the database");

    const db = client.db('learning_zone');
    console.log(`Connected to database ${db.databaseName}`);

    const studentCollection = db.collection('students')

    const newStudent = {
      name: "January",
      age: 1
    }

    const result = await studentCollection.insertOne(newStudent);
    console.log("Insert results", result)
  } catch (err) {
    console.log("An error occurred", err);
  } finally {
    client.close();
  }
}

run();