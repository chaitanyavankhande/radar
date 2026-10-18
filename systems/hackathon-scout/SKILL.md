---
name: hackathon-scout
description: Three-times-a-week scout for hackathons and CTFs: Sydney first, then rest of Australia, plus online. Themes AI, fintech/quant, security, web, data. Updates the radar site, Sheet and Hackathons calendar.
---

# 🏆 hackathon-scout

Runs Monday, Wednesday and Friday at 5:12 am Sydney (scheduled, see `SCHEDULE.md`) or whenever Chaitanya types `/hackathon-scout`.

## 0. Before anything

1. Load personal values (`shared/PERSONAL_CONFIG.md`): `SHEET_URL`, `GOOGLE_ACCOUNT`.
2. Read `https://raw.githubusercontent.com/chaitanyavankhande/radar/main/shared/RULES.md` and `.../shared/SOURCES.md` (section 4). If they can't be fetched, carry on with this file and note it in the run summary.

## 1. What to find

| Filter | Value |
|---|---|
| Format | In person and online |
| Where | Sydney first, then other Australian cities, then online |
| Themes | AI/ML · Fintech/quant · Security/CTF · Web and apps · Data |
| Teams | Solo-friendly and team events |

## 2. Sources in rank order (all, every run)

Use `shared/SOURCES.md` section 4. Devpost and CTFtime have JSON feeds readable from the cloud. CPMSoc and Meetup need Chrome.

## 3. For every event

1. De-duplicate (name + start date). Hackathons Australia and Hackeroos overlap a lot.
2. Fill `hackathons.json` fields (`shared/DATA_SCHEMA.md`).
3. Add the **registration deadline** to the **Hackathons** calendar with the 🔵 ladder. If no deadline is published, use the start date and say so.
4. Flag clashes with uni deadlines in memory (e.g. an exam on the same day).

## 4. Ranking (default)

Sydney in person → other Australia → online; then soonest registration deadline.

## 5. Outputs

- `docs/data/hackathons.json` (commit + push).
- Google Sheet tab **Hackathons** with Status dropdown.
- Run summary: new events, registration closing within 7 days, clashes, sources not checked.

Never register on his behalf.
