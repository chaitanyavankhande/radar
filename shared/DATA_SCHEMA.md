# 🗄️ Data schema

Every scout writes one JSON file in `docs/data/`. The website reads these files; the Google Sheet mirrors them (one tab per file) and adds Chaitanya's **Status** column.

| File | Written by | Website tab |
|---|---|---|
| `docs/data/casual.json` | `casual-and-part-time-jobs` | 💼 Casual & part-time |
| `docs/data/internships.json` | `internship-scout` | 🚀 Internships |
| `docs/data/hackathons.json` | `hackathon-scout` | 🏆 Hackathons |
| `docs/data/accommodation.json` | `accommodation-scout` | 🏠 Accommodation |
| `docs/data/uni.json` | `uni-daily-brief` | 🎓 Uni deadlines |

## File shape

```json
{
  "updated_at": "2026-10-18T04:30:00+11:00",
  "previous_run_at": "2026-10-17T04:30:00+11:00",
  "sources": [
    { "name": "Flatmates.com.au", "rank": 1, "result": "checked", "found": 12, "note": "" },
    { "name": "Seek", "rank": 3, "result": "not checked", "found": 0, "note": "Mac asleep" }
  ],
  "items": [ { "...": "see fields below" } ]
}
```

`result` is one of `checked`, `not checked`, `failed`.

## Fields on every item

| Field | Type | Meaning |
|---|---|---|
| `id` | string | Stable id: `<source-slug>:<source item id or hash of title+org+location>` |
| `title` | string | Job title, event name, room headline or assessment name |
| `org` | string | Employer, organiser, landlord/agency, or course |
| `link` | URL | **Official** page for the item (apply, register, listing, course page) |
| `source` | string | Source name from `shared/SOURCES.md` |
| `source_rank` | number | Rank of that source |
| `found_at` | ISO date | First run that saw it (drives the "New" badge) |
| `last_seen_at` | ISO date | Last run that saw it |
| `deadline` | ISO datetime or null | Closing date / registration deadline / due date |
| `status` | string | From the Google Sheet: `new`, `interested`, `applied`, `enquired`, `inspected`, `interview`, `offer`, `rejected`, `signed`, `not for me`. Uni items use `to do`, `in progress`, `done` |
| `closed` | bool | True once the deadline passes or the listing disappears |
| `verified` | string | `✅` official page read · `⚠️` inferred or secondary · `🚫` couldn't access |
| `notes` | string | Short notes, flags, why it ranks where it does |

## Extra fields per file

### 💼 casual.json
| Field | Type | Meaning |
|---|---|---|
| `suburb` | string | |
| `distance_km` | number | Approx. straight-line distance from UNSW Village (suburb centre) |
| `transit_min` | number or null | Approx. public transport (or walking, if shorter) minutes from UNSW Village. Shown with `distance_km` in one column |
| `employment_type` | string | `casual`, `part-time`, `contract`, `gig` |
| `job_type` | string | Retail, Hospitality, Campus, Tutoring, Delivery, Office, Warehouse, IT support |
| `pay_min`, `pay_max` | number or null | AUD per hour |
| `pay_listed` | bool | False = "pay not listed" (ranked below listed pay) |
| `hours_per_week` | string | As advertised |
| `resume_doc` | URL or null | Tailored draft resume (Google Doc) when pay ≥ floor |

### 🔒 Sheet-only columns (never in JSON or on the site)

| Tab | Column | Written by | Rule |
|---|---|---|---|
| every tab | Status | Chaitanya | The Sheet wins (RULES.md rule 8) |
| Internships | Resume pack, Tailored on | `resume-tailor` | Private Drive folder link and date. Scouts keep them unchanged, match rows by ID, and never copy them to `docs/data/` (CLAUDE.md: no Drive ids in this repo) |
| Full-time | whole tab | `resume-tailor` | Full-time jobs he tailored for; no JSON file and no site tab |

### 🚀 internships.json
| Field | Type | Meaning |
|---|---|---|
| `location` | string | City |
| `country` | string | Australia first |
| `role_type` | string | AI/ML, Backend, Distributed systems, Full-stack, Data, Security, Quant, Software |
| `paid` | string | `paid`, `unpaid`, `unknown` |
| `start_window` | string | e.g. `Dec 2026 to Feb 2027` |
| `start_date`, `end_date` | ISO date or null | When the ad states them |
| `break_fit` | string | `exact` (all days inside one break), `overlap` (1 to 14 days in teaching or exams), `outside` (more than 14), `unknown` |
| `overlap_days` | number or null | Days that fall in teaching or exams |
| `break_name` | string or null | Which break it sits in, e.g. `Summer 2026-27` |
| `fits_break` | bool | `exact` or `overlap` (kept for older readers) |
| `work_rights` | string | What the role needs (e.g. "Australian work rights", "US work authorisation") |
| `accepts_international` | string | `yes`, `no`, `unknown` |

