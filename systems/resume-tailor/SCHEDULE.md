# ⏰ Schedule · 🎯 resume-tailor

| Field | Value |
|---|---|
| When | On demand only: `/resume-tailor <link> [<link> …]` |
| Scheduled task | None. It needs live answers (form questions, his blanks) and web pages that scheduled runs can't open |
| Connectors | Google Drive (Sheet, Drive folders) · Claude in Chrome (postings and forms behind JavaScript) · Claude Docs (base resume) · memory · GitHub (clone only) |
| Personal values used | Read from private project docs in his claude.ai Project, never from this repo |

## 🧰 Files here

| File | What it is |
|---|---|
| `SKILL.md` | The instructions (same text as the Claude skill) |
| `rt_build.py` | The builder: one JSON → `.tex` → PDF, plus `.txt` and optional `.docx`, then ATS-style checks (page count, size, `pdftotext` round trip, ligatures, clickable links, reading order, lint). No personal data |

Personal facts, the base resume JSON, form answers and Drive or Sheet ids live only in the private project docs, never in this repo.
