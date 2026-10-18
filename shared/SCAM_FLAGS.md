# 🚩 Fraud and scam flags for rooms

Used by `accommodation-scout` on every listing, from every source. Researched 18 Oct 2026 from Tier 1 sources only (Scamwatch, NSW Government, NSW legislation, NSW Police, Tenants' Union of NSW, UNSW, Arc, Study Australia, eSafety, and the platforms' own safety pages). Sources are listed at the end, each marked ✅ (read) or 🚫 (could not read).

A flag is a prompt to check, never proof. Claude never contacts, pays or applies to test a listing.

## 1. How flags are shown

| Level | Meaning | Default view |
|---|---|---|
| 🔴 **high** | A typical scam sign. Stop and verify before any contact beyond the platform. | Hidden |
| 🟠 **medium** | Unlawful in NSW or risky. Must be fixed before you pay anything. | Shown, with reasons |
| 🟡 **low** | Be careful and verify. | Shown, with reasons |

Each listing stores `scam_flags` as `{code, level, reason}`, a `risk` (the highest level) and a source `trust` tier. The website shows every reason on the card. The Sheet has Risk and Flags (reasons) columns.

**Default view (site and Sheet):** trust tier A or B, listing page read (✅), no high flag, not women-only, not closed. Everything else stays in the data and can be shown with the Safety and Women-only filters.

## 2. Source trust tiers

| Tier | Meaning | Sources today |
|---|---|---|
| **A** | Official, or a licensed agent | UNSW Village (CLV), Australian Homestay Network (UNSW partner), realestate.com.au and Domain listings by licensed agents |
| **B** | Moderated site, but private listers: verify | Flatmates.com.au, UNSW Study Stays (UNSW says its properties are not checked), Down Under Stay |
| **C** | Open classifieds or overseas marketplace: extra checks | Gumtree, uhomes, Casita, Facebook groups, and any new source until reviewed |

A licensed agent can still be impersonated: get the agency's number from its own website, not from the ad.

## 3. NSW money limits (each confirmed by two or more Tier 1 sources)

| Rule | Limit |
|---|---|
| Bond (residential tenancy) | At most **4 weeks' rent**, lodged with **NSW Rental Bonds Online** within 10 business days (agents: 10 business days after the end of the month) |
| Rent in advance | At most **2 weeks** (Residential Tenancies Act s 33(2)) |
| Holding fee | Only **after your application is approved**, at most **1 week's rent**, with a written receipt; the place is held for 7 days (s 24) |
| Other fees | No application, background-check or lease-preparation fee (s 23). No pet bond, no fee for the first keys |
| Advertised rent | Must be a **fixed amount**: no ranges, "from" prices or invitations to offer more (s 22A) |
| Rent payment | A fee-free electronic method must be offered; receipts for cash (s 35, s 36) |
| Boarding house | Must be registered if beds are provided for **5 or more paying residents** (not counting the owner, manager or their family) (Boarding Houses Act s 5(2)). Security deposit at most **2 weeks' fee**. Written occupancy agreement required |
| Boarders and lodgers | If the owner or head tenant lives there and controls the house, the Residential Tenancies Act may not apply: no bond-lodgement duty. Know this before paying |
| Student buildings | Purpose-built student accommodation may sit outside the Residential Tenancies Act. Tenancy fee and bond flags are not applied to it; read its contract instead |

## 4. Flags Claude checks automatically

Detect: **L** listing text · **X** an outside cross-check Claude can run.

