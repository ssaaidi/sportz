// the ws file will manage all connected clients and provide broadcasting logic
import {WebSocket, WebSocketServer} from 'ws';
// 1. create a function that will send a JSON object to a specific client,
//      it's essentially a helper function that'll prevent repetitive JSON.stringify calls
//              and ensure the socket is actually open before sending

// ensure the socket is actually open before sending
function sendJson(socket, payload) {
    if(socket.readyState !== WebSocket.OPEN) return;

    // stringify the payload we want too send over to the client
    socket.send(JSON.stringify(payload));
}

// send data to every connected user
function broadcast(wss, payload) {
    for (const client of wss.clients) {
        if(client.readyState !== WebSocket.OPEN) return;

        client.send(JSON.stringify(payload));
    }
}


// attach the websocket logic to our node server
export function attachWebSocketServer(server) {
    const wss = new WebSocketServer({
        server,
        path: '/ws', // this string represents the WebSockets endpoint and only requests made to this exact path are eligible for websocket upgrades
        maxRequests: 1024 * 1024, // equals one megabite, if a client sends a message larger than this limit, the server drops the connection to protect memory
    });

    wss.on("connection", (socket) => {
         // we want to send an initial message to confirm the link is active
        sendJson(socket, {payload: 'Welcome'});

        socket.on('error', console.error);

    });

    function broadcastMatchCreated(match){
        broadcast(wss, {type: 'match_created', data: match});
    }


    // Returns that function inside an object:
    return { broadcastMatchCreated }
}


// PAYLOAD NOTES:
// payload is used as a function parameter that accepts a raw JS opject you intent to transmit over the network
// it acts as a placeholder object for whatever data object you decide to pass into the function later

// {payload: 'Welcome'}
//In this line, you are explicitly creating a JSON object
//          where the key is named payload and
//          its value is the string 'Welcome'