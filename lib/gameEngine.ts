// Pure state-machine logic. No side effects — takes current state + inputs,
// returns next state. The hook drives the tick loop.

import type { GameState, GestureState } from "@/types/game"

const COUNTDOWN_SECONDS = 3

// Random delay after countdown hits 0 before showing DRAW (0.5–2.5s)
export function getDrawDelay(): number {
  return 500 + Math.random() * 2000
}

export function getInitialState(): GameState {
  return {
    phase: "WAITING",
    countdown: COUNTDOWN_SECONDS,
    gesture: "IDLE",
    reactionTime: null,
    reactionTime2: null,
    failed: false,
  }
}

export function tickGameEngine(
  state: GameState,
  gesture: GestureState,
  drawSignalTime: number | null, // timestamp when DRAW phase began
  now: number                    // Date.now()
): GameState {
  switch (state.phase) {
    case "WAITING":
      return state // transitions triggered externally by startGame()

    case "COUNTDOWN": {
      if (gesture === "EARLY") {
        return { ...state, phase: "RESULT", gesture: "EARLY", failed: true }
      }
      return state // countdown tick managed in hook via setInterval
    }

    case "DRAW": {
      if (gesture === "EARLY") {
        return { ...state, phase: "RESULT", gesture: "EARLY", failed: true }
      }
      if (gesture === "FIRED" && drawSignalTime !== null) {
        return {
          ...state,
          phase: "RESULT",
          gesture: "FIRED",
          reactionTime: now - drawSignalTime,
        }
      }
      return { ...state, gesture }
    }

    case "RESULT":
      return state // waiting for player to restart
  }
}
