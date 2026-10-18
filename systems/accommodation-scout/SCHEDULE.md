# ⏰ Schedule · 🏠 accommodation-scout

| Field | Value |
|---|---|
| When | Every day, 4:54 am Sydney, until Chaitanya says a lease is signed |
| Cron | `CRON_TZ=Australia/Sydney 54 4 * * *` |
| Scheduled task | New scheduled task. Disable it (do not delete) once a lease is signed. |
| Notifications | Push only (no email) |
| Model | Account default for scheduled tasks (currently claude-opus-5) |
| Connectors | Google Drive (Sheet) · Google Calendar · Claude in Chrome (realestate.com.au, Roomgo, Facebook groups) · memory · GitHub |
| Personal values used | HOME_BASE, RENT_MAX, MOVE_IN_WINDOW, SHEET_URL, GOOGLE_ACCOUNT |

## 🧾 Prompt the scheduled task sends

The prompt is the same text as a manual run, so `/accommodation-scout` and the scheduled task behave the same way. The `<PERSONAL BLOCK>` is filled from memory only inside the scheduled task, never here.

```text
Run Chaitanya's accommodation scout. Invoke the `accommodation-scout` skill and follow it end to end.
If that skill is not available, fetch https://raw.githubusercontent.com/chaitanyavankhande/radar/main/systems/accommodation-scout/SKILL.md with WebFetch and follow it exactly.

Unattended run: nobody is watching. Do not ask questions. Take the most reasonable reading and say which one you took in the summary. Do not create, change or delete scheduled tasks. Never apply, submit, pay, register, send or message anyone.

Time zone: Australia/Sydney. "Today" means today in Sydney.

Personal values (private; never copy them into the repo or any public page):
<PERSONAL BLOCK: HOME_BASE, RENT_MAX, MOVE_IN_WINDOW, SHEET_URL, GOOGLE_ACCOUNT. Filled in from Claude memory when the task is set up. Never committed.>

Finish: Commit docs/data/accommodation.json, update the Sheet tab, end with 3 lines: new rooms, best room, scam flags.
```

## 🔁 When the Mac is asleep

Cloud sources still run. Chrome sources (they need the Mac awake with Chrome open) are marked **not checked** with the reason. Run `/accommodation-scout` by hand later to fill them in.

## 🧪 Checks after setting up

1. Fire the task once by hand and read the run.
2. Confirm it could read memory, reach Chrome and push to the repo.
3. Confirm the push notification arrived on the phone.
