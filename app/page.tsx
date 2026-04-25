"use client"

import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { IntroCinematic } from "@/components/game/IntroCinematic"
import { LobbyScreen } from "@/components/screens/LobbyScreen"
import { PlayerSelectScreen } from "@/components/screens/PlayerSelectScreen"
import { InstructionsScreen } from "@/components/screens/InstructionsScreen"
import { DuelScreen, type DuelPhase } from "@/components/screens/DuelScreen"
import { ResultScreen } from "@/components/screens/ResultScreen"
import { useGame } from "@/hooks/useGame"
import { initHandTracking } from "@/lib/handTracking"
import type { HandData } from "@/types/game"

type AppState =
  | "INTRO"
  | "LOBBY"
  | "PLAYER_SELECT"
  | "INSTRUCTIONS"
  | "DUEL_WAIT"
  | "DUEL_RUN"
  | "RESULT"

const CDN_SCRIPTS = [
  "https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js",
  "https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js",
]

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return }
    const s = document.createElement("script")
    s.src = src
    s.crossOrigin = "anonymous"
    s.onload = () => resolve()
    s.onerror = reject
    document.head.appendChild(s)
  })
}

export default function Home() {
  const [state, setState] = useState<AppState>("INTRO")
  const [players, setPlayers] = useState<1 | 2>(1)
  const [flash, setFlash] = useState(false)
  const [shake, setShake] = useState(false)
  const [reactionMs2, setReactionMs2] = useState<number>(0)
  const [hand, setHand] = useState({ x: 0.5, y: 0.5 })

  const videoRef = useRef<HTMLVideoElement>(null)
  const cleanupTrackingRef = useRef<(() => void) | null>(null)
  const prevPhaseRef = useRef<string>("")

  const { phase: gamePhase, countdown, reactionTime, startGame, updateHand } = useGame()

  // Map useGame phase → DuelScreen phase
  const duelPhase: DuelPhase =
    gamePhase === "DRAW" ? "draw"
    : gamePhase === "COUNTDOWN" && countdown === 0 ? "steady"
    : gamePhase === "COUNTDOWN" ? "countdown"
    : "wait"

  // Trigger flash/shake on DRAW, navigate to RESULT when game ends
  useEffect(() => {
    if (prevPhaseRef.current === gamePhase) return
    prevPhaseRef.current = gamePhase

    if (gamePhase === "DRAW") {
      setFlash(true)
      setShake(true)
      window.setTimeout(() => setFlash(false), 120)
      window.setTimeout(() => setShake(false), 600)
    }

    if (gamePhase === "RESULT") {
      if (players === 2) {
        const r = reactionTime ?? 9999
        let m2 = 200 + Math.floor(Math.random() * 450)
        if (m2 === r) m2 += 1
        setReactionMs2(m2)
      }
      setState("RESULT")
    }
  }, [gamePhase, players, reactionTime])

  // Load CDN scripts and start hand tracking for each duel screen.
  // Restarts on every state change so the new <video> ref is picked up
  // after AnimatePresence swaps DUEL_WAIT → DUEL_RUN.
  useEffect(() => {
    if (state !== "DUEL_WAIT" && state !== "DUEL_RUN") return
    let cancelled = false

    async function start() {
      for (const src of CDN_SCRIPTS) await loadScript(src)
      if (cancelled || !videoRef.current) return
      cleanupTrackingRef.current = initHandTracking(
        videoRef.current,
        (data: HandData | null) => {
          updateHand(data)
          if (data) setHand({ x: data.x, y: data.y })
        }
      )
    }

    start()

    return () => {
      cancelled = true
      cleanupTrackingRef.current?.()
      cleanupTrackingRef.current = null
    }
  }, [state, updateHand])

  const goLobby = () => setState("LOBBY")

  return (
    <main className="relative min-h-screen w-full overflow-hidden">
      <AnimatePresence mode="wait">
        {state === "INTRO" && (
          <IntroCinematic key="intro" onEnter={() => setState("LOBBY")} />
        )}

        {state === "LOBBY" && (
          <ScreenWrap key="lobby">
            <LobbyScreen
              onOnePlayer={() => { setPlayers(1); setState("INSTRUCTIONS") }}
              onTwoPlayers={() => { setPlayers(2); setState("PLAYER_SELECT") }}
            />
          </ScreenWrap>
        )}

        {state === "PLAYER_SELECT" && (
          <ScreenWrap key="player-select">
            <PlayerSelectScreen
              onReady={() => setState("INSTRUCTIONS")}
              onBack={goLobby}
            />
          </ScreenWrap>
        )}

        {state === "INSTRUCTIONS" && (
          <ScreenWrap key="instructions">
            <InstructionsScreen players={players} onContinue={() => setState("DUEL_WAIT")} />
          </ScreenWrap>
        )}

        {state === "DUEL_WAIT" && (
          <ScreenWrap key="duel-wait">
            <DuelScreen phase="wait" hand={hand} players={players} videoRef={videoRef}>
              <button
                onClick={() => { setState("DUEL_RUN"); startGame() }}
                className="stamp-btn font-display text-2xl tracking-widest px-10 py-4 rounded-md border-2 border-ink/40"
              >
                <span className="relative z-[1]">START DUEL</span>
              </button>
            </DuelScreen>
          </ScreenWrap>
        )}

        {state === "DUEL_RUN" && (
          <ScreenWrap key="duel-run">
            <DuelScreen
              phase={duelPhase}
              countdown={countdown}
              flash={flash}
              shake={shake}
              hand={hand}
              players={players}
              videoRef={videoRef}
            />
          </ScreenWrap>
        )}

        {state === "RESULT" && (
          <ScreenWrap key="result">
            <ResultScreen
              reactionMs={reactionTime ?? 9999}
              reactionMs2={players === 2 ? reactionMs2 : undefined}
              players={players}
              onPlayAgain={() => setState("DUEL_WAIT")}
              onMainMenu={goLobby}
            />
          </ScreenWrap>
        )}
      </AnimatePresence>

      {state !== "INTRO" && state !== "LOBBY" && state !== "PLAYER_SELECT" && (
        <div className="fixed bottom-2 left-0 right-0 text-center font-typewriter text-[10px] tracking-[0.3em] text-parchment/70 z-10 pointer-events-none">
          {players === 2 ? "★ TWO-GUN MODE ★" : "★ LONE WOLF MODE ★"}
        </div>
      )}
    </main>
  )
}

const ScreenWrap = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.35 }}
    className="absolute inset-0"
  >
    {children}
  </motion.div>
)
