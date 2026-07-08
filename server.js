import { MongoClient } from "mongodb";
import http from 'node:http';

const URI = process.env.URI;
const PORT = process.env.PORT;
const client = new MongoClient(URI);
let db;

async function run() { 
  try {
    await client.connect();
    db = client.db('student_system');

    const server = http.createServer(async (req, res) => { 
      const studentsCollection = db.collection('students');
      res.setHeader('Content-Type', 'application/json');
      
      try {
        if (req.method === 'GET' && req.url === '/students') {
          const students = await studentsCollection.find({}).toArray();

          res.writeHead(200);
          res.end(JSON.stringify(students))
          
        } else if (req.method === 'POST' && req.url === '/students') {
          let bodyBuffer = '';

          req.on('data', (chunk) => {
            bodyBuffer += chunk.toString();
          })

          req.on('end', async () => {
            try {
              const payload = JSON.parse(bodyBuffer);

              const result = await studentsCollection.insertOne(payload);

              res.writeHead(201);
              res.end(JSON.stringify({
                success: true,
                insertedId: result.insertedId
              }))
            } catch (err) {
              console.error("An error occurred", err);
              res.writeHead(400);
              res.end(JSON.stringify({
                success: false,
                message: "Error processing payload"
              }))
            }
          })
        }
        
      } catch (err) {
        console.error("Server encountered an error", err);
        res.writeHead(500);
        res.end(JSON.stringify({ message: "Internal Server Error" }));
      }
    })

    server.listen(PORT, () => {
      console.log(`Server listening at http://localhost:${PORT}`);
    })
    
  } catch (err) {
    console.error("An error occurred", err);
    process.exit(1);
  }
}

run();