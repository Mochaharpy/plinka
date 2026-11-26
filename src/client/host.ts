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
const gameListElement = document.getElementById(
    'game-list',
) as HTMLUListElement;
const gameFrameElement = document.getElementById(
    'game-frame',
) as HTMLIFrameElement;

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

socket.on('setGame', (gameData) => {
    gameFrameElement.classList.add('active');
    gameFrameElement.src = `/games/${gameData.gameName}/${gameData.entryPoint.host}`
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
        `[socketId="${player.socketId}"]`,
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

async function getGames(): Promise<GameList> {
    const response = await fetch('/api/games');
    if (!response.ok) {
        throw new Error(`couldnt load games, status: ${response.status}`);
    }
    return response.json();
}

async function populateGameCards() {
    const template = document.getElementById(
        'game-card-template',
    ) as HTMLTemplateElement;

    const gameList = await getGames();
    state.gameList = gameList;

    for (const [gameDirectory, gameManifest] of Object.entries(gameList)) {
        const clone = document.importNode(template.content, true);
        const gameCard = clone.querySelector('.game-card') as HTMLLIElement;
        const gameName = gameCard.querySelector(
            '.game-name',
        ) as HTMLSpanElement;
        const gameDescription = gameCard.querySelector(
            '.game-description',
        ) as HTMLLIElement;
        const gameIcon = gameCard.querySelector(
            '.game-icon',
        ) as HTMLImageElement;
        const gamePlayButton = gameCard.querySelector(
            '.game-start-button',
        ) as HTMLButtonElement;

        gameName.textContent = gameManifest.name;
        gameDescription.textContent = gameManifest.description;
        gameIcon.src = gameManifest.icon ?? '/assets/noimage.svg';
        gamePlayButton.addEventListener('click', () => {
            setGame(gameDirectory);
        });

        gameListElement.appendChild(clone);
    }
}

function setGame(gameName: string) {
    if (Object.hasOwn(state.gameList, gameName)) {
        socket.emit('setGame', gameName);
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    populateGameCards().catch((error) => console.error(error));
});
