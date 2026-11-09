---
name: accommodation-scout
description: Daily scout for long-stay rooms within about 15 min of UNSW Village under $350/wk, moving in by 28 Feb 2027. Records lease length, bills, NSW renting rules and scam flags; updates radar and Sheet.
---

# 🏠 accommodation-scout

Runs every day at 4:54 am Sydney (scheduled, see `SCHEDULE.md`) or whenever Chaitanya types `/accommodation-scout`. Stops when Chaitanya says he has signed a lease. Never pay, apply, book an inspection, sign in for him or message anyone.

## 0. Before anything

1. Load personal values (`shared/PERSONAL_CONFIG.md`): `HOME_BASE`, `RENT_MAX`, `MOVE_IN_WINDOW`, `SHEET_URL`, `GOOGLE_ACCOUNT`.
2. Attach the repo (`add_repo` chaitanyavankhande/radar, push), clone it, and read `shared/RULES.md`, `shared/SOURCES.md` (section 5), `shared/SCAM_FLAGS.md` and `shared/DATA_SCHEMA.md` from the clone. If that fails, carry on with this file and say so in the run summary.
3. Read `docs/data/accommodation.json`: every open room is re-read this run, not only new ones.

## 1. What to find

| Filter | Value |
|---|---|
| Rent | **$350 per week or less** (ideally $300 or less). A room that rises above $350 is closed |
| Travel scope | **Every room within about 15 minutes of UNSW Village** (public transport or walking, door to door). Suburbs in scope, by Google Maps transit time from UNSW Village to the suburb centre (9 Nov 2026): Kensington, Kingsford, Randwick (14), Moore Park (16), Daceyville (17), Eastlakes (18), Zetland (19), Waterloo (19), Rosebery (20), Eastgardens (20), plus Coogee incl. South Coogee (22) and Maroubra (23) kept from the original six. Out of scope: Surry Hills (24), Pagewood (27), Clovelly (30), Hillsdale (33), Centennial Park (34), Paddington (34), Redfern, Mascot and the CBD rows search sites pad results with. Record `transit_min` for every room |
| Move-in | Any start date from today until **28 Feb 2027**. Rooms that start after 28 Feb are closed |
| Stay length | **Long stays are the target: 6 months or more possible** (`contract.longest_months` 6 or more, or `open_ended`). Rooms whose length is **unknown** count as possible long stays: keep them, mark "Lease length unknown", list them last, and ask the length. Shorter stays found by the normal searches stay in the data only if they last until at least 14 Jan 2027, but get no ranking, enquiry draft or summary line and are hidden by default |
| Room types | Private room in a share house · Shared (twin) room · Studio · Student building · UNSW Village 2027 · Homestay |
| Trusted and safe only | A room counts only if its source is trust tier A or B, its listing page was read (✅) and it has no 🔴 high flag. Rooms that fail are not considered at all: never on the site, never ranked, summarised or drafted for, kept out of the Sheet view, kept in the JSON as history only |
| Women-only rooms | Kept in the data with `women_only` set, **hidden by default** on the site and Sheet |
| Must-haves | None. Walking distance to UNSW ranks higher. Chaitanya needs a washing machine, so laundry is always recorded |

Don't run separate short-stay searches unless asked.

## 2. Sources (all, every run, in `shared/SOURCES.md` section 5 order)

- **Cloud:** UNSW Study Stays (pages 1 to 6 plus every tracked detail page), Down Under Stay (`/rooms/` and the room sitemap), Domain (one URL per in-scope suburb, all 12), AHN pricing and student FAQ, UNSW Village, price-watch operators.
- **Chrome:** Flatmates, realestate.com.au (`/rent/between-0-350-in-<suburb>,+nsw+<postcode>%3b+.../list-1` for the old six and for the six added suburbs), Flatmate Finders (one page per run), the NSW boarding house register. Domain pages also read well in Chrome; call `get_page_text` on its own, not inside `browser_batch`, so the site permission can be granted.
- Tier C sources (Gumtree, uhomes, Casita, Facebook, overseas marketplaces) are never considered; don't spend reads on them.

