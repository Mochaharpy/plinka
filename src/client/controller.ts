const socket = io({
    auth: {
        clientType: 'player',
    },
});

const state: ControllerState = {
    activeGame: null,
    registered: false,
};

const nameForm = document.getElementById('name-form') as HTMLFormElement;
const nameElement = nameForm.querySelector(
    'input[name=username]',
) as HTMLInputElement;
const gameFrameElement = document.getElementById('game-frame') as HTMLIFrameElement;

nameElement.addEventListener('input', () => {
    nameElement.setCustomValidity('');
});

nameForm.addEventListener('submit', (submitEvent) => {
    submitEvent.preventDefault();
    nameElement.setCustomValidity('');

    if (!nameElement.reportValidity()) {
        return;
    }

    const nameFormData = new FormData(nameForm);

    const name = nameFormData.get('username');

    socket.emit('registerPlayer', name);
});

socket.on('invalidUsername', (reason: string) => {
    nameElement.setCustomValidity(reason || 'Invalid username');
    nameElement.reportValidity();
});

socket.on('registerSuccess', () => {
    state.registered = true;
    nameForm.style.display = 'none';
});

socket.on('setGame', (gameData) => {
    if (!state.registered) return;

    gameFrameElement.classList.add('active');

    gameFrameElement.src = `/games/${gameData.gameName}/${gameData.entryPoint.controller}`
});

socket.on('receivePacket', (packet: Packet) => {
    gameFrameElement.contentWindow?.postMessage(packet, window.location.origin)
})

window.addEventListener('message', (messageEvent) => {
    if (messageEvent.source !== gameFrameElement.contentWindow) return;
    
    socket.emit('sendPacket', messageEvent.data);
});

export {};
