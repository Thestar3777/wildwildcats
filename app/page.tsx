"use client"

import { useGame } from "@/hooks/useGame"
import WebcamView from "@/components/WebcamView"
import GameOverlay from "@/components/GameOverlay"

export default function Home() {
  const { phase, countdown, gesture, reactionTime, failed, startGame, updateHand } = useGame()

  const cameraActive = phase !== "WAITING"

  return (
    <main className="min-h-screen bg-[#1a0a00] flex flex-col items-center justify-center gap-6 p-4">
      <h1 className="text-yellow-400 text-4xl font-black tracking-widest drop-shadow">
        🤠 WILD WEST QUICK DRAW
      </h1>

      <div className="relative">
        <WebcamView onHandData={updateHand} active={cameraActive} />
        <GameOverlay
          phase={phase}
          countdown={countdown}
          gesture={gesture}
          reactionTime={reactionTime}
          failed={failed}
          onStart={startGame}
        />
      </div>

      <p className="text-yellow-700 text-sm">
        {phase === "WAITING" && "Hold your hand in view of the camera, then START"}
        {phase === "COUNTDOWN" && "Hold still — draw on the signal!"}
        {phase === "DRAW" && "Move hand UP fast, then PINCH to fire"}
        {phase === "RESULT" && ""}
      </p>
    </main>
  )
}
