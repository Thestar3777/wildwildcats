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
const THUMB_IP = 3       // thumb knuckle closest to tip
const THUMB_TIP = 4
const INDEX_MCP = 5      // index finger base knuckle
const INDEX_TIP = 8

// Velocity is scaled by 100 so gestureDetection thresholds land in the 8–15 range
const VELOCITY_SCALE = 100

// Index finger counts as "horizontal" when tip and base knuckle are within this Y distance.
// 0.65 accommodates natural gun-pose camera angles (observed real values ~0.60).
const INDEX_HORIZ_TOLERANCE = 0.65
// Index finger must be at least this long to count as extended (not curled)
const INDEX_MIN_EXTENSION = 0.10
// Thumb tip must drop this far past its IP joint to register as "fired"
const THUMB_DOWN_MARGIN = 0.02
// Hold isFiring=true for this many frames so the 50ms game tick always catches it
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
  return (lm: { x: number; y: number }[]): boolean => {
    // Index horizontal: tip and base knuckle at the same height in frame
    const indexVertDiff = Math.abs(lm[INDEX_TIP].y - lm[INDEX_MCP].y)
    const indexExtension = Math.hypot(
      lm[INDEX_TIP].x - lm[INDEX_MCP].x,
      lm[INDEX_TIP].y - lm[INDEX_MCP].y
    )
    const indexGun = indexVertDiff < INDEX_HORIZ_TOLERANCE && indexExtension > INDEX_MIN_EXTENSION

    // Thumb pulled down: tip drops past its IP joint toward the palm
    const thumbFired = lm[THUMB_TIP].y > lm[THUMB_IP].y + THUMB_DOWN_MARGIN

    console.log("[handTracking] gesture —", {
      indexDiff: indexVertDiff.toFixed(3),
      indexExt: indexExtension.toFixed(3),
      thumbTipY: lm[THUMB_TIP].y.toFixed(3),
      thumbIPY: lm[THUMB_IP].y.toFixed(3),
      gunShape: indexGun,
      thumbFired,
    })

    if (indexGun && thumbFired) {
      latchFrames = FIRE_LATCH_FRAMES
      console.log("[handTracking] FIRE — gun shape + thumb down")
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

  let closed = false

  const camera = new window.Camera(videoElement, {
    onFrame: async () => {
      if (closed) return
      await hands.send({ image: videoElement })
    },
    width: 640,
    height: 480,
  })

  camera.start()
    .then(() => console.log("[handTracking] camera started"))
    .catch((err: unknown) => console.error("[handTracking] camera.start() failed — check browser camera permissions:", err))

  // Return cleanup: guard flag prevents in-flight onFrame from hitting closed WASM
  return () => {
    console.log("[handTracking] cleanup — stopping camera and closing hands")
    closed = true
    camera.stop()
    hands.close()
  }
}
