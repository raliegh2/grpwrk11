# UTech CTF Hub

A reusable ethical hacking learning platform built for **CNS3005 - Ethical Hacking**, University of Technology Jamaica.

## Features

- **Learn** — 6 topic tracks with lesson notes, examples and self-check quizzes
- **Challenges** — 12 CTF challenges across 3 difficulty tiers (Beginner / Intermediate / Advanced)
- **Jeopardy Board** — 6 categories × 5 point values (100–500 pts)
- **Quizzes** — 3 quizzes, 10 questions each with instant feedback
- **Scoreboard** — Live leaderboard with podium and progress bars
- **Admin Panel** — Add/edit/delete challenges, manage users, reset scores, export JSON
- **Profile** — Per-user stats, badges, category progress, solve history
- **Login / Register** — Auth forms with password strength meter

## Project Structure

```
ctf-hub/
├── index.html          # Main HTML — all pages and modals
├── css/
│   └── styles.css      # All styling — dark hacker theme
├── js/
│   ├── data.js         # All data — challenges, tracks, quizzes, leaderboard
│   └── app.js          # All logic — routing, rendering, interactions
└── assets/             # Place challenge files here (pcap, zip, pdf, txt)
```

## Getting Started

### Run locally
Just open `index.html` in any modern browser — no build step required.

### Deploy to GitHub Pages
1. Push this folder to a GitHub repository
2. Go to **Settings → Pages**
3. Set source to `main` branch, `/ (root)` folder
4. Your site will be live at `https://<username>.github.io/<repo-name>`

## Challenge Categories

| Category | Count |
|----------|-------|
| Web Hacking | 3 |
| Cryptography | 3 |
| Forensics | 2 |
| Reverse Engineering | 2 |
| Network Security | 1 |
| Social Engineering | 2 |

## Difficulty Tiers

| Tier | Challenges | Points Range |
|------|-----------|--------------|
| Beginner | 6 | 75–150 pts |
| Intermediate | 4 | 125–200 pts |
| Advanced | 4 | 300–400 pts |

## Adding New Challenges

Open `js/data.js` and add an object to the `CHALLENGES` array:

```js
{
  id: 13,                          // unique number
  title: 'My New Challenge',
  cat: 'web',                      // web | crypto | forensics | reverse | network | social
  diff: 'beginner',                // beginner | intermediate | advanced
  pts: 100,
  desc: 'Short card description',
  scenario: 'Full challenge prompt shown in the modal',
  files: [{name: 'file.zip', size: '12 KB'}],  // or []
  flag: 'CTF{your_flag_here}',
  hint: 'Optional hint text',
  learned: ['Point 1', 'Point 2', 'Point 3'],
  solves: 0,
  solved: false
}
```

## Tech Stack

- Vanilla HTML / CSS / JavaScript — no frameworks, no dependencies
- Google Fonts (Orbitron, Share Tech Mono, Syne)
- All data is in `js/data.js` — easy to swap for a real backend API

## License

Built for academic use — UTech CNS3005, Semester 2, 2026.
