# ⏰ Schedule · 🏠 accommodation-scout

| Field | Value |
|---|---|
| When | Every day, 4:54 am Sydney, until Chaitanya says a lease is signed |
| Cron | `CRON_TZ=Australia/Sydney 54 4 * * *` |
| Scheduled task | New scheduled task. Disable it (do not delete) once a lease is signed. |
| Notifications | Push only (no email) |
| Approval | **Automatically approve** (set by Chaitanya in the task settings; Claude cannot set it). Never "Manually approve": nobody is there at run time. Safety comes from `shared/RULES.md` section 3. |
| Model | Account default for scheduled tasks (currently claude-opus-5) |
| Connectors | Google Drive (Sheet) · Google Calendar · Claude in Chrome (realestate.com.au, Roomgo, Facebook groups) · memory · GitHub |
| Personal values used | HOME_BASE, RENT_MAX, MOVE_IN_WINDOW, SHEET_URL, GOOGLE_ACCOUNT |

## 🧾 Prompt the scheduled task sends

The prompt is the same text as a manual run, so `/accommodation-scout` and the scheduled task behave the same way. The `<PERSONAL BLOCK>` is filled from memory only inside the scheduled task, never here.

```text
Run Chaitanya's Accommodation scout now. Invoke the `anthropic-skills:accommodation-scout` skill (his saved `accommodation-scout` skill) and follow it end to end.
If that skill is not available, fetch https://raw.githubusercontent.com/chaitanyavankhande/radar/main/systems/accommodation-scout/SKILL.md with WebFetch and follow it exactly.

Repo: attach github.com/chaitanyavankhande/radar with the add_repo tool (push access), clone it, and commit your data file there as the skill says.
Browser: use the Claude in Chrome tools for Chrome-only sources if they are available. If they are missing or the computer is unreachable, mark those sources "not checked" and carry on.

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
