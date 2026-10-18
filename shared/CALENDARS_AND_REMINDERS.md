# 🗓️ Calendars and reminders

## Six Google Calendars (in the connector Google account)

| Calendar | Filled by | What goes in |
|---|---|---|
| **UNSW** | `uni-daily-brief` | Assessments, exams, quizzes, practicals, admin deadlines, class/room changes |
| **Internships** | `internship-scout` | Application closing dates, interviews |
| **Casual & Part-time Jobs** | `casual-and-part-time-jobs` | Application closing dates, interviews, trial shifts |
| **Hackathons** | `hackathon-scout` | Registration deadlines |
| **Events** | `uni-daily-brief` (from emails) | Society and Arc events, careers fairs, employer talks, networking meetups, workshops, social events: anything that builds network or skills |
| **Accommodation** | `accommodation-scout` | Inspections, application deadlines, lease start dates |

Colours: Claude picks a distinct colour per calendar. All times are created with time zone `Australia/Sydney`.

The Google Calendar connector can add and change events but cannot create calendars, so the six calendars are created once in Chrome on calendar.google.com.

## Event format

- Title: `🔴 DUE · COMP9024 Data Structures and Algorithms · Assignment (12%)`
- Placed **at the deadline time** (not the start of the day).
- Description: what it is, official link, source, verification tag, and a hidden tag `radar-id:<item id>` so re-runs update the same event instead of duplicating it.
- When an official source changes a date, the event is moved, memory is updated, and the brief reports the change.

## Reminder ladder (phone popups; Google allows at most 5 per event, at most 4 weeks before)

| Tier | Applies to | Reminders before the deadline |
|---|---|---|
| 🔴 Major | Exams, mid-terms, assignments worth 10% or more, internship closing dates | 2 weeks · 1 week · 3 days · 1 day · 3 hours |
| 🟠 Weekly assessed | Quizzes, practicals, tutorial quizzes | 3 days · 1 day · 6 hours · 2 hours · 30 min |
| 🟡 Admin action | Modules, forms, enrolment, payments, room applications | 1 week · 3 days · 1 day · 3 hours |
| 🔵 Event | Inspections, help sessions, talks, hackathon registrations | 1 day · 2 hours |
