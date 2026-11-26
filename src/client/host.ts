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

const playerListElement = document.getElementById('player-list') as HTMLUListElement;

socket.on('playerList', (playerList: Record<SocketId, PlayerName>) => {
    for (const socketId in playerList) {
        if (!Object.hasOwn(playerList, socketId)) continue;

        const playerName = playerList[socketId];

        addPlayer({playerName, socketId})
    }
});

socket.on('addPlayer', (player: Player) => {
    addPlayer(player)
})

socket.on('removePlayer', (player: Player) => {
    removePlayer(player);
})

function addPlayer(player: Player) {
    state.playerNameToSocketId[player.playerName] = player.socketId;
    state.socketIdToPlayer[player.socketId] = {
        playerName: player.playerName,
        socketId: player.socketId,
    };

    addPlayerCard(player)
}

function removePlayer(player: Player) {
    delete state.playerNameToSocketId[player.playerName];
    delete state.socketIdToPlayer[player.socketId];

    removePlayerCard(player);
}

function removePlayerCard(player: Player) {
    const playerCardElement = playerListElement.querySelector(`[socketId=${player.socketId}]`) as HTMLLIElement;

    if (!playerCardElement) return;

    playerCardElement.remove();
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

    playerListElement.appendChild(clone)
}
