# SITUATIONSHIP CRM — MASTER AGENT PROMPT

## For Google Antigravity | React + Vite Frontend + Node/Express Backend

---

## YOUR MISSION

You are building **Situationship CRM** — a real product being shipped to Reel Rumble participants. This is NOT a hackathon prototype. This is a complete, production-quality app.

You will execute in **three phases without stopping**:

1. **ANALYZE** — Understand the existing Charcha backend code
2. **PLAN** — Generate a complete implementation plan
3. **EXECUTE** — Build the full product (backend modifications + React + Vite frontend)

Do not ask for clarification. Do not stop between phases. Complete the full build.

---

## PHASE 1 — UNDERSTAND THE CHARCHA CODEBASE

The existing Charcha backend is a Node.js/Express community forum. Here is what exists:

### Stack

- Node.js + Express
- MongoDB + Mongoose
- JWT auth (jsonwebtoken + bcryptjs)
- CORS, rate limiting, dotenv

### Models (what you CAN reuse)

**User.js** — Rich user model with:

- `email`, `password`, `name`, `username`, `platform`
- `aura`, `xp`, `cred`, `level` (reputation system)
- `followerCount`, `followingCount`, `bio`, `avatarUrl`, `avatarIndex`
- `badges`, `stats`, `streak`
- Methods: `comparePassword()`, `getVoteWeight()`, `canModerate()`

**Follow.js** — `{ follower: ObjectId, following: ObjectId }` with compound unique index

**Post.js** — `{ author, platform, type, title, content, tag, upvotes, downvotes, hotScore, commentCount, mentions, ... }`

**Comment.js**, **Vote.js**, **Mention.js**, **PointLog.js** — standard forum models

### Routes that exist

- `/api/auth` — register, login, SSO
- `/api/posts` — CRUD posts
- `/api/votes` — upvote/downvote
- `/api/users` — follow/unfollow, get followers/following
- `/api/mentions` — @mentions

### Auth middleware

`middleware/auth.js` — JWT `protect` middleware, attaches `req.user`
`middleware/ssoAuth.js` — SSO token validation

---

## PHASE 2 — IMPLEMENTATION PLAN

### What Situationship CRM IS

A social relationship intelligence tool for Gen Z. It tracks "situationships" — people who aren't quite friends, not quite strangers: the mutual who retweeted you once, the founder you DMed at a hackathon, the senior you met at an event. These weak ties are where opportunities live. They die because nobody follows up.

The product:

