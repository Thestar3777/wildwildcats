# Wild Wild Cats

A gesture-controlled Wild West duel game where your **hand becomes the controller**.

Built for a hackathon, Wild Wild Cats turns a classic quick-draw showdown into a real-time interactive experience using computer vision.

---

## Demo

https://www.youtube.com/watch?v=C1COtagLgCs
---

## Inspiration

Inspired by the CatHacks Wild West theme, we wanted to create something that felt **interactive, physical, and engaging**—not just another screen-based app.  
We asked: *what if you could play a game using only your hand?*

---

## What It Does

- Players engage in a **quick-draw duel**
- Wait for the countdown…
- React to **“DRAW”**
- Perform a **hand gesture to shoot**
- Get instant feedback:
  - Reaction time
  - Score
  - Rank

Includes a **two-player mode** for competitive gameplay.

---

## How It Works

1. Webcam captures the player’s hand
2. :contentReference[oaicite:0]{index=0} detects hand landmarks in real time
3. Gesture detection logic interprets movement:
   - Draw motion (velocity)
   - Fire gesture (pinch/action)
4. A custom game engine manages states:
   - Waiting → Countdown → Draw → Result
5. The UI updates instantly based on game state

---

## Tech Stack

- **Frontend:** React, Next.js, TypeScript  
- **Styling:** Tailwind CSS  
- **Computer Vision:** :contentReference[oaicite:1]{index=1}  
- **Tools:** Node.js, Git, GitHub  

---

## Challenges

- Handling **noisy hand tracking data**
- Making gesture detection **accurate and responsive**
- Synchronizing **real-time input with game timing**
- Coordinating development across multiple components

---

## Accomplishments

- Built a **fully working real-time gesture game**
- Smooth and responsive gameplay loop
- Functional **two-player mode**
- Clean separation between tracking, logic, and UI

---

## What We Learned

- How to work with **real-time computer vision data**
- Importance of **simplifying inputs** before building logic
- Designing **reactive UIs** tied to live data
- Collaborating effectively under time pressure

---

## What's Next

- Online multiplayer (remote duels)
- Leaderboards and rankings
- Improved gesture accuracy and robustness
- More game modes and polish

---

## Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/your-username/wildwildcats.git
cd wildwildcats
## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

