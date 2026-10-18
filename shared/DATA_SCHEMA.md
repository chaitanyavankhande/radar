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

### 🚀 internships.json
| Field | Type | Meaning |
|---|---|---|
| `location` | string | City |
| `country` | string | Australia first |
| `role_type` | string | AI/ML, Backend, Distributed systems, Full-stack, Data, Security, Quant, Software |
| `paid` | string | `paid`, `unpaid`, `unknown` |
| `start_window` | string | e.g. `Dec 2026 to Feb 2027` |
| `fits_break` | bool | Inside a UNSW break window |
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
| `bills` | object | `{ "electricity": "...", "gas": "...", "water": "...", "internet": "..." }`, each `included` / `excluded` / `not mentioned` |
| `bills_included_count` | number | How many of the four are included (sort key) |
| `bills_estimate_pw` | number or null | Estimated weekly cost of excluded or not-mentioned bills |
| `room_type` | string | Private room, Shared room, Studio, Student building, Homestay |
| `available_from` | ISO date or null | |
| `lease` | string | e.g. `3 to 6 months`, `flexible` |
| `furnished` | string | `yes`, `no`, `unknown` |
| `own_bathroom` | string | `yes`, `no`, `unknown` |
| `household` | string | What the listing says about the household |
| `inspection_questions` | string[] | Questions to ask at the inspection |
| `scam_flags` | string[] | e.g. "asks for payment before inspection" |
| `enquiry_draft` | string | Draft message for Chaitanya to send himself |

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
| Randwick | 2.0 | Rosebery | 3.0 |
| Daceyville | 2.5 | Zetland | 3.5 |

⚠️ Straight-line estimates, not travel distance. Scouts may refine with a listing's exact address.
