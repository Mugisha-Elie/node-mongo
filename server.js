import { MongoClient, ObjectId } from "mongodb";
import http from 'node:http'

const URI = process.env.URI;
const PORT = process.env.PORT;
const client = new MongoClient(URI);
let db;

function extractIdFromUrl(url) {
  const parts = url.split('/');
  return parts[2] || null;
}

async function run(){
  try{
    await client.connect();
    db = client.db('student_system');

    const server = http.createServer(async (req, res) => {
      res.setHeader('Content-Type', 'application/json');
      try{
        const studentCollection = db.collection('students');

        if(req.method === 'GET' && req.url === '/students'){
          const students = await studentCollection.find({}).toArray();

          res.writeHead(200);
          res.end(JSON.stringify(students));
          
        }else if(req.method === 'GET' && req.url.startsWith('/students/')){
          const id = extractIdFromUrl(req.url);

          const student = await studentCollection.findOne({_id: new ObjectId(id)});

          if(!student){
            res.writeHead(404);
            res.end(JSON.stringify({message: "404 Not Found"}))
          }else{
            res.writeHead(200);
            res.end(JSON.stringify(student))
          }
          
        }else if(req.method === 'POST' && req.url === '/students'){
          let bodyBuffer = '';

          req.on('data', (chunk) => {
            bodyBuffer += chunk.toString();
          })

          req.on('end', async () => {
           try{
             const parsedData = JSON.parse(bodyBuffer);
             
             const result = await studentCollection.insertOne(parsedData);

             res.writeHead(201);
             res.end(JSON.stringify({
               success: true,
               insertedId: result.insertedId
             }))
             
           }catch(err){
             console.error("An error occurred", err);
             res.writeHead(400);
             res.end(JSON.stringify({
               success: false,
               message: "Error processing payload"
             }))
           }
          })
          
        }else if(req.method === 'DELETE' && req.url.startsWith('/students/')){
          const id = extractIdFromUrl(req.url);

          const result = await studentCollection.deleteOne({_id: new ObjectId(id)});

          if(result.deletedCount === 0){
            res.writeHead(404);
            res.end(JSON.stringify({
              success: false,
              deletedCount: result.deletedCount
            }))
          }else{
            res.writeHead(200);
            res.end(JSON.stringify({
              success: true,
              deletedCount: result.deletedCount
            }))
          }
        }
        
      }catch(err){
        console.error("A server error occurred", err);
        res.writeHead(500);
        res.end(JSON.stringify({message: "Internal Server Error"}));
      }
    });

    server.listen(PORT, () => { console.log(`Server listening at http://localhost:${PORT}`)}); 
    
  }catch(err){
    console.error("An unexpected error occurred", err.message);
  }
}

run();