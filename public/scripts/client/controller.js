import { io } from 'socket.io-client';
const socket = io({
    auth: {
        clientType: 'player'
    }
});
const state = {
    activeGame: null,
};
