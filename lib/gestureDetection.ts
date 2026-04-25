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

  // Cheating: significant upward hand movement before the draw signal.
  // We deliberately do NOT flag isFiring during countdown — the trigger-pull
  // detector is sensitive enough that natural hand-positioning into the
  // holster pose can produce single-frame fire flickers, which would foul
  // the player before they ever see "DRAW!". Velocity catches the only
  // real cheat (raising the gun off the hip early).
  if (phase === "COUNTDOWN" && hand.velocity > EARLY_VELOCITY_THRESHOLD) {
    console.log("[gestureDetection] EARLY — velocity", {
      velocity: hand.velocity.toFixed(2),
      threshold: EARLY_VELOCITY_THRESHOLD,
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
