import { MongoClient } from "mongodb";

const URI = process.env.URI;
const client = new MongoClient(URI);

async function run() { 
  try {
    await client.connect();
    const db = client.db('learning_zone');
    const studentCollection = db.collection('students');

    console.log("Connected to the Database");

    const query = { coreLang: { $ne: 'Java' } };

    const cursor = studentCollection.find(query);
    console.log("Displaying students who don't have Java as they coreLang");

    await cursor.forEach(student => {
      console.log(student);
    })

  } catch (err) {
    console.error("An error occurred", err);
  } finally {
    await client.close()
  }
}

run();