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
const RING_MCP = 13      // ring finger base knuckle
const RING_TIP = 16
const PINKY_MCP = 17     // pinky base knuckle
const PINKY_TIP = 20

// Velocity is scaled by 100 so gestureDetection thresholds land in the 8–15 range
const VELOCITY_SCALE = 100

// Shared
const FIRE_LATCH_FRAMES = 4    // hold isFiring=true so the 50ms tick always catches it
const HOLSTER_HOLD_FRAMES = 1  // frames the holster pose must be held to arm the draw

// 1P: western hip-draw (thumb up, finger at camera, ring+pinky curled)
const THUMB_UP_MARGIN = 0.03     // thumbTip.y must be this far above wrist.y
const CAMERA_POINT_Z = -0.03     // tip.z - mcp.z must be below this (negative = toward camera)
const TRIGGER_PULL_MARGIN = 0.02 // thumbTip.y must exceed thumbIP.y by this

// 2P: flat hand parallel to screen
const HOLSTER_Y_MIN_2P = 0.55   // wrist must be this low on screen to be "holstered"
const FLAT_HAND_TOLERANCE = 0.12 // max |tip.y - mcp.y| for all fingers (holster check)
const FLAT_HAND_FIRE_TOL = 0.15  // same check, more lenient at fire height
const RAISE_Y_MAX = 0.45         // wrist must rise above this Y (lower value) to fire
const FLAT_CAMERA_Z = -0.03      // tip.z - mcp.z must stay above this (not pointing at camera)

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

