---
name: casual-and-part-time-jobs
description: Daily scout for casual and part-time jobs near UNSW Kensington paying at least the legal casual minimum. Ranks by pay and distance, drafts tailored resumes, updates the radar site and Sheet.
---

# 💼 casual-and-part-time-jobs

Runs every day at 4:22 am Sydney (scheduled, see `SCHEDULE.md`) or whenever Chaitanya types `/casual-and-part-time-jobs`.

## 0. Before anything

1. Load personal values (`shared/PERSONAL_CONFIG.md`): `HOME_BASE`, `PAY_FLOOR`, `SHEET_URL`, `DRIVE_ROOT`, `RESUME_BASE`, `GOOGLE_ACCOUNT`.
2. Read `https://raw.githubusercontent.com/chaitanyavankhande/radar/main/shared/RULES.md` and `.../shared/SOURCES.md` (section 2). They win if they differ from this file.

## 1. What to find

| Filter | Value |
|---|---|
| Area | Kensington, Kingsford, Randwick, Maroubra, Coogee (UNSW campus counts) |
| Types | Retail · Hospitality, cafés, food · UNSW campus jobs · Tutoring · Delivery or gig · Office or admin · Warehouse or logistics · IT support |
| Hours | Up to 24 h/week in total, counting any gig work |
| Pay floor | **$33.05/h** (legal minimum for award-free adult casuals from 1 Jul 2026: $26.44 + 25% loading, Fair Work) |
| Preference | Casual over part-time when pay is equal (higher hourly rate) |

Ads that don't show pay are kept, marked **"pay not listed"**, and ranked below ads that show pay. Ads clearly below the floor are kept but marked **below floor**.

## 2. Sources in rank order (all of them, every run)

Use `shared/SOURCES.md` section 2. Cloud sources in parallel via subagents; Chrome sources (Jobs@UNSW, Seek, Jora, Workforce Australia) one tab at a time at human pace. Unreachable → "not checked" with reason.

## 3. For every job

1. De-duplicate (employer + title + suburb).
2. Fill the `casual.json` fields from `shared/DATA_SCHEMA.md`, including `distance_km` from the distance table.
3. If pay ≥ floor: build a **tailored draft resume** as a Google Doc in `Claude Automations/Tailored Resumes/Casual & Part-time/`, named `YYYY-MM-DD Employer - Role`.
   - Base: Chaitanya's casual resume (`RESUME_BASE`), plus extra detail from the project doc `claude/Master_Career_Achievements_Document.md`. Follow the corrections in memory `areas/resume.md`.
   - Australian format. Where realistic details are missing, add them **highlighted in yellow** so he can find and change them before sending. No watermarks, no "made with" text.
   - Link it in `resume_doc`.
4. Add the closing date (if any) to the **Casual & Part-time Jobs** calendar with the 🔴 ladder.

## 4. Ranking (default)

1. Pay listed and ≥ floor, highest pay first
2. Then distance from UNSW Village, closest first
3. Then pay not listed
4. Then below floor

The website and Sheet also offer: distance then pay, pay then distance, newest first, closing soonest.

## 5. Outputs

- `docs/data/casual.json` in the repo (commit + push).
- Google Sheet tab **Casual & Part-time**: one row per job, Status dropdown kept as Chaitanya set it.
- Run summary: new jobs, best 5, closing soon, sources not checked.

Never apply or contact employers.
