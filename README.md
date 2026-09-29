# Credo Motion Lab

A small Next.js portfolio for interactive Credo motion studies. The first study ports the loyalty prototype to a React component and keeps the DialKit timeline for inspecting timing.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. The studies index is at `/`; the loyalty prototype is at `/studies/loyalty`.

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
