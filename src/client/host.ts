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

const playerListElement = document.getElementById('player-list');

socket.on('playerList', (playerList: Record<SocketId, PlayerName>) => {
    for (const socketId in playerList) {
        if (!Object.hasOwn(playerList, socketId)) continue;

        const playerName = playerList[socketId];

        state.playerNameToSocketId[playerName] = socketId;
        state.socketIdToPlayer[socketId] = {
            playerName: playerName,
            socketId: socketId,
        };
    }
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

function addPlayerCard(player: Player) {
    const template = document.getElementById(
        'player-card-template',
    ) as HTMLTemplateElement;

    const clone = document.importNode(template.content, true);

    const playerCard = clone.querySelector('.player-card') as HTMLLIElement;

    if (playerCard) {
        playerCard.setAttribute('name', player.playerName);
        playerCard.setAttribute('socketId', player.socketId);

        playerCard.textContent = player.playerName;
    }

    playerListElement?.appendChild(clone)
}
