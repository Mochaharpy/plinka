import express, { type Express, Request, Response } from 'express';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import fs from 'fs/promises';
import { Bonjour } from 'bonjour-service';

const app: Express = express();
const server = http.createServer(app);
const io = new Server(server);

const port = 80;
const hostName = 'game.local'

const state: ServerState = {
    hostId: null,
    socketIdToPlayerName: {},
    playerNameToSocketId: {},
    activeGame: null,
};

app.use(express.static('public'));

app.use('/script', express.static(path.join(process.cwd(), 'dist/client')));
app.use('/games', express.static(path.join(process.cwd(), 'dist/games')));

server.listen(port, () => {
    const bonjour = new Bonjour();

    bonjour.publish({
        name: 'plinka',
        type: 'http',
        port: port,
        host:  hostName,
    })

    console.log('running at: ', hostName)
});

io.on('connection', (socket) => {
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
            console.log('registered: ', playerName)
            if (!state.hostId) return;
            io.to(state.hostId).emit('addPlayer', {
                socketId: socket.id,
                playerName: playerName,
            });
        }
    });

    socket.on('sendPacket', (packet: Packet) => {
        if (packet.recipient === 'host' && state.hostId) {
            io.to(state.hostId).emit("receivePacket", packet);
        } else if (packet.recipient === 'all' && state.hostId === socket.id) {
            socket.broadcast.emit('receivePacket', packet);
        } else {
            if (packet.recipient in state.socketIdToPlayerName) {
                io.to(packet.recipient).emit('receivePacket', packet)
            }
        }
    })

    socket.on('disconnect', () => {
        if (socket.data.role === 'player') {
            const playerName = state.socketIdToPlayerName[socket.id];
            console.log('disconnect player: ', state.socketIdToPlayerName[socket.id])
            delete state.socketIdToPlayerName[socket.id];
            delete state.playerNameToSocketId[playerName];
        } else if (socket.data.role === 'host') {
            state.hostId = null;
        }
    })
});

function addPlayer(player: Player) {
    state.playerNameToSocketId[player.playerName] = player.socketId;
    state.socketIdToPlayerName[player.socketId] = player.playerName;
}
