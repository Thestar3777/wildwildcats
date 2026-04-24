"use client"

import type { GamePhase, GestureState } from "@/types/game"

interface Props {
  phase: GamePhase
  countdown: number
  gesture: GestureState
  reactionTime: number | null
  failed: boolean
  onStart: () => void
}

function ratingFor(ms: number): string {
  if (ms < 250) return "LEGENDARY"
  if (ms < 400) return "QUICK"
  if (ms < 600) return "STEADY"
  return "SLOW POKE"
}

export default function GameOverlay({ phase, countdown, gesture, reactionTime, failed, onStart }: Props) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">

      {phase === "WAITING" && (
        <button
          className="pointer-events-auto bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-2xl px-8 py-4 rounded-xl shadow-lg transition"
          onClick={onStart}
        >
          START DUEL
        </button>
      )}

      {phase === "COUNTDOWN" && (
        <div className="text-white text-center">
          <p className="text-xl mb-2 opacity-70">Keep your hand still…</p>
          <p className="text-8xl font-black drop-shadow-lg">
            {countdown > 0 ? countdown : "…"}
          </p>
        </div>
      )}

      {phase === "DRAW" && gesture !== "FIRED" && (
        <p className="text-yellow-400 text-8xl font-black animate-pulse drop-shadow-lg">
          DRAW!
        </p>
      )}

      {phase === "DRAW" && gesture === "DRAWING" && (
        <p className="text-white text-2xl mt-4">Now FIRE! (pinch)</p>
      )}

      {phase === "RESULT" && (
        <div className="bg-black/80 rounded-2xl p-8 text-center text-white pointer-events-auto">
          {failed ? (
            <>
              <p className="text-red-500 text-6xl font-black">TOO EARLY!</p>
              <p className="text-gray-300 mt-2">You flinched before the signal.</p>
            </>
          ) : (
            <>
              <p className="text-yellow-400 text-5xl font-black">{reactionTime}ms</p>
              <p className="text-2xl mt-1">{reactionTime !== null ? ratingFor(reactionTime) : ""}</p>
            </>
          )}
          <button
            className="mt-6 bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-xl px-6 py-3 rounded-xl transition"
            onClick={onStart}
          >
            PLAY AGAIN
          </button>
        </div>
      )}
    </div>
  )
}
