# GroceryListApp — Architecture

> Status: target architecture. Supersedes `PROJECT_STRUCTURE.md`, which described a
> folder skeleton that was never filled in.
>
> Last updated: 2026-07-27

---

## 1. Goal

A grocery list app whose defining feature is an **AI list-builder**: the user describes
what they need in plain language ("pasta night for 4, plus breakfast this week") and the
app produces a categorized, aisle-sorted, quantified shopping list.

Everything else (auth, CRUD, sync) is table stakes that exists to support that feature.

### Non-goals (explicitly out of scope for v1)

- Multi-user / shared lists
- Price tracking, budgets
- Barcode scanning
- Web deployment (mobile-first; web build is incidental)

---

## 2. Guiding principles

1. **The AI key never touches the client.** All model calls go through a backend the
   client authenticates against. This is non-negotiable and drives the whole topology.
2. **Screens render, they do not fetch.** Data access lives behind a repository layer.
   A screen that imports `firebase/firestore` directly is a bug.
3. **Never trust model output.** Every LLM response is parsed and validated against a
   schema before it can touch application state. Validation failure is a normal,
   handled path — not an exception.
4. **Use AI only where AI is required.** Restock prediction, sorting, and dedup are
   deterministic problems. Solving them with a model is slower, costlier, and worse.
5. **Offline-first.** A grocery list is used inside a supermarket, where signal is
   unreliable. Firestore local persistence is enabled from day one.

---

## 3. System topology

```
┌─────────────────────────────────────┐
│  Expo / React Native client         │
│                                     │
│  app/          expo-router routes   │
│  src/features/ UI + domain logic    │
│  src/data/     repositories         │
└──────┬────────────────────┬─────────┘
       │                    │
       │ Firebase SDK       │ HTTPS + Firebase ID token
       │ (auth + data)      │ (AI only)
       ▼                    ▼
┌──────────────┐   ┌────────────────────────┐
│  Firebase    │   │  AI proxy (serverless) │
│              │   │                        │
│  Auth        │   │  1. verify ID token    │
│  Firestore   │   │  2. rate limit         │
│  (offline    │   │  3. call Claude API    │
│   enabled)   │   │  4. validate + return  │
└──────────────┘   └───────────┬────────────┘
                               │ ANTHROPIC_API_KEY
                               │ (server env only)
                               ▼
                       ┌───────────────┐
                       │  Claude API   │
                       └───────────────┘
```

**Why the proxy exists:** React Native bundles can be extracted from any installed APK.
An API key shipped in the client is a published key. The proxy is also the only place
rate limiting, cost control, and prompt versioning can live.

**Proxy platform:** Vercel serverless function (free tier, no billing setup required).
Firebase Cloud Functions is the alternative if you prefer a single platform, but it
requires the Blaze plan.

---

## 4. Target folder structure

```
app/                              # expo-router — routing ONLY, no logic
├── _layout.tsx                   # AuthProvider + QueryProvider + auth gate
├── (auth)/
│   ├── _layout.tsx
│   ├── login.tsx
│   └── register.tsx
└── (app)/
    ├── _layout.tsx               # tabs
    ├── index.tsx                 # list
    ├── assistant.tsx             # AI entry point
    └── profile.tsx

src/
├── features/                     # vertical slices — the core of the app
│   ├── auth/
│   │   ├── AuthContext.tsx
│   │   ├── LoginScreen.tsx
│   │   └── RegisterScreen.tsx
│   ├── groceries/
│   │   ├── GroceryListScreen.tsx
│   │   ├── components/           # GroceryItemRow, AddItemBar, ...
│   │   ├── hooks/                # useGroceryList, useAddItem
│   │   └── grocery.types.ts
│   └── assistant/
│       ├── AssistantScreen.tsx
│       ├── hooks/useAiParse.ts
│       └── assistant.types.ts
│
├── data/                         # the ONLY place external I/O happens
│   ├── firebase.ts               # SDK init (config from env)
│   ├── groceryRepository.ts      # Firestore CRUD + realtime subscription
│   ├── userRepository.ts
│   └── aiClient.ts               # typed fetch wrapper for the proxy
│
├── domain/                       # pure functions — trivially unit-testable
│   ├── schemas.ts                # Zod: GroceryItem, AiParseResponse
│   ├── categories.ts             # category → aisle order
│   └── restock.ts                # frequency analysis (NO AI)
│
├── ui/                           # design system — dumb, reusable, no domain imports
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Card.tsx
│   └── theme.ts                  # colors, spacing, typography tokens
│
└── lib/
    ├── env.ts
    └── result.ts                 # Result<T, E> for typed error handling

server/                           # deployed separately (Vercel)
└── api/
    ├── parse-list.ts             # POST — NL text → structured items
    └── _lib/
        ├── verifyAuth.ts
        ├── prompts.ts            # versioned prompt templates
        └── anthropic.ts
```

