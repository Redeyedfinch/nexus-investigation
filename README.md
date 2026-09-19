# MARVEL vs DC: THE LAST TIMELINE
## Round 1 Website — Cyber Investigation Simulation

An implementation-ready, participant-facing cyber investigation simulation terminal designed for **Event 1: Investigation** of the **#Hash** club competition.

---

## ⚡ Overview & Narrative Concept

The Infinity Nexus has suffered a catastrophic temporal breach. The Marvel and DC timelines have overlapped. Participants act as forensic analysts in the Infinity Nexus Control Terminal to reconstruct a breach event, evaluate manipulated digital evidence, and follow an identity trail through the system.

- **Duration**: 45 Minutes (continuous global timer across all 3 investigations)
- **Total Points**: 30 Points (10 Points per investigation)
- **Design Audience**: Intuitive for beginners with no cybersecurity background, while maintaining the aesthetic of a military-grade terminal.
- **Principles**: Simulation, not technical training. No command-line hacking or exploit tools required.

---

## 🎨 Visual System & Palette

| Element | Color Code | Purpose |
| :--- | :--- | :--- |
| **Background** | `#070A0F` | Near-black charcoal with subtle cyber grid texture & scanline overlay |
| **Primary Panels** | `#111927` | Dark blue-grey terminal panels with `#1F2B3E` borders |
| **Verified / Safe** | `#3EA6FF` | Cold blue glow, authenticated records |
| **Warning / Corrupted** | `#E5484D` | Crimson red alerts, suspicious evidence markers |
| **Temporal Divergence** | `#FFD43B` | Electric yellow speed-force tachyon indicators |
| **Infinity Nexus** | `#9B5CFF` | Cosmic purple holographic crest & accent highlights |
| **Text** | `#F4F7FA` | High-contrast readable typography (Space Grotesk, Inter, JetBrains Mono) |

---

## 📂 Repository Structure

```
marvel-vs-dc-investigation/
├── index.html       # Single Page Application layout (Login, Dashboard, Cases, Summary, Modals)
├── styles.css       # Full responsive cyberpunk design system & CRT effects
├── app.js           # Client state engine, 45-min timer, sound effects, hints, case scoring
├── cases-data.js    # Evidence models, questions, metadata, node graph data, and answer keys
├── admin.js         # Organiser master control console, live leaderboard, audit logs, CSV exporter
└── README.md        # Event documentation, answer key, and deployment guide
```

---

## 🕹️ Participant Flow & Investigation Modules

```
[Login Screen] ──> [Team Dashboard] ──> [Case 01: Breach Report] ──> [Case 02: AI or Authentic?] ──> [Case 03: Digital Trail] ──> [Score Summary]
```

### 1. Login Screen
- Requires `TEAM ID` (e.g. `TEAM 07`) and `ACCESS CODE` (`NEXUS-2026`).
- Status indicator: `NEXUS STATUS: UNSTABLE`.

### 2. Team Dashboard
- Mission briefing: "Investigate the breach, verify the evidence and reconstruct the digital trail."
- Timer displays `45:00`.
- Rules card explaining simulation directives.
- Clicking **BEGIN INVESTIGATION 01** starts the 45-minute countdown.

### 3. Investigation 01: The Breach Report (10 Points)
- **Evidence Tabs**: Access Logs, Device Records, System Alerts, Location Data.
- **Tools**: Sort by timestamp, expand row metadata inspection, "Mark Suspicious" (red tag), "Clear Marks".
- **Key Deduction**: Timestamp `00:19:12` features an unexpected remote device (`Remote Admin Device R-07`) performing a file alteration during a local terminal session on `Nexus Terminal N-04`.
- **Questions**: 5 questions (2 pts each).
  - Q1: `00:19:12 (File alteration)`
  - Q2: `Remote Admin Device R-07`
  - Q3: Record conflicts with preceding access sequence and injects an external device.
  - Q4: Remote device (`R-07`).
  - Q5: One-sentence synthesis of remote exploitation during the terminal session.

