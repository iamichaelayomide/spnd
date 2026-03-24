# SleepPal (MVP scaffold)

This repo implements the **Onboarding flow (OB-1 → OB-7)** and a minimal tab shell, following the PRD.

## Run locally

```bash
npm install
npm run dev
```

Open the dev URL and you should be dropped into onboarding the first time.

## What’s implemented

- Night-only onboarding theme (forced)
- OB-1 Welcome Splash
- OB-2 Name
- OB-3 Rest goal
- OB-4 Typical nap time
- OB-5 Sound preference
- OB-6 Notification permission request (browser)
- OB-7 All set
- Local storage user profile model + persistence
- Minimal Home/Sleep/PAL/Settings pages + bottom nav

## Routing

For portability, this build uses a tiny hash-router (no external deps):

- `#/onboarding/ob1` ... `#/onboarding/ob7`
- `#/` home
- `#/sleep-data`
- `#/pal`
- `#/settings`

You can later swap this to React Router v6 exactly as in the PRD.
