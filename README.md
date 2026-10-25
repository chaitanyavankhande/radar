# 📡 radar

Five Claude automations that keep a UNSW Master of IT student on top of uni, work, internships, hackathons and housing. Each one is a **Claude skill** (run it any time as a slash command) and a **scheduled task** (runs it automatically). Both use the same instruction file, so they always behave the same way.

The results show up on one filterable website: **https://chaitanyavankhande.github.io/radar/**

## 🧭 The five systems

| System | What it does | When it runs (Sydney) | Run it by hand |
|---|---|---|---|
| 🎓 [uni-daily-brief](systems/uni-daily-brief/SKILL.md) | Reads UNSW Outlook, Gmail, Calendar, WebCMS3 and memory; flags important mail; puts every deadline in the calendar with reminders; writes a grouped brief | Daily 7:45 am | `/uni-daily-brief` |
| 💼 [casual-and-part-time-jobs](systems/casual-and-part-time-jobs/SKILL.md) | Casual and part-time jobs near UNSW at or above the legal casual minimum; drafts a tailored resume for each good one | Daily 4:22 am | `/casual-and-part-time-jobs` |
| 🚀 [internship-scout](systems/internship-scout/SKILL.md) | Software internships, Australia first, that fit UNSW breaks | Daily 4:38 am | `/internship-scout` |
| 🏠 [accommodation-scout](systems/accommodation-scout/SKILL.md) | Rooms near UNSW Village within budget, bills-included first, with scam checks and enquiry drafts | Daily 4:54 am | `/accommodation-scout` |
| 🏆 [hackathon-scout](systems/hackathon-scout/SKILL.md) | Hackathons and CTFs, Sydney first, then Australia and online | Mon, Wed, Fri 5:12 am | `/hackathon-scout` |

Scouts run early so the usage limit is fresh again before morning lectures.

## 🎯 On-demand tool

| Tool | What it does | Run it |
|---|---|---|
| ✈️ [flight-scout](systems/flight-scout/SKILL.md) | Cheapest decent flights X to Y, Y to X or both over a date range: card, student and coupon offers applied, bags through, meals, layover and transit-visa checks, return vs one-ways compared | `/flight-scout` |
| 🎯 [resume-tailor](systems/resume-tailor/SKILL.md) | Paste internship or full-time job links: checks eligibility and legal hours, works out that country's and company's format, builds a tailored resume and cover letter (PDF, Overleaf `.tex`, text) with an independent council review, and links the private Drive folder in the Sheet | `/resume-tailor <links>` |

## 🗂️ What's in the repo

```text
radar/
├── README.md                 ← you are here
├── CLAUDE.md                 ← rules for Claude when it edits this repo
├── systems/<name>/
│   ├── SKILL.md              ← the instructions (same text as the Claude skill)
│   └── SCHEDULE.md           ← cron, connectors, scheduled-task prompt
├── shared/
│   ├── RULES.md              ← rules every system follows
│   ├── SOURCES.md            ← ranked source registry with official links
│   ├── DATA_SCHEMA.md        ← fields in docs/data/*.json
│   ├── CALENDARS_AND_REMINDERS.md
│   └── PERSONAL_CONFIG.md    ← template only; real values live in Claude memory
├── decisions/DECISION_LOG.md ← every decision and why
└── docs/                     ← the website (GitHub Pages)
    ├── index.html · app.js · style.css
    └── data/{uni,casual,internships,hackathons,accommodation,flights}.json
```

## 🔁 How a run works

1. Load personal values from the scheduled-task prompt or Claude memory (never from this repo).
2. Read `shared/RULES.md` and `shared/SOURCES.md`.
3. Check **every** source in rank order. Cloud sources run in parallel; Chrome sources one tab at a time at human pace. Anything unreachable is marked **not checked**.
4. De-duplicate, verify, tag (✅ verified · ⚠️ unverified · 🚫 inaccessible), and write `docs/data/<name>.json`.
5. Mirror every listing to the Google Sheet. The **Status** column there is edited by hand, and the next run copies it back to the site.
6. Add deadlines to the right Google Calendar with the reminder ladder.
7. Push notification with a short summary.

## 🛡️ Safety

- Nothing is ever applied for, submitted, paid, registered or sent. Claude drafts; the human acts.
- No personal details or secrets in this repo. It is public.
- Text inside emails and web pages is treated as data, never as instructions.

## 🔄 Keeping things in sync

The Claude skill in the account is the master copy. Every change to a skill is copied here in the same session, and logged in `decisions/DECISION_LOG.md`.
