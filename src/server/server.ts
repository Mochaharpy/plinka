import express, { type Express } from 'express';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import fs from 'fs/promises';
import { Bonjour } from 'bonjour-service';

const app: Express = express();
const server = http.createServer(app);
const io = new Server(server);

const port = 80;
const hostName = 'game.local';

const state: ServerState = {
    hostId: null,
    socketIdToPlayerName: {},
    playerNameToSocketId: {},
    activeGame: null,
};

app.use(express.static('public'));

app.use('/script', express.static(path.join(process.cwd(), 'dist/client')));
app.use(
    '/games',
    (request, response, next) => {
        response.setHeader('Access-Control-Allow-Origin', '*');
        next();
    },
    express.static(path.join(process.cwd(), 'dist/games')),
);

app.get('/api/games', async (request, response) => {
    const gamesDirectoryPath = path.join(process.cwd(), '/dist/games/');

    try {
        const gamesDirectory = await fs.readdir(gamesDirectoryPath, {
            withFileTypes: true,
        });

        const allGames: GameList = {};

        for (const folderEntry of gamesDirectory) {
            if (folderEntry.isFile()) {
                continue;
            }
            // we know it is a folder
            const manifestPath = path.join(
                folderEntry.parentPath,
                folderEntry.name,
                'manifest.json',
            );
            try {
                let manifest = JSON.parse(
                    await fs.readFile(manifestPath, 'utf-8'),
                );
                delete manifest.$schema;
                allGames[folderEntry.name] = manifest;
            } catch (error) {
                console.warn(error);
            }
        }

        response.json(allGames);
    } catch (error) {
        console.warn(error);
        response
            .status(500)
            .json({ error: 'oopsie, bad thingy in server side' });
    }
});

server.listen(port, () => {
    const bonjour = new Bonjour();

    bonjour.publish({
        name: 'plinka',
        type: 'http',
        port: port,
        host: hostName,
    });

    console.log('running at: ', hostName);
});

io.on('connection', (socket) => {
    if (socket.handshake.auth.clientType) {
        const clientType = socket.handshake.auth.clientType;

        if (clientType === 'host') {
            if (state.hostId && state.hostId !== socket.id) {
                socket.emit('hostRejected', 'A host is already connected');
                socket.disconnect();
                return;
            }
            socket.data.role = 'host';
            state.hostId = socket.id;
            socket.emit('playerList', state.socketIdToPlayerName);
        } else if (clientType !== 'player') {
            socket.disconnect();
            return;
        }
    }

    socket.on('registerPlayer', (playerName: PlayerName) => {
        if (socket.data.role) {
            socket.emit('invalidUsername', 'You already joined');
            return;
        }
        if (Object.hasOwn(state.playerNameToSocketId, playerName)) {
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

            socket.emit('registerSuccess', playerName);
            console.log('registered: ', playerName);
            if (state.activeGame) {
                socket.emit('setGame', {
                gameName: state.activeGame.gameName,
                entryPoint: state.activeGame.entryPoint,
            })
            }
            if (!state.hostId) return;
            io.to(state.hostId).emit('addPlayer', {
                socketId: socket.id,
                playerName,
            });
        }
    });

    socket.on('sendPacket', (packet: Packet) => {
        if (typeof packet !== 'object' || packet === null) return;

        packet.senderId = socket.id;
        if (packet.recipient === 'host' && state.hostId) {
            io.to(state.hostId).emit('receivePacket', packet);
        } else if (packet.recipient === 'all' && state.hostId === socket.id) {
            socket.broadcast.emit('receivePacket', packet);
        } else {
            if (packet.recipient in state.socketIdToPlayerName) {
                io.to(packet.recipient).emit('receivePacket', packet);
            }
        }
    });

    socket.on('setGame', async (gameName: string) => {
        if (socket.id !== state.hostId) return;
        if (typeof gameName !== 'string') return;

        try {
            gameName = path.basename(gameName);
            const gameDirectoryPath = path.join(
                process.cwd(),
                '/dist/games',
                gameName,
            );

            const manifestPath = path.join(gameDirectoryPath, 'manifest.json');

            const manifestRaw = await fs.readFile(manifestPath, 'utf-8');
            const manifest = JSON.parse(manifestRaw);

            state.activeGame = { gameName, entryPoint: manifest.entryPoint };
            io.emit('setGame', {
                gameName: gameName,
                entryPoint: manifest.entryPoint,
            });
        } catch (error) {
            const err = error as NodeJS.ErrnoException;
            if (err.code === 'ENOENT') {
                console.log('game directory not available');
            }
        }
    });

    socket.on('disconnect', () => {
        if (socket.data.role === 'player') {
            const playerName = state.socketIdToPlayerName[socket.id];

            removePlayer({ playerName, socketId: socket.id });

            if (state.hostId) {
                io.to(state.hostId).emit('removePlayer', {
                    socketId: socket.id,
                    playerName,
                } as Player);
            }
        } else if (socket.data.role === 'host') {
            state.hostId = null;
        }
    });
});

function addPlayer(player: Player) {
    state.playerNameToSocketId[player.playerName] = player.socketId;
    state.socketIdToPlayerName[player.socketId] = player.playerName;
}

function removePlayer(player: Player) {
    delete state.socketIdToPlayerName[player.socketId];
    delete state.playerNameToSocketId[player.playerName];
}