**Dependency rule — strictly one-directional:**

```
app → features → data → (Firebase / AI proxy)
         ↓         ↓
       domain ← ← ←
         ↑
        ui
```

`ui/` and `domain/` import nothing from `features/` or `data/`. If you ever need to
reverse an arrow, the abstraction is wrong.

---

## 5. Data model (Firestore)

```
users/{uid}
  displayName: string
  createdAt: timestamp

users/{uid}/items/{itemId}
  name:       string
  quantity:   number          // default 1
  unit:       string | null   // "kg", "L", "pack"
  category:   Category        // enum, see domain/categories.ts
  purchased:  boolean
  source:     "manual" | "ai"  // ← lets you measure AI feature adoption
  createdAt:  timestamp
  purchasedAt: timestamp | null
```

`purchasedAt` is what makes restock prediction possible later. Record it from day one
even though nothing reads it yet — you cannot retroactively generate history.

`source` lets you answer "what % of items came from the AI?" — a metric worth putting
in your portfolio README.

**Security rules:** a user can read/write only under their own `users/{uid}` subtree.
Write these before the first deploy, not after.

---

## 6. The AI pipeline

```
user text
   ↓
client → POST /api/parse-list   { text }   + Authorization: Bearer <firebase-id-token>
   ↓
proxy: verify token → reject if invalid
   ↓
proxy: rate limit (N requests/user/day)
   ↓
proxy: Claude call, model claude-haiku-4-5-20251001
       structured output enforced via tool-use, not free-form JSON in prose
   ↓
proxy: validate against Zod schema
       ├─ valid   → 200 { items: [...] }
       └─ invalid → one retry, then 422 { error }
   ↓
client: show items in a REVIEW SHEET (never auto-commit)
   ↓
user confirms → batch write to Firestore
```

### Design decisions worth defending in an interview

- **Tool-use over "reply in JSON".** Asking a model for JSON in prose gives you
  markdown fences, preambles, and trailing commas. A tool schema constrains generation
  structurally.
- **Zod validation is not optional.** Schema-constrained output is still not a
  guarantee. Validation is the contract boundary between a probabilistic system and a
  deterministic one.
- **Human-in-the-loop by default.** AI-proposed items land in a review sheet the user
  confirms. Never silently mutate user data from a model response.
- **Haiku, not Sonnet/Opus.** Structured extraction from short text does not need
  frontier reasoning. Picking the cheapest model that clears the bar is an engineering
  decision, not a compromise.
- **Restock prediction uses statistics, not a model.** Mean interval between
  `purchasedAt` timestamps per item name. Deterministic, free, instant, explainable.

### Failure modes and handling

| Failure | Handling |
|---|---|
| Network down | Queue nothing — show "AI needs a connection", manual add still works offline |
| Schema validation fails | One retry with a repair prompt, then surface an error and fall back to manual entry |
| Rate limit hit | Show remaining quota and reset time |
| Ambiguous input ("stuff for dinner") | Model returns a `clarification` field; app asks a follow-up question |

**The app must remain fully usable with the AI feature completely disabled.** Treat it
as an enhancement layer, never a dependency.

---

## 7. Stack changes

### Add

