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
const MIDDLE_MCP = 9     // middle finger base knuckle
const MIDDLE_TIP = 12

// Velocity is scaled by 100 so gestureDetection thresholds land in the 8–15 range
const VELOCITY_SCALE = 100

const FIRE_LATCH_FRAMES = 4    // hold isFiring=true so the 50ms tick always catches it
const HOLSTER_HOLD_FRAMES = 1  // frames the holster pose must be held to arm the draw

// Hip-draw gun: thumb up, finger at camera, ring+pinky curled. Used for BOTH
// players in 2P mode — each detector instance keeps its own state.
const THUMB_UP_MARGIN = 0.03     // thumbTip.y must be this far above wrist.y
const CAMERA_POINT_Z = -0.03     // tip.z - mcp.z must be below this (negative = toward camera)
// Trigger pull: thumb tip falls to within 0.02 of the IP joint. Negative margin
// means we fire BEFORE the tip passes the IP — rest pose sits at Δy ≈ -0.06 to
// -0.09, so any meaningful drop crosses this line.
const TRIGGER_PULL_MARGIN = -0.02

type Lm = { x: number; y: number; z: number }

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

function makeGunDrawDetector(label: string): (lm: Lm[]) => { isFiring: boolean; wasHolstered: boolean } {
  let holsterHoldFrames = 0
  let wasHolstered = false
  let latchFrames = 0

  // Thumb-up gun at hip, index or middle finger pointing at camera, ring+pinky curled.
  // Fire = thumb drops down (trigger pull) while still aiming at camera.
  return (lm: Lm[]) => {
    const wrist = lm[WRIST]

    const indexZDelta = lm[INDEX_TIP].z - lm[INDEX_MCP].z
    const middleZDelta = lm[MIDDLE_TIP].z - lm[MIDDLE_MCP].z

    const thumbUp = lm[THUMB_TIP].y < wrist.y - THUMB_UP_MARGIN
    const fingerAtCamera = indexZDelta < CAMERA_POINT_Z || middleZDelta < CAMERA_POINT_Z
    // Ring/pinky curl checks are unreliable when the fist faces the camera
    // (tips collapse behind MCPs in 2D). Thumb-up + camera-aim is sufficient.
    const inHolsterPose = thumbUp && fingerAtCamera

    if (inHolsterPose) {
      holsterHoldFrames = Math.min(holsterHoldFrames + 1, HOLSTER_HOLD_FRAMES)
      if (holsterHoldFrames >= HOLSTER_HOLD_FRAMES) wasHolstered = true
    } else {
      holsterHoldFrames = 0
    }

    const stillAtCamera = indexZDelta < CAMERA_POINT_Z || middleZDelta < CAMERA_POINT_Z
    const thumbFired = lm[THUMB_TIP].y > lm[THUMB_IP].y + TRIGGER_PULL_MARGIN
    const firePose = wasHolstered && stillAtCamera && thumbFired

    console.log(`[handTracking ${label}] gesture —`, {
      thumbUp, fingerAtCamera, wasHolstered, thumbFired, firePose,
      indexZ: indexZDelta.toFixed(3), middleZ: middleZDelta.toFixed(3),
      thumbTipY: lm[THUMB_TIP].y.toFixed(3), thumbIpY: lm[THUMB_IP].y.toFixed(3),
    })

    if (firePose) {
      latchFrames = FIRE_LATCH_FRAMES
      console.log(`[handTracking ${label}] FIRE — hip draw complete + thumb trigger`)
    } else if (latchFrames > 0) {
      latchFrames--
    }

    return { isFiring: latchFrames > 0, wasHolstered }
  }
}

export type HandCallback = (data: HandData | null) => void
export type TwoPlayerCallback = (p1: HandData | null, p2: HandData | null) => void

