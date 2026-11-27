import type { io as ioClient } from 'socket.io-client';

declare global {
    const io: typeof ioClient;

    interface GameManifest {
        name: string,
        description: string,
        entryPoint: {
            controller: string,
            host: string
        }
        icon?: string
    }

    type GameList = Record<string, GameManifest>

    type SocketId = string& { readonly __dummy?: unique symbol };
    type PlayerName = string& { readonly __dummy?: unique symbol };

    interface Player {
        socketId: SocketId;
        playerName: PlayerName;
    }

    interface Packet<T = any> {
        recipient: 'host' | 'all' | SocketId;
        senderId?: SocketId;
        payload: T;
        type?: PacketType
    }

    type PacketType = 'addPlayer' | 'removePlayer' | 'playerList';

    interface State {
        activeGame: boolean | null | object;
    }

    interface ServerState extends State {
        hostId: SocketId | null;
        playerNameToSocketId: Record<PlayerName, SocketId>;
        socketIdToPlayerName: Record<SocketId, PlayerName>;
        activeGame: {
            gameName: string,
            entryPoint: GameManifest['entryPoint']
        } | null
    }

    interface HostState extends State {
        playerNameToSocketId: Record<PlayerName, SocketId>;
        socketIdToPlayer: Record<SocketId, Player>;
        gameList: GameList
    }

    interface ControllerState extends State {
        registered: boolean
    }

    interface Game {
        input(): void;
    }

    interface GameState {
        playerNameToSocketId: Record<PlayerName, SocketId>;
        socketIdToPlayerName: Record<SocketId, PlayerName>;
    } 
}

export {};
