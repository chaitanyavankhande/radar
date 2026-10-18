# Rules for Claude in this repo

This repo is **public**. Read this before changing anything.

## Never commit

- Email addresses (except public UNSW office addresses already in `shared/SOURCES.md`), zID, phone numbers, street addresses, date of birth, visa or passport details.
- Resume content, salary or bank details, the Google Sheet URL, Drive folder IDs.
- Tokens, passwords, cookies, API keys. If one appears anywhere, stop and tell Chaitanya.

Personal values belong in the scheduled-task prompt or Claude memory (`areas/automation-config.md`), as described in `shared/PERSONAL_CONFIG.md`.

## Sync rule

- The Claude skill in Chaitanya's account is the master copy.
- When a skill changes, update `systems/<name>/SKILL.md` to the same text in the same session, and add a line to `decisions/DECISION_LOG.md`.
- When a schedule changes, update `systems/<name>/SCHEDULE.md` and the table in `README.md`.

## Data files

- Only scouts write `docs/data/*.json`, following `shared/DATA_SCHEMA.md`.
- Never delete an item. Closed items get `closed: true`.
- The `status` field comes from the Google Sheet; never overwrite a status Chaitanya set.
- Validate JSON before committing (`python3 -m json.tool file.json`).

## Commits

- One commit per run: `data(<system>): YYYY-MM-DD run, N new, M closed`.
- Docs and skill changes: `docs(<system>): <what changed>`.
- Website changes: `site: <what changed>`.

## Style

Structured, short, no em dashes, full course names with codes, Sydney dates.
