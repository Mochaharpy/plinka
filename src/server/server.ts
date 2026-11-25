import express, { type Express, Request, Response } from 'express';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import fs from 'fs/promises';
import { hostname } from 'os';

const app: Express = express();
const server = http.createServer(app);
const io = new Server(server);

const port = 80;

const state: ServerState = {
    hostId: null,
    socketIdToPlayerName: {},
    playerNameToSocketId: {},
    activeGame: null,
};

app.use(express.static('public'));

app.use('/script', express.static(path.join(import.meta.dirname, '../client')));

server.listen(port, () => {
    console.log(`server running at port: ${port}`);
});

io.on('connection', (socket) => {
    console.log('console');
    if (socket.handshake.auth.clientType) {
        const role = socket.handshake.auth.clientType;

        if (role === 'host' && (!state.hostId || state.hostId == socket.id)) {
            socket.data.role = role;
            state.hostId = socket.id;
            socket.emit('playerList', state.socketIdToPlayerName);
        } else {
            socket.emit('redirect', '/controller');
        }
    }

    socket.on('registerPlayer', (playerName: PlayerName) => {
        if (playerName in state.playerNameToSocketId) {
            socket.emit('invalidUsername', 'Name Taken');
        } else {
            const playerNameValidity = /^[a-zA-Z]{3,16}$/;

            if (
                !playerNameValidity.test(playerName) ||
                typeof playerName !== 'string'
            ) {
                socket.emit('invalidUsername', 'YOU TRYING TO CHEAT');
                return;
            }
            
            socket.data.role = 'player';

            addPlayer({ playerName: playerName, socketId: socket.id });

            socket.emit('registerSuccess');
            if (!state.hostId) return;
            io.to(state.hostId).emit('addPlayer', {
                socketId: socket.id,
                playerName: playerName,
            });
        }
    });
});

function addPlayer(player: Player) {
    state.playerNameToSocketId[player.playerName] = player.socketId;
    state.socketIdToPlayerName[player.socketId] = player.playerName;
}
