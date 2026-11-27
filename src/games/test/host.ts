import { add } from './helper.js';

const state: GameState = {
    playerNameToSocketId: {},
    socketIdToPlayerName: {},
};

const playerLeaderboardElement = document.getElementById('player-leaderboard') as HTMLUListElement;
const playerCardTemplateElement = document.getElementById('player-card-template') as HTMLTemplateElement;

function sendToHost(message: string) {
        window.top?.postMessage(message, '*')
}

document.addEventListener('DOMContentLoaded', () => {
    sendToHost('playerList')
})

window.addEventListener('message', (event) => {
    const packet: Packet = event.data;
    switch (event.data.type as PacketType) {
        case 'addPlayer':
            if (!packet.senderId) return;
            addPlayer({
                playerName: packet.payload.player.playerName,
                socketId: packet.senderId,
            });
            break;

        case 'removePlayer':
            if (!packet.senderId) return;
            removePlayer({
                playerName: packet.payload.player.playerName,
                socketId: packet.senderId,
            });
            break;
        case 'playerList':
            const playerList = packet.payload
            for (const socketId in playerList) {
                if (!Object.hasOwn(playerList, socketId)) continue;

                const playerName = playerList[socketId].playerName;

                addPlayer({ playerName, socketId });
            }
            break;
        default:
            break;
    }
});

window.addEventListener('message', (event) => {
    if (event.data.payload === 'button_clicked') {
        let playerCard = playerLeaderboardElement.querySelector(`[socketId="${event.data.senderId}"]`) as HTMLLIElement
        let playerScore = playerCard.querySelector('.score') as HTMLSpanElement;
        let score = Number(playerScore.textContent);
        score = add(score, 1);

        playerCard.style.setProperty('--score', score.toString());

        playerScore.textContent = score.toString();
    }
});

function addPlayer(player: Player) {
    state.playerNameToSocketId[player.playerName] = player.socketId;
    state.socketIdToPlayerName[player.socketId] = player.playerName;

    addPlayerCard(player)
}

function removePlayer(player: Player) {
    delete state.playerNameToSocketId[player.playerName];
    delete state.socketIdToPlayerName[player.socketId];

    const playerCard = playerLeaderboardElement.querySelector(`[socketId="${player.socketId}"]`);
    playerCard?.remove();
}

function addPlayerCard(player: Player) {
    const clone = document.importNode(playerCardTemplateElement.content, true);
    const playerCard = clone.querySelector('.player-card') as HTMLLIElement;

    const playerName = playerCard.querySelector('.player-name') as HTMLSpanElement;
    const playerScore = playerCard.querySelector('.score') as HTMLSpanElement;

    playerName.innerText = player.playerName;
    playerScore.innerText = '0';
    playerCard.setAttribute('socketId', player.socketId);
    playerCard.setAttribute('playerName', player.playerName);

    playerCard.style.setProperty('--score', '0');

    playerLeaderboardElement.appendChild(playerCard)
}