import colors from 'colors/safe'
import { Machine, StateMachine, interpret, assign, Interpreter } from 'xstate'

enum Player {
  Cross = `X`,
  Circle = `O`,
}

enum TileState {
  Empty = ` `,
  Cross = `X`,
  Circle = `O`,
}

interface GameStateSchema {
  states: {
    playing: {}
    winner: {}
    draw: {}
  }
}

type GameEvent =
  | { type: `PLAY`; tileIndex: number }
  | { type: `RESET`; tileIndex: number }

interface GameContext {
  currentPlayer: Player
  board: TileState[]
  moves: number
  winner: Player | undefined
}

export class GameManager {
  private stateMachine: StateMachine<GameContext, GameStateSchema, GameEvent>
  private initialContext: GameContext
  private service: Interpreter<GameContext, GameStateSchema, GameEvent>

  constructor({ initialPlayer = Player.Cross }: { initialPlayer?: Player }) {
    this.initialContext = {
      board: Array(9).fill(TileState.Empty),
      currentPlayer: initialPlayer,
      moves: 0,
      winner: undefined,
    }

    this.stateMachine = Machine<GameContext, GameStateSchema, GameEvent>(
      {
        key: `tictactoe`,
        initial: `playing`,
        context: this.initialContext,
        states: {
          playing: {
            on: {
              '': [
                { target: `winner`, cond: `checkWin` },
                { target: `draw`, cond: `checkDraw` },
              ],
              PLAY: [
                {
                  target: `playing`,
                  cond: (ctx, e): boolean => {
                    return ctx.board[e.tileIndex] === TileState.Empty
                  },
                  actions: `updateBoard`,
                },
              ],
            },
          },
          winner: {
            onEntry: `setWinner`,
          },
          draw: {},
        },
        on: {
          RESET: {
            target: `playing`,
            actions: `resetGame`,
          },
        },
      },
      {
        actions: {
          updateBoard: assign({
            board: (ctx, e) => {
              const updatedBoard = [...ctx.board]
              updatedBoard[e.tileIndex] =
                ctx.currentPlayer === Player.Cross
                  ? TileState.Cross
                  : TileState.Circle
              return updatedBoard
            },
            moves: (ctx) => ctx.moves + 1,
            currentPlayer: (ctx) =>
              ctx.currentPlayer === Player.Cross ? Player.Circle : Player.Cross,
          }),
          resetGame: assign<GameContext>(this.initialContext),
          setWinner: assign({
            winner: (ctx) =>
              ctx.currentPlayer === Player.Cross ? Player.Circle : Player.Cross,
          }),
        },
        guards: {
          checkDraw(ctx): boolean {
            return ctx.moves === 9
          },
          checkWin(ctx): boolean {
            const { board } = ctx
            const winningLines = [
              [0, 1, 2],
              [3, 4, 5],
              [6, 7, 8],
              [0, 3, 6],
              [1, 4, 7],
              [2, 5, 8],
              [0, 4, 8],
              [2, 4, 6],
            ]

            for (const line of winningLines) {
              const xWon = line.every((index) => {
                return board[index] === TileState.Cross
              })
              const oWon = line.every((index) => {
                return board[index] === TileState.Circle
              })

              if (xWon || oWon) {
                return true
              }
            }
            return false
          },
        },
      },
    )

    this.service = interpret(this.stateMachine)
    // .onTransition((state, event) => {
    //   console.log({ context: state.context, event })
    // })
    this.service.start()
  }

  private getTileText(tileRow: number, tileCol: number): string {
    const tileIndex = tileCol + tileRow * 3
    let text: string = this.service.state.context.board[tileIndex]
    if (text === TileState.Cross) text = colors.red(text)
    if (text === TileState.Circle) text = colors.blue(text)
    return text
  }

  play(tileRow: number, tileCol: number): void {
    const tileIndex = tileCol + tileRow * 3
    const currentPlayer = this.service.state.context.currentPlayer

    this.service.send({ type: `PLAY`, tileIndex })

    console.log(`Player ${currentPlayer} played. Resulting board:`)
    this.printBoard()

    if (this.service.state.matches(`winner`)) {
      console.log(
        `Player ${this.service.state.context.winner} won! Congratulations!`,
      )
    }
  }

  printBoard(): void {
    console.log(
      colors.underline(
        `${this.getTileText(0, 0)}|${this.getTileText(0, 1)}|${this.getTileText(
          0,
          2,
        )}`,
      ),
    )
    console.log(
      colors.underline(
        `${this.getTileText(1, 0)}|${this.getTileText(1, 1)}|${this.getTileText(
          1,
          2,
        )}`,
      ),
    )
    console.log(
      `${this.getTileText(2, 0)}|${this.getTileText(2, 1)}|${this.getTileText(
        2,
        2,
      )}`,
    )
    console.log(``)
  }
}
