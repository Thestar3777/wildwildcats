"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import type { HandData, GameState, GestureState } from "@/types/game"
import { detectGesture } from "@/lib/gestureDetection"
import { tickGameEngine, getInitialState, getDrawDelay } from "@/lib/gameEngine"

const COUNTDOWN_SECONDS = 3
// Ignore gestures for this many ticks (50ms each) after startGame() so
// MediaPipe re-acquisition spikes and the player's hand-into-pose movement
// don't trigger EARLY. 1s is long enough for the typical settle-in but
// well short of the 3s countdown.
const WARMUP_TICKS = 20

function playGunshot() {
  const audio = new Audio("/sounds/33276__mastafx__shot.wav")
  audio.play()
}

// Handles the 2P tick: evaluates both hands, first to fire (with wasHolstered) wins.
// Returns the sentinel 9999 for the player who did not complete the draw.
function tick2P(
  prev: GameState,
  hand1: HandData | null,
  hand2: HandData | null,
  drawSignalTime: number | null,
  now: number
): GameState {
  if (prev.phase === "WAITING" || prev.phase === "RESULT") return prev

  const g1 = detectGesture(hand1, prev.phase, prev.countdown)
  const g2 = detectGesture(hand2, prev.phase, prev.countdown)

  // Either player moving early during countdown is a foul
  if (g1 === "EARLY" || g2 === "EARLY") {
    return { ...prev, phase: "RESULT", gesture: "EARLY", failed: true }
  }

  if (prev.phase === "DRAW" && drawSignalTime !== null) {
    // wasHolstered gate: only credit the fire if the player actually held the
    // gun pose first. wasHolstered is sticky (once true, stays true), so it
    // never fights the isFiring latch.
    const p1Fired = g1 === "FIRED" && hand1?.wasHolstered === true
    const p2Fired = g2 === "FIRED" && hand2?.wasHolstered === true

    console.log("[tick2P] DRAW —", {
      g1, g2, p1Fired, p2Fired,
      hand1: hand1 ? `fire=${hand1.isFiring} hol=${hand1.wasHolstered}` : "null",
      hand2: hand2 ? `fire=${hand2.isFiring} hol=${hand2.wasHolstered}` : "null",
    })

    if (p1Fired || p2Fired) {
      playGunshot()
      const rt = now - drawSignalTime
      return {
        ...prev,
        phase: "RESULT",
        gesture: "FIRED",
        // Winner gets actual reaction time; loser gets sentinel 9999
        reactionTime: p1Fired ? rt : 9999,
        reactionTime2: p2Fired ? rt : 9999,
      }
    }

    const displayGesture: GestureState =
      g1 === "DRAWING" || g2 === "DRAWING" ? "DRAWING" : "IDLE"
    return { ...prev, gesture: displayGesture }
  }

  return prev
}

export function useGame(players: 1 | 2 = 1) {
  const [gameState, setGameState] = useState<GameState>(getInitialState)
  const hand1Ref = useRef<HandData | null>(null)
  const hand2Ref = useRef<HandData | null>(null)
  const drawSignalTimeRef = useRef<number | null>(null)
  const warmupTicksRef = useRef(0)

  // Called every frame from handTracking (P1)
  const updateHand = useCallback((data: HandData | null) => {
    hand1Ref.current = data
  }, [])

  // Called every frame from handTracking (P2, 2P mode only)
  const updateHand2 = useCallback((data: HandData | null) => {
    hand2Ref.current = data
  }, [])

  // Tick loop: runs every ~50ms to process gesture → engine
  useEffect(() => {
    if (gameState.phase === "WAITING" || gameState.phase === "RESULT") return

    const id = setInterval(() => {
      const now = Date.now()
      setGameState(prev => {
        if (warmupTicksRef.current > 0) {
          warmupTicksRef.current--
          return prev
        }

        if (players === 2) {
          return tick2P(prev, hand1Ref.current, hand2Ref.current, drawSignalTimeRef.current, now)
        }

        const gesture = detectGesture(hand1Ref.current, prev.phase, prev.countdown)
        if (prev.phase === "DRAW" && gesture === "FIRED") {
          playGunshot()
        }
        return tickGameEngine(prev, gesture, drawSignalTimeRef.current, now)
      })
    }, 50)

    return () => clearInterval(id)
  }, [gameState.phase, players])

  // Countdown ticker — separate 1s interval
  useEffect(() => {
    if (gameState.phase !== "COUNTDOWN") return

    const id = setInterval(() => {
      setGameState(prev => {
        if (prev.phase !== "COUNTDOWN") return prev
        const next = prev.countdown - 1
        if (next <= 0) {
          // Schedule the random DRAW delay then flip to DRAW
          setTimeout(() => {
            drawSignalTimeRef.current = Date.now()
            setGameState(s => (s.phase === "COUNTDOWN" ? { ...s, phase: "DRAW" } : s))
          }, getDrawDelay())
          return { ...prev, countdown: 0 } // show 0 briefly while waiting
        }
        return { ...prev, countdown: next }
      })
    }, 1000)

    return () => clearInterval(id)
  }, [gameState.phase])

  const startGame = useCallback(() => {
    drawSignalTimeRef.current = null
    warmupTicksRef.current = WARMUP_TICKS
    setGameState({ ...getInitialState(), phase: "COUNTDOWN", countdown: COUNTDOWN_SECONDS })
  }, [])

  return {
    phase: gameState.phase,
    countdown: gameState.countdown,
    gesture: gameState.gesture,
    reactionTime: gameState.reactionTime,
    reactionTime2: gameState.reactionTime2,
    failed: gameState.failed,
    startGame,
    updateHand,
    updateHand2,
  }
}
