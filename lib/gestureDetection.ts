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

  // Cheating: any significant movement OR firing before the draw signal
  if (phase === "COUNTDOWN" && (hand.velocity > EARLY_VELOCITY_THRESHOLD || hand.isFiring)) {
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
