import {io, type io as ioClient} from 'socket.io-client';

const socket = io({
    auth: {
        clientType: 'player'
    }
});

const state: ControllerState = {
    activeGame: null,
}

