// Gesture Detection
// Translates HandData into GestureState for the game engine
// Owner: Xavier

import { HandData, GestureState, GamePhase } from "@/types/game"


// Thresholds matched to Cameron's handTracking velocity scale (wrist Y-delta × 100)
export const DRAW_VELOCITY_THRESHOLD = 15
export const EARLY_VELOCITY_THRESHOLD = 8

export function detectGesture(
  hand: HandData | null,
  phase: GamePhase,
  countdown: number
): GestureState {
  // No hand in frame = idle
  if (!hand) return "IDLE"

  // Cheating: raising the gun arm before DRAW. Only enforce in the final tense moment
  // (countdown 1 + the steady random delay at 0) — 3 and 2 are free settle-in time.
  if (phase === "COUNTDOWN" && countdown <= 1 && hand.velocity > EARLY_VELOCITY_THRESHOLD) {
    return "EARLY"
  }



  // Fire gesture wins during draw phase (handTracking latches this for ~4 frames)
  if (hand.isFiring) return "FIRED"

  // Fast upward movement during draw phase = legit draw
  if (phase === "DRAW" && hand.velocity > DRAW_VELOCITY_THRESHOLD) {
    return "DRAWING"
  }

  return "IDLE"
}
