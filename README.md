# Credo Motion Lab

A small Next.js portfolio for interactive Credo motion studies. The first study ports the loyalty prototype to a React component and keeps the DialKit timeline for inspecting timing.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. The studies index is at `/`; the loyalty prototype is at `/studies/loyalty`.

The full China transfer prototype is at `/studies/transfers`. Choose China,
then Alipay or WechatPay, enter a preset/custom amount, review and confirm.
The small **Demo result** selector outside the phone lets you inspect Success,
Pending and Unsuccessful outcomes. Amounts are sample USD values and no money
is moved. Pending can be checked again after choosing a different demo outcome.
Closing the tray keeps the current demo visible under Recent transfer.

**Show timeline** inspects the most recent transition. Comma/period step frames
when focus is outside amount entry; inside the custom keypad, period enters a
decimal. Small authoring viewports can scroll so phone tap targets stay usable.

Run `npm test` for amount handling, response cancellation and motion checks.

## Automatic payments

Study04 is at `/studies/automatic-payments`. Enter a GEL amount, continue to
the monthly calendar and drag the slider to select a date or Last Day.
Use this day returns to the amount screen with the selection retained.
Show timeline scrubs the tray transition; the calendar slider stays interactive.
This study focuses on amount/date selection and does not activate a payment.

## Add a study

Read the [Credo motion guide](docs/motion-guide.md) for interaction principles and
lessons from existing studies. Project instructions in `AGENTS.md` route future
animation work to that guide.

1. Add a route under `app/studies/your-study/page.jsx`.
2. Build its interactive component under `components/` and place assets in `public/assets/`.
3. Add its title, description, and route to `content/studies.js`.

The loyalty study keeps its styles in `app/studies/loyalty/loyalty.css` and animation code in `components/LoyaltyStudy.jsx`. Its DialKit timeline can be scrubbed, and `,` and `.` step one frame backward or forward.

## Deploy

Push this folder as the root of a GitHub repository, then import the repository in Vercel. Vercel detects Next.js automatically; its default build command and output settings are sufficient. Run `npm run build` before pushing to check the production build.
