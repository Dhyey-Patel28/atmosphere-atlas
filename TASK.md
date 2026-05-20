# Current Task

## Task

Prepare app for deployment.

## Goal

Make sure Atmosphere Atlas is ready for a first public deployment.

## Requirements

- Verify production build works.
- Verify app title and favicon are correct.
- Verify no accidental large/archive files are tracked.
- Verify public assets are referenced correctly.
- Verify README is presentable enough for GitHub.
- Verify no API keys or secrets are used.
- Verify app works with Vite static hosting.
- Do not add new features.
- Do not install packages.
- Do not delete files unless clearly removing accidental artifacts.
- Do not change app logic.
- Do not deploy automatically.

## Files likely to edit

- README.md
- package.json only if absolutely necessary
- index.html only if needed
- TASK.md

## Done when

- npm run build works
- git status is clean after commit
- README explains what the app is
- App is ready to deploy on Vercel, Netlify, or Cloudflare Pages