import { MongoClient } from "mongodb";

const URI = process.env.URI;
const client = new MongoClient(URI);

async function run() { 
  try {
    await client.connect();
    const db = client.db('learning_zone');
    const studentCollection = db.collection('students')

    console.log("Connected Successfully");

    const results = await studentCollection.deleteMany({});

    console.log("Deletion Results", results);
  } catch (err) {
    console.log("An error occurred", err)
  } finally {
    await client.close();
  }
}

run();