### 🏆 hackathons.json
| Field | Type | Meaning |
|---|---|---|
| `starts_at`, `ends_at` | ISO date | Event dates |
| `mode` | string | `in-person`, `online`, `hybrid` |
| `city` | string | Sydney first |
| `themes` | string[] | AI/ML, Fintech/quant, Security/CTF, Web/apps, Data |
| `team` | string | `solo`, `team`, `both`, `unknown` |
| `cost` | string | `free` or amount |
| `prize` | string | |

### 🏠 accommodation.json
| Field | Type | Meaning |
|---|---|---|
| `suburb` | string | |
| `distance_km` | number | Approx. from UNSW Village |
| `transit_min` | number or null | Approx. public transport (or walking, if shorter) minutes from UNSW Village |
| `walkable` | bool | About 20 minutes' walk or less to UNSW |
| `rent_pw` | number | AUD per week |
| `bond` | number or null | AUD, as listed |
| `about` | string | Short description from the listing |
| `bills` | object | `{ "electricity": "...", "gas": "...", "water": "...", "internet": "..." }`, each `included` / `excluded` / `not mentioned` |
| `bills_included_count` | number | How many of the four are included (sort key) |
| `bills_estimate_pw` | number or null | Estimated weekly cost of excluded or not-mentioned bills |
| `room_type` | string | Private room, Shared room, Studio, Student building, Homestay |
| `available_from` | ISO date or null | |
| `lease` | string | e.g. `3 to 6 months`, `flexible` |
| `furnished` | string | `yes`, `no`, `unknown` |
| `own_bathroom` | string | `yes`, `no`, `unknown` |
| `who_can_apply` | string or null | As the listing states, e.g. `Anyone`, `Anyone except couples`, `Females only`, `Students only` |
| `household` | string | What the listing says about the household |
| `inspection_questions` | string[] | Questions to ask at the inspection |
| `scam_flags` | object[] | `[{ "code", "level", "reason" }]`. `code` and `level` (`high`, `medium`, `low`) come from `shared/SCAM_FLAGS.md`; `reason` says why, in plain words, quoting the listing where it can. Older runs wrote plain strings; the site still reads them |
| `risk` | string | `high`, `medium`, `low` or `none`: the highest flag level |
| `trust` | string | Source tier from `shared/SCAM_FLAGS.md`: `A` official or licensed, `B` moderated site (verify), `C` open classifieds or overseas marketplace |
| `women_only` | string or null | `stated` (the listing says women or females only), `likely` (tagged all-female flat, or a shared room with a woman), or null |
| `lister` | object or null | Flatmates only: `{ photos, social, nosocial, online, rate, early }` from the listing page |
| `laundry` | string | Washing machine: `yes` (in the home), `shared` (shared or communal laundry in the building), `likely` (a laundry is mentioned but no machine), `no` (stated none, or only a laundromat), `not mentioned`. Flatmates has no laundry field, so it comes from the description |
| `laundry_evidence` | string | The exact short phrase relied on (empty when not mentioned) |
| `contact` | object | Public-safe contact route only: `{ channel, business, url, mobile_on_listing }`. `business` is filled only for businesses (agency, operator, marketplace). **Never** put a private person's name, phone number or email here: the repo is public. Those go only to the private Sheet's Contact name, Phone and Email columns |
| `enquiry_draft` | string | Draft message for Chaitanya to send himself |

**Default view (site and Sheet):** trust `A` or `B`, verified ✅, risk not `high`, `women_only` null, not closed. Everything else stays in the data and can be shown with the Safety and Women-only filters.

### 🎓 uni.json
| Field | Type | Meaning |
|---|---|---|
| `course_code`, `course_name` | string | Code always shown with the full name |
| `kind` | string | `assignment`, `quiz`, `practical`, `exam`, `mid-term`, `admin`, `event` |
| `weight` | string | e.g. `12%` |
| `where` | URL | Platform where it is done or submitted |

## Distance table (approx., from UNSW Village, suburb centre)

| Suburb | km | Suburb | km |
|---|---|---|---|
| Kensington | 1.0 | Maroubra | 3.5 |
| Kingsford | 1.5 | Coogee | 3.5 |
| Eastlakes | 3.0 | | |
| Randwick | 2.0 | Rosebery | 3.0 |
| Daceyville | 2.5 | Zetland | 3.5 |

⚠️ Straight-line estimates, not travel distance. Scouts may refine with a listing's exact address.
