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

app.use(express.static(path.join(process.cwd(), 'dist', 'public')))

app.listen(port, () => {
    console.log(`server running at port: ${port}`)
})