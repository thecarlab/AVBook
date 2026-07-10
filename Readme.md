# Introduction to Autonomous Driving

This repository accompanies *Introduction to Autonomous Driving* by Weisong Shi and Yuankai He. It contains chapter examples, ROS 2 workspaces, course projects, lecture material, and a browser-based learning companion.

## Autonomous Driving Lab

The static learning companion covers all 14 chapters in `AutonomousDrivingBook.pdf` and includes:

- two interactive, browser-only demonstrations per chapter;
- a 100-question multiple-choice bank per chapter;
- a fresh random set of 10 questions for each quiz attempt;
- independently shuffled answer choices;
- end-of-quiz scoring, correct-answer review, explanations, and book references;
- local course progress saved in the browser.

The deployed site is configured for [GitHub Pages](https://thecarlab.github.io/AVBook/). It has no server or student-data collection.

## Run locally

Node.js 22 or newer is recommended.

```bash
cd web
npm ci
npm run dev
```

Run the complete validation suite with:

```bash
cd web
npm run validate
```

The production build is written to `web/dist/`. The source PDF is intentionally kept local and excluded from Git.

## GitHub Pages deployment

The workflow at `.github/workflows/pages.yml` tests and builds the app, uploads `web/dist/`, and deploys it through GitHub Actions whenever relevant files change on `main`. Repository Pages must use **GitHub Actions** as its source.

The Vite app uses relative assets and hash-based routes, so chapter URLs work correctly under the `/AVBook/` project path without server-side route rewrites.

## Source layout

- `web/` — React, TypeScript, and Vite learning companion
- `Chapter1/` … `Chapter13/` — chapter-specific examples and ROS 2 material
- `Projects/` — course projects and sample answers
- `LecturePresentations/` — lecture decks and supporting assets
- `AutonomousDrivingBook.pdf` — local, ignored authoritative source used to prepare chapter and quiz content
