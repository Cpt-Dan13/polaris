# Polaris

**Polaris** is the internal admin dashboard for the [Constellation](../constellation/) dating app. Named after the North Star — the fixed point everything orbits around — Polaris gives the ops team a single command center to monitor, manage, and grow the platform.

Built with React 18 + TypeScript + Vite + Tailwind CSS. All navigation is pure React state (no router); charts are hand-rolled SVG. Data is currently mocked and will be wired to Supabase as each module ships.

---

## Current Modules

| Module | Description |
|---|---|
| Overview | High-level KPI snapshot |
| Bot Management | Configure and monitor automation bots |
| VM Health Monitor | Track virtual machine status and uptime |
| Bot Activity Feed | Live feed of bot interactions |
| Persona Manager | Manage bot personas and profiles |
| Scheduler | Schedule automated tasks and campaigns |
| Message Log | Browse and search chat message history |
| User Management | View, search, and act on user accounts |
| Customer Service | Handle support requests and tickets |
| Feedback | Aggregate and review user-submitted feedback |
| Reports & Flags | Evaluate flagged content and user reports |
| Announcements | Broadcast messages to the user base |
| IRIS | AI assistant stub (in development) |
| Settings | Dashboard configuration |

---

## Planned Features

### Analytics
- Swipe analytics — average swipes per user, broken down by Patriarch / Muse
- Most desired height and age ranges for Patriarchs and Muses
- Top-performing and most popular Patriarchs, Muses, and Constellations
- Most disliked, most reported, and most blocked profiles
- Demographic breakdowns — ethnicity, religion, education, politics, and more
- Average users per period (daily / monthly / yearly)
- Total users subscribed to Nova and SuperNova tiers
- Revenue history and averages

### Moderation & Safety
- Chat message assessment — flagged messages, warnings, and auto-blocks
- Report evaluation workflow — team review queue for flagged content and profiles

### Operations
- Full support ticketing system integrated with Customer Service module
- Total and average active users per period
- Bot management system — per-bot health, activity, and configuration
- Announcement and broadcasting system for platform-wide or segmented messages

---

## Tech Stack

| Category | Library |
|---|---|
| Framework | React 18 |
| Language | TypeScript |
| Build | Vite |
| Styling | Tailwind CSS + CSS custom properties |
| Charts | Custom SVG (no external charting library) |
| Icons | Lucide React |
| Backend (planned) | Supabase |

---

## Getting Started

```bash
cd constellation-dashboard
npm install
npm run dev
```

The dev server starts at `http://localhost:5173`.
