const socket = io({
    auth: {
        clientType: 'host',
    },
});

const state: HostState = {
    playerNameToSocketId: {},
    socketIdToPlayer: {},
    activeGame: null,
};

socket.on('playerList', (playerList) => {
    
});

function addPlayer(player: Player) {
    state.playerNameToSocketId[player.playerName] = player.socketId;
    state.socketIdToPlayer[player.socketId] = {
        playerName: player.playerName,
        socketId: player.socketId,
    };
}

function removePlayerFromSocketId(socketId: SocketId) {
    const player = state.socketIdToPlayer[socketId];
    if (!player) return;
    const playerName = player.playerName;
    delete state.playerNameToSocketId[playerName];
    delete state.socketIdToPlayer[socketId];
}

function removePlayerFromName(playerName: PlayerName) {
    const socketId = state.playerNameToSocketId[playerName];
    if (!socketId) return;
    delete state.playerNameToSocketId[playerName];
    delete state.socketIdToPlayer[socketId];
}
