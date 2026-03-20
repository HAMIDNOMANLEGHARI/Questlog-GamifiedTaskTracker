# 🎮 QuestLog (Gamified Productivity App)

Yo! Welcome to the repo. So basically, I got tired of boring to-do lists that just stare at you and make you feel bad, so I decided to build a gamified productivity app where you literally level up in real life by doing your tasks. Think of it like a mix of an RPG and an organized calendar. Grinding productivity should actually be fun, right?

### 🌟 Features
- **Task Board & XP System**: Put stuff you need to do, check it off, get XP. Pretty standard but it feels so good to see the progress bar fill up. Complete tasks to level up your character.
- **Global Tavern**: A dope social feed where you can see what other people are grinding on. 
- **Rivalries & Player Search**: Ngl this is my favorite part. You can search other players and start rivalries. Good ol' competitive motivation for when you're feeling lazy.
- **Smart Quest Generator**: Uses some AI magic to create personalized "quests" and breakdown huge tasks into smaller chunks.
- **Deep Analytics**: Got some dope charts and an activity calendar (kinda like the GitHub contribution graph) so you can track your daily streak.
- **Confetti!**: Because who doesn't like a little celebration when they finish a task? 🎉

### 💻 Tech Stack
I built this using:
- **Next.js 14** (App Router mostly, it's pretty sick)
- **React & TypeScript** (because static typing saves lives, obviously)
- **Tailwind CSS** (for that buttery smooth styling without the headache)
- **Supabase** (for backend, database - it's open source Firebase vibes and I love it)
- **Framer Motion** (for the sweet animations)
- **Zustand** (for state management, way lighter than Redux)

### 🚀 How to Run It Locally
Alright, if you wanna clone this and run it on your own machine, here's the deal:
1. **Clone it**: `git clone <your-repo-url>` 
2. **Install modules**: Drop a quick `npm install` in your terminal.
3. **Environment vars**: Make a `.env.local` file in the root. You'll need your Supabase `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`, plus whatever API keys you need for the AI (like Google Gemini).
4. **Boot it up**: Run `npm run dev` and hit up `http://localhost:3000` in your browser.

### 🧠 My Approach & Code Overview
Honestly, the approach was basically "make productivity less painful by adding dopamine hits." 

I started by setting up the core layout (`src/app/dashboard/layout.tsx`) and the main sidebar so you can navigate around easily. Then I wired up the internal state with Zustand for real-time updates on XP and levels.

The `TaskBoard.tsx` handles the main interactions. Once you complete a task, the confetti pops using `canvas-confetti` (because why not?) and your XP goes up.

The `GlobalTavern.tsx` and `RivalWidget.tsx` are where the social features chill. I wanted it to feel alive, like you're in a guild or something, hence the "Tavern" naming. I set up player search (`PlayerSearch.tsx`) so you can actually find your friends and rival them.

I structured it so that Server Components do the heavy lifting for data fetching where possible, and Client Components (`"use client"`) handle the interactivity (the Framer Motion stuff, the charts, state updates). 

Enjoy exploring the code! If you find any bugs... well, let's just call them unannounced features for now. Just kidding, submit a PR if you want. Peace! ✌️
