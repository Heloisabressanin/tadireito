# Tá Direito

Free Brazilian calculators — net salary, overtime and MEI revenue limit — always up to date with the law, with official sources on every result.

> Status: Phase 1 (MVP) built and tested, not deployed yet. UI in Brazilian Portuguese; code and docs in English.

## Stack

- **Next.js 16 (App Router)**, statically generated pages for SEO and speed
- **TypeScript** + **Tailwind CSS 4**
- **Vitest** for the calculation engine, **Playwright** for end-to-end tests (with clock travel) and screenshots
- Hosting: **Vercel** (planned)

## Getting started

```bash
pnpm install
pnpm dev          # http://localhost:3200
```

| Script | What it does |
|---|---|
| `pnpm dev` | Dev server on port 3200 |
| `pnpm build` / `pnpm start` | Production build / serve on port 3200 |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | Route types + `tsc --noEmit` |
| `pnpm test` | Unit tests (Vitest), including the Receita Federal's official examples |
| `pnpm test:e2e` | Browser tests on the production build (run `pnpm build` first), mobile + desktop |
| `pnpm veille` | Check the official sources behind the rules and print a report |
| `pnpm veille:aceitar [id…]` | After review, record the current content of the sources as the new reference |
| `pnpm regras:marcar-verificadas` | Monthly routine: mark current rule versions as verified today (refused if a source changed) |
| `node scripts/screenshots.mjs [baseUrl] [outDir]` | Mobile + desktop screenshots of the main pages |
| `node scripts/gerar-imagens.mjs` | Regenerate app icons and the social share image from the logo |

## Project structure

```
src/app           Pages (one route per calculator)
src/components    Shared UI (logo, header, footer…)
src/lib/calc      Calculation engine — pure functions, no UI dependency
src/data/regras   Versioned legal rules (values, effective dates, official sources)
scripts/veille    Daily watch of official sources (fontes.json, estado.json, instantaneos/)
```

## Core principle

The engine never hardcodes legal values: every rate, bracket and limit lives in `src/data/regras` with its effective dates, official source and last verification date. The engine picks the version in force at the reference date, and the UI warns users when a rule may be outdated.

## Keeping the rules up to date

1. **Every morning** the `Veille des lois` workflow downloads the official pages listed in `scripts/veille/fontes.json`, extracts their content and compares it with the reference in `scripts/veille/estado.json`. It also flags rules close to the 45-day verification limit and scheduled changes.
2. When a human is needed, it opens (or comments on) an issue labelled `veille`, with a diff of the changed lines. GitHub emails the owner.
3. The reviewer updates `src/data/regras/*.json` if a value changed (new dated version, official source, `verificadoEm`), runs `pnpm veille:aceitar`, then commits. CI re-runs every test, including the official examples.

Planalto blocks automated requests, so the watch reads the official copies published by the Câmara dos Deputados; users still get Planalto links.
