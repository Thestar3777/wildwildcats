// Converts raw HandData into a discrete GestureState.
// The game engine reads this output to drive state transitions.

import type { HandData, GestureState } from "@/types/game"

// Velocity thresholds (units are scaled in handTracking: ~pixels/frame * 100)
const DRAW_VELOCITY_THRESHOLD = 15  // upward snap to trigger DRAWING
const EARLY_VELOCITY_THRESHOLD = 8  // smaller unintentional movement = EARLY

export function detectGesture(
  hand: HandData | null,
  currentGesture: GestureState,
  phase: "WAITING" | "COUNTDOWN" | "DRAW" | "RESULT"
): GestureState {
  if (!hand) return "IDLE"

  const movingUp = hand.velocity > EARLY_VELOCITY_THRESHOLD

  // During countdown any movement is an early draw
  if (phase === "COUNTDOWN" && movingUp) return "EARLY"

  // After DRAW signal: fast upward movement = drawing
  if (phase === "DRAW") {
    if (currentGesture === "FIRED") return "FIRED" // latch — stay fired
    if (hand.velocity > DRAW_VELOCITY_THRESHOLD) return "DRAWING"
    if (currentGesture === "DRAWING" && hand.isFiring) return "FIRED"
  }

  return "IDLE"
}
