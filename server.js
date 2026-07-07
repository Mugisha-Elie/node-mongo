import { MongoClient } from "mongodb";

const URI = process.env.URI;
const client = new MongoClient(URI);

async function run() { 
  try {
    await client.connect();
    const db = client.db('learning_zone');
    const studentCollection = db.collection('students')

    console.log("Connected successfully");

    const query = {
      coreLang: {
        $ne: 'Java',
        $exists: true
      }
    }

    const cursor = studentCollection.find(query);

    await cursor.forEach(student => {
      console.log(student);
    })
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

run();