"use client"

import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { IntroCinematic } from "@/components/game/IntroCinematic"
import { LobbyScreen } from "@/components/screens/LobbyScreen"
import { PlayerSelectScreen } from "@/components/screens/PlayerSelectScreen"
import { InstructionsScreen } from "@/components/screens/InstructionsScreen"
import { DuelScreen, type DuelPhase } from "@/components/screens/DuelScreen"
import { ResultScreen } from "@/components/screens/ResultScreen"

type AppState =
  | "INTRO"
  | "LOBBY"
  | "PLAYER_SELECT"
  | "INSTRUCTIONS"
  | "DUEL_WAIT"
  | "DUEL_RUN"
  | "RESULT"

export default function Home() {
  const [state, setState] = useState<AppState>("INTRO")
  const [players, setPlayers] = useState<1 | 2>(1)
  const [duelPhase, setDuelPhase] = useState<DuelPhase>("wait")
  const [countdown, setCountdown] = useState(3)
  const [flash, setFlash] = useState(false)
  const [shake, setShake] = useState(false)
  const [reactionMs, setReactionMs] = useState<number>(0)
  const [reactionMs2, setReactionMs2] = useState<number>(0)
  const [hand, setHand] = useState({ x: 0.5, y: 0.5 })

  const timersRef = useRef<number[]>([])
  const drawAtRef = useRef<number>(0)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Mock hand drift animation
  useEffect(() => {
    let raf = 0
    const start = performance.now()
    const tick = (t: number) => {
      const dt = (t - start) / 1000
      setHand({
        x: 0.5 + Math.sin(dt * 0.7) * 0.18,
        y: 0.55 + Math.cos(dt * 0.5) * 0.12,
      })
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  const clearTimers = () => {
    timersRef.current.forEach((id) => window.clearTimeout(id))
    timersRef.current = []
  }

  useEffect(() => () => clearTimers(), [])

  const startDuelSequence = () => {
    clearTimers()
    setState("DUEL_RUN")
    setDuelPhase("countdown")
    setCountdown(3)

    const t1 = window.setTimeout(() => setCountdown(2), 1000)
    const t2 = window.setTimeout(() => setCountdown(1), 2000)
    const t3 = window.setTimeout(() => setDuelPhase("steady"), 3000)
    const t4 = window.setTimeout(() => {
      setDuelPhase("draw")
      setFlash(true)
      setShake(true)
      drawAtRef.current = performance.now()
      window.setTimeout(() => setFlash(false), 120)
      window.setTimeout(() => setShake(false), 600)

      const t5 = window.setTimeout(() => {
        const mocked = 200 + Math.floor(Math.random() * 450)
        setReactionMs(mocked)
        if (players === 2) {
          let mocked2 = 200 + Math.floor(Math.random() * 450)
          if (mocked2 === mocked) mocked2 += 1
          setReactionMs2(mocked2)
        }
        setState("RESULT")
      }, 800 + Math.random() * 600)
      timersRef.current.push(t5)
    }, 3000 + 1500 + Math.random() * 2500)
    timersRef.current.push(t1, t2, t3, t4)
  }

  const goLobby = () => {
    clearTimers()
    setState("LOBBY")
    setDuelPhase("wait")
  }

  return (
    <main className="relative min-h-screen w-full overflow-hidden">
      <AnimatePresence mode="wait">
        {state === "INTRO" && (
          <IntroCinematic key="intro" onEnter={() => setState("LOBBY")} />
        )}

        {state === "LOBBY" && (
          <ScreenWrap key="lobby">
            <LobbyScreen
              onOnePlayer={() => {
                setPlayers(1)
                setState("INSTRUCTIONS")
              }}
              onTwoPlayers={() => {
                setPlayers(2)
                setState("PLAYER_SELECT")
              }}
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
                onClick={startDuelSequence}
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
              reactionMs={reactionMs}
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
