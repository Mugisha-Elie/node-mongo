import { MongoClient } from "mongodb";

const URI = process.env.URI;

const client = new MongoClient(URI);

async function run() { 
  try {
    console.log("Connecting to the Database...");

    await client.connect();
    console.log("Connected to the Database");

    const db = client.db('learning_zone');
    console.log(`Switched to database ${db.databaseName}`);
  } catch (err) {
    console.error("Connection Failed:", err.message);
  } finally {
    await client.close();
    console.log("Connection Closed");
  }
}

run();