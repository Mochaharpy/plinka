import type { io as ioClient } from "socket.io-client";

declare global {
  const io: typeof ioClient;

  type SocketId = string;
  type PlayerName = string;

  interface Player {
    socketId: SocketId,
    playerName: PlayerName
  }

  interface Packet<T = any> {
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

  interface ControllerState extends State {}

  interface Game {
    input(): void;
  }
}

export {};
