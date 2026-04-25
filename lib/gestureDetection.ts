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
  countdown: number = 99
): GestureState {
  // No hand in frame = idle
  if (!hand) return "IDLE"

  // Cheating window is just the final "1" tick + the random steady delay
  // (countdown <= 1). During 3-2 the player is settling into pose, so we
  // ignore movement. Only velocity is checked — the fire-pose detector is
  // too sensitive to use as a foul signal (natural finger wobble flickers
  // isFiring even when the hand is stationary).
  if (phase === "COUNTDOWN" && countdown <= 1 && hand.velocity > EARLY_VELOCITY_THRESHOLD) {
    console.log("[gestureDetection] EARLY — velocity", {
      velocity: hand.velocity.toFixed(2),
      threshold: EARLY_VELOCITY_THRESHOLD,
      countdown,
    })
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
