# 🔐 Personal config (template only, no values here)

This repo is public, so personal values are **never** stored here. Each run gets them from, in order:

1. The **scheduled-task prompt** (private, in Chaitanya's Claude account), or the message that invoked the skill.
2. **Claude memory**: project file `areas/automation-config.md` in the "Masters in UNSW for Master of Information Technology" project.
3. If a value is still missing, the run stops that step and says which value is missing. It never guesses.

| Key | Used by | Example of the kind of value (not the real one) |
|---|---|---|
| `UNSW_SIGNIN` | uni brief | UNSW sign-in name used as Outlook `login_hint` |
| `GMAIL_1` | all | Gmail read through the connector |
| `GMAIL_2` | all | Gmail read in Chrome (Mac awake only) |
| `GOOGLE_ACCOUNT` | all | Account that owns Drive, Sheets and the six calendars |
| `SHEET_URL` | all scouts | Google Sheet with one tab per scout |
| `DRIVE_ROOT` | casual scout | `Claude Automations/` folder |
| `RESUME_BASE` | casual scout | Base casual resume (from Downloads, filed in Drive) |
| `HOME_BASE` | casual, rooms | Where distances are measured from (UNSW Village) |
| `PAY_FLOOR` | casual scout | AUD per hour |
| `RENT_MAX` | rooms | AUD per week |
| `MOVE_IN_WINDOW` | rooms | Dates |
| `BREAK_WINDOWS` | internships | UNSW break dates |
