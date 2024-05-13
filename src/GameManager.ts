import WebSocket from 'ws';
import { INIT_GAME, MOVE } from './constant';
import { Game } from './Game';

export class GameManager {
  private games: Game[] = [];
  private pendingUser: WebSocket | null = null;
  private users: WebSocket[] = [];
  constructor() {}
  addUser(socket: WebSocket) {
    this.users.push(socket);
    this.addHandler(socket);
  }
  removeUser(socket: WebSocket) {
    this.users = this.users.filter((user) => user !== socket);
  }
  private addHandler(socket: WebSocket) {
    socket.on('message', (data) => {
      const message = JSON.parse(data.toString());
      switch (message.type) {
        case INIT_GAME:
          if (this.pendingUser) {
            const game = new Game(this.pendingUser, socket);
            this.games.push(game);
            this.pendingUser = null;
          } else {
            this.pendingUser = socket;
          }
          break;
        case MOVE:
          const game = this.games.find(
            (game) => game.player1 === socket || game.player2 === socket
          );
          if (game) {
            game.makeMove(socket, message.move);
          }
          break;
        default:
          break;
      }
    });
  }
}