| Package | Purpose |
|---|---|
| `firebase/firestore` | Persistence + realtime + offline (already in the `firebase` package) |
| `zod` | Runtime validation of AI output and Firestore reads |
| `@tanstack/react-query` | Async state: loading/error/cache for AI calls |
| `zustand` | Small client-only UI state (filters, sort) — optional, only if needed |
| `react-native-dotenv` or `app.config.ts` | Move Firebase config out of source |
| `jest` + `@testing-library/react-native` | Tests for `domain/` at minimum |
| `expo-image-picker` | Phase 3 — receipt scanning |
| `expo-speech-recognition` | Phase 3 — voice input |

Server side: `@anthropic-ai/sdk`, `firebase-admin`, `zod`.

### Remove

| Item | Reason |
|---|---|
| `app-example/` | Expo template leftovers, 67 KB of dead code |
| `src/navigation/*` (3 empty files) | expo-router owns navigation; this is a competing paradigm |
| `App.tsx` (empty) | Unused — entry point is `expo-router/entry` |
| `scripts/setup.Env.js` (empty) | Never written |
| `PROJECT_STRUCTURE.md` | Replaced by this document |
| `@react-navigation/bottom-tabs`, `/elements`, `/native` | Only if not used directly — expo-router depends on them transitively |
| All `console.log` in the auth flow | Replace with a proper logger or delete |

### Keep unchanged

Expo SDK 54, React Native 0.81, expo-router 6, TypeScript strict, Firebase Auth. These
are current and correct. Do not churn them.

---

## 8. Build order

Ship in this sequence. Each phase leaves the app in a working state.

### Phase 0 — Fix what's broken (½ day)

- [ ] Delete `app-example/`, empty `src/navigation/*`, empty `App.tsx`, `scripts/setup.Env.js`
- [ ] Add `loading` to `AuthContext`; render a splash until the first `onAuthStateChanged`
      fires — fixes the login-screen flash on cold start
- [ ] Delete `app/index.tsx`; let the root layout's auth gate own redirection
- [ ] Remove all `router.replace` calls from Login/Home — the conditional `<Stack>`
      already handles it. Pick declarative OR imperative, never both.
- [ ] Move Firebase config to env vars via `app.config.ts`

### Phase 1 — Real persistence (1–2 days)

- [ ] Firestore schema + security rules
- [ ] `data/groceryRepository.ts` with realtime `onSnapshot`
- [ ] Rewrite `HomeScreen` against `useGroceryList()` — remove the hardcoded array
- [ ] Enable offline persistence
- [ ] Store `displayName` on register (currently collected and thrown away)

### Phase 2 — The AI feature (2–3 days) ← the part that gets you hired

- [ ] Deploy proxy to Vercel with Firebase token verification
- [ ] Define the tool schema + Zod schema in `domain/schemas.ts`
- [ ] `POST /api/parse-list`
- [ ] Assistant screen: input → loading → review sheet → confirm → batch write
- [ ] Handle every failure mode in §6

### Phase 3 — Polish (ongoing, day by day)

- [ ] Extract `ui/` design system; remove duplicated `StyleSheet` blocks
- [ ] Unit tests for `domain/` (pure functions — easiest possible testing win)
- [ ] Restock suggestions from `purchasedAt` history (statistics, no AI)
- [ ] Voice input → same phase-2 pipeline
- [ ] Receipt scanning (multimodal)

---

## 9. Interview notes

When presenting this project, lead with the decisions, not the features:

- **"Why a proxy?"** — Client bundles are extractable; a shipped key is a published key.
- **"Why Haiku?"** — Cheapest model that clears the accuracy bar for short-text
  extraction. Model selection is a cost/latency/quality tradeoff, not a default.
- **"Why Zod if the tool schema already constrains output?"** — Structural constraints
  reduce malformed output; they don't eliminate it. Validation is the boundary between
  a probabilistic and a deterministic system.
- **"Why isn't restock prediction using AI?"** — Because it's a mean-interval
  calculation. Using a model there would be slower, costlier, non-deterministic, and
  unexplainable. Knowing where *not* to apply AI is part of applying it well.

Put the `source: "manual" | "ai"` adoption metric in the README. Concrete numbers about
your own feature beat adjectives.
