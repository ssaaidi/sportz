// this code is the SERVER
//  API schema as a complete blueprint or map,
//  while an API endpoint is a specific destination on that map.

import express from 'express';
import {matchRouter} from "./routes/matches.js";

const app = express();
const port = 8000;

// main Express application needs this middleware for JSON bodies:
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello from Express Server!')
});

app.use('/matches', matchRouter);

app.listen(port, () => {
    console.log(`Server is running from: ${port}`)
});


// note:
// Set up a simple express.js server in javascript that listens on port 8000,
// uses json middleware,
// has root get route that returns a short message,
// and logs URL when the server starts.