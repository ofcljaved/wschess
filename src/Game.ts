import WebSocket from 'ws';
import { Chess } from 'chess.js';
import { GAME_OVER, INIT_GAME, MOVE } from './constant';

export class Game {
  private board: Chess = new Chess();
  private moveCount: number = 0;
  private startTime: Date = new Date();

  constructor(public player1: WebSocket, public player2: WebSocket) {
    this.player1.send(
      JSON.stringify({
        type: INIT_GAME,
        payload: {
          color: 'white',
        },
      })
    );
    this.player2.send(
      JSON.stringify({
        type: INIT_GAME,
        payload: {
          color: 'black',
        },
      })
    );
  }
  makeMove(socket: WebSocket, move: { from: string; to: string }) {
    if (this.moveCount % 2 === 0 && socket !== this.player1) return;

    if (this.moveCount % 2 === 1 && socket !== this.player2) return;

    try {
      this.board.move(move);
    } catch (error) {
      console.log('ERROR: MAKING A MOVE ON CHESS \n', error);
      return;
    }

    if (this.board.isGameOver()) {
      this.player1.emit(
        JSON.stringify({
          type: GAME_OVER,
          payload: {
            winner: this.board.turn() === 'w' ? 'black' : 'white',
          },
        })
      );
      this.player2.emit(
        JSON.stringify({
          type: GAME_OVER,
          payload: {
            winner: this.board.turn() === 'w' ? 'black' : 'white',
          },
        })
      );
      return;
    }

    if (this.board.moves().length % 2 === 0) {
      this.player2.send(
        JSON.stringify({
          type: MOVE,
          payload: move,
        })
      );
    } else {
      this.player1.send(
        JSON.stringify({
          type: MOVE,
          payload: move,
        })
      );
    }
    this.moveCount++;
  }
}