**Flatmates in Chrome (works):** open `https://flatmates.com.au/rooms/kensington-2033+kingsford-2032+eastlakes-2018+randwick-2031+maroubra-2035+coogee-2034/max-350` and `https://flatmates.com.au/rooms/daceyville-2032+zetland-2017+rosebery-2018+waterloo-2017+eastgardens-2036+moore-park-2021/max-350` in one tab (signed in). Collect listing links page by page with `?page=N` by `fetch()` from that tab (links appear as `flatmates.com.au/<type>-sydney-<suburb>-<postcode>-P<id>` inside the page data; stop when a page adds nothing new). Also run `.../bills-included+max-300`, the newest-first sort and `https://flatmates.com.au/rooms/south-coogee-2034/max-350`. Then fetch every in-area listing page (new and tracked) at about 2 second intervals in a background loop, strip scripts, and keep the text from "About the property" to "Report this property". Read it back by writing it into a `<pre>` and calling `get_page_text` in batches of about 20 listings (tool output is short). Record from each page: weekly rent, bond (or "Bond amount to be confirmed"), bills included list, room and bathroom, stay length, available date, who can apply, furnished, the house icons (bedrooms, bathrooms, people), "Who you'll be living with", and the lister signals (photos, verified social media or not, "Online ...", "Response rate", "Early Bird", "Show mobile number"). Collect photo URLs and a 64-bit difference hash of each photo so reused photos can be caught. A page that says "no longer available" closes the room.