- Lets users manually log interactions (or import from platforms)
- Tracks relationship "heat" (how recently/frequently you've interacted)
- Surfaces cold relationships that are about to go completely dead
- Suggests the right moment and a smart re-engagement message
- Shows your full "relationship graph" with warmth scores

### What to REUSE from Charcha

- **User model** — reuse as-is (the auth system, profile data, avatar system)
- **Follow model** — repurpose as "ConnectionRequest" tracking
- **Auth middleware** — reuse exactly
- **server.js structure** — extend, don't replace
- **DB config** — reuse

### What to BUILD NEW

#### New Models

**Situationship.js**

```js
{
  owner: ObjectId (ref: User),         // who owns this relationship
  person: {                             // the "situationship" person
    name: String (required),
    handle: String,                     // @twitter, @instagram, linkedin URL
    platform: String (enum: ['instagram','twitter','linkedin','irl','discord','other']),
    avatarUrl: String,
    notes: String,                      // freeform notes about them
    tags: [String],                     // e.g. ['founder', 'designer', 'e-cell']
    contactInfo: {
      email: String,
      phone: String,
    }
  },
  warmthScore: { type: Number, default: 50, min: 0, max: 100 },
  status: { type: String, enum: ['warm', 'cooling', 'cold', 'frozen'], default: 'warm' },
  lastInteractionAt: Date,
  nextNudgeAt: Date,                    // when to remind user to reach out
  interactionCount: { type: Number, default: 0 },
  isMuted: { type: Boolean, default: false },
  isArchived: { type: Boolean, default: false },
  createdAt, updatedAt (timestamps)
}
```

**Interaction.js**

```js
{
  situationship: ObjectId (ref: Situationship),
  owner: ObjectId (ref: User),
  type: String (enum: ['dm', 'comment', 'mention', 'irl_meet', 'call', 'collab', 'follow', 'react', 'manual']),
  platform: String,
  note: String,                         // what happened
  sentiment: String (enum: ['positive', 'neutral', 'negative']),
  date: Date (default: now),
  aiSuggested: Boolean (default: false) // was this a nudge the AI suggested?
}
```

**NudgeLog.js**

```js
{
  situationship: ObjectId (ref: Situationship),
  owner: ObjectId (ref: User),
  message: String,                      // the AI-generated suggested message
  context: String,                      // why the nudge was triggered
  status: String (enum: ['pending', 'sent', 'dismissed', 'snoozed']),
  createdAt (timestamps)
}
```

#### New Routes to Build

**situationshipRoutes.js** — mounted at `/api/situationships`

```
POST   /                        → create new situationship
GET    /                        → get all (with warmth sorting, filters)
GET    /dashboard               → get dashboard stats + nudges
GET    /:id                     → get single with full interaction history
PUT    /:id                     → update situationship details
DELETE /:id                     → archive (soft delete)
POST   /:id/interactions        → log a new interaction
GET    /:id/interactions        → get interaction history
POST   /:id/nudge               → generate AI nudge message (Claude API)
POST   /:id/mute                → mute/unmute nudges
```

**nudgeRoutes.js** — mounted at `/api/nudges`

```
GET    /pending                 → all pending nudges for current user
POST   /:id/status              → update nudge status (sent/dismissed/snoozed)
```

#### Warmth Score Algorithm

Build a `warmthEngine.js` service:

- Starts at 50 when situationship is created
- +15 for each interaction (capped, diminishing returns after 3/week)
- +10 for positive sentiment interactions
- -5 for negative sentiment
- Decays by -2 per day of no interaction (minimum 0)
- Status transitions:
  - 70–100 = 'warm'
  - 40–69 = 'cooling'
  - 15–39 = 'cold'
  - 0–14 = 'frozen'
- Run decay as a scheduled job on every GET /dashboard call (lazy evaluation)

#### AI Nudge Generation (Claude API)

In the nudge controller, call the Anthropic API:

```js
const response = await fetch("https://api.anthropic.com/v1/messages", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": process.env.ANTHROPIC_API_KEY,
    "anthropic-version": "2023-06-01",
  },
  body: JSON.stringify({
    model: "claude-opus-4-5",
    max_tokens: 300,
    messages: [
      {
        role: "user",
        content: `You are a Gen Z social intelligence assistant. Generate a casual, non-cringe re-engagement message for this situation:
      
Person: ${situationship.person.name} (${situationship.person.platform})
Last interaction: ${daysSince} days ago
Context/notes about them: ${situationship.person.notes}
Tags: ${situationship.person.tags.join(", ")}
Last interaction type: ${lastInteraction.type}

Write ONE short, natural message (2-3 sentences max) that feels human, not salesy. 
Match the energy of someone who genuinely wants to reconnect, not someone running a CRM.
Output only the message text, nothing else.`,
      },
    ],
  }),
});
```

---

## PHASE 3 — BUILD EVERYTHING

### Backend File Structure (add to existing Charcha)

```
charcha-backend/
├── models/
│   ├── User.js          (existing - keep)
│   ├── Follow.js        (existing - keep)
│   ├── Post.js          (existing - keep)
│   ├── Comment.js       (existing - keep)
│   ├── Vote.js          (existing - keep)
│   ├── Mention.js       (existing - keep)
│   ├── PointLog.js      (existing - keep)
│   ├── Situationship.js (NEW)
│   ├── Interaction.js   (NEW)
│   └── NudgeLog.js      (NEW)
├── controllers/
│   ├── authController.js     (existing - keep)
│   ├── followController.js   (existing - keep)
│   ├── postController.js     (existing - keep)
│   ├── commentController.js  (existing - keep)
│   ├── voteController.js     (existing - keep)
│   ├── mentionController.js  (existing - keep)
│   ├── situationshipController.js (NEW)
│   └── nudgeController.js         (NEW)
├── routes/
│   ├── [existing routes - keep]
│   ├── situationshipRoutes.js (NEW)
│   └── nudgeRoutes.js         (NEW)
├── services/
│   ├── pointsEngine.js   (existing - keep)
│   └── warmthEngine.js   (NEW)
├── middleware/
│   ├── auth.js      (existing - keep)
│   └── ssoAuth.js   (existing - keep)
└── server.js        (MODIFY — add new routes)
```

### Frontend File Structure (NEW React + Vite app)

```
situationship-crm-frontend/
├── src/
│   ├── api/
│   │   ├── auth.js
│   │   ├── situationships.js
│   │   └── nudges.js
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.jsx
│   │   │   └── TopBar.jsx
│   │   ├── cards/
│   │   │   ├── SituationshipCard.jsx
│   │   │   └── NudgeCard.jsx
│   │   ├── modals/
│   │   │   ├── AddSituationship.jsx
│   │   │   └── LogInteraction.jsx
│   │   └── ui/
│   │       ├── WarmthBar.jsx
│   │       ├── StatusBadge.jsx
│   │       └── AvatarRing.jsx
│   ├── pages/
│   │   ├── Auth.jsx
│   │   ├── Dashboard.jsx
│   │   ├── People.jsx
│   │   ├── PersonDetail.jsx
│   │   └── Nudges.jsx
│   ├── store/
│   │   └── authStore.js (Zustand)
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── vite.config.js
└── package.json
```

---

## FRONTEND DESIGN DIRECTION

**DO NOT copy any existing design. DO NOT use generic AI aesthetics.**

### The Visual Concept: "Thermal Imaging for Relationships"

Think of it as a relationship heat map. The visual language is inspired by thermal cameras — relationships glow warm or go cold, literally visible in the UI.

### Color System

```css
:root {
  --bg-base: #0a0a0f; /* near-black with slight blue undertone */
  --bg-surface: #13131a; /* card backgrounds */
  --bg-raised: #1c1c28; /* elevated elements */

  /* Warmth spectrum — these are the SOUL of the design */
  --warm-hot: #ff4d1a; /* 80-100 warmth — glowing orange-red */
  --warm-warm: #ff8c42; /* 60-80 warmth — amber */
  --warm-cooling: #4db8ff; /* 30-60 warmth — cool blue */
  --warm-cold: #1e4d6b; /* 10-30 warmth — deep cold blue */
  --warm-frozen: #0d1f2d; /* 0-10 warmth — almost black */

  --text-primary: #f0eee8; /* warm white */
  --text-secondary: #8b8a9e; /* muted lavender-gray */
  --text-ghost: #3d3d52; /* very muted */

  --accent: #c084fc; /* soft purple for actions */
  --accent-glow: rgba(192, 132, 252, 0.15);

  --border: rgba(255, 255, 255, 0.06);
  --border-warm: rgba(255, 140, 66, 0.3);
}
```

### Typography

```css
/* Google Fonts imports */
@import url("https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap");

/* Syne for headings — geometric, slightly futuristic */
/* DM Sans for body — clean, readable */
```

### Key Design Elements

**1. Warmth Bars** — Each person card has a glowing horizontal bar. Hot = burning orange glow, Cold = icy blue, Frozen = barely visible. The glow intensity is proportional to warmth score.

**2. Cards** — Rounded (16px), dark surface, LEFT border colored by warmth status. Subtle hover lift (transform: translateY(-2px)). No shadows — instead use inner glow.

**3. Sidebar** — Narrow (60px icons only on mobile, 220px with labels on desktop). Icons only, no text labels on sidebar. Clean black, border-right.

**4. Dashboard** — Starts with 3 stat cards (Total people, Due for nudge, Hot connections). Then a grid of SituationshipCards sorted by last interaction.

**5. Nudge cards** — These look like iMessages / chat bubbles. The AI message appears as a speech bubble. Buttons: "Send it", "Dismiss", "Snooze". Subtle typing animation on first render.

**6. Add Person modal** — Slide-up panel (not centered modal). Clean form with platform selector as icon pills (Instagram, Twitter, LinkedIn, IRL, Discord icons). Tags as chip inputs.

**7. Person detail page** — Timeline view of interactions on the right. Person info + warmth score + AI nudge button on the left. Timeline items have platform icons and relative dates.

**8. Empty states** — Not generic "No data found". Instead: "Your network is a ghost town. Add your first situationship ↓" with a subtle animation.

### Micro-interactions

- Warmth bar fills with animation on load
- Cards appear with staggered fade-in (animation-delay: calc(var(--i) \* 50ms))
- Status badge pulses for "frozen" connections (slow pulse, 3s)
- Nudge generation shows a thinking animation (3 dots) while waiting for API

### Mobile-first

Design for mobile first. The sidebar collapses to a bottom tab bar on mobile. Cards stack to full width. Modals become bottom sheets.

---

## ENV VARIABLES NEEDED

Add to backend `.env`:

```
ANTHROPIC_API_KEY=your_key_here
```

Add to frontend `.env`:

```
VITE_API_BASE_URL=http://localhost:5001/api
```

---

## EXECUTION ORDER

1. Create `Situationship.js`, `Interaction.js`, `NudgeLog.js` models
2. Create `warmthEngine.js` service
3. Create `situationshipController.js` with all CRUD + nudge generation
4. Create `nudgeController.js`
5. Create `situationshipRoutes.js` and `nudgeRoutes.js`
6. Modify `server.js` to mount new routes
7. Create new React + Vite project in `situationship-crm-frontend/`
8. Build all frontend pages and components
9. Wire up API calls
10. Test that full flow works: Register → Add person → Log interaction → Get nudge

---

## IMPORTANT NOTES

- Keep ALL existing Charcha code intact. Only ADD to it, never break it.
- The warmth decay runs lazily (on fetch), not via cron, to keep infra simple.
- The AI nudge is optional — if `ANTHROPIC_API_KEY` is not set, return a template message instead.
- Use `axios` for frontend API calls with a base URL config.
- Use `Zustand` for auth state management (simpler than Redux for this size).
- Use `react-router-dom` v6 for routing.
- All API responses follow the existing Charcha pattern: `{ success: true/false, data: ..., message: ... }`
- JWT token stored in localStorage, sent as `Authorization: Bearer <token>` header.
- The platform enum for situationship.person should have emoji-like icons in the UI: Instagram (📸), Twitter/X (🐦), LinkedIn (💼), IRL (🤝), Discord (🎮), Other (✨)

---

## START NOW

Begin with Phase 1 (read and confirm you understand the existing code), then immediately proceed to Phase 2 (implementation plan), then execute Phase 3 (full build). Do not stop or ask questions. Ship it.
