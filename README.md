# Trust Score MVP — GitHub Authenticity Report

An AI-assisted tool that analyzes a developer's public GitHub history and generates
a "consistency/plausibility" report — useful for freelance clients or employers who
want a second opinion on whether a candidate's claimed work looks authentic.

**This is a signal tool, not a fraud detector.** It never accuses — it surfaces
patterns (commit cadence, message quality, author consistency, timeline plausibility)
and lets a human decide what to do with that context.

## How it works

1. You enter a GitHub username
2. Backend pulls their public, non-fork repos + commit metadata via the GitHub API
3. Rule-based signals are computed (no AI needed for this part — fast and free)
4. Those signals are sent to Groq (free LLM API) which writes a plain-English report
5. Report is saved to a local SQLite DB and shown in the browser

## Setup (5 minutes)

### 1. Get your free API keys

**GitHub token** (raises rate limit from 60→5000 req/hour, optional but recommended):
- Go to https://github.com/settings/tokens → "Generate new token (classic)"
- Scope needed: `public_repo` only
- Copy the token (starts with `ghp_`)

**Groq API key** (free, no credit card):
- Go to https://console.groq.com → sign up → "API Keys" → "Create API Key"
- Copy the key (starts with `gsk_`)

### 2. Configure environment

```bash
cd backend
cp .env.example .env
# open .env and paste your two keys in
```

### 3. Install and run

```bash
cd backend
npm install
npm start
```

Open **http://localhost:3001** in your browser. Enter any public GitHub username and hit Analyze.

## Project structure

```
trust-score-mvp/
├── backend/
│   ├── src/
│   │   ├── server.js      # Express API server
│   │   ├── github.js      # GitHub API client
│   │   ├── analyze.js     # Rule-based signal computation (the "hard" logic)
│   │   ├── groq.js        # AI reasoning layer (Groq API call)
│   │   └── db.js          # SQLite persistence
│   ├── .env.example       # Copy to .env and fill in keys
│   └── package.json
├── frontend/
│   └── index.html         # Single-page UI, no build step needed
└── README.md
```

## What's next (not built yet, for when you extend this)

- Cross-repo code style fingerprinting (tree-sitter AST comparison) — currently only
  language-distribution comparison is implemented
- Shareable public report URLs (the DB schema already supports it via `/api/report/:id`,
  just needs a frontend route)
- Swap Groq → Claude API later for stronger reasoning quality (same JSON schema,
  just change the endpoint in `groq.js` / rename to `ai.js`)
- Auth so freelancers can claim/own their reports (GitHub OAuth is the natural fit)

## Known limitations (be upfront about these if you demo this)

- Only analyzes **public** repos — most real freelance/client work is in private
  repos and is invisible to this tool. This is the biggest honest limitation.
- Signals are correlational, not conclusive — frame results as discussion starters,
  never as verdicts.
- Groq free tier: 30 requests/min, 1,000 requests/day — plenty for demos, not for
  production traffic.
