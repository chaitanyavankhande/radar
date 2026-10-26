---
name: "flight-scout"
description: "On-demand scout for cheap but decent flights X to Y, Y to X or both over a date range. Applies card, student and coupon offers, checks bags, meals, layovers and transit visas, ranks by real price. Updates the radar site."
---

# ✈️ flight-scout

Runs only when Chaitanya types `/flight-scout`. No schedule. Never books, pays or enters card details.

## 0. Before anything

1. Read the private preference file **`claude/Flight_Scout_Preferences.md`** in his claude.ai Project (master rules: passport for transit checks, bags, meal rules, offer scope, layover caps, output lists). If this file and the skill disagree, the preference file wins. If it can't be read, say so and use section 2 below.
2. Read `shared/RULES.md` (section 3: unattended runs, safe browsing) and `shared/SOURCES.md` section 7 from a clone of the radar repo.
3. Get this run's inputs from his message. Ask only for what is missing, in one short question:
   - **X and Y** (city or airport) and **direction(s)**: X to Y, Y to X, or both.
   - **Date range** for each direction. If he gives none, use the **default dates**: leave Sydney any day from **10 Dec to 7 Jan**, return in the **first week of Feb (1 to 7 Feb)**. Roll the years forward to the next such window.
   - **Passengers**, if not just him.
4. **Always** price both ways for a two-direction trip: one return ticket, and the two directions booked separately. Pick whichever is cheaper among decent airlines, after the best combined offer (section 4).

## 1. What a "decent" flight is (hard filters)

| Rule | Value |
|---|---|
| Stops | At most 1 |
| Ticket | One ticket, bags checked through X to Y. Drop self-transfer and "virtual interlining" (Kiwi-style) itineraries |
| Layover | At most 8 h. Overnight layover kept: say if the airline gives a free hotel, else flag 🌙 overnight in airport |
| Journey time | Under 24 h per direction |
| Airline | Genuinely good customer experience. Claude judges each airline (rating, on-time record, cabin, service, complaints) and writes 2 to 3 sentences why it qualifies (`airline_reason`, shown behind the ⓘ on the site) |
| Bags | Checked allowance from the preference file. Low-cost fares are kept only with bags and meals added to the price |
| Meals | Included on any leg over about 4 h (Claude judges); special meal from the preference file must be pre-bookable, else say so |
| Nearby airports | Within 2 h by ground, transfer cost and time added; named exceptions in the preference file (e.g. Mumbai for Pune) |

## 2. Flags (kept, never hidden by default)

| Flag | When |
|---|---|
| 🔴 Transit visa | A layover country needs a transit visa for the passenger's passport (from the preference file) |
| 🌙 Overnight in airport | Layover overnight with no airline hotel |
| 🚇 After hours | Arrives when public transport at the arrival airport is not running |
| 🎓 UNSW clash | A travel day falls in UNSW teaching or exams (calendar in `systems/internship-scout/SKILL.md`) |

## 3. Sources in rank order

Use `shared/SOURCES.md` section 7. Chrome sources (Google Flights, Skyscanner, airline sites, OTAs) run one tab at a time at human pace. If the Mac is asleep, mark them **not checked** and say live fares could not be read. Never present remembered or estimated fares as live prices.

1. **Find:** Google Flights date grid and results for every direction, plus return tickets. Skyscanner for cross-checking and extra sellers.
2. **Confirm** each shortlisted flight on the airline's own site (price, bag, meal, special meal) or a trusted seller from the list. Untrusted sellers are skipped and listed under "Skipped as suspicious".
3. **Offers:** official offer pages of the platforms and banks in section 7 (cloud). Record expiry, cap, minimum amount and whether international bookings count.

## 4. Price every flight the same way

```
real price = base fare + bag and meal add-ons + card surcharge + forex markup − best legal offer
total      = real price + ground transfer (nearby airports only)
```

- Compare prices **only after** discounts. Try every allowed combination of student fare or discount + best credit card offer + coupon, and keep the cheapest one that the terms allow to stack. Name it in `best_offer` with what it needs (card, code, platform, minimum).
- Card offers: every Indian bank card (he need not hold it); mention an Australian card when it beats them.
- Price **both** ways for two-direction trips: one return ticket, and two separate one-ways. Show the cheaper clearly.
- Show AUD and INR side by side, with the rate and the date it was read.
- Every price carries the time it was seen. Fares change; mark ✅ only when the seller's own page showed it.

## 5. Ranking (default)

Cheapest `total` first, among flights that pass section 1. Ties: shorter journey, then fewer flags. The site also offers fastest, earliest departure and fewest flags.

## 6. Outputs

- `docs/data/flights.json` (`shared/DATA_SCHEMA.md`, lists `out`, `back`, `return`): top 25 per direction plus top 25 return tickets. Items from earlier runs for other routes or dates get `closed: true`.
- Radar site tab **Flights** only. No Sheet tab, no calendar.
- Run summary in chat: cheapest per list, the best offer and what it needs, return vs one-ways verdict, flags, sources not checked, skipped sellers.

Never book, hold a fare, enter passenger or card details, or sign in.
