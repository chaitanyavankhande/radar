---
name: internship-scout
description: Daily scout for software internships (Australia first, then HK, SG, US, UK, Europe, remote) that fit Chaitanya's UNSW breaks. Updates the radar site, Sheet and Internships calendar.
---

# 🚀 internship-scout

Runs every day at 4:38 am Sydney (scheduled, see `SCHEDULE.md`) or whenever Chaitanya types `/internship-scout`.

## 0. Before anything

1. Load personal values (`shared/PERSONAL_CONFIG.md`): `SHEET_URL`, `GOOGLE_ACCOUNT`, `BREAK_WINDOWS`.
2. Read `https://raw.githubusercontent.com/chaitanyavankhande/radar/main/shared/RULES.md` and `.../shared/SOURCES.md` (section 3). If they can't be fetched, carry on with this file and note it in the run summary.

## 1. What to find

| Filter | Value |
|---|---|
| Roles | AI/ML engineering · Backend · Distributed systems / infrastructure · Full-stack · Data engineering · Security · Quant / trading software · any software role |
| Where | **Australia first**, then Hong Kong, Singapore, United States, United Kingdom, Europe, remote |
| Pay | Paid and unpaid both included; mark which |
| When | UNSW breaks, official calendar (Summer and Winter terms count as breaks): Summer 2026-27 = 11 Dec 2026 to 14 Feb 2027 · May 2027 = 14 to 30 May 2027 · Aug-Sep 2027 = 27 Aug to 12 Sep 2027 · Summer 2027-28 = 10 Dec 2027 to 27 Feb 2028 · Winter 2028 = 20 Jun to 13 Aug 2028 · after Semester 2 2028 = from 3 Dec 2028. ⚠️ UNSW moves to flex-semesters in 2028; whether program 8543 moves is unconfirmed. 2029 dates not published yet. |
| Work rights | Include all; fill `work_rights` and `accepts_international` for each |

## 2. Sources in rank order (all, every run)

Use `shared/SOURCES.md` section 3. Note: **UNSWConnect closes 30 Oct 2026**; after that use Prosple. LinkedIn: read LinkedIn job-alert emails **and** browse in Chrome at human pace. Cloud sources in parallel via subagents; Chrome sources one tab at a time.

## 3. For every internship

1. De-duplicate (company + title + location).
2. Fill `internships.json` fields (`shared/DATA_SCHEMA.md`). Set `start_date` and `end_date` when the ad gives them, then `break_fit`:
   - `exact`: every day sits inside one break;
   - `overlap`: 1 to 14 days fall in teaching or exams (store the count in `overlap_days` and say it in the notes);
   - `outside`: more than 14 days in teaching or exams;
   - `unknown`: dates not stated.
   Flexible-date roles count as `exact`. Northern-summer roles (about Jun to Aug) are `outside` unless dates say otherwise.
3. Add the closing date to the **Internships** calendar with the 🔴 ladder.

## 4. Ranking (default)

Exact fit first → up to 14 days over → dates unknown → clashes with term; within each, Australia first → closing soonest → paid before unpaid. The website offers more sorts and filters.

## 5. Outputs

- `docs/data/internships.json` (commit + push).
- Google Sheet tab **Internships**: all openings with Status dropdown; his applications keep their status. Rows copied once from the old tracker: SCX.ai internship (applied 27 Sep 2026).
  - Column order (A to W): Status · Role · Company · Location · Country · Role type · Paid · When · Start · End · Break fit · Days over break · Break · Accepts international · Closes · Link · Source · First seen · Closed · Checked · **Resume pack** · **Tailored on** · ID. Match rows by ID (last column), never by position.
  - **Sheet-only columns:** Status (his), Resume pack and Tailored on (written only by `/resume-tailor`). Keep all three exactly as they are when refreshing a row, and never copy Resume pack or Tailored on into `internships.json` or the public site.
  - Leave the **Full-time** tab alone (only `/resume-tailor` writes it).
  - Rows whose ID starts with `resume-tailor:` were added by `/resume-tailor`: never delete them. When a scouted internship matches one (same Link, or same Company + Role + Location), write the scout's ID into that row and keep Status, Resume pack and Tailored on, instead of adding a second row.
- Run summary: new roles, closing within 14 days, sources not checked.

Never apply on his behalf.
