// Gesture Detection
// Translates HandData into GestureState for the game engine
// Owner: Xavier

import { HandData, GestureState, GamePhase } from "@/types/game"

// Thresholds matched to Cameron's handTracking velocity scale (wrist Y-delta × 100)
export const DRAW_VELOCITY_THRESHOLD = 15
export const EARLY_VELOCITY_THRESHOLD = 8

export function detectGesture(
  hand: HandData | null,
  phase: GamePhase
): GestureState {
  // No hand in frame = idle
  if (!hand) return "IDLE"

  // Fire gesture wins over everything (handTracking latches this for ~4 frames)
  if (hand.isFiring) return "FIRED"

  // Movement during countdown = cheating
  if (phase === "COUNTDOWN" && hand.velocity > EARLY_VELOCITY_THRESHOLD) {
    return "EARLY"
  }

  // Fast upward movement during draw phase = legit draw
  if (phase === "DRAW" && hand.velocity > DRAW_VELOCITY_THRESHOLD) {
    return "DRAWING"
  }

  return "IDLE"
}
