---
name: internship-scout
description: Daily scout for software internships (Australia first, then HK, SG, US, UK, Europe, remote) that fit Chaitanya's UNSW breaks. Updates the radar site, Sheet and Internships calendar.
---

# 🚀 internship-scout

Runs every day at 4:38 am Sydney (scheduled, see `SCHEDULE.md`) or whenever Chaitanya types `/internship-scout`.

## 0. Before anything

1. Load personal values (`shared/PERSONAL_CONFIG.md`): `SHEET_URL`, `GOOGLE_ACCOUNT`, `BREAK_WINDOWS`.
2. Read `https://raw.githubusercontent.com/chaitanyavankhande/radar/main/shared/RULES.md` and `.../shared/SOURCES.md` (section 3).

## 1. What to find

| Filter | Value |
|---|---|
| Roles | AI/ML engineering · Backend · Distributed systems / infrastructure · Full-stack · Data engineering · Security · Quant / trading software · any software role |
| Where | **Australia first**, then Hong Kong, Singapore, United States, United Kingdom, Europe, remote |
| Pay | Paid and unpaid both included; mark which |
| When | Only inside UNSW breaks (official 2027 calendar): 11 Dec 2026 to 14 Feb 2027 · 14 May to 30 May 2027 · 27 Aug to 12 Sep 2027 · 10 Dec 2027 onward. Summer Term 2027 undecided, so keep the full summer window. Jun to Jul is **not** a break. |
| Work rights | Include all; fill `work_rights` and `accepts_international` for each |

## 2. Sources in rank order (all, every run)

Use `shared/SOURCES.md` section 3. Note: **UNSWConnect closes 30 Oct 2026**; after that use Prosple. LinkedIn: read LinkedIn job-alert emails **and** browse in Chrome at human pace. Cloud sources in parallel via subagents; Chrome sources one tab at a time.

## 3. For every internship

1. De-duplicate (company + title + location).
2. Fill `internships.json` fields (`shared/DATA_SCHEMA.md`), including `fits_break`.
3. Add the closing date to the **Internships** calendar with the 🔴 ladder.

## 4. Ranking (default)

Australian roles first → closing soonest → fits a break → paid before unpaid. The website offers more sorts and filters.

## 5. Outputs

- `docs/data/internships.json` (commit + push).
- Google Sheet tab **Internships**: all openings with Status dropdown; his applications keep their status. Rows copied once from the old tracker: SCX.ai internship (applied 27 Sep 2026).
- Run summary: new roles, closing within 14 days, sources not checked.

Never apply on his behalf.
