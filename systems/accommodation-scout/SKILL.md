---
name: accommodation-scout
description: Daily scout for rooms near UNSW Village up to the rent cap, moving in any time from now until 15 Feb 2027. Ranks bills-included first, flags fraud and scam signs with reasons, hides women-only and untrusted rooms by default, records laundry and contacts, drafts enquiries. Updates radar site and Sheet.
---

# 🏠 accommodation-scout

Runs every day at 4:54 am Sydney (scheduled, see `SCHEDULE.md`) or whenever Chaitanya types `/accommodation-scout`. Stops when Chaitanya says he has signed a lease.

## 0. Before anything

1. Load personal values (`shared/PERSONAL_CONFIG.md`): `HOME_BASE`, `RENT_MAX`, `MOVE_IN_WINDOW`, `SHEET_URL`, `GOOGLE_ACCOUNT`.
2. Read `https://raw.githubusercontent.com/chaitanyavankhande/radar/main/shared/RULES.md`, `.../shared/SOURCES.md` (section 5) and `.../shared/SCAM_FLAGS.md`. If they can't be fetched, carry on with this file and note it in the run summary.

## 1. What to find

| Filter | Value |
|---|---|
| Rent | **≤ $350 per week** (every room within budget is shown) |
| Suburbs | Kensington, Kingsford, Eastlakes, Randwick, Maroubra, Coogee |
| Room types | Private room in a share house · Shared (twin) room · Studio · Student building · UNSW Village 2027 · Homestay |
| Move-in | Any start date from today until 15 Feb 2027 (widened 6 Nov 2026; was 10 Dec 2026 to early Feb 2027). Rooms that start after 15 Feb are closed |
| Lease | Any length, recorded per room (`contract`) so the site's Contract length and "I want to stay for" filters can narrow it. Short stays are kept only when they last until at least mid January 2027 (14 Jan), so they can cover the gap after UNSW Village ends on 31 Dec |
| Must-haves | None. Walking distance to UNSW ranks higher. |
| Women-only rooms | Keep them in the data with `women_only` set, but they are **hidden by default** on the site and Sheet |
| Trusted and safe only | A room counts only if its source is tier A or B, its listing page was read (✅) and it has no 🔴 high flag. Rooms that fail are **not considered at all**: no ranking, no enquiry draft, not in the run summary, never on the site, kept out of the Sheet view |

Don't run separate short-stay searches unless asked; short stays found by the normal searches are kept under the rule above.

## 2. Sources in rank order (all, every run)

Use `shared/SOURCES.md` section 5. UNSW Study Stays, Down Under Stay, Gumtree, Domain and homestay pages work from the cloud. Flatmates, realestate.com.au, Roomgo and Facebook groups need Chrome (Facebook at human pace; Chaitanya accepted the account risk).

**Flatmates in Chrome (works, tested 18 Oct 2026):** open `https://flatmates.com.au/rooms/kensington-2033+kingsford-2032+eastlakes-2018+randwick-2031+maroubra-2035+coogee-2034/max-350` in one tab (signed in). Collect listing links page by page with `?page=N` (12 per page; drop links outside these suburbs). Then fetch each listing page from that same tab with `fetch()` at 2 to 5 second intervals and read its "Room overview" block: weekly rent, bond, which bills are included, room and bathroom, stay length, available date, who can apply, furnished, and "Who you'll be living with". Also run the bills-included search (`.../bills-included+max-300`) so those listings are never missed. Hand bulk results back as a downloaded JSON file, because tool output is short. From the same page also record the lister signals: number of photos, "View <name> on social media" (verified) or "has no verified social media", "Online ...", "Response rate: N%" and "Early Bird" (new listing). Collect the listing photo URLs (`user_property/<id>`) and a 64-bit difference hash of each photo (fetch the Cloudinary image at `c_scale,w_72`, draw it to a 9 by 8 canvas, compare neighbouring pixels) so reused photos can be caught.

## 3. For every room

1. De-duplicate (address or listing photos + rent).
2. Fill `accommodation.json` fields (`shared/DATA_SCHEMA.md`).
3. **Bills:** for electricity, gas, water and internet, record each as `included`, `excluded` or `not mentioned` (on Flatmates, "Bills not included in rent" means all four are `excluded`; bills missing from an "included" list are `not mentioned` unless the description says they are extra). Estimate the weekly cost of anything not included and store it in `bills_estimate_pw` with ⚠️. The site and Sheet name every bill as included, extra or not mentioned.
   **Contract length:** copy the listing's wording to `lease`, then fill `contract` (`shared/DATA_SCHEMA.md`): minimum and maximum months, a fixed end date when the ad gives one (sublets, summer stays), the bucket and a one-line summary. When the stated minimum is longer than the ad's dates allow, say so in `contract.note`.
