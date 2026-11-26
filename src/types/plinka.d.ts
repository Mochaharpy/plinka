import type { io as ioClient } from 'socket.io-client';

declare global {
    const io: typeof ioClient;

    type SocketId = string& { readonly __dummy?: unique symbol };
    type PlayerName = string& { readonly __dummy?: unique symbol };

    interface Player {
        socketId: SocketId;
        playerName: PlayerName;
    }

    interface Packet<T = any> {
        recipient: 'host' | 'all' | SocketId;
        senderId?: SocketId;
        isGamePacket?: boolean;
        payload: T;
    }

    interface State {
        activeGame: Game | null;
    }

    interface ServerState extends State {
        hostId: SocketId | null;
        playerNameToSocketId: Record<PlayerName, SocketId>;
        socketIdToPlayerName: Record<SocketId, PlayerName>;
    }

    interface HostState extends State {
        playerNameToSocketId: Record<PlayerName, SocketId>;
        socketIdToPlayer: Record<SocketId, Player>;
    }

    interface ControllerState extends State {}

    interface Game {
        input(): void;
    }
}

export {};