| Code | Level | What triggers it | Detect |
|---|---|---|---|
| `pay_before_inspection` | 🔴 | Money asked before you inspect: deposit to hold, payment due within days of booking | L |
| `inspection_fee` | 🔴 | A fee to view the room | L |
| `cannot_inspect` | 🔴 | Owner overseas or away, can't show it, keys posted, video tour only | L |
| `unusual_payment` | 🔴 | Western Union, MoneyGram, gift cards, crypto, money order, overseas account | L |
| `id_before_inspection` | 🔴 | Passport, visa, licence, payslips or bank documents asked for up front | L |
| `off_platform_contact` | 🔴 | Pushes you to WhatsApp, WeChat, Kakao, Telegram, QQ, Line, Messenger | L |
| `photos_reused` | 🔴 | The same photos appear in a listing in another suburb (64-bit photo hash, distance 6 or less) | X |
| `too_good_to_be_true` | 🔴 under 50%, 🟠 under 65% | Rent far below the middle price of the same room type in the same suburb in today's data. ⚠️ Our own threshold: no official one exists, and NSW Rent Check has no room medians | X |
| `contact_details_in_ad` | 🟠 | A phone number or email written into the ad | L |
| `application_or_check_fee` | 🟠 | Application, admin, booking, screening or lease fee | L |
| `holding_fee` | 🟠 | A holding fee or "deposit to secure" | L |
| `advance_rent_over_limit` | 🟠 | More than 2 weeks' rent in advance, "first month upfront" | L |
| `pet_bond_or_key_fee` | 🟠 | Pet bond or key fee | L |
| `bond_over_limit` | 🟠 | Bond above 4 weeks' rent | L |
| `bond_not_lodged` | 🟠 | "Self-managed" bond, bond paid to the lister, not lodged | L |
| `bh_deposit_over_limit` | 🟠 | Looks like a boarding house and the deposit is above 2 weeks' fee | L |
| `cash_only` | 🟠 | Cash only | L |
| `urgency_pressure` | 🟠 | "Lots of interest", "pay today", "first come first served" | L |
| `rent_bidding` | 🟠 | "Offers above", "make an offer", "best offer" | L |
| `price_from_only` | 🟠 | Only a "from" or indicative price | L |
| `price_mismatch` | 🟠 or 🟡 | The ad text names a higher weekly price than the listed rent | L |
| `overseas_marketplace` | 🟠 | Overseas booking site, no landlord named | L |
| `address_unverifiable` | 🟠 | No street address, or the location doesn't match | L |
| `not_secured` | 🟠 | The lister doesn't control the place yet ("looking to start a share house"). ⚠️ Our extension of "advertiser is not the owner" | L |
| `text_reused` | 🟠 | The same description is used for a listing in another suburb | X |
| `boarding_house_check` | 🟠 or 🟡 | "Boarding house", 8 or more bedrooms or residents (🟠); 6 or more bedrooms or 5 or more people on Flatmates (🟡): check the NSW register | L, X |
| `overcrowding` | 🟠 | Bunk beds, 3 or more people per bedroom. No official per-room limit was found | L |
| `sublet_check` | 🟡 | Sub-let or lease takeover: ask for the owner's written consent | L |
| `unverified_lister` | 🟡 | Flatmates lister has no verified social media **and** another weak sign below. ⚠️ Not an official sign on its own | X |
| `few_photos` · `no_description` · `photos_on_request` | 🟡 | Fewer than 3 photos, no description, "DM me for photos" | L |
| `inactive_lister` · `low_response` | 🟡 | Last online 14 or more days ago; replies to 15% of messages or less (the room may be gone or the ad may be bait) | X |
| `high_risk_classifieds` | 🟡 | Tier C source (NSW Police: increased risk on lightly moderated sites) | L |
| `studystays_not_vetted` | 🟡 | UNSW does not check Study Stays properties | L |
| `inconsistent_details` · `stale_listing` | 🟡 | Details contradict each other; dates look old | L |

Women-only rooms are not a scam flag. They get `women_only`: `stated` (the listing says women, females, girls or ladies only) or `likely` (tagged "All female flat", or a shared room with a woman). They are hidden by default.

## 5. Checks only Chaitanya can do (conversation, inspection, lookup)

Claude cannot see these from a listing, so they appear as advice on every card and in the enquiry questions:

