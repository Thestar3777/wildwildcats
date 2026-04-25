"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import type { HandData, GameState } from "@/types/game"
import { detectGesture } from "@/lib/gestureDetection"
import { tickGameEngine, getInitialState, getDrawDelay } from "@/lib/gameEngine"

const COUNTDOWN_SECONDS = 3

export function useGame() {
  const [gameState, setGameState] = useState<GameState>(getInitialState)
  const handRef = useRef<HandData | null>(null)
  const drawSignalTimeRef = useRef<number | null>(null)

  // Called every frame from handTracking
  const updateHand = useCallback((data: HandData | null) => {
    handRef.current = data
  }, [])

  // Tick loop: runs every ~50ms to process gesture → engine
  useEffect(() => {
    if (gameState.phase === "WAITING" || gameState.phase === "RESULT") return

    const id = setInterval(() => {
      setGameState(prev => {
        const gesture = detectGesture(handRef.current, prev.phase)
        if (prev.phase === "DRAW" && gesture === "FIRED") {
          playGunshot()
        }
        return tickGameEngine(prev, gesture, drawSignalTimeRef.current, Date.now())
      })
    }, 50)

    return () => clearInterval(id)
  }, [gameState.phase])

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
    setGameState({ ...getInitialState(), phase: "COUNTDOWN", countdown: COUNTDOWN_SECONDS })
  }, [])

  const playGunshot = () => {
  const audio = new Audio("/sounds/33276__mastafx__shot.wav")
  audio.play()
  }

  return {
    phase: gameState.phase,
    countdown: gameState.countdown,
    gesture: gameState.gesture,
    reactionTime: gameState.reactionTime,
    failed: gameState.failed,
    startGame,
    updateHand,
  }
}
