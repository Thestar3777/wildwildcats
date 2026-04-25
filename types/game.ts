// Shared types used across all modules

export interface HandData {
  x: number        // normalized 0–1 (horizontal)
  y: number        // normalized 0–1 (vertical, 0 = top)
  velocity: number // pixels/frame upward movement (positive = moving up)
  isFiring: boolean
  wasHolstered: boolean // detector confirmed holster pose before this draw
}

export type GestureState = "IDLE" | "DRAWING" | "FIRED" | "EARLY"

export type GamePhase = "WAITING" | "COUNTDOWN" | "DRAW" | "RESULT"

export interface GameState {
  phase: GamePhase
  countdown: number       // seconds remaining
  gesture: GestureState
  reactionTime: number | null   // ms from DRAW signal to FIRED (P1)
  reactionTime2: number | null  // ms from DRAW signal to FIRED (P2, 2P mode only)
  failed: boolean               // true if moved early
}