1. **Inspect in person** before paying anything. A live video call you start can rule a place out, but is not enough to pay a private person (see conflict 1).
2. Refuses a live video call, or sends "their friend" to show you around.
3. Asks to pay into an account whose name doesn't match the person, or splits payment across accounts.
4. Message saying the bank account for rent has changed.
5. Overpays you and asks for a refund; new fees keep appearing after the first payment.
6. Long backstory with "official" papers; poorly written or scripted replies.
7. A "rental application" form that only collects your ID details.
8. Won't give a written agreement, condition report, or receipts.
9. Can't show proof of ownership or authority to rent the room; an "agent" with a Gmail address or a number not on the agency's website.
10. Reverse image search of the photos finds them elsewhere.
11. The address is a holiday rental or a different building.
12. The room you see is not the one in the photos (bait and switch).

## 6. If something goes wrong (in order)

1. Stop paying. Call your bank now to stop or recall the transfer.
2. Keep evidence: screenshots of the ad, profile, chats and payments.
3. If you sent ID: contact [IDCARE](https://www.idcare.org/).
4. Report to police through [ReportCyber](https://www.cyber.gov.au/report-and-recover/report) and [NSW Police](https://www.police.nsw.gov.au/safety_and_prevention/crime_prevention/fraud/property_rental_scams).
5. Report to [Scamwatch](https://www.scamwatch.gov.au/report-a-scam) and to the platform (Flatmates "Report this listing"; Gumtree reporting).
6. Unlawful fees or a known trader: [NSW Fair Trading complaints](https://www.nsw.gov.au/departments-and-agencies/fair-trading/complaints-and-enquiries).
7. Free advice: [Tenants' Advice and Advocacy Service](https://www.tenants.org.au/get-advice), UNSW Off-Campus Accommodation Support (ocas@unsw.edu.au), [Arc Legal](https://www.arc.unsw.edu.au/help/legal-information/Renting).
8. Unhappy with the bank's response: [AFCA](https://www.afca.org.au/make-a-complaint). Watch for "recovery" scams.

## 7. Where sources disagree

1. **Video inspections.** Scamwatch: never pay for a place you cannot inspect; its 2020 alert and NSW Police list "virtual inspections only" as a warning sign. Flatmates calls a video call the best way from overseas, and UNSW Renting tips allows a virtual inspection through a licensed agent. **Working rule:** a video call can rule a place out; pay a private person only after an in-person inspection.
2. **Bond lodgement deadline.** Study Australia says 10 days after moving in (national, general). NSW sources say 10 business days after payment. Use the NSW rule.
3. **Boarding house threshold.** Flatmates says "5 or more rooms"; the Act says beds for 5 or more residents. The Act wins.
4. **Paying by transfer.** UNSW says avoid paying by transfer or cash; the Act makes electronic transfer a lawful rent method once a real lease exists. **Reading:** never transfer to an unverified stranger; pay bond through Rental Bonds Online and rent only under a signed agreement.

## 8. Sources

- ✅ Scamwatch, Buying and selling scams: https://www.scamwatch.gov.au/types-of-scams/buying-and-selling-scams
- ✅ Scamwatch, What to do if you've been scammed: https://www.scamwatch.gov.au/stop-check-protect/what-to-do-if-youve-been-scammed
- ✅ Scamwatch alerts on fake rental listings (2008, 2010, 2020): https://www.scamwatch.gov.au/about-us/news-and-alerts/fake-rental-properties-and-shared-accommodation-listings · https://www.scamwatch.gov.au/about-us/news-and-alerts/looking-for-rental-properties-online-watch-out-for-scams · https://www.scamwatch.gov.au/about-us/news-and-alerts/rental-scams-targeting-more-australians-during-pandemic
- ✅ Residential Tenancies Act 2010 (ss 22A, 23, 24, 25, 28, 29, 33, 35, 36): https://legislation.nsw.gov.au/view/whole/pdf/inforce/2025-11-07/act-2010-042 · 🚫 ss 159 and 162 (the PDF was cut short; limits confirmed by NSW Government and Tenants' Union pages)
- ✅ Boarding Houses Act 2012 (ss 5, 9 to 14, 28): https://legislation.nsw.gov.au/view/whole/pdf/inforce/2024-07-30/act-2012-074 · 🚫 Schedule 1 (cut short; the limit on fees paid in advance in a boarding house was not found)
- ✅ NSW Government, Costs at the start of a tenancy: https://www.nsw.gov.au/housing-and-construction/rules/costs-at-start-of-a-residential-tenancy
- ✅ NSW Government, Finding and applying for a rental: https://www.nsw.gov.au/housing-and-construction/renting-a-place-to-live/starting-a-residential-tenancy/finding-and-applying-for-a-rental-property
- ✅ NSW Government, Advertising and rent bidding: https://www.nsw.gov.au/housing-and-construction/rules/advertising-and-rent-bidding-on-rental-properties
- ✅ NSW Government, Rent receipts: https://www.nsw.gov.au/housing-and-construction/rules/rent-receipts-from-agents-and-landlords
- ✅ NSW Government, Rental Bonds Online for tenants: https://www.nsw.gov.au/housing-and-construction/renting-a-place-to-live/residential-rental-bonds/rental-bonds-online-for-tenants
- ✅ NSW Government, Living in a boarding house: https://www.nsw.gov.au/housing-and-construction/community-living/boarding-houses/living-a-boarding-house
- ✅ NSW Fair Trading, Accommodation register search: https://applications.fairtrading.nsw.gov.au/accomregister/AccommodationSearch.aspx
- ✅ NSW Rent Check (interactive; no room medians, excludes studios): https://www.nsw.gov.au/rent-check · 🚫 its figures could not be read by fetch
- ✅ NSW Police, Property rental scams: https://www.police.nsw.gov.au/safety_and_prevention/crime_prevention/fraud/property_rental_scams
- ✅ Legal Aid NSW, Boarding houses FAQs: https://www.legalaid.nsw.gov.au/lawprompt/legal-topics/housing-and-land/boarding-houses/boarding-houses-faqs
- ✅ Tenants' Union of NSW: Avoiding scams https://www.tenants.org.au/resource/avoiding-scams · Bond https://www.tenants.org.au/factsheet-bond · Share housing https://www.tenants.org.au/factsheet-15-share-housing · Boarding Houses Act https://www.tenants.org.au/factsheet-boarding-houses-act
- ✅ UNSW, Beware of scams (rental): https://unsw.edu.au/student/support/it-support/scams
- ✅ UNSW, Off-campus accommodation and Renting tips: https://www.unsw.edu.au/student/student-life/campus/accommodation/off-campus · https://www.unsw.edu.au/student/student-life/campus/accommodation/renting-tips
- ✅ UNSW Study Stays FAQ: https://studystays.unsw.edu.au/faq · 🚫 Study Stays student terms (blocked by robots)
- ✅ Arc UNSW, Renting: https://www.arc.unsw.edu.au/help/legal-information/Renting
- ✅ Study Australia, Accommodation: know your rights: https://www.studyaustralia.gov.au/en/tools-and-resources/tips-and-advice-for-students/accommodation-know-your-rights
- ✅ eSafety, Gumtree scams: https://beconnected.esafety.gov.au/articles-and-tips/gumtree-scams-how-to-avoid-them
- ✅ Flatmates, How to protect yourself: https://flatmates.com.au/info/how-to-protect-yourself · NSW guide: https://flatmates.com.au/info/nsw-share-accommodation
- ✅ Gumtree, Real estate tips and Types of scams: https://help.gumtree.com.au/AU/articles/en_US/KB_Article/real-estate-AU · https://help.gumtree.com.au/AU/articles/en_US/KB_Article/Types-of-Scams-on-Gumtree-AU
- 🚫 Service NSW, Check a real estate agent licence: https://www.service.nsw.gov.au/transaction/check-a-real-estate-agent-licence (not read; cited by the Tenants' Union)
