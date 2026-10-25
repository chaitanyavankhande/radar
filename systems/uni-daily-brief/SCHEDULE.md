# ⏰ Schedule · 🎓 uni-daily-brief

| Field | Value |
|---|---|
| When | Every day, 7:45 am Sydney (brief ready by about 8:00) |
| Cron | `CRON_TZ=Australia/Sydney 45 7 * * *` |
| Scheduled task | Rewrites the existing morning brief scheduled task in place (same task, new name and prompt). No second uni task. |
| Notifications | Push only (no email) |
| Approval | **Automatically approve** (set by Chaitanya in the task settings; Claude cannot set it). Never "Manually approve": nobody is there at run time. Safety comes from `shared/RULES.md` section 3. |
| Model | Account default for scheduled tasks (currently claude-opus-5) |
| Connectors | Gmail · Google Calendar · Google Drive · Claude in Chrome (Outlook, second Gmail) · memory · GitHub (radar repo) |
| Personal values used | UNSW_SIGNIN, GMAIL_1, GMAIL_2, GOOGLE_ACCOUNT |

## 🧾 Prompt the scheduled task sends

The prompt is the same text as a manual run, so `/uni-daily-brief` and the scheduled task behave the same way. The `<PERSONAL BLOCK>` is filled from memory only inside the scheduled task, never here.

```text
Run Chaitanya's UNSW daily brief now. Invoke the `anthropic-skills:uni-daily-brief` skill (his saved `uni-daily-brief` skill) and follow it end to end.
If that skill is not available, fetch https://raw.githubusercontent.com/chaitanyavankhande/radar/main/systems/uni-daily-brief/SKILL.md with WebFetch and follow it exactly.

Repo: attach github.com/chaitanyavankhande/radar with the add_repo tool (push access), clone it, and commit your data file there as the skill says.
Browser: use the Claude in Chrome tools for Chrome-only sources if they are available. If they are missing or the computer is unreachable, mark those sources "not checked" and carry on.

Unattended run: nobody is watching. Do not ask questions. Take the most reasonable reading and say which one you took in the summary. Do not create, change or delete scheduled tasks. Never apply, submit, pay, register, send or message anyone.

Time zone: Australia/Sydney. "Today" means today in Sydney.

Personal values (private; never copy them into the repo or any public page):
<PERSONAL BLOCK: UNSW_SIGNIN, GMAIL_1, GMAIL_2, GOOGLE_ACCOUNT. Filled in from Claude memory when the task is set up. Never committed.>

Finish: Update the pinned brief page, commit docs/data/uni.json, then end with two lines: the day's shape and the single most pressing thing.
```

## 🔁 When the Mac is asleep

Cloud sources still run. Chrome sources (they need the Mac awake with Chrome open) are marked **not checked** with the reason. Run `/uni-daily-brief` by hand later to fill them in.

## 🧪 Checks after setting up

1. Fire the task once by hand and read the run.
2. Confirm it could read memory, reach Chrome and push to the repo.
3. Confirm the push notification arrived on the phone.