export function initHandTracking(
  videoElement: HTMLVideoElement,
  onResult: HandCallback | TwoPlayerCallback,
  players: 1 | 2 = 1
): () => void {
  console.log(`[handTracking] init — ${players}P mode`)

  if (typeof window.Hands === "undefined") {
    console.error("[handTracking] window.Hands not found — MediaPipe CDN script not loaded yet")
    return () => {}
  }
  if (typeof window.Camera === "undefined") {
    console.error("[handTracking] window.Camera not found — camera_utils CDN script not loaded yet")
    return () => {}
  }

  const computeVelocity1 = makeVelocityTracker()
  const checkGesture1 = makeGunDrawDetector("P1")

  // Second tracker and detector only allocated for 2P
  const computeVelocity2 = players === 2 ? makeVelocityTracker() : null
  const checkGesture2 = players === 2 ? makeGunDrawDetector("P2") : null

  const hands = new window.Hands({
    locateFile: (file: string) =>
      `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
  })

  hands.setOptions({
    maxNumHands: players,
    // 2P: full model — the lite model frequently locks onto only one hand.
    // 1P stays on the lite model for lowest latency.
    modelComplexity: players === 2 ? 1 : 0,
    // 2P: looser thresholds so the second hand isn't dropped on partial frames.
    minDetectionConfidence: players === 2 ? 0.5 : 0.7,
    minTrackingConfidence: players === 2 ? 0.5 : 0.6,
  })

  hands.onResults((results: {
    multiHandLandmarks?: Lm[][]
    multiHandedness?: { label: "Left" | "Right"; score: number }[]
  }) => {
    const landmarks = results.multiHandLandmarks ?? []

    if (players === 1) {
      if (!landmarks.length) {
        console.log("[handTracking] no hand detected")
        ;(onResult as HandCallback)(null)
        return
      }
      const lm = landmarks[0]
      const wrist = lm[WRIST]
      const velocity = computeVelocity1(wrist.y)
      const { isFiring, wasHolstered } = checkGesture1(lm)
      const data: HandData = { x: wrist.x, y: wrist.y, velocity, isFiring, wasHolstered }
      console.log("[handTracking] frame →", {
        x: data.x.toFixed(3), y: data.y.toFixed(3),
        velocity: data.velocity.toFixed(2), isFiring, wasHolstered,
      })
      ;(onResult as HandCallback)(data)
      return
    }

    // 2P: assign by horizontal position — leftmost hand on screen → P1,
    // rightmost → P2. MediaPipe's array order is unstable (it can swap when
    // both hands are detected at similar confidence), but x-position is a
    // physical anchor: as long as the players don't cross arms, the
    // assignment is stable. Players know who's who by where they stand.
    const sorted = [...landmarks].sort(
      (a, b) => a[WRIST].x - b[WRIST].x
    )

    let p1Data: HandData | null = null
    let p2Data: HandData | null = null

    if (sorted.length >= 1) {
      const lm1 = sorted[0]
      const wrist1 = lm1[WRIST]
      const velocity1 = computeVelocity1(wrist1.y)
      const { isFiring: f1, wasHolstered: h1 } = checkGesture1(lm1)
      p1Data = { x: wrist1.x, y: wrist1.y, velocity: velocity1, isFiring: f1, wasHolstered: h1 }
    }

    if (sorted.length >= 2 && checkGesture2 && computeVelocity2) {
      const lm2 = sorted[1]
      const wrist2 = lm2[WRIST]
      const velocity2 = computeVelocity2(wrist2.y)
      const { isFiring: f2, wasHolstered: h2 } = checkGesture2(lm2)
      p2Data = { x: wrist2.x, y: wrist2.y, velocity: velocity2, isFiring: f2, wasHolstered: h2 }
    }

    console.log("[handTracking 2P] frame →",
      `count=${landmarks.length}`,
      "P1:", p1Data ? `y=${p1Data.y.toFixed(2)} fire=${p1Data.isFiring} holstered=${p1Data.wasHolstered}` : "null",
      "P2:", p2Data ? `y=${p2Data.y.toFixed(2)} fire=${p2Data.isFiring} holstered=${p2Data.wasHolstered}` : "null",
    )

    ;(onResult as TwoPlayerCallback)(p1Data, p2Data)
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
