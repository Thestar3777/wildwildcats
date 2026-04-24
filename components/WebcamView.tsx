"use client"

import { useEffect, useRef } from "react"
import { initHandTracking } from "@/lib/handTracking"
import type { HandData } from "@/types/game"

interface Props {
  onHandData: (data: HandData | null) => void
  active: boolean
}

// Loads MediaPipe CDN scripts once, then starts the camera.
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

export default function WebcamView({ onHandData, active }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const cleanupRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    if (!active || !videoRef.current) return

    let cancelled = false

    async function start() {
      for (const src of CDN_SCRIPTS) await loadScript(src)
      if (cancelled || !videoRef.current) return
      cleanupRef.current = initHandTracking(videoRef.current, onHandData)
    }

    start()

    return () => {
      cancelled = true
      cleanupRef.current?.()
      cleanupRef.current = null
    }
  }, [active, onHandData])

  return (
    <div className="relative w-[640px] h-[480px] bg-black rounded-lg overflow-hidden">
      {/* Mirror the feed so it feels natural */}
      <video
        ref={videoRef}
        className="w-full h-full object-cover scale-x-[-1]"
        autoPlay
        muted
        playsInline
      />
    </div>
  )
}