**NSW boarding house register (Chrome):** `https://applications.fairtrading.nsw.gov.au/accomregister/`. Tick Register of Boarding Houses, type "<Suburb> NSW <postcode>" or a street name in the top search box with real typing (JavaScript value changes don't register), click Search, and page with "Next". Only street addresses are listed; a search for a street with no match shows no results.

## 3. For every room (new and tracked)

1. **De-duplicate** (address, listing photos or the same operator's room number, plus rent). Note duplicates in `notes`.
2. **Changes since last run:** rent, bond, available date, stay length, bills. Rent above $350 or "no longer available" closes the room (`closed: true`, never delete). Say what changed in `notes` with the date.
3. **Bills:** for electricity, gas, water and internet record `included`, `excluded` or `not mentioned`. Read the description as well as the overview: "only water is included" makes the other three `excluded`; "internet included" in the text upgrades a not-mentioned internet; "Bills not included in rent" on Flatmates makes all four `excluded`. Estimate the weekly cost of anything not included (share house guide: electricity $10, gas $5, water $3, internet $6; ⚠️ estimate) in `bills_estimate_pw`. Then fill **`bills_not_included`** for every room: `{ extra, not_mentioned, estimate_pw, summary }`, summary "None: all 4 bills are included" when nothing is missing.
4. **Contract length:** copy the listing's wording to `lease`, then fill `contract` (`shared/DATA_SCHEMA.md`): minimum and maximum months, a fixed end date (`ends`) when the ad gives one (sublets, "lease period", "available until"), `flexible`, the bucket, a one-line summary and a `note` for conflicts (overview vs description, a minimum longer than the dates allow). Read the description and "Who you'll be living with" for dates too ("available until 31/01/2027"). Then fill **`contract.longest_months`** (months from the later of today and `available_from` to the end date, or the maximum) and **`contract.open_ended`** (true when there is a minimum or "flexible" but no maximum or end). If the length is not stated anywhere, look for the provider's own terms or FAQ (for example AHN: 28-night placements extended 28 nights at a time). If still unknown: `lease` says where it was checked, `contract.bucket` is `Not stated`, `longest_months` null, and add the inspection question "What is the lease term, and can I stay for all of 2027?".
5. **NSW renting rules:** fill `rules_check` and `rules_summary` for every open room from its own listing page (section 4). Never mark ✅ from a guess.
6. **Laundry:** `laundry` is `yes`, `shared`, `likely`, `no` or `not mentioned`, with the exact phrase in `laundry_evidence`. If it isn't `yes`, add "Is there a washing machine I can use, and is it included in the rent?" to the questions.
7. **Contact:** public `contact` field: channel, business name for businesses only, contact page link, and `mobile_on_listing`. Private, Sheet only (never in the repo): the lister's or agent's name and any phone or email printed on the listing. Don't reveal hidden numbers (Flatmates needs a paid upgrade, Gumtree a sign-in). Keep first contact on the listing site.
8. **Household:** copy what the listing says (people, ages, work or study, house rules, pets) into `household`, and `who_can_apply` as the listing words it. Write 3 to 6 `inspection_questions`: always ask to hold the room until about 1 January when it is available earlier, ask about every contradiction found, and ask the lease length when unknown.
9. **Fraud and scam checks** (`shared/SCAM_FLAGS.md`): trust tier (A official or licensed agent, B moderated site, C open classifieds), every flag in the catalogue, the cross-checks (rent under 65% of similar rooms, reused photos or text in another suburb, Flatmates lister signals), contradictions between the overview and the description (for example "private room" in the text but "Shared room" in the overview), a street address that isn't given. Write each hit to `scam_flags` as `{code, level, reason}` quoting the listing; set `risk` and `trust`. Set `women_only` (`stated` or `likely`).
10. **Verify:** keep the official listing link. Mark ✅ only when the listing page itself was read this run or earlier.
11. **Enquiry draft** (`enquiry_draft`) for good listings, for Chaitanya to send himself: greet the lister by first name; "I'm Chaitanya, a UNSW Master of IT student", quiet, tidy, non-smoker (mention house rules he fits); the room and listing id; long stay ideally all of 2027, moving in around 1 January when his current place ends; numbered questions (hold until early January, every contradiction, bills fully included or capped, how many people live there, written agreement and bond lodged with Rental Bonds Online, lease length if unknown, washing machine if not stated); ask for an in-person viewing before paying anything. Keep Flatmates drafts under 1,024 characters. No phone number, email or documents in the draft.
12. **Calendar:** inspections and deadlines go to the Accommodation calendar (🟡 / 🔵 ladder).

## 4. NSW renting rules (`rules_check`)

For each of the 12 rules record `{ s, why }`: `follows` ✅, `breaks` ❌, `not_mentioned` ❔ (the ad doesn't say: ask), `check` ⚠️ (depends, say what to ask) or `na` ➖ (doesn't apply). `why` quotes or explains the listing. `rules_summary` counts each state.

| Key | Rule | How to judge |
|---|---|---|
| `status` | Legal status is clear | Sublet, take-over or "subtenants" = sub-tenant; owner or landlord living there = lodger (tenancy law doesn't cover them); registered boarding house; homestay lodger; agent-leased whole studio = tenant. Lister lives there but ownership unclear = ⚠️ |
| `bond_cap` | Bond within the limit | 4 weeks' rent; 2 weeks in a boarding house (5 or more paying residents). Compute bond ÷ rent. "To be confirmed" = ❔ |
| `bond_lodged` | Bond lodged with NSW Fair Trading | "Lodged with RBO" = ✅; "self managed" = ❌ (for a sub-let the head tenant must lodge within 10 days). Boarding houses: ➖ (the operator holds it and refunds within 14 days) |
| `rent_advance` | Rent in advance 2 weeks or less | From the ad's terms |
| `holding_fee` | Holding fee 1 week or less, after approval | From the ad's terms |
| `no_banned_fees` | No banned fees | Application, background check, viewing, lease preparation, first keys, pet bond are banned for tenancies. Ongoing extras (cleaning, air-con) = ⚠️ get them in writing |
| `written_agreement` | Written agreement | Contract attached, lease or agreement mentioned, fixed lease period, agent application |
| `condition_report` | Condition report | Attached or mentioned |
| `receipts` | Receipts or fee-free payment | "Receipt provided", Rental Bonds Online, direct debit or invoices |
| `inspect_first` | Inspection before paying | Ad invites a viewing or inspection; agent listings with "Book inspection". Video only = ⚠️ |
| `boarding_register` | Boarding house registered | If 5 or more people pay to live there (not counting the owner, manager or their relatives), the address must be on the NSW register: on it ✅; clearly 5+ paying and the address checked and absent ❌; 5+ bedrooms or people but no address ⚠️; fewer than 5 ➖; size unknown ❔ |
| `sublet_consent` | Landlord consent for a sublet | Only for sublets: ❔ unless the ad shows written consent; otherwise ➖ |

Limits and sources live in the site's ⓘ guide (`RENT_GUIDE` in `docs/app.js`); update it when a rule changes.

## 5. Ranking (default)

1. Known lease length before unknown (unknown lengths always last, in every sort)
2. Most bills included (4 of 4 first)
3. Walkable to UNSW
4. Cheapest rent plus estimated missing bills
5. Earliest suitable move-in

## 6. What the radar site shows (`docs/app.js`)

- **Page:** heading with an **ⓘ button** that opens and closes the NSW renting rules guide (remembered per browser); lede; sources table.
- **Default view:** trusted and safe rooms only; women-only hidden; Long stays filter at 6 months, which also keeps rooms of unknown length (listed last).
- **Card facts, in order:** Rent · Bond · With bills (rent plus ⚠️ estimate) · Bills (N of 4, each ✅ ❌ ❔) · Bills not included (you pay, not stated, estimate) · Renting rules (✅ ❌ ❔ ⚠️ counts) · Longest stay (♾️ no maximum, up to N months or years, or ❔ Unknown length) · Contract (summary and the listing's wording, or "❔ Lease of unknown length: ask") · Distance · Room · Furnished · Own bathroom · Laundry · Who can apply · Contact · Source.
- **Flags box:** every scam flag with its reason.
- **Chips:** risk, trusted source, women only, all bills included, "Breaks N renting rules", short stay, flexible contract, long stay OK or 1 year+, stay 6 months+, "Lease length unknown", washing machine, walkable, who can apply.
- **More details:** NSW renting rules table (all 12 rules with reasons) · Bills not included · Bills included or extra · Contract length and longest stay · Laundry · How to contact · About the lister · Safety checks · About the place · Household · Questions to ask · Enquiry draft (copy button) · Notes.
- **Filters:** Travel time from UNSW Village (10, 15, about 15 = 20 or less, 25 min) · NSW renting rules · Flags · Women-only rooms · Risk · Source trust · Rent at most · Bills included count · These bills must be included · Suburb · Room type · Available from · Contract length (Unknown length is its own group) · Long stays (3 months, 6 months, 10 months or 3 terms, 1 year, 2 years) · I want to stay for (months, Term 1 2027, Terms 1 and 2, all 3 terms of 2027, 1 year, 18 months, 2 years) · Rooms with a lease of unknown length (show at the bottom or hide) · Bills not included · Who can apply · Furnished · Own bathroom · Washing machine · Walkable.
- **Sorts:** bills then cheapest (default) · cheapest · closest · earliest move-in · longest stay first · shortest contract first · lowest risk · newest. Unknown lengths go last in each.

## 7. Outputs

- `docs/data/accommodation.json`: validate with `python3 -m json.tool`, one commit per run (`data(accommodation-scout): YYYY-MM-DD run, N new, M closed`), push. Site code changes: `site: ...`; skill and docs: `docs(accommodation-scout): ...` plus a `decisions/DECISION_LOG.md` line.
- **Google Sheet tab Accommodation** (one row per room, matched by ID in the last column, Status in column A, never overwrite a Status Chaitanya set). Columns: Status, Listing, Suburb, Rent $/wk, Bills included (of 4), Bills included, Bills extra (you pay), Bills not mentioned, Est. extra bills $/wk, **Bills not included** (one ARRAYFORMULA in J1 built from the bill columns: never write values under it), Km, Transit min, Walkable, Room, Available from, Lease, Contract length, Contract group, **Longest stay allowed** ("Unknown length (the ad does not say)" when unknown), Furnished, Own bathroom, Laundry, Laundry evidence, Who can apply, Women only, Source trust, Risk, Flags (reasons), **NSW renting rules** (counts, then which rules break, need checking and are followed), In default view, Contact via, Contact name, Phone, Email, Link, Source, First seen, Closed, Checked, ID. In default view is `no` for closed, untrusted, women-only and short-stay rooms (longest stay under 6 months); unknown lengths stay `yes`. Write cells with `update_values`: a `repeatCell` batch skips rows the Sheet's filter hides. Write dates and phone numbers with a leading apostrophe.
- **Run summary:** new trusted long-stay rooms; the best 5 (rent, contract and longest stay, bills not included, rules broken); rooms that break a renting rule; rooms closed and why; how many women-only and short-stay rooms are hidden; sources not checked and why. Leave out rooms that are not trusted and safe.
