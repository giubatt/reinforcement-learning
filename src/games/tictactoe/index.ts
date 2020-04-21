import { GameManager } from './stateMachineManager'

const manager = new GameManager({})
manager.printBoard()
manager.play(0, 0) // X
manager.play(1, 1) // O
manager.play(1, 0) // X
manager.play(2, 2) // O
manager.play(2, 0) // X
