---
name: accommodation-scout
description: Daily scout for rooms near UNSW Village up to the rent cap, moving late Dec 2026 to early Feb 2027. Ranks bills-included first, checks for scams, drafts enquiries. Updates radar site and Sheet.
---

# 🏠 accommodation-scout

Runs every day at 4:54 am Sydney (scheduled, see `SCHEDULE.md`) or whenever Chaitanya types `/accommodation-scout`. Stops when Chaitanya says he has signed a lease.

## 0. Before anything

1. Load personal values (`shared/PERSONAL_CONFIG.md`): `HOME_BASE`, `RENT_MAX`, `MOVE_IN_WINDOW`, `SHEET_URL`, `GOOGLE_ACCOUNT`.
2. Read `https://raw.githubusercontent.com/chaitanyavankhande/radar/main/shared/RULES.md` and `.../shared/SOURCES.md` (section 5). If they can't be fetched, carry on with this file and note it in the run summary.

## 1. What to find

| Filter | Value |
|---|---|
| Rent | **≤ $350 per week** (every room within budget is shown) |
| Suburbs | Kensington, Kingsford, Eastlakes, Randwick, Maroubra, Coogee |
| Room types | Private room in a share house · Shared (twin) room · Studio · Student building · UNSW Village 2027 · Homestay |
| Move-in | Late Dec 2026 · 1 to 10 Jan 2027 · mid to late Jan 2027 · early Feb 2027 |
| Lease | 3 to 6 months · 6 to 12 months · 12 months · flexible |
| Must-haves | None. Walking distance to UNSW ranks higher. |

A January gap is Chaitanya's to sort out; don't search short stays unless asked.

## 2. Sources in rank order (all, every run)

Use `shared/SOURCES.md` section 5. UNSW Study Stays, Down Under Stay, Gumtree, Domain and homestay pages work from the cloud. Flatmates, realestate.com.au, Roomgo and Facebook groups need Chrome (Facebook at human pace; Chaitanya accepted the account risk).

**Flatmates in Chrome (works, tested 18 Oct 2026):** open `https://flatmates.com.au/rooms/kensington-2033+kingsford-2032+eastlakes-2018+randwick-2031+maroubra-2035+coogee-2034/max-350` in one tab (signed in). Collect listing links page by page with `?page=N` (12 per page; drop links outside these suburbs). Then fetch each listing page from that same tab with `fetch()` at 2 to 5 second intervals and read its "Room overview" block: weekly rent, bond, which bills are included, room and bathroom, stay length, available date, who can apply, furnished, and "Who you'll be living with". Also run the bills-included search (`.../bills-included+max-300`) so those listings are never missed. Hand bulk results back as a downloaded JSON file, because tool output is short.

## 3. For every room

1. De-duplicate (address or listing photos + rent).
2. Fill `accommodation.json` fields (`shared/DATA_SCHEMA.md`).
3. **Bills:** for electricity, gas, water and internet, record each as `included`, `excluded` or `not mentioned`. Estimate the weekly cost of anything not included and store it in `bills_estimate_pw` with ⚠️.
4. **Household:** copy what the listing says (number of people, ages, work or study, habits, house rules) and who can apply (`who_can_apply`, e.g. "Anyone except couples", "Females only"). Claude cannot vet people; write 3 to 5 `inspection_questions` instead.
5. **Scam and fairness checks** (UNSW renting tips and NSW rules): payment asked before an in-person inspection · pushed to WhatsApp, Kakao or Messenger · bond not lodged with NSW Rental Bonds Online · bond over 4 weeks or rent in advance over 2 weeks · rent far below the NSW Rent Check median · unregistered boarding house. Put every hit in `scam_flags`.
6. **Verify:** keep the official listing link (photos are there). Mark ✅ only when the listing page itself was read.
7. Draft an `enquiry_draft` message for good listings. Chaitanya sends it himself.
8. Inspections and deadlines go to the **Accommodation** calendar (🟡 / 🔵 ladder).

## 4. Ranking (default)

1. Most bills included (4 of 4 first)
2. Walkable to UNSW
3. Cheapest rent (plus estimated missing bills)
4. Earliest suitable move-in date

The website offers: closest then cheapest · cheapest then closest · cheapest · earliest move-in · newest · lowest scam risk.

## 5. Outputs

- `docs/data/accommodation.json` (commit + push).
- Google Sheet tab **Accommodation** with Status dropdown (new, enquired, inspected, rejected, signed).
- Run summary: new rooms, best 5, scam flags, sources not checked.

Never pay, apply, book an inspection or message anyone.
