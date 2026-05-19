# RTTY.COM Website — Project Context for Claude Code

This file gives you the full context needed to continue work on the RTTY.COM
website rebuild. Read it before touching any files.

---

## What This Project Is

RTTY.COM is a non-commercial archive dedicated to the preservation of
radioteletype history, Baudot teletype art, and the ITTY live wire service.
The site is being rebuilt from a legacy FrontPage/Java-applet site into clean,
modern, maintainable HTML/CSS.

**Owner:** Paul Heller, W2TTY — Arvada, CO
**Original founder:** George Hutchison, W7TTY (Silent Key)
**Original software author:** Bill Bytheway, K7TTY
**Hosting target:** GitHub Pages (static site) with sdf.org redirect stub

---

## Design Decisions — DO NOT CHANGE WITHOUT DISCUSSION

### Aesthetic
Paper teletype / wire service editorial. NOT green-screen CRT. The reference
is the AP/UPI wire room — aged paper, ink, punched tape.

### Fonts
- **Headings / site name / dropcaps / wire-heds:** Special Elite (Google Font) — worn typewriter key feel
- **Body text / prose / sidebar notes / UI elements:** Courier Prime (Google Font),
  fallback 'Courier New', monospace — the entire site uses monospace, consistent with
  the teletype aesthetic. There is no proportional/serif font in use.
- **Art preview:** Courier Prime monospace, tiny (5.5px), green-on-black CRT look

### Colors (CSS variables in rtty.css)
```
--paper:     #f2ede0   (warm cream — page background)
--paper-dk:  #e8e0cc   (slightly darker cream — sidebar, dateline bg)
--ink:       #1a1510   (near-black dark brown — primary text)
--ink-mid:   #3a2e20   (medium brown — body text)
--ink-faint: #7a6a50   (muted brown — secondary text)
--ink-ghost: #b8a888   (very light — DO NOT use for readable text, contrast too low)
--rule:      #c8b898   (rule lines)
--rule-dk:   #9a8868   (stronger rule lines)
--red:       #8b1a1a   (telegraph red — active nav, slugs, callsign labels, links)
```