### 4. Investigation 02: AI or Authentic? (10 Points)
- **4 Digital Evidence Cards**:
  - `EV-01`: CCTV Frame (00:19:12) — empty room, active screen.
  - `EV-02`: Security Screenshot (00:19:12) — claims in-person biometric override.
  - `EV-03`: Incident Message (00:19:30) — claims routine maintenance outage.
  - `EV-04`: Location Report (00:19:12) — 0.0 kg load, zero human biomass.
- **Tools**: Fullscreen inspection modal, Drag/click into `VERIFIED` and `QUESTIONABLE` bins, Side-by-side comparison modal with deduction prompts, mandatory "Why?" deduction rationale field.
- **Key Deduction**: EV-02 and EV-03 are fabricated. CCTV and pressure telemetry objectively refute the screenshot's in-person presence claim.
- **Questions**: 5 questions (2 pts each).

### 5. Investigation 03: The Digital Trail (10 Points)
- **Interactive Visual Node Graph**:
  - `LOGIN` → `DEVICE` → `FILE` → `USER` → `LOCATION`.
  - Clickable nodes with deep forensic metadata drawers.
  - Interactive connector links (Cold blue for authentic path, flashing crimson red for tampered path).
- **Key Deduction**: Account `VICTOR-07` (Doctor Doom) was used, but the physical room was unoccupied and the file modification originated through a remote bridge with Speed-Force tachyon radiation. Therefore, the legitimate account owner must **NOT** yet be considered the confirmed culprit.
- **Questions**: 5 questions (2 pts each).

### 6. Round 1 Score Summary Screen
- Displays score breakdown across all three cases and total out of 30.
- Narrative status: `PRIMARY IDENTITY: UNRESOLVED`.
- Prepares teams for Event 2 and the projector story video transition.

---

## 💡 Hint Engine & Scoring Rules

- **Hint 1**: Category clue (**-1 Point** from that question).
- **Hint 2**: Answer narrowing (**-1 Additional Point**).
- **Hint 3**: Direct directional clue (**Question becomes worth 0 Points**).
- Hint usage requires confirmation in a modal prompt to prevent accidental deductions.

---

## 🛠️ Organiser & Admin Control Console

Organisers have a master terminal to manage the competition in real-time:
- **How to open**: Press `Ctrl + Shift + A` anywhere on the site, or click the discreet `ADMIN [CTRL+SHIFT+A]` button in the bottom right corner.
- **Master Passcode**: `NEXUS-ADMIN` (or `1337` / `admin`).
- **Features**:
  - Live team scoreboard and progress tracking.
  - Manual score overrides (+/- points with mandatory audit log note).
  - Force case unlock or case reset for any team in case of technical issues.
  - Global timer controls (Pause, Resume, +5 Minutes).
  - **Export Scores as CSV** with one click.

---

## 🔗 Google Stitch MCP Server Integration

To connect Google Stitch (UI generation platform) to your development environment via Model Context Protocol (MCP):

### 1. Interactive Setup
Run the setup wizard in your terminal:
```bash
npx @_davideast/stitch-mcp init
```
Complete the Google OAuth authorization in the browser.

### 2. Manual MCP Configuration
Add the Stitch MCP server to your `mcp_config.json`:
```json
{
  "mcpServers": {
    "stitch": {
      "command": "cmd.exe",
      "args": ["/c", "npx", "@_davideast/stitch-mcp", "proxy"],
      "env": {
        "STITCH_API_KEY": "<YOUR_STITCH_API_KEY>"
      }
    }
  }
}
```

---

## 🚀 Live Hosting on GitHub Pages

1. Push this repository to GitHub:
   ```bash
   git init
   git add -A
   git commit -m "feat: Initial release of MARVEL vs DC Round 1 Cyber Investigation Simulation"
   gh repo create Redeyedfinch/nexus-investigation --public --source=. --push
   ```
2. Enable GitHub Pages in repo settings: **Settings → Pages → Branch: main / (root)**.
3. The site will be live instantly at `https://redeyedfinch.github.io/nexus-investigation/`.
