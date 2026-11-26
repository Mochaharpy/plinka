const socket = io({
    auth: {
        clientType: 'host',
    },
});

const state: HostState = {
    playerNameToSocketId: {},
    socketIdToPlayer: {},
    activeGame: null,
    gameList: {},
};

const playerListElement = document.getElementById(
    'player-list',
) as HTMLUListElement;
const gameListElement = document.getElementById('game-list') as HTMLUListElement;

socket.on('playerList', (playerList: Record<SocketId, PlayerName>) => {
    for (const socketId in playerList) {
        if (!Object.hasOwn(playerList, socketId)) continue;

        const playerName = playerList[socketId];

        addPlayer({ playerName, socketId });
    }
});

socket.on('addPlayer', (player: Player) => {
    addPlayer(player);
});

socket.on('removePlayer', (player: Player) => {
    removePlayer(player);
});

function addPlayer(player: Player) {
    state.playerNameToSocketId[player.playerName] = player.socketId;
    state.socketIdToPlayer[player.socketId] = {
        playerName: player.playerName,
        socketId: player.socketId,
    };

    addPlayerCard(player);
}

function removePlayer(player: Player) {
    delete state.playerNameToSocketId[player.playerName];
    delete state.socketIdToPlayer[player.socketId];

    removePlayerCard(player);
}

function removePlayerCard(player: Player) {
    const playerCardElement = playerListElement.querySelector(
        `[socketId=${player.socketId}]`,
    ) as HTMLLIElement;

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

    playerListElement.appendChild(clone);
}

async function getGames() {
    const games = await fetch(window.location.origin + '/api/games');
    state.gameList = await JSON.parse(await games.text());
}

async function populateGameCards() {
    const template = document.getElementById(
        'game-card-template',
    ) as HTMLTemplateElement;

    await getGames();

    for (const gameDirectoryName in state.gameList) {
        if (!Object.hasOwn(state.gameList, gameDirectoryName)) continue;

        const gameManifest: GameManifest = state.gameList[gameDirectoryName];

        const clone = document.importNode(template.content, true);

        const gameCard = clone.querySelector('.game-card') as HTMLLIElement;

        const gameName = gameCard.querySelector('.game-name') as HTMLSpanElement;
        const gameDescription = gameCard.querySelector(
            '.game-description',
        ) as HTMLLIElement;
        const gameIcon = gameCard.querySelector(
            '.game-icon',
        ) as HTMLImageElement;

        gameName.textContent = gameManifest.name;
        gameDescription.textContent = gameManifest.description;
        if (gameManifest.icon) {
            gameIcon.src = gameManifest.icon;
        } else {
            gameIcon.src = '/assets/noimage.svg';
        }

        gameListElement.appendChild(clone);

        gameCard.addEventListener('click', () => {
            console.log('hi');
        });
    }
}

document.addEventListener('DOMContentLoaded', async () => {
  populateGameCards();
});
