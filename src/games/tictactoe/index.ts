import colors from 'colors/safe'

enum Player {
  Cross = `X`,
  Circle = `O`,
}

enum TileState {
  Empty = ` `,
  Cross = `X`,
  Circle = `O`,
}

export class GameManager {
  board: TileState[][]
  currentPlayer: Player

  constructor({ initialPlayer = Player.Cross }: { initialPlayer?: Player }) {
    this.board = Array.from({ length: 3 }).map(() =>
      Array.from({ length: 3 }).map(() => TileState.Empty),
    )
    this.currentPlayer = initialPlayer
  }

  private getTileText(tileRow: number, tileCol: number): string {
    let text: string = this.board[tileRow][tileCol]
    if (text === TileState.Cross) text = colors.red(text)
    if (text === TileState.Circle) text = colors.blue(text)
    return text
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

  play(tileRow: number, tileCol: number): void {
    const oldPlayer = this.currentPlayer

    if (this.board[tileRow][tileCol] !== TileState.Empty)
      throw new Error(`Tile not empty`)
    let tileState
    if (this.currentPlayer === Player.Cross) {
      tileState = TileState.Cross
      this.currentPlayer = Player.Circle
    } else if (this.currentPlayer === Player.Circle) {
      tileState = TileState.Circle
      this.currentPlayer = Player.Cross
    } else throw new Error(`Invalid current player`)

    this.board[tileRow][tileCol] = tileState

    console.log(`Player ${oldPlayer} played. Resulting board:`)
    this.printBoard()

    const winner = this.checkWin()
    if (winner) console.log(`Player ${oldPlayer} won! Congratulations!`)
  }

  checkWin(): Player | null {
    let winner: Player | null = null

    // check rows
    for (let i = 0; i < this.board.length; i++) {
      if (this.board[i][0] === TileState.Empty) continue
      for (let j = 1; j < this.board[i].length; j++) {
        if (this.board[i][j] !== this.board[i][0]) {
          winner = null
          break
        }
        if (this.board[i][0] === TileState.Circle) winner = Player.Circle
        else winner = Player.Cross
      }
      if (winner) return winner
    }

    // check columns
    for (let i = 0; i < this.board[0].length; i++) {
      if (this.board[0][i] === TileState.Empty) continue
      for (let j = 1; j < this.board.length; j++) {
        if (this.board[j][i] !== this.board[0][i]) {
          winner = null
          break
        }
        if (this.board[j][0] === TileState.Circle) winner = Player.Circle
        else winner = Player.Cross
      }
      if (winner) return winner
    }

    return null
  }
}

// const manager = new GameManager({})
// manager.printBoard()
// manager.play(0, 0) // X
// manager.play(1, 1) // O
// manager.play(1, 0) // X
// manager.play(2, 2) // O
// manager.play(2, 0) // X
