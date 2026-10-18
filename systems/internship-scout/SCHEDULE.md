# ⏰ Schedule · 🚀 internship-scout

| Field | Value |
|---|---|
| When | Every day, 4:38 am Sydney |
| Cron | `CRON_TZ=Australia/Sydney 38 4 * * *` |
| Scheduled task | New scheduled task. |
| Notifications | Push only (no email) |
| Model | Account default for scheduled tasks (currently claude-opus-5) |
| Connectors | Google Drive (Sheet) · Google Calendar · Gmail (LinkedIn and Prosple alerts) · Claude in Chrome (LinkedIn, UNSWConnect) · memory · GitHub |
| Personal values used | SHEET_URL, GOOGLE_ACCOUNT, BREAK_WINDOWS |

## 🧾 Prompt the scheduled task sends

The prompt is the same text as a manual run, so `/internship-scout` and the scheduled task behave the same way. The `<PERSONAL BLOCK>` is filled from memory only inside the scheduled task, never here.

```text
Run Chaitanya's Internship scout now. Invoke the `anthropic-skills:internship-scout` skill (his saved `internship-scout` skill) and follow it end to end.
If that skill is not available, fetch https://raw.githubusercontent.com/chaitanyavankhande/radar/main/systems/internship-scout/SKILL.md with WebFetch and follow it exactly.

Repo: attach github.com/chaitanyavankhande/radar with the add_repo tool (push access), clone it, and commit your data file there as the skill says.
Browser: use the Claude in Chrome tools for Chrome-only sources if they are available. If they are missing or the computer is unreachable, mark those sources "not checked" and carry on.

Unattended run: nobody is watching. Do not ask questions. Take the most reasonable reading and say which one you took in the summary. Do not create, change or delete scheduled tasks. Never apply, submit, pay, register, send or message anyone.

Time zone: Australia/Sydney. "Today" means today in Sydney.

Personal values (private; never copy them into the repo or any public page):
<PERSONAL BLOCK: SHEET_URL, GOOGLE_ACCOUNT, BREAK_WINDOWS. Filled in from Claude memory when the task is set up. Never committed.>

Finish: Commit docs/data/internships.json, update the Sheet tab, end with 3 lines: new roles, closing soonest, sources not checked.
```

## 🔁 When the Mac is asleep

Cloud sources still run. Chrome sources (they need the Mac awake with Chrome open) are marked **not checked** with the reason. Run `/internship-scout` by hand later to fill them in.

## 🧪 Checks after setting up

1. Fire the task once by hand and read the run.
2. Confirm it could read memory, reach Chrome and push to the repo.
3. Confirm the push notification arrived on the phone.
