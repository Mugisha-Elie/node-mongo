import http from 'node:http'
import { MongoClient } from 'mongodb'

const URI = process.env.URI;
const PORT = process.env.PORT;
const client = new MongoClient(URI);

let db;

async function startSystem() {
  try {
    await client.connect();
    db = client.db('student_system');

    console.log("Connection success");

    const server = http.createServer(async (req, res) => {
      res.setHeader('Content-Type', 'application/json');

      if (req.method === "GET" && req.url === '/students') {
        res.writeHead(200);
        res.end(JSON.stringify({message: 'GET is live'}))
      } else if (req.method === "POST" && req.url === '/students') {
        res.writeHead(201);
        res.end(JSON.stringify({message: "POST is live"}))
      } else {
        res.writeHead(404);
        res.end(JSON.stringify({message: "NOT FOUND"}))
      }
    })

    server.listen(PORT, () => {
      console.log(`Server listenin at http://localhost:${PORT}`);
    })
    
  } catch (err) {
    console.error("An error occurred", err)
    res.writeHead(500);
    res.end(JSON.stringify({message: "Internal server error"}))
  }
}

startSystem();