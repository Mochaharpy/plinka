declare global {
    type SocketId = string;
    type PlayerName = string;

    export interface Packet<T = any> {
        senderId?: SocketId,
        isGamePacket?: boolean,
        payload: T
    }

    export interface State {
        activeGame: Game | null
    }

    export interface ServerState extends State {
        hostId: SocketId | null,
        playerNameToSocketId: Record<PlayerName, SocketId>,
        socketIdToPlayerName: Record<SocketId, PlayerName>
    }

    export interface Game {
        input(): void
    }
}

export {}