### Tape Strips
Top and bottom of every page: pale yellow (#f0e8a8) canvas-rendered 5-level
Baudot (ITA2) punched tape. Rendered by `js/tape.js`.
- **Top tape encodes:** `RTTY.COM` (LTRS R T T Y FIGS . LTRS C O M SP)
- **Bottom tape encodes:** `DE W2TTY` (LTRS D E SP W FIGS 2 LTRS T T Y SP)
- Sprocket holes between channels 3 and 2, always punched, smaller radius
- Bit order in TAPE_TOP/TAPE_BOT arrays: [b5, b4, b3, b2, b1]
- **Hover tooltip:** mouseover shows a styled label (`■ ITA2 BAUDOT — RTTY.COM` /
  `■ ITA2 BAUDOT — DE W2TTY`) positioned at the cursor. Top tape tooltip appears
  below the strip; bottom tape tooltip appears above. Implemented in `addTapeHover()`
  in tape.js using a fixed-position div updated on mousemove.

### Layout
- Max-width: 900px, centered, border left/right
- Two-column: `1fr 270px` (main + sidebar) on interior pages
- Homepage uses same two-column for main content + sidebar

---

## Current File Structure

```
rttycom/
├── css/
│   └── rtty.css                  ← ALL shared styles. Edit here, not inline.
├── js/
│   └── tape.js                   ← Baudot tape renderer + hover tooltip logic.
├── downloads/
│   ├── teletype-story.pdf        ← IN ZIP. 40-page Teletype Corp booklet, 1958.
│   └── bsp-570-001-901-...pdf    ← MUST BE COPIED MANUALLY. Merged BSP manual.
├── equipment/
│   └── literature/
│       └── wubook/               ← IN ZIP. 18-part WU Field Service Manual.
│           ├── cover.pdf
│           ├── contents.pdf
│           └── part1.pdf ... part18.pdf
├── gallery/                      ← MUST BE CREATED AND POPULATED MANUALLY.
│   └── *.pix                     ← 147 .pix files. NOT in ZIP. Copy from source.
├── England/                      ← Articles by Alan Hobbs G8GOJ (UK RTTY history)
│   ├── ahobbs.htm                ← G8GOJ biography + article index
│   ├── fiveunits.htm             ← Five-Unit Codes article
│   ├── creed1.html               ← Teleprinters for the Radio Amateur
│   ├── creed2.html               ← Creed & Co — The First 50 Years
│   ├── creed444.html             ← ITT Creed Model 444 Teleprinter
│   ├── g8goj.jpg                 ← Alan Hobbs portrait photo
│   ├── britain.gif               ← Map of Britain graphic
│   ├── bartg.gif                 ← BARTG logo
│   └── cread444.jpg              ← Creed 444 photo (NOTE: typo in filename, 'cread' not 'creed')
├── history/                      ← History Hall article pages
│   ├── krum.htm                  ← A Brief History of the Morkrum Company
│   ├── nelson.htm                ← History of Teletypewriter Development
│   ├── w6owp.htm                 ← W6OWP — Letter of Recollections
│   └── w6owpSK.htm               ← W6OWP Silent Key notice
├── index.html
├── history.html
├── gallery.html
├── equipment.html
├── equipment-teletype.html
├── equipment-tu.html
├── equipment-service.html
├── itty.html
├── resources.html
├── community.html
└── links.html
```

### Manual steps required after every unzip
1. Copy `rttycom/gallery/` and populate with 147 .pix files from original source
2. Copy `rttycom/downloads/bsp-570-001-901-critical-adjustments.pdf`
   (This file is too large to include in the ZIP reliably)

---

## Navigation Structure

All 8 nav items link to real pages:
Home → index.html
History → history.html
RTTY Art → gallery.html
Equipment → equipment.html (landing) → equipment-teletype.html, equipment-tu.html, equipment-service.html
ITTY → itty.html
Resources → resources.html
Community → community.html
Links → links.html

The `active` class on `.site-nav a` highlights the current page in red.

---

## The PIX Format (RTTY Art)

.pix files are plain text containing only the Baudot (ITA2) character set:
- Uppercase A-Z, 0-9, and punctuation: `-$!&#'()"/:;?,. \n\r`
- CR (0x0D) without LF = carriage return without line advance = OVERSTRIKE
- LF (0x0A) = new line
- All other bytes: silently ignored

The gallery.html page has a complete JavaScript renderer built in. It uses
`fetch('gallery/' + filename)` to load files, so it requires a web server
(not file:// protocol). The renderer handles overstrike correctly via canvas.

File list is hardcoded as the FILES array in gallery.html (147 entries).
Callsigns are auto-extracted from filenames (e.g. BigMac_W2UIC.pix → W2UIC).

---

## Content Attribution

**Kretzman Technical Library** — named for Byron W. Kretzman, W2JTP.
Copyright © 2011 William Bytheway K7TTY and George Hutchison W7TTY.

**Mainline TU series** (TT/L, ST-3, ST-5, ST-6, UT-2) — all by Irv Hoff,
variously W6FFC and K8DKG. Always credit him on these pages.

**The Teletype Story** — Copyright 1958 by Teletype Corporation.
Golden Anniversary booklet. 40 pages, full color scans. Available as PDF.

**BSP 570-001-901** — Bell System Practices Critical Adjustments Manual.
7 original parts merged into one 102-page PDF.

**Western Union Field Service Manual** — 168 pages, all 18 parts present.

**Alan Hobbs G8GOJ articles** — Copyright Alan Hobbs G8GOJ. Hosted with permission.
Five articles on UK RTTY history and Creed teleprinters, linked from history.html
History Hall. Alan is a BARTG President and Creed specialist.

---

## ITTY Technical Details

Four live channels, 24/7, from Arvada CO:

| Channel    | URL                                      | Baud  | Shift      |
|------------|------------------------------------------|-------|------------|
| ITTY 60    | http://internet-tty.net:8000/ITTY        | 45.45 | 170 Hz LSB |
| ITTY 100   | http://internet-tty.net:8010/ITTY100     | 75    | 170 Hz LSB |
| ITTY Europe| http://internet-tty.net:8040/EUROPE      | 50    | Mark 1275 Hz / Space 1445 Hz |
| AUTOSTART  | http://internet-tty.net:8030/AUTOSTART   | 45.45 | 170 Hz LSB |

RTTYMailer v16 download:
downloads/RTTYMailer%20v16.zip (self-hosted; was previously at www.rtty.com/itty/)

---

## Key People (use correct names and callsigns everywhere)

| Person          | Callsign | Role                                      | Notes      |
|-----------------|----------|-------------------------------------------|------------|
| George Hutchison| W7TTY    | Founded ITTY and RTTY.COM                 | Silent Key |
| Bill Bytheway   | K7TTY    | Original software and website             |            |
| Paul Heller     | W2TTY    | Current owner, maintainer since 2017      |            |
| Byron Kretzman  | W2JTP    | Kretzman Technical Library dedication     |            |
| Irv Hoff        | W6FFC    | Mainline TU designer, Intro to RTTY author| Also K8DKG |
| Alan Hobbs      | G8GOJ    | BARTG President, Creed specialist, author | UK-based   |

Spelling: Hutchison (one N). Always "George Hutchison", never "Hutchinson".

---

## History Dates (verified)

- 1870: Baudot invents 5-unit code
- 1907: Morkrum Company incorporated (October 5) — NOT 1906
- 1928: Name changed to Teletype Corporation
- 1930: AT&T/Western Electric acquires Teletype
- 1958: The Teletype Story booklet published (NOT 1956)
- 1984: AT&T breakup, Teletype ceases manufacturing
- 2001: ITTY and RTTY.COM founded by George Hutchison W7TTY
- 2017: Paul Heller W2TTY takes over

---

## What Still Needs Doing

### High priority
- [ ] Set up Eleventy build system to eliminate duplicated header/footer in 14 pages
- [ ] GitHub Pages deployment and sdf.org redirect stub
- [ ] Verify all internal links across all pages
- [ ] Dead-link audit on links.html external URLs (ARRL link fixed May 2026; others not yet audited)

### Medium priority
- [ ] RTTYApp download link — location currently unknown, needs to be found
- [ ] Bill Bytheway's other BSDL software — lost, needs to be located
- [ ] Videos section — old YouTube links dead, worth searching for replacements
- [ ] The old development HTML pages (equipment/literature/*.htm) need to be
      copied into the rttycom/ directory for the equipment-service.html links
      to work (introduction.htm, ttytools/tools.htm, etc.)
- [x] Stunt Box PDF — present at downloads/stuntbox.pdf (10 MB, linked from equipment-service.html)

### Low priority
- [x] ITTY Europe FSK frequencies — Mark 1275 Hz / Space 1445 Hz (confirmed, updated in itty.html)
- [ ] Launch year — listed as "late 1990s", exact year unknown (ask Bill K7TTY)
- [ ] Country pages (Aussie, Poland) — England/ done; Aussie and Poland deferred,
      original content was mostly images with little text

---

## Development Notes

### Font sizes — body text is 16px everywhere
All main prose/body text across the site is standardized at **16px**.
The canonical reference is index.html (`.lede-wrap`, `.wire-body`).
Per-page body text classes and their correct sizes:
- `rtty.css .prose` — 16px (used by history, itty, resources, community)
- `equipment.html .intro-text` — 16px
- `gallery.html .gallery-intro` — 16px
- `itty.html .ch-desc`, `.step-body`, `.info-box` — 16px
- `resources.html .sw-desc` — 16px
- `links.html .link-desc` — 16px
- `equipment-tu.html .machine-body`, `.series-intro` — 16px
- `equipment-teletype.html .machine-body` — 16px
- `equipment-service.html .doc-body` — 16px

Intentionally smaller (UI / narrow grid cards, not prose):
- `equipment.html .sc-desc` — 11.5px (3-column card grid)
- `community.html .topic-item` — 13px (2-column tag grid)
- Various meta/label/slug elements — 9–13px

### Do NOT do these things
- Do not change the tape strip encoding without updating both TAPE_TOP and
  TAPE_BOT arrays in tape.js AND verifying ITA2 bit patterns
- Do not use var(--ink-ghost) (#b8a888) for any readable text — contrast fails
- Do not change Special Elite to anything else for the site-name or headings
- Do not add JavaScript frameworks or dependencies — this is a static site
- Do not set any prose/body text below 16px — the whole site was standardized
  to match index.html

### England/ article page conventions
These pages use the standard site template (../css/rtty.css, ../js/tape.js) with
page-specific styles in a `<style>` block. Key CSS classes:

- `.machine-model` — Special Elite 19px var(--red); used for machine model numbers in creed1.html
- `.img-right` / `.img-left` — floated images with border; always wrap in `.clearfix` div
- `.clearfix::after` — standard float-clear hack
- `.ref-group` — grouped reference list header; Special Elite 15px, red left border
- `.spec-hed` — section heading for dense spec docs (17px, not .section-hed 25px);
  used in creed444.html because ~40 headings would overwhelm at full size
- `.spec-sub` — sub-section label within a spec heading group
- `.dim-table` — proper HTML table replacing the original space-padded blockquote;
  used for the Creed 444 paper margin/feed-rack dimension table

Image filename note: `cread444.jpg` is a typo in the original (should be creed).
The file exists with that name on disk — do not rename it.

### If setting up Eleventy
The shared layout lives in every page's <header>, <nav>, <canvas> (×2),
and <footer> elements. Extract these into _includes/base.njk. Each page's
unique content goes between the dateline and the footer. The CSS and JS
paths use relative references so adjust for the output directory structure.

### File encoding
All HTML files: UTF-8. All .pix files: ASCII (Latin-1). The tape.js file
and gallery.html renderer handle ASCII-only Baudot character filtering.

---

## Deployment

### Target setup
- Website: rtty.internet-tty.net → GitHub Pages
- sdf.org: single redirect stub index.html pointing to rtty.internet-tty.net
- Domain managed via No-IP

### No-IP DNS — one-time setup
Add a CNAME record in No-IP:
  rtty.internet-tty.net → your-username.github.io

Add a file called CNAME in the repository root containing:
  rtty.internet-tty.net

GitHub Pages provisions SSL automatically. Site serves at
https://rtty.internet-tty.net with no extra configuration.

### sdf.org redirect stub
One file at sdf.org/~yourname/index.html:
  <meta http-equiv="refresh" content="0; url=https://rtty.internet-tty.net">

### What does not change
The ITTY streams are on separate port-forwarded entries and are
completely unaffected by adding the rtty subdomain.
  internet-tty.net:8000 → pi-itty60 Icecast (ITTY 60 WPM)
  internet-tty.net:8010 → pi-itty100 Icecast (ITTY 100 WPM)
  internet-tty.net:8030 → pi-autostart Icecast (AUTOSTART)
  internet-tty.net:8040 → pi-europe Icecast (EUROPE)

---

## Conversation History

This project was developed in a Claude.ai chat session (May 2026).
The full conversation covers all design decisions, content review, and
the rationale behind every choice documented here. If a decision seems
arbitrary, it was probably deliberate — ask before changing it.
