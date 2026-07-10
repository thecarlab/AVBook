# Introduction to Autonomous Driving

This repository accompanies *Introduction to Autonomous Driving* by Weisong Shi and Yuankai He. It contains chapter examples, ROS 2 workspaces, course projects, lecture material, and a browser-based learning companion.

## Autonomous Driving Lab

The static learning companion covers all 14 chapters in `AutonomousDrivingBook.pdf` and includes:

- eight browser labs in the chapters where a compact, authentic evidence source supports a meaningful analysis;
- recorded road video and CAN, IMU, GNSS, fused-pose, V2X, CAN-attack, incident-report, and deployment-event data;
- source, retrieval date, transformation, license, and limitations beside every evidence snapshot;
- a 100-question multiple-choice bank per chapter;
- a fresh set of 10 case-based questions balanced across application, diagnosis, comparison, causal reasoning, and transfer;
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

## Lab scope and dataset attribution

The site deliberately omits labs from Chapters 1, 2, 5, 7, 10, and 14. A chapter is left without a lab when the repository does not contain a compact, licensable source that supports a defensible analytical task. The site does not substitute synthetic points or decorative sliders.

The retained labs use compact snapshots from [comma2k19](https://github.com/commaai/comma2k19), the [Tampa Connected Vehicle Pilot](https://data.transportation.gov/Automobiles/Tampa-CV-Pilot-Basic-Safety-Message-BSM-Sample/nm7w-nvbm), the [ROAD CAN Intrusion Dataset](https://zenodo.org/records/10462796), [NHTSA Standing General Order incident reports](https://www.nhtsa.gov/es/node/103486), and the [CASSI UNC Charlotte shuttle pilot](https://catalog.data.gov/dataset/cassi-at-unc-charlotte-disengagement). Full attribution and limitations are in `web/public/data/real/ATTRIBUTION.md`; `web/scripts/prepare_real_data.py` reproduces the JSON snapshots from their primary sources.

## GitHub Pages deployment

The workflow at `.github/workflows/pages.yml` tests and builds the app, uploads `web/dist/`, and deploys it through GitHub Actions whenever relevant files change on `main`. Repository Pages must use **GitHub Actions** as its source.

The Vite app uses relative assets and hash-based routes, so chapter URLs work correctly under the `/AVBook/` project path without server-side route rewrites.

## Source layout

- `web/` — React, TypeScript, and Vite learning companion
- `Chapter1/` … `Chapter13/` — chapter-specific examples and ROS 2 material
- `Projects/` — course projects and sample answers
- `LecturePresentations/` — lecture decks and supporting assets
- `AutonomousDrivingBook.pdf` — local, ignored authoritative source used to prepare chapter and quiz content