function makeGunDrawDetector(mode: 1 | 2): (lm: Lm[]) => { isFiring: boolean; wasHolstered: boolean } {
  let holsterHoldFrames = 0
  let wasHolstered = false
  let latchFrames = 0

  if (mode === 1) {
    // 1P: thumb-up gun at hip, index or middle finger pointing at camera, ring+pinky curled.
    // Fire = thumb drops down (trigger pull) while still aiming at camera.
    return (lm: Lm[]) => {
      const wrist = lm[WRIST]

      const indexZDelta = lm[INDEX_TIP].z - lm[INDEX_MCP].z
      const middleZDelta = lm[MIDDLE_TIP].z - lm[MIDDLE_MCP].z

      // Holster pose: thumb up + finger aimed at camera + ring/pinky curled down toward palm.
      // hipLevel is not enforced here — the velocity-based DRAWING state in gestureDetection
      // handles "came off hip". We only need the gun shape to arm the detector.
      const thumbUp = lm[THUMB_TIP].y < wrist.y - THUMB_UP_MARGIN
      const fingerAtCamera = indexZDelta < CAMERA_POINT_Z || middleZDelta < CAMERA_POINT_Z
      // Curled: tip drops below base knuckle (tip.y > mcp.y in screen coords where y=0 is top)
      const ringCurled = lm[RING_TIP].y > lm[RING_MCP].y
      const pinkyCurled = lm[PINKY_TIP].y > lm[PINKY_MCP].y
      // Ring/pinky Y-curl checks are unreliable when the fist faces the camera
      // (tips collapse behind MCPs in 2D). Thumb-up + camera-aim is sufficient.
      const inHolsterPose = thumbUp && fingerAtCamera

      if (inHolsterPose) {
        holsterHoldFrames = Math.min(holsterHoldFrames + 1, HOLSTER_HOLD_FRAMES)
        if (holsterHoldFrames >= HOLSTER_HOLD_FRAMES) wasHolstered = true
      } else {
        holsterHoldFrames = 0
      }

      // Fire pose: still aiming at camera + thumb trigger pulled + wasHolstered.
      // Ring/pinky not re-checked here — they shift naturally when the thumb drops,
      // and curl was already verified when the holster was armed.
      const stillAtCamera = indexZDelta < CAMERA_POINT_Z || middleZDelta < CAMERA_POINT_Z
      const thumbFired = lm[THUMB_TIP].y > lm[THUMB_IP].y + TRIGGER_PULL_MARGIN
      const firePose = wasHolstered && stillAtCamera && thumbFired

      console.log("[handTracking 1P] gesture —", {
        thumbUp, fingerAtCamera, ringCurled, pinkyCurled,
        wasHolstered, thumbFired, firePose,
        indexZ: indexZDelta.toFixed(3), middleZ: middleZDelta.toFixed(3),
      })

      if (firePose) {
        latchFrames = FIRE_LATCH_FRAMES
        console.log("[handTracking 1P] FIRE — hip draw complete + thumb trigger")
      } else if (latchFrames > 0) {
        latchFrames--
      }

      return { isFiring: latchFrames > 0, wasHolstered }
    }
  }

  // 2P: flat hand parallel to screen, raise from hip to fire.
  return (lm: Lm[]) => {
    const wrist = lm[WRIST]

    // Flat hand: all finger tips at approximately the same Y as their MCPs/PIPs
    const flatIndex = Math.abs(lm[INDEX_TIP].y - lm[INDEX_MCP].y) < FLAT_HAND_TOLERANCE
    const flatMiddle = Math.abs(lm[MIDDLE_TIP].y - lm[MIDDLE_MCP].y) < FLAT_HAND_TOLERANCE
    const flatRing = Math.abs(lm[RING_TIP].y - lm[RING_MCP].y) < FLAT_HAND_TOLERANCE
    const flatPinky = Math.abs(lm[PINKY_TIP].y - lm[PINKY_MCP].y) < FLAT_HAND_TOLERANCE
    const flatHand = flatIndex && flatMiddle && flatRing && flatPinky

    // Not pointing at camera: fingers parallel to screen (z delta near zero or positive)
    const notAtCamera =
      (lm[INDEX_TIP].z - lm[INDEX_MCP].z) > FLAT_CAMERA_Z &&
      (lm[MIDDLE_TIP].z - lm[MIDDLE_MCP].z) > FLAT_CAMERA_Z

    const inHolsterPose = wrist.y > HOLSTER_Y_MIN_2P && flatHand && notAtCamera

    if (inHolsterPose) {
      holsterHoldFrames = Math.min(holsterHoldFrames + 1, HOLSTER_HOLD_FRAMES)
      if (holsterHoldFrames >= HOLSTER_HOLD_FRAMES) wasHolstered = true
    } else {
      holsterHoldFrames = 0
    }

    // Fire: raised past midscreen + flat hand maintained + wasHolstered
    const raised = wrist.y < RAISE_Y_MAX
    const flatAtFire =
      Math.abs(lm[INDEX_TIP].y - lm[INDEX_MCP].y) < FLAT_HAND_FIRE_TOL &&
      Math.abs(lm[MIDDLE_TIP].y - lm[MIDDLE_MCP].y) < FLAT_HAND_FIRE_TOL
    const firePose2P = wasHolstered && raised && flatAtFire

    console.log("[handTracking 2P] gesture —", {
      flatHand, notAtCamera, inHolsterPose, wasHolstered, raised, flatAtFire, firePose2P,
      wristY: wrist.y.toFixed(3),
    })

    if (firePose2P) {
      latchFrames = FIRE_LATCH_FRAMES
      console.log("[handTracking 2P] FIRE — flat hand raised past midscreen")
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
  const checkGesture1 = makeGunDrawDetector(players)

  // Second tracker and detector only allocated for 2P
  const computeVelocity2 = players === 2 ? makeVelocityTracker() : null
  const checkGesture2 = players === 2 ? makeGunDrawDetector(2) : null

  const hands = new window.Hands({
    locateFile: (file: string) =>
      `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
  })

  hands.setOptions({
    maxNumHands: players,
    modelComplexity: 0, // fastest model for low latency
    minDetectionConfidence: 0.7,
    minTrackingConfidence: 0.6,
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

    // 2P: index 0 → P1, index 1 → P2. Each player's hand is identified by position in the
    // multiHandLandmarks array (consistent frame-to-frame once MediaPipe locks on).
    let p1Data: HandData | null = null
    let p2Data: HandData | null = null

    if (landmarks.length >= 1) {
      const lm1 = landmarks[0]
      const wrist1 = lm1[WRIST]
      const velocity1 = computeVelocity1(wrist1.y)
      const { isFiring: f1, wasHolstered: h1 } = checkGesture1(lm1)
      p1Data = { x: wrist1.x, y: wrist1.y, velocity: velocity1, isFiring: f1, wasHolstered: h1 }
    }

    if (landmarks.length >= 2 && checkGesture2 && computeVelocity2) {
      const lm2 = landmarks[1]
      const wrist2 = lm2[WRIST]
      const velocity2 = computeVelocity2(wrist2.y)
      const { isFiring: f2, wasHolstered: h2 } = checkGesture2(lm2)
      p2Data = { x: wrist2.x, y: wrist2.y, velocity: velocity2, isFiring: f2, wasHolstered: h2 }
    }

    console.log("[handTracking 2P] frame →",
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
