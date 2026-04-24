// Wraps MediaPipe Hands + webcam and streams simplified HandData every frame.
// Call initHandTracking once, then subscribe via onResult callback.

import type { HandData } from "@/types/game"

// MediaPipe types are global after the CDN scripts load; declare minimal shapes.
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Hands: any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Camera: any
  }
}

let prevY: number | null = null

function computeVelocity(currentY: number): number {
  if (prevY === null) { prevY = currentY; return 0 }
  // Positive velocity = moving UP (lower Y value = higher on screen)
  const v = (prevY - currentY) * 100 // scale to readable range
  prevY = currentY
  return v
}

// Pinch: thumb tip (4) close to index tip (8)
function detectFiring(landmarks: { x: number; y: number }[]): boolean {
  const thumb = landmarks[4]
  const index = landmarks[8]
  const dist = Math.hypot(thumb.x - index.x, thumb.y - index.y)
  return dist < 0.07 // threshold tuned for 640px feed
}

export function initHandTracking(
  videoElement: HTMLVideoElement,
  onResult: (data: HandData | null) => void
): () => void {
  const hands = new window.Hands({
    locateFile: (file: string) =>
      `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
  })

  hands.setOptions({
    maxNumHands: 1,
    modelComplexity: 0, // fastest model for low latency
    minDetectionConfidence: 0.7,
    minTrackingConfidence: 0.6,
  })

  hands.onResults((results: { multiHandLandmarks?: { x: number; y: number; z: number }[][] }) => {
    if (!results.multiHandLandmarks?.length) {
      onResult(null)
      return
    }
    const lm = results.multiHandLandmarks[0]
    // Use wrist (0) as the primary position anchor
    const wrist = lm[0]
    const velocity = computeVelocity(wrist.y)
    onResult({
      x: wrist.x,
      y: wrist.y,
      velocity,
      isFiring: detectFiring(lm),
    })
  })

  const camera = new window.Camera(videoElement, {
    onFrame: async () => { await hands.send({ image: videoElement }) },
    width: 640,
    height: 480,
  })

  camera.start()

  // Return cleanup function
  return () => { camera.stop(); hands.close() }
}
