import { MongoClient, ObjectId } from "mongodb";
import { createServer } from 'node:http';

const URI = process.env.URI;
const PORT = process.env.PORT;
const client = new MongoClient(URI);
let db;

function extractIdFromURL(url) {
  const parts = url.split('/');
  const id = parts[2];
  return id || null;
}

async function run() {
  try {
    await client.connect();
    db = client.db('student_system');

    const server = createServer(async (req, res) => { 
      res.setHeader('Content-Type', 'application/json');
      const studentCollection = db.collection('students');
      
      try {
        if (req.method === 'GET' && req.url === '/students') {
          const students = await studentCollection.find({}).toArray();

          res.writeHead(200);
          res.end(JSON.stringify(students));
          
        } else if (req.method === 'GET' && req.url.startsWith('/students/')) {
          try {
            const searchId = extractIdFromURL(req.url);
  
            const student = await studentCollection.findOne({ _id: new ObjectId(searchId) });
  
            res.writeHead(200);
            res.end(JSON.stringify(student));
            
          } catch (err) {
            res.writeHead(400);
            res.end(JSON.stringify({message: "Error processing ID"}))
          }
          
        } else if (req.method === 'POST' && req.url === '/students') {
          let bodyBuffer = ''

          req.on('data', (chunk) => {
            bodyBuffer += chunk.toString();
          })

          req.on('end', async () => {
            try {
              const parsedObject = JSON.parse(bodyBuffer);

              const result = await studentCollection.insertOne(parsedObject);

              res.writeHead(201);
              res.end(JSON.stringify({
                success: true,
                insertedId: result.insertedId
              }))
              
            } catch (err) {
              console.error("An error occurred streaming data", err);
              res.writeHead(400);
              res.end(JSON.stringify({
                success: false,
                message: "Error processing payload"
              }))
            }
          })
        }
        
      } catch (error) {
        console.error("Server error", error);
        res.writeHead(500);
        res.end(JSON.stringify({message: "Internal Server Error"}))
      }
    })

    server.listen(PORT, () => { console.log(`Server listening at http://localhost:${PORT}`) })
    
  } catch (error) {
    console.error("An error occurred on the server", error);
  }
}

run();