4. **Laundry:** Chaitanya needs a washing machine. Record `laundry` as `yes`, `shared`, `likely`, `no` or `not mentioned` with the exact phrase in `laundry_evidence` (Flatmates has no laundry field, so read the description). If it isn't `yes`, add the inspection question "Is there a washing machine I can use, and is it included in the rent?"
5. **Contact:** record how to contact every room. Public `contact` field: channel (e.g. "Flatmates message", "Agent: phone or enquiry form"), business name for businesses only, and the contact page link. Private, Sheet only (never in the repo): the lister's or agent's name, and any phone number or email printed on the listing or the business's own contact page. Note when a lister offers a mobile number, but don't try to reveal it: on Flatmates it needs a paid upgrade (tested 18 Oct 2026), and Gumtree's "Show number" needs a Gumtree sign-in. Flatmates messages are free, but delayed for listings under 14 days old ("Early Bird") unless upgraded. Study Stays provider contacts need Chaitanya's own Study Stays sign-in. Never pay for an upgrade or sign in for him. Keep first contact on the listing site.
6. **Household:** copy what the listing says (number of people, ages, work or study, habits, house rules) and who can apply (`who_can_apply`, e.g. "Anyone except couples", "Females only"). Claude cannot vet people; write 3 to 5 `inspection_questions` instead.
7. **Fraud and scam checks** (catalogue, levels and sources: `shared/SCAM_FLAGS.md`). Think through every listing, from any source, as if it might be fake:
   - Give the source its trust tier: **A** official or licensed agent (UNSW Village, AHN, realestate.com.au and Domain agent listings), **B** moderated site, verify (Flatmates, UNSW Study Stays, Down Under Stay), **C** open classifieds or overseas marketplace, extra checks (Gumtree, uhomes, Casita, Facebook, anything new).
   - Check the listing text for every flag in the catalogue: money before inspection, owner away or keys posted, untraceable payment, ID or bank documents up front, off-platform contact, rent in advance over 2 weeks, bond over 4 weeks or not lodged, cash only, boarding house not on the register, sub-let without consent, pressure, "from" prices, stale dates, contradictions.
   - Cross-checks: rent below 65% of the middle price of the same room type in the same suburb in today's data; the same photos (hash distance 6 or less) or the same description in another suburb; Flatmates lister signals (no verified social media together with another weak sign, last online 14 days or more ago, response rate 15% or less, fewer than 3 photos, no description).
   - Write each hit to `scam_flags` as `{code, level, reason}`. The reason says why in plain words and quotes the listing where it can. Set `risk` to the highest level and `trust` to the tier.
   - Set `women_only`: `stated` when the listing says women, females, girls or ladies only; `likely` when it is tagged "All female flat" or is a shared room with a woman. If it says "Anyone" but is tagged all-female, add an `inconsistent_details` flag.
   - Never contact, pay or apply to test a listing. Flags are prompts to check, not proof.
   - If the room is tier C, unverified, or gets a 🔴 high flag, stop there: it is not considered (no draft, no ranking, not summarised). It may be kept in the JSON as history only.
8. **Verify:** keep the official listing link (photos are there). Mark ✅ only when the listing page itself was read.
9. Draft an `enquiry_draft` message for good listings. Chaitanya sends it himself.
10. Inspections and deadlines go to the **Accommodation** calendar (🟡 / 🔵 ladder).

## 4. Ranking (default)

1. Most bills included (4 of 4 first)
2. Walkable to UNSW
3. Cheapest rent (plus estimated missing bills)
4. Earliest suitable move-in date

The website shows trusted and safe rooms only (it drops every other room on load). Sorts: cheapest · closest then cheapest · earliest move-in · shortest contract first · lowest risk first · newest. Filters: Flags (any, none, flagged only), Women-only rooms (default: hidden, including all-female flat tags), Contract length (the minimum you sign for), I want to stay for (N months), These bills must be included, Washing machine, Risk, Source trust, and the usual room filters. Each card names every bill as ✅ included, ❌ extra or ❔ not mentioned, and shows the contract summary next to the listing's own wording.

## 5. Outputs

- `docs/data/accommodation.json` (commit + push).
- Google Sheet tab **Accommodation** with Status dropdown (new, enquired, inspected, rejected, signed), plus Bills included, Bills extra (you pay), Bills not mentioned, Contract length, Contract group, Laundry, Laundry evidence, Who can apply, Women only, Source trust, Risk, Flags (reasons), In default view, Contact via, Contact name, Phone and Email columns. The Sheet's filter hides rows where In default view is `no`. Never overwrite a Status Chaitanya set.
- Run summary: new trusted and safe rooms, best 5 (with contract length and which bills are included), how many women-only rooms are hidden, sources not checked. Rooms that are not trusted and safe are left out of the summary.

Never pay, apply, book an inspection or message anyone.
