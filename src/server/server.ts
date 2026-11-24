import express, {type Express, Request, Response} from 'express';
import http from 'http';
import {Server} from 'socket.io';
import path from 'path';
import fs from 'fs/promises';

const app: Express = express();
const server = http.createServer(app);
const io = new Server(server);

const port = 8080;

const state: ServerState = {
    hostId: null,
    socketIdToPlayerName: {},
    playerNameToSocketId: {},
    activeGame: null,
}

app.use(express.static("public"));

app.use("/script", express.static(path.join(__dirname, "../client")));

app.listen(port, () => {
    console.log(`server running at port: ${port}`)
})

io.on('connection', (socket) => {
    if (socket.handshake.auth.clientType) {
        const role = socket.handshake.auth.clientType;

        if (role === 'host' && (!state.hostId || state.hostId == socket.id)) {
            socket.data.role = role;
            state.hostId = socket.id;
            socket.emit('playerList', state.socketIdToPlayerName)
        }
    }
})