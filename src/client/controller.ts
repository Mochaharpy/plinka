
const socket = io({
    auth: {
        clientType: 'player'
    }
});

const state: ControllerState = {
    activeGame: null,
}

socket.emit('registerPlayer', 'MyName')

socket.on('registerSuccess', () => {
    console.log('wow')
})

export {}