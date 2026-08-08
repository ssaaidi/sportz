// this code is like the listening script, the add event listeners code
//  API schema as a complete blueprint or map,
//  while an API endpoint is a specific destination on that map.

//An index is a sorted map or table of contents that helps find data quickly

import express from 'express';
import {matchRouter} from "./routes/matches.js";
import http from 'http';
import {attachWebSocketServer} from "./ws/server.js";

const PORT = Number(process.env.PORT || 8000);
const HOST = process.env.HOST || '0.0.0.0';

const app = express();
const server = http.createServer(app);

// main Express application needs this middleware for JSON bodies:
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello from Express Server!')
});

app.use('/matches', matchRouter);

// here we are initializing a websocket and getting access to the broadcast function,
// and we're getting access to it so we can store it to app.local
const { broadcastMatchCreated } = attachWebSocketServer(server) // using object deconstruction to extract broadcastMatchCreated from that returned object
app.locals.broadcastMatchCreated = broadcastMatchCreated;

server.listen(PORT, HOST, () => {
    const baseUrl = HOST === '0.0.0.0' ? `http://localhost:${PORT}` : `http://${HOST}:${PORT}`;

    console.log(`Server is running from: ${baseUrl}`);
    console.log(`WebSocket is running on: ${baseUrl.replace('http', 'ws')}/ws`);
});


// note:
// Set up a simple express.js server in javascript that listens on port 8000,
// uses json middleware,
// has root get route that returns a short message,
// and logs URL when the server starts.