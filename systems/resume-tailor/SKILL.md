---
name: resume-tailor
description: Paste internship or full-time job links; for each, checks eligibility and legal hours, researches country and company formats, and builds a tailored resume and cover letter (PDF, Overleaf .tex, text).
---

# 🎯 resume-tailor

**Use:** `/resume-tailor <link> [<link> …]` or "tailor my resume for <link>". Input can be posting URLs, pasted posting text, or a PDF/screenshot of a posting. Optional words after the links: `1-page`, `docx`, `my-draft`.
**Scope:** internships and full-time jobs only. A casual or part-time posting → say it belongs to the casual-and-part-time-jobs skill and stop for that link.
**Runs interactively** (scheduled runs can't fetch most pages). Replies start with "Hey Chaitanya". No em dashes anywhere.

## Hard rules

1. **Truth only.** Every claim maps to a line in the project doc `claude/Master_Career_Achievements_Document.md` or memory `areas/resume.md`. The doc's §0 never-use list always wins; otherwise the most recently confirmed fact wins. §0 unconfirmed items need his yes in this run. Never invent anything (no details, names, dates, metrics or baselines). Missing details become `[ADD: …]`; any placeholder makes the files `_DRAFT`.
2. **Form answers come only from** `claude/Application_Form_Answers.md`. A blank (`[ADD]`, `[YOU DECIDE]`), a row with no date in "Confirmed by you on", or a compound question ("sponsorship now or in the future") is asked in chat; write his answer back to that doc with the date. Never fill demographic (EEO) questions.
3. **Never apply, submit, type into an application form, email or contact an employer.** Opening a form read-only to see its questions is fine. Never change the Status column of the tracker.
4. **Never commit resume content, Drive links or personal details** to the public radar repo.
5. **Sources:** format rules from Tier 1 pages only (official body, university careers service, company's own site, vendor docs); tag ✅ / ⚠️ / 🚫 in the report. Company hints in the reference doc are hints; re-read the posting's own facts every run.
6. **Watermarks:** never claim output is unmarked; never rewrite text or strip files to defeat provenance marking. The writing mode is chosen for authorship and the employer's policy only.
7. **Cheapest path first:** vendor JSON → WebFetch → Claude in Chrome (one tab, human pace, read-only) → ask him to paste.

## 0. Load (once per run)

- Project docs: `claude/Master_Career_Achievements_Document.md` (§0 first), `claude/Resume_Format_Reference.md` (config §0, council §1, work-rights engine §2, writing §3, cover letter §4, builder JSON §5, links §L, country tables §A to §E), `claude/Resume_Base_JSON.md`, `claude/Application_Form_Answers.md`.
- Memory (this project's folder): `areas/resume.md`, `areas/internship-applications.md`, `areas/linkedin-portfolio.md`, `areas/mit-course-planning.md`, `areas/automation-config.md`.
- Builder: `rm -rf /tmp/radar && git clone --depth 1 https://github.com/chaitanyavankhande/radar /tmp/radar`, then use `/tmp/radar/systems/resume-tailor/rt_build.py`. If the clone fails, follow `claude/Resume_Tailor_Builder.md`. Tools: `pdflatex` missing → `apt-get install -y texlive-latex-extra poppler-utils`; Python libraries → `pip install python-docx pypdf --break-system-packages`.
- No project tools in this chat → say so and ask him to run it inside the UNSW Master of IT project.
- Make a task list: one item per link plus "council review" and "deliver".

## 1. Read every posting, then gate (all links before any building)

1. **Find the real vendor**, including embedded boards: a numeric job id on a company page is often Greenhouse, Lever or Ashby underneath (e.g. the Greenhouse board API `boards-api.greenhouse.io/v1/boards/<board>/jobs/<id>`). Try the vendor's public JSON, then WebFetch, then Chrome `get_page_text`.
2. **Open the Apply form read-only** (Chrome) to list its questions, required documents and file limits. Never type, never submit. Anything still unseen → mark 🚫 and ask him to paste it.
3. **Save `JD_snapshot.md`:** URL, date read, full posting text, form questions.
4. **Extract:** company, program, role, job type (internship / full-time), location, country, work location (onsite, remote, overseas), dates, hours, closing date (none → flag "rolling or late in cycle"; already passed, or sources disagree → ⚠️ and ask him before building it), must-haves vs nice-to-haves, exact keywords, values words, documents asked for (cover letter, transcript, essay, VEVO letter), form-only fields (e.g. preferred interview languages), file limits.
5. **Gate checks:**
   - Work-rights requirement **per program** (citizen/PR only, "full working rights"). Conflicting sources → ⚠️.
   - Student requirement (penultimate year, graduation window).
   - **Work-rights engine** (reference §2): fortnight-by-fortnight hours table for every in-session overlap; Summer Term branch from the Form Answers; overseas roles → attendance + host-country visa route and lead time (§E). Full-time roles: start while studying vs after completing the course.
   - Break fit (the internship-scout break list); "up to 14 days over" is fine only if the hours table passes.
   - Duplicates at **company level** (Opportunities Tracker Sheet, memory `areas/internship-applications.md`): some firms allow one application across all offices or one posting only. A hit → say so in the table and build only if he says yes.
   - Employer's policy on AI in applications (its careers or candidate-guidance page) → writing mode.
   - Knockout and form questions → answers from the Form Answers doc; ask for blanks.
6. **Outcome per link:** ✅ eligible · ⚠️ unclear (build, flagged) · ❌ clearly ineligible: **still build it** (his decision), with a red warning at the top of the summary and report saying why.
7. Show **one table for all links** (company · role · type · country · outcome · hours result · closes · AI policy · questions for him). Ask his blanks with clickable options where the answer is a fixed choice. Then run **council G1** (reference §1).

## 2. Format card (per link)

- Priority: the posting's own instruction > the company's own guidance > the country row (reference §A, §A2) > the international default. Re-verify a row older than 6 months or research a missing country live (Tier 1), and update the reference doc with a dated change-log line.
- Company research (always live): how-we-hire, students or early-careers, FAQ, values, candidate AI guidance, engineering blog for the real stack. Reuse a same-company report under 6 months old from Drive.
- ATS vendor rules (reference §B) plus the form's own file limit.
- Quant/trading intern with no length guidance → ask him, default 1 page. Full-time roles → experience before education.
- No work-rights line where he has no right to work in that country; no salary line on intern resumes.
- Output one line, e.g. `AU · A4 · 2 pages · en-AU · no photo/DOB · work-rights line · education first · Referees: Available upon request · PDF ≤2.5 MB (Greenhouse) · angle: backend performance`. Run **council G2**.

## 3. Tailor (per link)

1. **Requirement matrix:** each requirement → his best evidence (with the source line) → strong / partial / gap → the JD's exact phrase.
2. **Angle** by role family (reference §3): backend/infra, AI/LLM, quant/trading SWE, full-stack. Use the evidence reference §3 lists for that family.
3. Mirror a JD term only when literally true; otherwise it goes in the gap list with an honest fix (cover-letter line, project, course).
4. Run **council G3**.

## 4. Write the resume

- **Mode:** 🅰 Claude drafts (default). 🅱 when he types `my-draft` or the employer's policy asks for his own draft: give him the selected facts and an X-Y-Z skeleton per bullet, he writes, Claude checks and fixes errors only. Record the **AI-use log** (mode, lines Claude drafted, lines he changed).
- Copy the base JSON from `claude/Resume_Base_JSON.md`; adjust `meta` per the format card (reference §5) and select, order and trim sections and bullets per the matrix and the bullet budget (4-5 main-role bullets for 1 page, 6-8 for 2). Keep his approved wording where it fits; new wording follows reference §3 (X-Y-Z with a baseline only where one is known).
- Fill `meta.allowed_numbers` with every number in the source lines used. Replace `[ADD: visa expiry]` from the Form Answers when it's there.
- Spelling and paper follow the country (A4 except US/Canada Letter). Outside Australia set `basics.phone` to the international form (reference §3 Header).

## 4b. Write the cover letter (every job)

- Rules: reference §4 and §A2. One page, 3-5 paragraphs: purpose + role + why this company → 2-3 matrix stories with numbers → one line tied to the company's stated values → close, thanks, contact.
- Greeting to a named person only if found on the posting, company site or LinkedIn; never invent a name; otherwise the country fallback and matching sign-off.
- Same mode, truth rules, lint, spelling and AI-use log as the resume. Never claim a right to work he doesn't have.
- Employer says it doesn't need one, or the posting and form never ask for one → still write it; mark it "not requested: attach only if there's a slot".
- Copy `allowed_numbers`, `never_use` and `spelling` from the resume's `meta` into the letter's `meta`.
- Essays and free-text answers (e.g. a 150-300-word essay): give an outline from the matrix only; he writes; Claude checks. A full draft only if he asks and the employer's AI policy allows it.

## 5. Build and check

```
python3 /tmp/radar/systems/resume-tailor/rt_build.py resume resume.json OUT [--docx]
python3 /tmp/radar/systems/resume-tailor/rt_build.py letter letter.json OUT [--docx]
```

- `--docx` only when the posting or portal asks for Word, or he typed `docx`.
- Use a fresh OUT folder per build and upload only the paths listed in the report's `files`.
- Exit 1 = FAIL: fix every `hard` item (em dash, first person, duty phrase, never-use phrase, number not allowed, letter not naming the company, text past the margin, page limit, size, missing text or links) and rebuild. Read every `warn` item and fix the real ones. `DRAFT` = placeholders remain; list them for him.
- Render page 1 of each PDF to an image (`pdftoppm -r 70 -png -f 1 -l 1`) and look at it before delivering.

## 6. Council G4 (independent)

Spawn a fresh agent with the G4 prompt in reference §1, giving it: the posting snapshot and form questions, the `pdftotext` output of both PDFs, the fact sheet (§0 verbatim, `areas/resume.md`, the career-doc lines used), the Form Answers used, the AI-use log and the format card. ❌ → back to step 4 or 4b (at most two loops, then ask him). Put the verdicts in the report. No agent tool on this surface → run G4 as a separate pass that reads only those inputs, and label it "not independent" in the report.

## 7. Links

Show the three links in reference §L (Overleaf Jake's Resume, the Overleaf paste steps, UNSW SMART Resume). The rest only on request.

## 8. Deliver and log

- **Chat, per link:** send the resume PDF and `.tex` and the cover letter PDF and `.tex` (SendUserFile), then a short block: format card · eligibility and hours result · form answers to use · documents to attach · top 3 gaps · council verdict · Drive folder link.
- **Drive:** create the folder `YYYY-MM-DD Company - Role` inside Internships or Full-time (ids and steps in reference §0) and upload: both PDFs, both `.tex`, both `.txt`, DOCX if built, `resume.json`, `letter.json`, `JD_snapshot.md`, `Tailoring_Report.md` (matrix, gaps, hours table, form answers, documents to attach, AI-use log, council verdicts, interview prep: each bullet → the story behind it).
- **Sheet** (reference §0): on the Internships or Full-time tab, set `Resume pack` (the Drive folder link) and `Tailored on` on the job's row; add a row only if the job isn't there. Never touch Status.
- **Several links:** finish with one summary table (company · role · country · format · pages · outcome · gaps · files).
- If he corrects a fact, update `claude/Resume_Base_JSON.md` (and say the career doc needs the same fix).
