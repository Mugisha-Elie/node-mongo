import { MongoClient, ObjectId } from "mongodb";
import http from 'node:http';

const URI = process.env.URI;
const PORT = process.env.PORT;
const client = new MongoClient(URI);
let db;

function extractIdFromUrl(url) {
  const parts = url.split('/');
  return parts[2] || null;
}

async function run() { 
  try {
    await client.connect();
    db = client.db('student_system');

    const server = http.createServer(async (req, res) => { 
      res.setHeader('Content-Type', 'application/json');
      
      try {
        const studentCollection = db.collection('students');

        if (req.method === 'GET' && req.url === '/students') {
          const students = await studentCollection.find({}).toArray();

          res.writeHead(200);
          res.end(JSON.stringify(students))
          
        } else if (req.method === 'GET' && req.url.startsWith('/students/')) {
          try {
            const id = extractIdFromUrl(req.url);
  
            const student = await studentCollection.findOne({ _id: new ObjectId(id) });
  
            if (!student) {
              res.writeHead(404);
              res.end(JSON.stringify({message: "Student Not Found"}));
            } else {
              res.writeHead(200);
              res.end(JSON.stringify(student));
            }
            
          } catch (err) {
            res.writeHead(400);
            res.end(JSON.stringify({message: err.message}))
          }
          
        } else if (req.method === 'POST' && req.url === '/students') {
          let bodyBuffer = '';

          req.on('data', (chunk) => {
            bodyBuffer += chunk.toString();
          })

          req.on('end', async () => {
            try {
              const parsedData = JSON.parse(bodyBuffer);

              const result = await studentCollection.insertOne(parsedData);

              res.writeHead(201);
              res.end(JSON.stringify({
                success: true,
                insertedId: result.insertedId
              }))
              
            } catch (err) {
              console.error("Error processing payload", err.message);
              res.writeHead(400);
              res.end(JSON.stringify({success: false, message: "Error processing payload"}))
            }
          })
          
        } else if (req.method === 'DELETE' && req.url.startsWith('/students/')) {
          const id = extractIdFromUrl(req.url);

          const result = await studentCollection.deleteOne({ _id: new ObjectId(id) });

          if (result.deletedCount === 0) {
            res.writeHead(404);
            res.end(JSON.stringify({
              success: false,
              deletedCount: result.deletedCount,
              message: 'Not Found'
            }))
          } else {
            res.writeHead(200);
            res.end(JSON.stringify({
              success: true,
              deletedCount: result.deletedCount
            }))
          }
          
        } else if (req.method === 'PATCH' && req.url.startsWith('/students/')) {
         
          let bodyBuffer = '';

          req.on('data', (chunk) => {
            bodyBuffer += chunk.toString();
          })

          req.on('end', async () => {
            try {
              const id = extractIdFromUrl(req.url);
              const parsedData = JSON.parse(bodyBuffer);
    
              const result = await studentCollection.updateOne({ _id: new ObjectId(id) }, {$set: parsedData});
              if (result.matchedCount === 0) {
                res.writeHead(404);
                res.end(JSON.stringify({
                  message: "Not Found"
                }))
                
              } else {
                res.writeHead(201);
                res.end(JSON.stringify({
                  success: true,
                  matchedCount: result.matchedCount,
                  modifiedCount: result.modifiedCount
                }))
              }
            } catch (err) {
              console.error("Error processing payload", err.message);
              res.writeHead(400);
              res.end(JSON.stringify({
                success: false,
                message: "Error processing payload"
              }))
            }
          })
          
        }
        
      } catch (err) {
        console.error("Server encountered an error", err.message);
        res.writeHead(500);
        res.end(JSON.stringify({message: "Internal Server Error"}))
      }
    })

    server.listen(PORT, () => { console.log(`Server listening at http://localhost:${PORT}`) });
    
  } catch (err) {
    console.error("An error occurred", err);
  }
}

run();