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

// Landmark indices used by MediaPipe Hands
const WRIST = 0
const THUMB_TIP = 4
const INDEX_TIP = 8
const MIDDLE_TIP = 12

// 0.12 is forgiving enough for a fast pinch without too many false positives
const PINCH_THRESHOLD = 0.12

// Velocity is scaled by 100 so gestureDetection thresholds land in the 8–15 range
const VELOCITY_SCALE = 100

// Hold isFiring=true for this many frames after a pinch so the 50ms game tick catches it
const FIRE_LATCH_FRAMES = 4

function makeVelocityTracker() {
  let prevY: number | null = null
  return (currentY: number): number => {
    if (prevY === null) { prevY = currentY; return 0 }
    // Positive = moving UP (lower Y = higher on screen, so prevY - currentY > 0)
    const v = (prevY - currentY) * VELOCITY_SCALE
    prevY = currentY
    return v
  }
}

function makeFireDetector() {
  let latchFrames = 0
  return (landmarks: { x: number; y: number }[]): boolean => {
    const thumb = landmarks[THUMB_TIP]
    const index = landmarks[INDEX_TIP]
    const middle = landmarks[MIDDLE_TIP]

    // Primary: thumb-to-index. Backup: thumb-to-middle (natural for some people)
    const distIndex = Math.hypot(thumb.x - index.x, thumb.y - index.y)
    const distMiddle = Math.hypot(thumb.x - middle.x, thumb.y - middle.y)

    console.log("[handTracking] pinch distances — index:", distIndex.toFixed(3), "middle:", distMiddle.toFixed(3))

    if (distIndex < PINCH_THRESHOLD || distMiddle < PINCH_THRESHOLD) {
      latchFrames = FIRE_LATCH_FRAMES
      console.log("[handTracking] FIRE detected — index:", distIndex.toFixed(3), "middle:", distMiddle.toFixed(3))
    } else if (latchFrames > 0) {
      latchFrames--
    }

    return latchFrames > 0
  }
}

export function initHandTracking(
  videoElement: HTMLVideoElement,
  onResult: (data: HandData | null) => void
): () => void {
  console.log("[handTracking] init — attaching MediaPipe Hands to video element")

  if (typeof window.Hands === "undefined") {
    console.error("[handTracking] window.Hands not found — MediaPipe CDN script not loaded yet")
    return () => {}
  }
  if (typeof window.Camera === "undefined") {
    console.error("[handTracking] window.Camera not found — camera_utils CDN script not loaded yet")
    return () => {}
  }

  const computeVelocity = makeVelocityTracker()
  const checkFiring = makeFireDetector()

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
      console.log("[handTracking] no hand detected")
      onResult(null)
      return
    }

    const lm = results.multiHandLandmarks[0]
    const wrist = lm[WRIST]
    const velocity = computeVelocity(wrist.y)
    const isFiring = checkFiring(lm)

    const data: HandData = {
      x: wrist.x,
      y: wrist.y,
      velocity,
      isFiring,
    }

    console.log("[handTracking] frame →", {
      x: data.x.toFixed(3),
      y: data.y.toFixed(3),
      velocity: data.velocity.toFixed(2),
      isFiring: data.isFiring,
    })

    onResult(data)
  })

  const camera = new window.Camera(videoElement, {
    onFrame: async () => { await hands.send({ image: videoElement }) },
    width: 640,
    height: 480,
  })

  try {
    camera.start()
    console.log("[handTracking] camera started")
  } catch (err) {
    console.error("[handTracking] camera.start() failed — check browser camera permissions:", err)
  }

  // Return cleanup: stop camera feed and free WASM memory
  return () => {
    console.log("[handTracking] cleanup — stopping camera and closing hands")
    camera.stop()
    hands.close()
  }
}
