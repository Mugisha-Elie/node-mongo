import { MongoClient, ObjectId } from "mongodb";

const URI = process.env.URI;
const client = new MongoClient(URI);
const HEX_ID = '6a4ca17e6e019f4ba87143d4';

async function run() { 
  try {
    await client.connect();
    const db = client.db('learning_zone');
    const studentCollection = db.collection('students');

    console.log("Connected to the database", db.databaseName);
    console.log("Using Collection", studentCollection.collectionName);

    console.log("Finding student with ID:", HEX_ID);
    const result = await studentCollection.findOne({ _id: new ObjectId(HEX_ID) });
    console.log("Results:", result);
    
  } catch (err) {
    console.error("An error occurred", err);
  } finally {
    await client.close();
  }
}

run();