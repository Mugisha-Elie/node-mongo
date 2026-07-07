import { MongoClient } from "mongodb";

const URI = process.env.URI;
const client = new MongoClient(URI);
const HEX_ID = '6a4ca17e6e019f4ba87143d4';

async function run() { 
  try {
    await client.connect();
    const db = client.db('learning_zone');
    const studentCollection = db.collection('students');

    console.log("Connected to database");
    console.log('Retrieving data from student with ID', HEX_ID);

    const results = await studentCollection.findOne({ _id: HEX_ID });
    console.log('Results', results);
  } catch (err) {
    console.err("An error occured", err);
  } finally {
    await client.close()
  }
}

run()