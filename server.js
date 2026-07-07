import http from 'node:http';
import { MongoClient } from 'mongodb';

const URI = process.env.URI;
const PORT = process.env.PORT;
const client = new MongoClient(URI);
let db;

async function run() {
  try {
    await client.connect();
    db = client.db('student_system');

    const server = http.createServer(async (req, res) => {
      const studentCollection = db.collection('students');
      res.setHeader('Content-Type', 'application/json');
      
      try {
        if (req.method === 'GET' && req.url === '/students') {
          const students = await studentCollection.find({}).toArray();

          res.writeHead(200);
          res.end(JSON.stringify(students));
        } else if(req.method === 'POST' && req.url === '/students'){
          try {
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
                console.log("An error occurred writing to the Database", err);
                res.writeHead(400);
                res.end(JSON.stringify({
                  success: false,
                  message: "Error processing payload"
                }))
              }
            })

            
          } catch (error) {
            console.log("An error occured while streaming data");
            res.writeHead(400);
            res.end(JSON.stringify({message: "Error processing request"}))
          }
        }
        
      } catch (error) {
        console.error("Server encountered an error", error);
        res.writeHead(500)
        res.end(JSON.stringify({message: "Internal Server Error"}))
      }
    });

    server.listen(PORT, () => { console.log(`Server listening at http://localhost:${PORT}`) })
    
  } catch (error) {
    console.error("An error occurred", error);
    process.exit(1);
  }
}

run()