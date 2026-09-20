/**
 * MARVEL vs DC: THE LAST TIMELINE
 * Round 1 Cyber Investigation Simulation - Client State & Interactive Application
 */

class SimulationApp {
  constructor() {
    this.data = window.INVESTIGATION_DATA;
    this.audioMuted = false;
    this.selectedEvidenceRow = null;
    this.markedRows = new Set();
    this.sortAscending = true;
    this.activeCategory = "ALL RECORDS";
    
    // Comparison mode state
    this.selectedForCompare = [];
    
    // Active hint target
    this.pendingHint = null;

    // Load or initialize state
    this.state = this.loadState();

    // Init Web Audio
    this.initAudio();

    // Timer handle
    this.timerInterval = null;

    // Initialize UI and events
    this.initDOM();
    this.setupEvents();
    this.restoreScreen();

    // If timer was running, resume it
    if (this.state.timerRunning && this.state.timerSeconds > 0) {
      this.startTimer();
    }
  }

  loadState() {
    const saved = localStorage.getItem("nexus_sim_state");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.caseState) return parsed;
      } catch (e) {
        console.warn("Could not load state, initializing default.");
      }
    }
    return {
      currentScreen: "login", // 'login', 'dashboard', 'investigation', 'summary'
      teamId: "TEAM 07",
      accessCode: "NEXUS-2026",
      timerSeconds: 45 * 60, // 45:00
      timerRunning: false,
      currentCase: 0,
      score: 0,
      caseScores: [0, 0, 0],
      caseState: [
        { unlocked: true, completed: false, answers: {}, feedback: null, hintsRevealed: [0, 0, 0, 0, 0], markedRows: [] },
        { unlocked: false, completed: false, answers: {}, feedback: null, hintsRevealed: [0, 0, 0, 0, 0], bins: { verified: [], questionable: [] }, whyText: "" },
        { unlocked: false, completed: false, answers: {}, feedback: null, hintsRevealed: [0, 0, 0, 0, 0], activeNodes: [], trailLinks: [] }
      ]
    };
  }

  saveState() {
    localStorage.setItem("nexus_sim_state", JSON.stringify(this.state));
    if (this.state && this.state.teamId) {
      const teamKey = "nexus_team_state_" + encodeURIComponent(this.state.teamId);
      localStorage.setItem(teamKey, JSON.stringify(this.state));
    }
  }

  loadTeamState(teamId, accessCode) {
    const teamKey = "nexus_team_state_" + encodeURIComponent(teamId);
    const saved = localStorage.getItem(teamKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.caseState) {
          if (accessCode) parsed.accessCode = accessCode;
          return parsed;
        }
      } catch(e) {}
    }
    return {
      currentScreen: "dashboard",
      teamId: teamId,
      accessCode: accessCode || "NEXUS-CODE",
      timerSeconds: 45 * 60,
      timerRunning: false,
      currentCase: 0,
      score: 0,
      caseScores: [0, 0, 0],
      caseState: [
        { unlocked: true, completed: false, answers: {}, feedback: null, hintsRevealed: [0, 0, 0, 0, 0], markedRows: [] },
        { unlocked: false, completed: false, answers: {}, feedback: null, hintsRevealed: [0, 0, 0, 0, 0], bins: { verified: [], questionable: [] }, whyText: "" },
        { unlocked: false, completed: false, answers: {}, feedback: null, hintsRevealed: [0, 0, 0, 0, 0], activeNodes: [], trailLinks: [] }
      ]
    };
  }

  /* ---------------- Sound FX (Web Audio API) ---------------- */
  initAudio() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContext();
    } catch(e) {
      this.audioCtx = null;
    }
  }

  playSound(type) {
    if (this.audioMuted || !this.audioCtx) return;
    try {
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume().catch(() => {});
      }
      const ctx = this.audioCtx;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;

      if (type === 'click') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.05);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
      } else if (type === 'type') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1400, now);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.02);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.02);
        osc.start(now);
        osc.stop(now + 0.02);
      } else if (type === 'alert') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.setValueAtTime(260, now + 0.08);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.16);
        osc.start(now);
        osc.stop(now + 0.16);
      } else if (type === 'alarm') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(660, now);
        osc.frequency.setValueAtTime(880, now + 0.1);
        osc.frequency.setValueAtTime(660, now + 0.2);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (type === 'success') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      }
    } catch(err) {
      // Audio autoplay policy blocked or not supported; fail gracefully
    }
  }

  /* ---------------- Timer Management (with Wall-Clock Drift Protection) ---------------- */
  startTimer() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.state.timerRunning = true;
    if (!this.state.wallClockStart) {
      this.state.wallClockStart = Date.now();
      this.state.totalDuration = this.state.timerSeconds || 2700;
    }
    this.saveState();

    this.timerInterval = setInterval(() => {
      if (this.state.wallClockStart) {
        const elapsed = Math.floor((Date.now() - this.state.wallClockStart) / 1000);
        this.state.timerSeconds = Math.max(0, (this.state.totalDuration || 2700) - elapsed);
      } else if (this.state.timerSeconds > 0) {
        this.state.timerSeconds--;
      }

      if (this.state.timerSeconds <= 0) {
        this.handleTimeExpired();
      } else {
        this.updateTimerDisplay();
        if (this.state.timerSeconds % 10 === 0) {
          this.saveState();
        }
      }
    }, 1000);
    this.updateTimerDisplay();
  }

  pauseTimer() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.state.timerRunning = false;
    this.state.wallClockStart = null;
    this.saveState();
    this.updateTimerDisplay();
  }

  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  updateTimerDisplay() {
    const timeStr = this.formatTime(this.state.timerSeconds);
    const topClock = document.getElementById("top-timer-clock");
    const dashClock = document.getElementById("dashboard-timer-clock");

    if (topClock) {
      topClock.textContent = timeStr;
      topClock.classList.remove("warning-yellow", "warning-red");
      if (this.state.timerSeconds <= 300) { // 5 mins
        topClock.classList.add("warning-red");
      } else if (this.state.timerSeconds <= 600) { // 10 mins
        topClock.classList.add("warning-yellow");
      }
    }
    if (dashClock) {
      dashClock.textContent = timeStr;
    }
  }

  handleTimeExpired() {
    this.pauseTimer();
    this.playSound('alert');
    alert("SYSTEM TIME EXPIRED // 45:00 ROUND OVER\nAnswer submissions are now locked. Showing current score.");
    this.switchScreen("summary");
  }

  /* ---------------- Navigation & Screens ---------------- */
  switchScreen(screenName) {
    this.state.currentScreen = screenName;
    this.saveState();

    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
    const target = document.getElementById(`screen-${screenName}`);
    if (target) {
      target.classList.add("active");
    }

    if (screenName === "investigation") {
      this.renderCurrentCase();
      this.updateUI();
    } else if (screenName === "summary") {
      this.renderSummaryScreen();
    } else if (screenName === "dashboard") {
      this.updateDashboardUI();
    }
  }

  restoreScreen() {
    this.switchScreen(this.state.currentScreen);
  }

  /* ---------------- DOM Initialization ---------------- */
  initDOM() {
    const topTeam = document.getElementById("top-team-badge");
    if (topTeam) topTeam.textContent = this.state.teamId;

    const teamInput = document.getElementById("login-team-id");
    if (teamInput && this.state.teamId) {
      teamInput.value = this.state.teamId;
    }

    const codeInput = document.getElementById("login-access-code");
    if (codeInput && this.state.accessCode) {
      codeInput.value = this.state.accessCode;
    }

    this.updateTimerDisplay();
  }

  setupEvents() {
    // Login form submit
    const loginForm = document.getElementById("login-form");
    if (loginForm) {
      loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const teamInput = document.getElementById("login-team-id").value.trim();
        const codeInput = document.getElementById("login-access-code").value.trim();
        const errorMsg = document.getElementById("login-error-msg");

        if (!teamInput) {
          if (errorMsg) {
            errorMsg.textContent = "PLEASE ENTER A VALID TEAM IDENTIFIER.";
            errorMsg.style.display = "block";
          }
          return;
        }

        if (!codeInput) {
          if (errorMsg) {
            errorMsg.textContent = "PLEASE ENTER YOUR SECURITY ACCESS CODE.";
            errorMsg.style.display = "block";
          }
          return;
        }

        if (errorMsg) errorMsg.style.display = "none";

        const newTeamId = teamInput.toUpperCase();
        const newAccessCode = codeInput.toUpperCase();

        if (this.state.teamId !== newTeamId) {
          this.saveState();
          this.state = this.loadTeamState(newTeamId, newAccessCode);
        } else {
          this.state.accessCode = newAccessCode;
        }

        // Auto-register team in admin leaderboard if new
        if (window.admin && Array.isArray(window.admin.teams)) {
          const exists = window.admin.teams.find(t => t.id === this.state.teamId);
          if (!exists) {
            window.admin.teams.push({
              id: this.state.teamId,
              accessCode: this.state.accessCode,
              currentCase: 1,
              score: 0,
              timerStatus: "Active",
              lastActive: "Just now",
              case1: 0,
              case2: 0,
              case3: 0
            });
            window.admin.saveTeams();
          }
        }

        this.saveState();
        this.playSound('click');
        this.updateUI();
        this.switchScreen("dashboard");
      });
    }

    // Dashboard Switch Team / Logout Button
    const btnDashLogout = document.getElementById("btn-dash-logout");
    if (btnDashLogout) {
      btnDashLogout.addEventListener("click", () => {
        this.playSound('click');
        this.switchScreen("login");
      });
    }

    // Top Bar Logout / Switch Team Button
    const btnSwitchTeam = document.getElementById("btn-switch-team");
    if (btnSwitchTeam) {
      btnSwitchTeam.addEventListener("click", () => {
        const confirmed = confirm("Switch team or return to login screen? Your case progress will remain saved.");
        if (confirmed) {
          this.playSound('click');
          this.switchScreen("login");
        }
      });
    }

    // Dashboard Begin Button
    const btnBegin = document.getElementById("btn-begin-investigation");
    if (btnBegin) {
      btnBegin.addEventListener("click", () => {
        this.playSound('success');
        if (!this.state.timerRunning) {
          this.startTimer();
        }
        this.switchScreen("investigation");
      });
    }

    // Top Bar Audio Toggle
    const audioToggle = document.getElementById("btn-toggle-audio");
    if (audioToggle) {
      audioToggle.addEventListener("click", () => {
        this.audioMuted = !this.audioMuted;
        audioToggle.textContent = this.audioMuted ? "SFX: MUTED" : "SFX: ON";
        audioToggle.classList.toggle("off", this.audioMuted);
      });
    }

    // Top Bar CRT Toggle
    const crtToggle = document.getElementById("btn-toggle-crt");
    if (crtToggle) {
      crtToggle.addEventListener("click", () => {
        document.body.classList.toggle("crt-off");
        crtToggle.classList.toggle("off", document.body.classList.contains("crt-off"));
      });
    }

    // Forensic Shell Drawer Toggles
    const btnToggleShell = document.getElementById("btn-toggle-shell");
    if (btnToggleShell) {
      btnToggleShell.addEventListener("click", () => {
        this.toggleForensicShell();
      });
    }

    const btnCloseShell = document.getElementById("btn-close-shell");
    if (btnCloseShell) {
      btnCloseShell.addEventListener("click", () => {
        this.toggleForensicShell(false);
      });
    }

    const shellForm = document.getElementById("shell-input-form");
    if (shellForm) {
      shellForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const input = document.getElementById("shell-cmd-input");
        if (input) {
          const val = input.value.trim();
          if (val) {
            this.handleShellCommand(val);
            input.value = "";
          }
        }
      });
    }

    // Bottom Action Buttons
    const btnSubmit = document.getElementById("btn-submit-answer");
    if (btnSubmit) {
      btnSubmit.addEventListener("click", () => {
        this.handleSubmitCase();
      });
    }

    const btnNext = document.getElementById("btn-next-investigation");
    if (btnNext) {
      btnNext.addEventListener("click", () => {
        if (this.state.currentCase < 2) {
          this.state.currentCase++;
          this.saveState();
          this.playSound('click');
          this.renderCurrentCase();
          this.updateUI();
        } else {
          this.switchScreen("summary");
        }
      });
    }

    const btnBack = document.getElementById("btn-back-dashboard");
    if (btnBack) {
      btnBack.addEventListener("click", () => {
        this.playSound('click');
        this.switchScreen("dashboard");
      });
    }

    // Clear Draft Selections (only for active unsubmitted case)
    const btnReset = document.getElementById("btn-reset-selection");
    if (btnReset) {
      btnReset.addEventListener("click", () => {
        this.handleResetCurrentSelections();
      });
    }

    // Modal Close buttons
    document.querySelectorAll(".modal-close-btn, .modal-backdrop").forEach(el => {
      el.addEventListener("click", (e) => {
        if (e.target === el) {
          document.querySelectorAll(".modal-backdrop").forEach(m => m.classList.remove("active"));
        }
      });
    });

    // Keyboard Shortcuts & Anti-Inspection Guard
    window.addEventListener("keydown", (e) => {
      // 1. Organiser Console: Ctrl+Shift+A
      if (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        this.openAdminModal();
        return;
      }

      // 2. Forensic Shell Toggle: Ctrl + ~ or Ctrl + `
      if (e.ctrlKey && (e.key === '`' || e.key === '~')) {
        e.preventDefault();
        this.toggleForensicShell();
        return;
      }

      // 3. Cheating / DevTools Shortcut Guard
      const isF12 = e.key === 'F12';
      const isDevTools = e.ctrlKey && e.shiftKey && ['I', 'i', 'J', 'j', 'C', 'c'].includes(e.key);
      const isViewSource = e.ctrlKey && (e.key === 'U' || e.key === 'u');

      if (isF12 || isDevTools || isViewSource) {
        e.preventDefault();
        this.playSound('alarm');
        this.showSecurityAdvisory("SECURITY ADVISORY // FORENSIC PROTOCOL ACTIVE: Direct source code inspection and console tools are restricted during the official simulation. Use the integrated Forensic Shell (>_ SHELL) for authorized system queries.");
      }
    });

    // Right-Click Context Menu Guard
    window.addEventListener("contextmenu", (e) => {
      if (window.admin && window.admin.isAuthenticated) return;
      e.preventDefault();
      this.playSound('alert');
      this.showToast("Forensic Security: Right-click inspection disabled during round.");
    });

    const adminTrigger = document.getElementById("btn-admin-console-trigger");
    if (adminTrigger) {
      adminTrigger.addEventListener("click", () => {
        this.openAdminModal();
      });
    }

    // Return to dashboard from summary
    const btnReturnSummary = document.getElementById("btn-summary-return");
    if (btnReturnSummary) {
      btnReturnSummary.addEventListener("click", () => {
        this.playSound('click');
        this.switchScreen("dashboard");
      });
    }

    // Export / Print Official Incident Report
    const btnPrintReport = document.getElementById("btn-print-report");
    if (btnPrintReport) {
      btnPrintReport.addEventListener("click", () => {
        this.playSound('click');
        window.print();
      });
    }
  }

  /* ---------------- Dashboard UI ---------------- */
  updateDashboardUI() {
    const title = document.getElementById("dash-team-title");
    if (title) title.textContent = this.state.teamId;

    const score = document.getElementById("dash-score-val");
    if (score) score.textContent = `${this.calculateTotalScore()} / 30`;

    const prog1 = document.getElementById("dash-stat-c1");
    const prog2 = document.getElementById("dash-stat-c2");
    const prog3 = document.getElementById("dash-stat-c3");

    if (prog1) prog1.textContent = this.state.caseState[0].completed ? "COMPLETED (10/10)" : (this.state.caseState[0].unlocked ? "ACTIVE" : "LOCKED");
    if (prog2) prog2.textContent = this.state.caseState[1].completed ? "COMPLETED (10/10)" : (this.state.caseState[1].unlocked ? "ACTIVE" : "LOCKED");
    if (prog3) prog3.textContent = this.state.caseState[2].completed ? "COMPLETED (10/10)" : (this.state.caseState[2].unlocked ? "ACTIVE" : "LOCKED");
  }

  calculateTotalScore() {
    return this.state.caseScores.reduce((a, b) => a + b, 0);
  }

  /* ---------------- Main Case Render Router ---------------- */
  renderCurrentCase() {
    const caseData = this.data.cases[this.state.currentCase];
    if (!caseData) return;

    // Header Case Title
    const headerTitle = document.getElementById("top-case-title");
    if (headerTitle) headerTitle.textContent = caseData.title;

    const workspace = document.getElementById("workspace-container");
    if (!workspace) return;

    // Build specific Case Interface
    if (this.state.currentCase === 0) {
      this.renderCase01(workspace, caseData);
    } else if (this.state.currentCase === 1) {
      this.renderCase02(workspace, caseData);
    } else if (this.state.currentCase === 2) {
      this.renderCase03(workspace, caseData);
    }

    // Render Left Rail cases
    this.renderLeftRail();

    // Render Right Rail Intelligence & Hints
    this.renderRightRail(caseData);

    // Update Bottom Bar buttons
    this.updateBottomBar();
  }

  /* ---------------- CASE 01: THE BREACH REPORT ---------------- */
  renderCase01(container, caseData) {
    const activeCaseState = this.state.caseState[0];

    // Filter evidence based on active category
    let records = caseData.evidence;
    if (this.activeCategory !== "ALL RECORDS") {
      records = records.filter(r => r.category === this.activeCategory);
    }

    // Sort
    records = [...records].sort((a, b) => {
      return this.sortAscending ? a.rawTime - b.rawTime : b.rawTime - a.rawTime;
    });

    let html = `
      <div class="case-header-panel">
        <div class="case-title-row">
          <div class="case-main-title">${caseData.title}</div>
          <div class="case-meta-pills">
            <span class="meta-pill">POINTS: 10</span>
            <span class="meta-pill">EST. TIME: 12-15 MIN</span>
            <span class="meta-pill">SKILL: TIMELINE RECONSTRUCTION</span>
          </div>
        </div>
        <p class="case-framing-text">${caseData.framing}</p>
      </div>

      <!-- Tabs and Table Toolbar -->
      <div class="table-toolbar">
        <div class="tabs-bar" id="case1-tabs">
          ${caseData.categories.map(cat => `
            <button class="tab-btn ${this.activeCategory === cat ? 'active' : ''}" data-cat="${cat}">
              ${cat}
            </button>
          `).join('')}
        </div>

        <div style="display: flex; gap: 8px;">
          <button class="btn btn-outline-blue" id="btn-sort-time">
            SORT TIME ${this.sortAscending ? '▲' : '▼'}
          </button>
          <button class="btn btn-outline-red" id="btn-mark-suspicious">
            MARK SUSPICIOUS
          </button>
          <button class="btn btn-secondary" id="btn-clear-marks">
            CLEAR MARKS
          </button>
        </div>
      </div>

      <!-- Evidence Table -->
      <div class="evidence-table-wrap">
        <table class="evidence-table">
          <thead>
            <tr>
              <th class="sortable">Timestamp</th>
              <th>Category</th>
              <th>Event Description</th>
              <th>Device</th>
              <th>Reported Location</th>
              <th>Integrity Status</th>
            </tr>
          </thead>
          <tbody>
            ${records.map(r => {
              const isSelected = this.selectedEvidenceRow === r.id;
              const isMarked = this.markedRows.has(r.id);
              return `
                <tr class="${isSelected ? 'selected' : ''} ${isMarked ? 'marked-suspicious' : ''}" data-row-id="${r.id}">
                  <td style="font-family: var(--font-mono); font-weight: 600;">${r.time}</td>
                  <td><span class="badge badge-muted">${r.category}</span></td>
                  <td><strong>${r.event}</strong></td>
                  <td><span style="font-family: var(--font-mono);">${r.device}</span></td>
                  <td>${r.location}</td>
                  <td><span class="badge ${r.badgeClass}">${r.status}</span></td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>

      <!-- Selected Row Deep Inspection Drawer -->
      <div id="row-inspection-area"></div>

      <!-- Feedback Banner if Submitted -->
      ${activeCaseState.feedback ? `
        <div class="feedback-banner">
          <div class="feedback-text">
            <strong>SYSTEM FEEDBACK:</strong> ${activeCaseState.feedback}
          </div>
          <span class="badge badge-verified">POINTS EARNED: ${this.state.caseScores[0]} / 10</span>
        </div>
      ` : ''}

      <!-- Questions Area -->
      <div class="questions-panel">
        ${activeCaseState.completed ? `
          <div class="case-locked-banner">
            <div>
              <div style="font-weight: 700; color: #fff;">🔒 ANSWERS EVALUATED & SUBMITTED (LOCKED)</div>
              <div style="font-size: 11px; color: var(--text-muted); margin-top: 3px;">Only 1 attempt is permitted. Responses permanently recorded for judges' evaluation.</div>
            </div>
            <span class="lock-badge">SCORE: ${this.state.caseScores[0]}/10 PTS</span>
          </div>
        ` : ''}
        <div class="questions-header">
          <div class="questions-title">Investigation Questions // 5 Objectives (10 Points)</div>
          <div class="case-meta-pills">
            <span class="meta-pill">2 POINTS EACH</span>
          </div>
        </div>

        ${caseData.questions.map((q, qIndex) => this.renderQuestionItem(q, qIndex, activeCaseState)).join('')}
      </div>
    `;

    container.innerHTML = html;

    // Attach Case 1 Events
    document.querySelectorAll("#case1-tabs .tab-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        this.activeCategory = btn.dataset.cat;
        this.playSound('click');
        this.renderCase01(container, caseData);
      });
    });

    const btnSort = document.getElementById("btn-sort-time");
    if (btnSort) {
      btnSort.addEventListener("click", () => {
        this.sortAscending = !this.sortAscending;
        this.playSound('click');
        this.renderCase01(container, caseData);
      });
    }

    const btnMark = document.getElementById("btn-mark-suspicious");
    if (btnMark) {
      btnMark.addEventListener("click", () => {
        if (!this.selectedEvidenceRow) {
          alert("Please click and select an evidence record in the table first.");
          return;
        }
        if (this.markedRows.has(this.selectedEvidenceRow)) {
          this.markedRows.delete(this.selectedEvidenceRow);
        } else {
          this.markedRows.add(this.selectedEvidenceRow);
          this.playSound('alert');
        }
        this.renderCase01(container, caseData);
      });
    }

    const btnClear = document.getElementById("btn-clear-marks");
    if (btnClear) {
      btnClear.addEventListener("click", () => {
        this.markedRows.clear();
        this.playSound('click');
        this.renderCase01(container, caseData);
      });
    }

    // Row selection
    container.querySelectorAll(".evidence-table tbody tr").forEach(row => {
      row.addEventListener("click", () => {
        const id = row.dataset.rowId;
        this.selectedEvidenceRow = (this.selectedEvidenceRow === id) ? null : id;
        this.playSound('click');
        this.renderCase01(container, caseData);
        this.renderMetadataInspection(caseData);
      });
    });

    this.renderMetadataInspection(caseData);
    this.attachQuestionInputListeners(caseData, activeCaseState);
  }

  renderMetadataInspection(caseData) {
    const area = document.getElementById("row-inspection-area");
    if (!area) return;
    if (!this.selectedEvidenceRow) {
      area.innerHTML = "";
      return;
    }

    const item = caseData.evidence.find(e => e.id === this.selectedEvidenceRow);
    if (!item) return;

    area.innerHTML = `
      <div class="metadata-drawer">
        <div class="meta-header">
          <div style="font-family: var(--font-mono); color: var(--cold-blue); font-weight: 700;">
            RECORD INSPECTION: [${item.id}] // ${item.event.toUpperCase()} @ ${item.time}
          </div>
          <span class="badge ${item.badgeClass}">${item.status}</span>
        </div>
        <div class="meta-grid">
          <div class="meta-item">
            <span class="meta-label">Source Device</span>
            <span class="meta-value">${item.device}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Account / Identity</span>
            <span class="meta-value">${item.user}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">IP Tunnel</span>
            <span class="meta-value">${item.ip}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">MAC Address</span>
            <span class="meta-value">${item.mac}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Clearance Level</span>
            <span class="meta-value">${item.authLevel}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Geofence Tag</span>
            <span class="meta-value">${item.location}</span>
          </div>
        </div>
        <div style="background: rgba(255,255,255,0.03); padding: 10px; border-left: 2px solid var(--cold-blue); font-size: 13px;">
          <strong style="color: var(--cold-blue);">Forensic Log Analysis:</strong> ${item.details}
        </div>
        <div class="custody-meta-bar" style="display: flex; flex-wrap: wrap; gap: 12px; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.4); border: 1px dashed rgba(62,166,255,0.3); border-radius: 4px; padding: 8px 12px; margin-top: 10px; font-family: var(--font-mono); font-size: 11px;">
          <div>
            <span style="color: var(--text-dim);">SHA-256 HASH:</span>
            <span style="color: var(--cold-blue); font-weight: 600;">e3b0c442...${item.id.replace('-','')}79a1f</span>
          </div>
          <div>
            <span style="color: var(--text-dim);">CUSTODIAN:</span>
            <span style="color: var(--terminal-green);">SHIELD SEC-OFFICER-491</span>
          </div>
          <div style="color: var(--neon-cyan);">
            ● CHAIN OF CUSTODY VERIFIED
          </div>
        </div>
      </div>
    `;
  }

  /* ---------------- CASE 02: AI OR AUTHENTIC? ---------------- */
  renderCase02(container, caseData) {
    const activeCaseState = this.state.caseState[1];

    let html = `
      <div class="case-header-panel" style="border-left-color: var(--nexus-purple);">
        <div class="case-title-row">
          <div class="case-main-title">${caseData.title}</div>
          <div class="case-meta-pills">
            <span class="meta-pill">POINTS: 10</span>
            <span class="meta-pill">EST. TIME: 12-15 MIN</span>
            <span class="meta-pill">SKILL: SOURCE COMPARISON</span>
          </div>
        </div>
        <p class="case-framing-text">${caseData.framing}</p>
      </div>

      <!-- Action Toolbar -->
      <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px;">
        <span style="font-family: var(--font-mono); font-size: 12px; color: var(--text-muted);">
          EVIDENCE PACKETS: 4 ITEMS AVAILABLE // SELECT TWO TO COMPARE
        </span>
        <button class="btn btn-outline-purple" id="btn-open-compare" ${this.selectedForCompare.length === 2 ? '' : 'disabled'}>
          COMPARE SELECTED (${this.selectedForCompare.length}/2)
        </button>
      </div>

      <!-- 4 Evidence Cards Grid -->
      <div class="evidence-cards-grid">
        ${caseData.evidence.map(ev => {
          const isSelected = this.selectedForCompare.includes(ev.id);
          return `
            <div class="evidence-card ${isSelected ? 'selected-compare' : ''}" data-ev-id="${ev.id}">
              <div class="card-header-bar">
                <span class="card-id-tag">${ev.id} // ${ev.category}</span>
                <span style="font-family: var(--font-mono); font-size: 11px; color: var(--text-muted);">${ev.timestamp}</span>
              </div>
              <div class="card-preview-window">
                ${this.renderMockEvidenceGraphic(ev)}
              </div>
              <div style="font-family: var(--font-display); font-size: 14px; font-weight: 700; color: var(--text-highlight);">
                ${ev.title}
              </div>
              <div class="card-desc">
                ${ev.description}
              </div>
              <div class="custody-meta-bar" style="margin-top: 8px; margin-bottom: 8px; font-size: 10px; padding: 4px 8px; background: rgba(0,0,0,0.3); border-radius: 3px; display: flex; justify-content: space-between; align-items: center; font-family: var(--font-mono);">
                <span style="color: var(--text-dim);">SHA256: <span style="color: var(--cold-blue);">${ev.id === 'EV-02' ? '4a5e1e...deda33b' : (ev.id === 'EV-01' ? '9f86d0...0f00a08' : 'b94d27...e2efcde')}</span></span>
                <span style="color: ${ev.id === 'EV-02' ? 'var(--neon-red)' : 'var(--terminal-green)'}; font-weight: 700;">${ev.id === 'EV-02' ? '● ANOMALY' : '● VERIFIED'}</span>
              </div>
              <div class="card-actions-bar">
                <button class="btn btn-outline-blue btn-view-fullscreen" data-ev-id="${ev.id}">
                  VIEW FULLSCREEN
                </button>
                <button class="btn ${isSelected ? 'btn-nexus' : 'btn-secondary'} btn-toggle-compare" data-ev-id="${ev.id}">
                  ${isSelected ? 'SELECTED' : 'COMPARE'}
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <!-- Classification Bins: VERIFIED vs QUESTIONABLE -->
      <div style="margin-top: 12px;">
        <div style="font-family: var(--font-display); font-size: 14px; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 8px;">
          Evidence Classification Bins (Click tags to classify)
        </div>
        <div class="bins-container">
          <div class="bin-dropzone verified-bin" id="bin-verified">
            <div class="bin-title" style="color: var(--cold-blue);">
              <span>🛡️ VERIFIED [AUTHENTIC]</span>
            </div>
            <div class="bin-items-wrap" id="bin-verified-items">
              ${caseData.evidence.map(ev => `
                <button class="bin-pill btn-toggle-bin" data-bin="verified" data-ev-id="${ev.id}" style="${(activeCaseState.bins.verified || []).includes(ev.id) ? 'background: var(--cold-blue-deep); border-color: var(--cold-blue); color: #fff;' : ''}">
                  ${ev.id}
                </button>
              `).join('')}
            </div>
          </div>

          <div class="bin-dropzone questionable-bin" id="bin-questionable">
            <div class="bin-title" style="color: var(--crimson-red);">
              <span>⚠️ QUESTIONABLE [ALTERED / GENERATED]</span>
            </div>
            <div class="bin-items-wrap" id="bin-questionable-items">
              ${caseData.evidence.map(ev => `
                <button class="bin-pill btn-toggle-bin" data-bin="questionable" data-ev-id="${ev.id}" style="${(activeCaseState.bins.questionable || []).includes(ev.id) ? 'background: var(--crimson-deep); border-color: var(--crimson-red); color: #fff;' : ''}">
                  ${ev.id}
                </button>
              `).join('')}
            </div>
          </div>
        </div>
      </div>

      <!-- Mandatory "Why?" field -->
      <div class="why-rationale-box">
        <label style="font-family: var(--font-mono); font-size: 11.5px; color: var(--crimson-red); text-transform: uppercase; font-weight: 700;">
          DEDUCTION RATIONALE: WHY IS THE QUESTIONABLE EVIDENCE SUSPICIOUS? ${activeCaseState.completed ? '(LOCKED)' : ''}
        </label>
        <textarea id="why-rationale-input" rows="2" class="q-text-input" placeholder="Explain the objective contradiction (e.g. CCTV & biometric sensors prove the room was empty at 00:19:12, contradicting the screenshot's in-person presence claim)..." ${activeCaseState.completed ? 'disabled' : ''}>${activeCaseState.whyText || ''}</textarea>
      </div>

      <!-- Feedback Banner if Submitted -->
      ${activeCaseState.feedback ? `
        <div class="feedback-banner">
          <div class="feedback-text">
            <strong>SYSTEM FEEDBACK:</strong> ${activeCaseState.feedback}
          </div>
          <span class="badge badge-verified">POINTS EARNED: ${this.state.caseScores[1]} / 10</span>
        </div>
      ` : ''}

      <!-- Questions Area -->
      <div class="questions-panel">
        ${activeCaseState.completed ? `
          <div class="case-locked-banner">
            <div>
              <div style="font-weight: 700; color: #fff;">🔒 ANSWERS EVALUATED & SUBMITTED (LOCKED)</div>
              <div style="font-size: 11px; color: var(--text-muted); margin-top: 3px;">Only 1 attempt is permitted. Responses permanently recorded for judges' evaluation.</div>
            </div>
            <span class="lock-badge">SCORE: ${this.state.caseScores[1]}/10 PTS</span>
          </div>
        ` : ''}
        <div class="questions-header">
          <div class="questions-title">Investigation Questions // 5 Objectives (10 Points)</div>
          <div class="case-meta-pills">
            <span class="meta-pill">2 POINTS EACH</span>
          </div>
        </div>

        ${caseData.questions.map((q, qIndex) => this.renderQuestionItem(q, qIndex, activeCaseState)).join('')}
      </div>
    `;

    container.innerHTML = html;

    // Attach Case 2 listeners
    container.querySelectorAll(".btn-view-fullscreen").forEach(btn => {
      btn.addEventListener("click", () => {
        this.openFullscreenModal(btn.dataset.evId);
      });
    });

    container.querySelectorAll(".btn-toggle-compare").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.evId;
        if (this.selectedForCompare.includes(id)) {
          this.selectedForCompare = this.selectedForCompare.filter(x => x !== id);
        } else {
          if (this.selectedForCompare.length >= 2) {
            this.selectedForCompare.shift();
          }
          this.selectedForCompare.push(id);
        }
        this.playSound('click');
        this.renderCase02(container, caseData);
      });
    });

    const btnOpenCompare = document.getElementById("btn-open-compare");
    if (btnOpenCompare) {
      btnOpenCompare.addEventListener("click", () => {
        if (this.selectedForCompare.length === 2) {
          this.openComparisonModal(this.selectedForCompare[0], this.selectedForCompare[1]);
        }
      });
    }

    // Bin toggle buttons
    container.querySelectorAll(".btn-toggle-bin").forEach(btn => {
      btn.addEventListener("click", () => {
        if (activeCaseState.completed) return;
        const bin = btn.dataset.bin;
        const evId = btn.dataset.evId;
        if (!activeCaseState.bins[bin]) activeCaseState.bins[bin] = [];

        if (activeCaseState.bins[bin].includes(evId)) {
          activeCaseState.bins[bin] = activeCaseState.bins[bin].filter(x => x !== evId);
        } else {
          activeCaseState.bins[bin].push(evId);
          // If in other bin, remove it
          const otherBin = bin === 'verified' ? 'questionable' : 'verified';
          activeCaseState.bins[otherBin] = (activeCaseState.bins[otherBin] || []).filter(x => x !== evId);
          this.playSound(bin === 'verified' ? 'click' : 'alert');
        }
        this.saveState();
        this.renderCase02(container, caseData);
      });
    });

    const whyInput = document.getElementById("why-rationale-input");
    if (whyInput) {
      whyInput.addEventListener("input", (e) => {
        activeCaseState.whyText = e.target.value;
        this.saveState();
      });
    }

    this.attachQuestionInputListeners(caseData, activeCaseState);
  }

  renderMockEvidenceGraphic(ev) {
    if (ev.svgType === 'cctv') {
      return `
        <svg viewBox="0 0 320 180" class="card-preview-svg">
          <rect width="320" height="180" fill="#090d14"/>
          <line x1="20" y1="20" x2="60" y2="20" stroke="#3EA6FF" stroke-width="2"/>
          <line x1="20" y1="20" x2="20" y2="60" stroke="#3EA6FF" stroke-width="2"/>
          <line x1="300" y1="20" x2="260" y2="20" stroke="#3EA6FF" stroke-width="2"/>
          <line x1="300" y1="20" x2="300" y2="60" stroke="#3EA6FF" stroke-width="2"/>
          <circle cx="160" cy="90" r="4" fill="#3EA6FF"/>
          <!-- Empty Desk & Monitor Outline -->
          <rect x="100" y="80" width="120" height="40" fill="#141e2e" stroke="#2a3b54" stroke-width="1.5"/>
          <rect x="135" y="55" width="50" height="28" fill="#1a273b" stroke="#3EA6FF" stroke-width="1"/>
          <text x="160" y="72" fill="#3EA6FF" font-family="monospace" font-size="8" text-anchor="middle">ACTIVE</text>
          <!-- Surveillance Overlay -->
          <text x="25" y="165" fill="#3EA6FF" font-family="monospace" font-size="10">REC ● CAM-04 [ROOM EMPTY]</text>
          <text x="295" y="165" fill="#3EA6FF" font-family="monospace" font-size="10" text-anchor="end">${ev.timestamp}</text>
        </svg>
      `;
    } else if (ev.svgType === 'screen') {
      return `
        <svg viewBox="0 0 320 180" class="card-preview-svg">
          <rect width="320" height="180" fill="#0b111a"/>
          <!-- Modal Dialog Box -->
          <rect x="40" y="30" width="240" height="120" fill="#141e2e" stroke="#E5484D" stroke-width="2"/>
          <rect x="40" y="30" width="240" height="24" fill="#4a1719"/>
          <text x="50" y="46" fill="#F4F7FA" font-family="monospace" font-size="10" font-weight="bold">AUTH OVERRIDE: IN-PERSON REQUIRED</text>
          <text x="160" y="85" fill="#F4F7FA" font-family="sans-serif" font-size="11" text-anchor="middle">Biometric Sensor Confirmation:</text>
          <text x="160" y="105" fill="#E5484D" font-family="monospace" font-size="12" font-weight="bold" text-anchor="middle">[OPERATOR PRESENT AT CONSOLE]</text>
          <rect x="110" y="120" width="100" height="20" fill="#E5484D" rx="2"/>
          <text x="160" y="134" fill="#070A0F" font-family="monospace" font-size="9" font-weight="bold" text-anchor="middle">VERIFIED 00:19:12</text>
        </svg>
      `;
    } else if (ev.svgType === 'alert') {
      return `
        <svg viewBox="0 0 320 180" class="card-preview-svg">
          <rect width="320" height="180" fill="#080c12"/>
          <circle cx="160" cy="65" r="26" fill="#2a1f0a" stroke="#FFD43B" stroke-width="2"/>
          <text x="160" y="72" fill="#FFD43B" font-family="sans-serif" font-size="20" font-weight="bold" text-anchor="middle">!</text>
          <text x="160" y="115" fill="#FFD43B" font-family="monospace" font-size="11" font-weight="bold" text-anchor="middle">COMMS DAEMON ADVISORY</text>
          <text x="160" y="135" fill="#8E9AAF" font-family="sans-serif" font-size="9" text-anchor="middle">CCTV-04 Maintenance Offline (Sched: 00:19:30)</text>
        </svg>
      `;
    } else {
      return `
        <svg viewBox="0 0 320 180" class="card-preview-svg">
          <rect width="320" height="180" fill="#070c14"/>
          <!-- Grid of sensors -->
          <g stroke="#1F2B3E" stroke-width="1">
            <line x1="80" y1="40" x2="80" y2="140"/><line x1="120" y1="40" x2="120" y2="140"/>
            <line x1="160" y1="40" x2="160" y2="140"/><line x1="200" y1="40" x2="200" y2="140"/>
            <line x1="240" y1="40" x2="240" y2="140"/>
            <line x1="60" y1="60" x2="260" y2="60"/><line x1="60" y1="90" x2="260" y2="90"/>
            <line x1="60" y1="120" x2="260" y2="120"/>
          </g>
          <circle cx="160" cy="90" r="12" fill="none" stroke="#3EA6FF" stroke-width="1.5" stroke-dasharray="2,2"/>
          <text x="160" y="94" fill="#3EA6FF" font-family="monospace" font-size="9" text-anchor="middle">0.0 kg</text>
          <text x="160" y="155" fill="#3EA6FF" font-family="monospace" font-size="10" text-anchor="middle">HEAT SIG: NONE (21.0°C AMBIENT)</text>
        </svg>
      `;
    }
  }

  /* ---------------- CASE 03: THE DIGITAL TRAIL ---------------- */
  renderCase03(container, caseData) {
    const activeCaseState = this.state.caseState[2];

    let html = `
      <div class="case-header-panel" style="border-left-color: var(--electric-yellow);">
        <div class="case-title-row">
          <div class="case-main-title">${caseData.title}</div>
          <div class="case-meta-pills">
            <span class="meta-pill">POINTS: 10</span>
            <span class="meta-pill">EST. TIME: 12-15 MIN</span>
            <span class="meta-pill">SKILL: IDENTITY CORRELATION</span>
          </div>
        </div>
        <p class="case-framing-text">${caseData.framing}</p>
      </div>

      <!-- Interactive Node Graph Canvas Container -->
      <div class="graph-interactive-container">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <span style="font-family: var(--font-mono); font-size: 12px; color: var(--text-muted);">
            INTERACTIVE SEQUENCE: CLICK NODES TO INSPECT // TRACE FORENSIC CORRELATIONS
          </span>
          <button class="btn btn-secondary" id="btn-reset-trail">
            RESET TRAIL
          </button>
        </div>

        <div class="graph-canvas-wrap">
          <div class="nodes-trail-row">
            ${caseData.nodes.map((node, i) => {
              const connector = caseData.trails[i];
              return `
                <div class="trail-node node-${node.status}" data-node-key="${node.key}">
                  <span class="trail-node-icon">
                    ${node.key === 'LOGIN' ? '🔑' : node.key === 'DEVICE' ? '💻' : node.key === 'FILE' ? '📄' : node.key === 'USER' ? '👤' : '📍'}
                  </span>
                  <div class="trail-node-title">${node.label}</div>
                  <span class="badge ${node.status === 'verified' ? 'badge-verified' : node.status === 'danger' ? 'badge-danger' : 'badge-warning'}">
                    ${node.status.toUpperCase()}
                  </span>
                </div>

                ${connector ? `
                  <div class="trail-connector ${(activeCaseState.trailLinks || []).includes(i) ? 'link-selected' : 'link-active'} ${connector.status === 'danger' || connector.status === 'divergent' ? 'link-danger' : ''}" data-connector-idx="${i}" title="${connector.note}" style="cursor: pointer;">
                  </div>
                ` : ''}
              `;
            }).join('')}
          </div>
        </div>

        <!-- Node Inspection Details Box -->
        <div class="trail-summary-card" id="trail-node-details">
          <div>
            <div style="font-family: var(--font-mono); font-size: 13px; font-weight: 700; color: var(--cold-blue);" id="trail-detail-title">
              CLICK ANY NODE OR CONNECTION IN THE SEQUENCE TO INSPECT EVIDENCE
            </div>
            <div style="font-size: 13.5px; color: var(--text-muted); margin-top: 4px;" id="trail-detail-text">
              Trace: LOGIN (Victor-07) → DEVICE (Remote R-07 Hijack) → FILE (Altered) → USER (Framed) → LOCATION (Spoofed)
            </div>
          </div>
          <span class="badge badge-warning">ANOMALY DETECTED AT HARDWARE HANDOFF</span>
        </div>
      </div>

      <!-- Feedback Banner if Submitted -->
      ${activeCaseState.feedback ? `
        <div class="feedback-banner">
          <div class="feedback-text">
            <strong>SYSTEM FEEDBACK:</strong> ${activeCaseState.feedback}
          </div>
          <span class="badge badge-verified">POINTS EARNED: ${this.state.caseScores[2]} / 10</span>
        </div>
      ` : ''}

      <!-- Questions Area -->
      <div class="questions-panel">
        ${activeCaseState.completed ? `
          <div class="case-locked-banner">
            <div>
              <div style="font-weight: 700; color: #fff;">🔒 ANSWERS EVALUATED & SUBMITTED (LOCKED)</div>
              <div style="font-size: 11px; color: var(--text-muted); margin-top: 3px;">Only 1 attempt is permitted. Responses permanently recorded for judges' evaluation.</div>
            </div>
            <span class="lock-badge">SCORE: ${this.state.caseScores[2]}/10 PTS</span>
          </div>
        ` : ''}
        <div class="questions-header">
          <div class="questions-title">Investigation Questions // 5 Objectives (10 Points)</div>
          <div class="case-meta-pills">
            <span class="meta-pill">2 POINTS EACH</span>
          </div>
        </div>

        ${caseData.questions.map((q, qIndex) => this.renderQuestionItem(q, qIndex, activeCaseState)).join('')}
      </div>
    `;

    container.innerHTML = html;

    // Attach Node Graph clicks
    container.querySelectorAll(".trail-node").forEach(nodeEl => {
      nodeEl.addEventListener("click", () => {
        const key = nodeEl.dataset.nodeKey;
        const node = caseData.nodes.find(n => n.key === key);
        if (node) {
          this.playSound('click');
          this.showNodeInspection(node);
        }
      });
    });

    // Attach Connector clicks
    container.querySelectorAll(".trail-connector").forEach(connectorEl => {
      connectorEl.addEventListener("click", () => {
        const idx = parseInt(connectorEl.dataset.connectorIdx);
        const trail = caseData.trails[idx];
        const detailTitle = document.getElementById("trail-detail-title");
        const detailText = document.getElementById("trail-detail-text");
        if (detailTitle) detailTitle.textContent = `TRAIL CONNECTION: ${trail.from} ➔ ${trail.to}`;
        if (detailText) detailText.innerHTML = `<strong>Forensic Correlation:</strong> ${trail.note}`;

        if (activeCaseState.completed) {
          // Locked - inspect only, no mutation
          return;
        }

        if (!activeCaseState.trailLinks) activeCaseState.trailLinks = [];
        if (activeCaseState.trailLinks.includes(idx)) {
          activeCaseState.trailLinks = activeCaseState.trailLinks.filter(x => x !== idx);
        } else {
          activeCaseState.trailLinks.push(idx);
          this.playSound('click');
        }
        this.saveState();
        this.renderCase03(container, caseData);
      });
    });

    const btnResetTrail = document.getElementById("btn-reset-trail");
    if (btnResetTrail) {
      if (activeCaseState.completed) {
        btnResetTrail.disabled = true;
        btnResetTrail.style.opacity = "0.4";
        btnResetTrail.style.cursor = "not-allowed";
        btnResetTrail.title = "Trail is locked after case submission";
      } else {
        btnResetTrail.addEventListener("click", () => {
          activeCaseState.trailLinks = [];
          activeCaseState.activeNodes = [];
          this.saveState();
          this.playSound('click');
          const detailTitle = document.getElementById("trail-detail-title");
          const detailText = document.getElementById("trail-detail-text");
          if (detailTitle) detailTitle.textContent = "TRAIL SELECTIONS RESET";
          if (detailText) detailText.textContent = "Click any node or connection link above to inspect forensic evidence data.";
          this.renderCase03(container, caseData);
          this.showToast("Digital trail selections reset.");
        });
      }
    }

    this.attachQuestionInputListeners(caseData, activeCaseState);
  }

  showNodeInspection(node) {
    const detailTitle = document.getElementById("trail-detail-title");
    const detailText = document.getElementById("trail-detail-text");
    if (detailTitle) {
      detailTitle.textContent = `${node.label} // ${node.summary}`;
    }
    if (detailText) {
      const entries = Object.entries(node.data).map(([k, v]) => `<strong>${k}:</strong> ${v}`).join(' | ');
      detailText.innerHTML = `
        <div style="margin-bottom: 8px;">${node.description}</div>
        <div style="font-family: var(--font-mono); font-size: 12px; color: var(--text-highlight); margin-bottom: 8px;">${entries}</div>
        <div style="display: flex; flex-wrap: wrap; gap: 10px; align-items: center; font-family: var(--font-mono); font-size: 10.5px; background: rgba(0,0,0,0.3); padding: 6px 10px; border-radius: 3px; border-left: 2px solid var(--electric-yellow);">
          <span style="color: var(--text-dim);">NODE PROVENANCE:</span>
          <span style="color: var(--electric-yellow);">${(node.stage || 'STAGE').toUpperCase()} AUDIT LOG</span>
          <span style="color: var(--text-dim);">INTEGRITY:</span>
          <span style="color: var(--terminal-green);">TAMPER-SEALED (HMAC-SHA256)</span>
        </div>
      `;
    }
  }

  /* ---------------- Questions Rendering & Handling ---------------- */
  renderQuestionItem(q, qIndex, activeCaseState) {
    const savedAnswer = activeCaseState.answers[q.id];
    const isCompleted = activeCaseState.completed;

    let inputMarkup = '';

    if (q.type === 'select') {
      inputMarkup = `
        <select class="q-text-input q-input-elem" data-qid="${q.id}" ${isCompleted ? 'disabled' : ''}>
          <option value="">-- Choose an option --</option>
          ${q.options.map(opt => `
            <option value="${opt}" ${savedAnswer === opt ? 'selected' : ''}>${opt}</option>
          `).join('')}
        </select>
      `;
    } else if (q.type === 'radio') {
      inputMarkup = `
        <div class="q-options-list">
          ${q.options.map(opt => `
            <label class="q-option-label">
              <input type="radio" name="${q.id}" value="${opt}" class="q-input-elem" data-qid="${q.id}" ${savedAnswer === opt ? 'checked' : ''} ${isCompleted ? 'disabled' : ''}>
              <span>${opt}</span>
            </label>
          `).join('')}
        </div>
      `;
    } else if (q.type === 'multiselect') {
      const selectedArray = Array.isArray(savedAnswer) ? savedAnswer : [];
      inputMarkup = `
        <div class="q-options-list">
          ${q.options.map(opt => `
            <label class="q-option-label">
              <input type="checkbox" name="${q.id}" value="${opt}" class="q-input-elem-multi" data-qid="${q.id}" ${selectedArray.includes(opt) ? 'checked' : ''} ${isCompleted ? 'disabled' : ''}>
              <span>${opt}</span>
            </label>
          `).join('')}
        </div>
      `;
    } else if (q.type === 'text') {
      inputMarkup = `
        <input type="text" class="q-text-input q-input-elem" data-qid="${q.id}" value="${savedAnswer || ''}" placeholder="${q.placeholder || ''}" ${isCompleted ? 'disabled' : ''}>
      `;
    }

    return `
      <div class="question-card" id="q-card-${q.id}">
        <div class="q-title">
          ${q.text}
          <span class="q-points-tag">${q.points} PTS</span>
        </div>
        ${inputMarkup}
        ${isCompleted ? `
          <div style="font-size: 13px; color: var(--cold-blue); background: rgba(62,166,255,0.06); padding: 8px 12px; border-left: 2px solid var(--cold-blue);">
            <strong>Analysis:</strong> ${q.explanation}
          </div>
        ` : ''}
      </div>
    `;
  }

  attachQuestionInputListeners(caseData, activeCaseState) {
    if (activeCaseState.completed) return;
    document.querySelectorAll(".q-input-elem").forEach(input => {
      input.addEventListener("change", (e) => {
        const qid = input.dataset.qid;
        activeCaseState.answers[qid] = input.value;
        this.saveState();
        this.updateBottomBar();
      });
      if (input.tagName === 'INPUT' && input.type === 'text') {
        input.addEventListener("input", (e) => {
          const qid = input.dataset.qid;
          activeCaseState.answers[qid] = input.value;
          this.saveState();
        });
      }
    });

    document.querySelectorAll(".q-input-elem-multi").forEach(input => {
      input.addEventListener("change", (e) => {
        const qid = input.dataset.qid;
        if (!Array.isArray(activeCaseState.answers[qid])) {
          activeCaseState.answers[qid] = [];
        }
        if (input.checked) {
          if (!activeCaseState.answers[qid].includes(input.value)) {
            activeCaseState.answers[qid].push(input.value);
          }
        } else {
          activeCaseState.answers[qid] = activeCaseState.answers[qid].filter(x => x !== input.value);
        }
        this.saveState();
      });
    });
  }

  /* ---------------- Submit Case Answers ---------------- */
  handleSubmitCase() {
    const currentCaseIdx = this.state.currentCase;
    const caseData = this.data.cases[currentCaseIdx];
    const activeCaseState = this.state.caseState[currentCaseIdx];

    if (activeCaseState.completed) {
      alert("This case has already been evaluated and submitted.");
      return;
    }

    // Single-attempt pre-submission completeness warning
    const unansweredCount = caseData.questions.filter(q => {
      const a = activeCaseState.answers[q.id];
      return a === undefined || a === null || a === '' || (Array.isArray(a) && a.length === 0);
    }).length;

    if (unansweredCount > 0) {
      const confirmed = confirm(
        `FORENSIC SUBMISSION ADVISORY:\nYou have left ${unansweredCount} of ${caseData.questions.length} question objectives unanswered.\n\nBecause this simulation enforces a strict 1-ATTEMPT policy, any unanswered questions will be permanently scored 0 points.\n\nProceed with final submission?`
      );
      if (!confirmed) return;
    }

    let earnedPoints = 0;
    const questionAuditList = [];

    caseData.questions.forEach((q, qIndex) => {
      const userAnswer = activeCaseState.answers[q.id];
      const hintCount = activeCaseState.hintsRevealed[qIndex] || 0;

      let questionBase = 0;
      let isCorrect = false;

      if (window.nexusCrypto) {
        const verifyRes = window.nexusCrypto.verify(q, userAnswer);
        if (verifyRes === true || verifyRes === 2) {
          questionBase = q.points;
          isCorrect = true;
        } else if (verifyRes === 1) {
          questionBase = 1;
          isCorrect = false;
        }
      } else {
        if (q.type === 'select' || q.type === 'radio') {
          if (userAnswer === q.correct) {
            questionBase = q.points;
            isCorrect = true;
          }
        } else if (q.type === 'multiselect') {
          if (Array.isArray(userAnswer)) {
            const isExactMatch = q.correct && q.correct.every(item => userAnswer.includes(item)) && userAnswer.length === q.correct.length;
            if (isExactMatch) {
              questionBase = q.points;
              isCorrect = true;
            } else if (q.correct && q.correct.some(item => userAnswer.includes(item))) {
              questionBase = 1;
            }
          }
        } else if (q.type === 'text') {
          if (userAnswer && typeof userAnswer === 'string') {
            const lower = userAnswer.toLowerCase();
            const matchCount = (q.keywords || []).filter(kw => lower.includes(kw)).length;
            if (matchCount >= 2) {
              questionBase = q.points;
              isCorrect = true;
            } else if (matchCount === 1) {
              questionBase = 1;
            }
          }
        }
      }

      // Apply Hint penalties
      let penalty = 0;
      if (hintCount === 1) {
        penalty = 1;
      } else if (hintCount >= 2) {
        penalty = questionBase;
      }

      const awardedForQ = Math.max(0, questionBase - penalty);
      earnedPoints += awardedForQ;

      const decodedAns = window.nexusCrypto ? window.nexusCrypto.getDecodedAnswer(q) : (q.correct || '');

      questionAuditList.push({
        qId: q.id,
        qText: q.text,
        userAnswer: userAnswer !== undefined && userAnswer !== null && userAnswer !== '' ? userAnswer : "NO_ANSWER",
        correctAnswer: decodedAns,
        isCorrect: isCorrect,
        points: awardedForQ,
        maxPoints: q.points,
        hintsUsed: hintCount,
        hintPenalty: penalty,
        explanation: q.explanation
      });
    });

    this.state.caseScores[currentCaseIdx] = earnedPoints;
    activeCaseState.completed = true;

    // Record submission for judges evaluation and spreadsheet integration
    if (window.admin && window.admin.recordSubmission) {
      const whyInputElem = document.getElementById("why-rationale-input");
      const submissionPayload = {
        submissionId: `SUB-${(this.state.teamId || 'TEAM').replace(/\s+/g, '')}-C0${currentCaseIdx + 1}-${Date.now()}`,
        teamId: this.state.teamId || "TEAM 07",
        caseIndex: currentCaseIdx,
        caseNumber: `0${currentCaseIdx + 1}`,
        caseTitle: caseData.title,
        timestamp: new Date().toLocaleString(),
        score: earnedPoints,
        maxScore: caseData.points || 10,
        questions: questionAuditList,
        qualitative: {
          whyText: activeCaseState.whyText || (whyInputElem ? whyInputElem.value : ""),
          markedRows: Array.from(this.markedRows || []),
          bins: activeCaseState.bins || { verified: [], questionable: [] },
          trailLinks: activeCaseState.trailLinks || []
        },
        timerRemaining: this.formatTime(this.state.timerSeconds)
      };
      window.admin.recordSubmission(submissionPayload);
    }

    // Set feedback message
    if (currentCaseIdx === 0) {
      activeCaseState.feedback = "CASE 01 RECORD RECONSTRUCTED: Remote Admin Device R-07 was used to execute an unauthorized modification during the active Terminal N-04 session.";
      if (this.state.caseState[1]) this.state.caseState[1].unlocked = true;
    } else if (currentCaseIdx === 1) {
      activeCaseState.feedback = "EVIDENCE VERIFICATION COMPLETE: One or more records were deliberately fabricated to support a false narrative of in-person presence.";
      if (this.state.caseState[2]) this.state.caseState[2].unlocked = true;
    } else if (currentCaseIdx === 2) {
      activeCaseState.feedback = "CASE 01–03 CORRELATED: The evidence points to deliberate information manipulation. Primary identity remains unresolved.";
    }

    this.state.score = this.calculateTotalScore();
    this.saveState();
    this.playSound('success');

    this.showToast(`Case 0${currentCaseIdx + 1} submitted! Locked (1 attempt only).`);
    alert(`EVALUATION COMPLETE // SUBMISSION CONFIRMED\n\nInvestigation 0${currentCaseIdx + 1} has been submitted.\nScore Awarded: ${earnedPoints}/10 Points\n\nNotice: Single-attempt policy is active. Your answers have been permanently locked and recorded for judges' evaluation.`);

    this.renderCurrentCase();
    this.updateUI();
  }

  handleResetCurrentSelections() {
    const currentCaseIdx = this.state.currentCase;
    const activeCaseState = this.state.caseState[currentCaseIdx];

    // STRICT SINGLE-ATTEMPT LOCKOUT:
    if (activeCaseState.completed) {
      alert(
        `EVALUATION LOCKED: Only 1 attempt is permitted per investigation.\n\nCase 0${currentCaseIdx + 1} has already been evaluated and submitted (${this.state.caseScores[currentCaseIdx]}/10 pts).\n\nYour responses are permanently recorded for the judges and cannot be reset or re-attempted.`
      );
      this.showToast("Locked: Only 1 attempt allowed per case.");
      return;
    }

    // Reset answers
    activeCaseState.answers = {};

    // Case 01 specific reset
    if (currentCaseIdx === 0) {
      this.markedRows.clear();
      activeCaseState.markedRows = [];
      this.selectedEvidenceRow = null;
      const area = document.getElementById("row-inspection-area");
      if (area) area.innerHTML = "";
    }

    // Case 02 specific reset
    if (currentCaseIdx === 1) {
      activeCaseState.bins = { verified: [], questionable: [] };
      activeCaseState.whyText = "";
      this.selectedForCompare = [];
    }

    // Case 03 specific reset
    if (currentCaseIdx === 2) {
      activeCaseState.activeNodes = [];
      activeCaseState.trailLinks = [];
      const detailTitle = document.getElementById("trail-detail-title");
      const detailText = document.getElementById("trail-detail-text");
      if (detailTitle) detailTitle.textContent = "CLICK ANY NODE IN THE SEQUENCE TO INSPECT DETAILED EVIDENCE";
      if (detailText) detailText.textContent = "Trace: LOGIN (Victor-07) → DEVICE (Remote R-07 Hijack) → FILE (Altered) → USER (Framed) → LOCATION (Spoofed)";
    }

    // Clear DOM input elements immediately
    document.querySelectorAll(".q-input-elem").forEach(input => {
      if (input.type === 'radio') {
        input.checked = false;
      } else if (input.tagName === 'SELECT') {
        input.selectedIndex = 0;
      } else {
        input.value = '';
      }
    });

    document.querySelectorAll(".q-input-elem-multi").forEach(input => {
      input.checked = false;
    });

    this.saveState();
    this.playSound('click');
    this.renderCurrentCase();
    this.updateUI();
    this.showToast(`Case 0${currentCaseIdx + 1} selections reset.`);
  }

  showToast(message) {
    let toast = document.getElementById("sim-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "sim-toast";
      toast.className = "sim-toast";
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      toast.classList.remove("show");
    }, 2400);
  }

  /* ---------------- Rails & Left/Right UI ---------------- */
  renderLeftRail() {
    const list = document.getElementById("cases-progress-list");
    if (!list) return;

    list.innerHTML = this.data.cases.map((c, i) => {
      const cState = this.state.caseState[i];
      const isActive = this.state.currentCase === i;
      const isCompleted = cState.completed;
      const isLocked = !cState.unlocked;

      let statusBadge = '';
      if (isCompleted) {
        statusBadge = `<span class="case-status-badge badge-completed">COMPLETED (${this.state.caseScores[i]}/10)</span>`;
      } else if (isActive) {
        statusBadge = `<span class="case-status-badge badge-active">ACTIVE</span>`;
      } else if (isLocked) {
        statusBadge = `<span class="case-status-badge badge-locked">LOCKED</span>`;
      } else {
        statusBadge = `<span class="case-status-badge badge-active">UNLOCKED</span>`;
      }

      return `
        <div class="case-progress-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''} ${isLocked ? 'locked' : ''}" data-case-idx="${i}">
          <div class="case-item-header">
            <span class="case-item-num">CASE ${c.number}</span>
            ${statusBadge}
          </div>
          <div class="case-item-title">${c.shortTitle}</div>
          <div class="case-item-points">MAX POINTS: ${c.points}</div>
        </div>
      `;
    }).join('');

    list.querySelectorAll(".case-progress-item:not(.locked)").forEach(item => {
      item.addEventListener("click", () => {
        const idx = parseInt(item.dataset.caseIdx);
        this.state.currentCase = idx;
        this.saveState();
        this.playSound('click');
        this.renderCurrentCase();
        this.updateUI();
      });
    });

    list.querySelectorAll(".case-progress-item.locked").forEach(item => {
      item.addEventListener("click", () => {
        this.playSound('alert');
        this.showToast("Case Locked: Complete and submit the preceding investigation first.");
      });
    });
  }

  renderRightRail(caseData) {
    const objText = document.getElementById("intel-objective-text");
    if (objText) objText.textContent = caseData.objective;

    const countText = document.getElementById("intel-evidence-count");
    if (countText) {
      const count = caseData.evidence ? caseData.evidence.length : (caseData.nodes ? caseData.nodes.length : 0);
      countText.textContent = `${count.toString().padStart(2, '0')} ITEMS AVAILABLE`;
    }

    const scoreBox = document.getElementById("intel-score-val");
    if (scoreBox) {
      scoreBox.textContent = `${this.calculateTotalScore()} / 30`;
    }

    // Hint Drawer rendering
    const hintDrawer = document.getElementById("hint-drawer-items");
    if (hintDrawer) {
      const activeCaseState = this.state.caseState[this.state.currentCase];
      hintDrawer.innerHTML = caseData.questions.map((q, qIndex) => {
        const hintCount = activeCaseState.hintsRevealed[qIndex] || 0;
        return `
          <div class="hint-tier-card">
            <div class="hint-tier-header">
              <span class="hint-tier-name">Question 0${qIndex + 1} Hints</span>
              <span class="hint-cost-pill">${hintCount}/3 UNLOCKED</span>
            </div>
            ${hintCount > 0 ? `
              <div class="hint-body-text">
                <strong>Hint 1:</strong> ${q.hints[0]}
              </div>
            ` : ''}
            ${hintCount > 1 ? `
              <div class="hint-body-text">
                <strong>Hint 2:</strong> ${q.hints[1]}
              </div>
            ` : ''}
            ${hintCount > 2 ? `
              <div class="hint-body-text">
                <strong>Hint 3:</strong> ${q.hints[2]}
              </div>
            ` : ''}
            ${hintCount < 3 && !activeCaseState.completed ? `
              <button class="btn btn-yellow btn-use-hint" data-q-index="${qIndex}" style="padding: 6px 10px; font-size: 11px;">
                USE HINT ${hintCount + 1} (${hintCount === 0 ? '-1 PT' : hintCount === 1 ? '-1 ADDL PT' : 'WORTH 0 PTS'})
              </button>
            ` : ''}
          </div>
        `;
      }).join('');

      hintDrawer.querySelectorAll(".btn-use-hint").forEach(btn => {
        btn.addEventListener("click", () => {
          const qIndex = parseInt(btn.dataset.qIndex);
          this.promptHintConfirmation(qIndex);
        });
      });
    }
  }

  promptHintConfirmation(qIndex) {
    const activeCaseState = this.state.caseState[this.state.currentCase];
    const currentHints = activeCaseState.hintsRevealed[qIndex] || 0;
    const nextHintLevel = currentHints + 1;

    let penaltyText = "-1 point from this question";
    if (nextHintLevel === 2) penaltyText = "-1 additional point (-2 total)";
    if (nextHintLevel === 3) penaltyText = "this question will become worth 0 points";

    const confirmed = confirm(`Use Hint ${nextHintLevel} for Question 0${qIndex + 1}?\n\nWarning: This will reduce maximum points (${penaltyText}).`);
    if (confirmed) {
      activeCaseState.hintsRevealed[qIndex] = nextHintLevel;
      this.saveState();
      this.playSound('alert');
      this.renderCurrentCase();
    }
  }

  updateBottomBar() {
    const activeCaseState = this.state.caseState[this.state.currentCase];
    const btnSubmit = document.getElementById("btn-submit-answer");
    const btnNext = document.getElementById("btn-next-investigation");
    const btnReset = document.getElementById("btn-reset-selections");

    if (btnSubmit) {
      btnSubmit.disabled = activeCaseState.completed;
      btnSubmit.textContent = activeCaseState.completed ? "LOCKED // EVALUATED (1 ATTEMPT ONLY)" : "SUBMIT ANSWERS";
    }

    if (btnReset) {
      if (activeCaseState.completed) {
        btnReset.disabled = true;
        btnReset.style.opacity = "0.4";
        btnReset.style.cursor = "not-allowed";
        btnReset.title = "Evaluation locked: Only 1 attempt permitted";
      } else {
        btnReset.disabled = false;
        btnReset.style.opacity = "1";
        btnReset.style.cursor = "pointer";
        btnReset.title = "Reset current unsubmitted selections";
      }
    }

    if (btnNext) {
      const hasNext = this.state.currentCase < 2;
      const nextUnlocked = hasNext && this.state.caseState[this.state.currentCase + 1].unlocked;
      btnNext.style.display = activeCaseState.completed ? "inline-flex" : "none";
      btnNext.textContent = hasNext ? `PROCEED TO CASE 0${this.state.currentCase + 2} ➔` : "VIEW FINAL SCORE REPORT ➔";
    }
  }

  updateUI() {
    this.updateDashboardUI();
    this.updateTimerDisplay();
  }

  /* ---------------- Modals (Fullscreen, Comparison, Admin) ---------------- */
  openFullscreenModal(evId) {
    const caseData = this.data.cases[this.state.currentCase];
    const ev = caseData.evidence.find(x => x.id === evId);
    if (!ev) return;

    const modal = document.getElementById("modal-fullscreen-evidence");
    const title = document.getElementById("fullscreen-modal-title");
    const body = document.getElementById("fullscreen-modal-body");

    if (title) title.textContent = `${ev.id} // ${ev.title}`;
    if (body) {
      body.innerHTML = `
        <div style="display: flex; gap: 20px; flex-wrap: wrap;">
          <div style="flex: 1 1 340px; height: 260px; background: #040608; border: 1px solid var(--border-line);">
            ${this.renderMockEvidenceGraphic(ev)}
          </div>
          <div style="flex: 1 1 300px; display: flex; flex-direction: column; gap: 10px;">
            <div style="font-family: var(--font-mono); font-size: 13px; color: var(--cold-blue);">${ev.category}</div>
            <p style="font-size: 14px; color: var(--text-main);">${ev.description}</p>
            <div class="meta-grid" style="margin-top: 10px;">
              <div class="meta-item"><span class="meta-label">Timestamp</span><span class="meta-value">${ev.timestamp}</span></div>
              <div class="meta-item"><span class="meta-label">Location</span><span class="meta-value">${ev.location}</span></div>
              <div class="meta-item"><span class="meta-label">Hash</span><span class="meta-value" style="font-size: 10.5px;">${ev.fileHash}</span></div>
              <div class="meta-item"><span class="meta-label">Source</span><span class="meta-value">${ev.source}</span></div>
            </div>
            ${ev.metadata ? `
              <div style="background: rgba(255,255,255,0.04); padding: 10px; border-left: 2px solid var(--cold-blue); font-size: 12.5px; margin-top: 6px;">
                ${Object.entries(ev.metadata).map(([k, v]) => `<strong>${k}:</strong> ${v}`).join('<br>')}
              </div>
            ` : ''}
          </div>
        </div>
      `;
    }

    if (modal) modal.classList.add("active");
  }

  openComparisonModal(id1, id2) {
    const caseData = this.data.cases[1];
    const ev1 = caseData.evidence.find(x => x.id === id1);
    const ev2 = caseData.evidence.find(x => x.id === id2);
    if (!ev1 || !ev2) return;

    const modal = document.getElementById("modal-comparison");
    const body = document.getElementById("comparison-modal-body");

    if (body) {
      body.innerHTML = `
        <div class="comparison-grid">
          <div class="compare-card">
            <div style="font-family: var(--font-mono); font-size: 12px; color: var(--cold-blue); font-weight: 700;">
              ${ev1.id}: ${ev1.title}
            </div>
            <div style="height: 160px; background: #040608; border: 1px solid var(--border-line);">
              ${this.renderMockEvidenceGraphic(ev1)}
            </div>
            <p style="font-size: 13px; color: var(--text-muted);">${ev1.description}</p>
            <div class="meta-grid">
              <div class="meta-item"><span class="meta-label">Timestamp</span><span class="meta-value">${ev1.timestamp}</span></div>
              <div class="meta-item"><span class="meta-label">Location</span><span class="meta-value">${ev1.location}</span></div>
            </div>
          </div>

          <div class="compare-card">
            <div style="font-family: var(--font-mono); font-size: 12px; color: var(--nexus-purple); font-weight: 700;">
              ${ev2.id}: ${ev2.title}
            </div>
            <div style="height: 160px; background: #040608; border: 1px solid var(--border-line);">
              ${this.renderMockEvidenceGraphic(ev2)}
            </div>
            <p style="font-size: 13px; color: var(--text-muted);">${ev2.description}</p>
            <div class="meta-grid">
              <div class="meta-item"><span class="meta-label">Timestamp</span><span class="meta-value">${ev2.timestamp}</span></div>
              <div class="meta-item"><span class="meta-label">Location</span><span class="meta-value">${ev2.location}</span></div>
            </div>
          </div>
        </div>

        <div style="background: rgba(255,212,59,0.08); border-left: 3px solid var(--electric-yellow); padding: 12px; font-size: 13.5px; color: var(--text-main);">
          <strong>Deduction Hint:</strong> Note the timestamp correspondence. If EV-01 and EV-04 assert the room was unoccupied at 00:19:12, how could EV-02 report an in-person biometric override at the exact same second?
        </div>
      `;
    }

    if (modal) modal.classList.add("active");
  }

  /* ---------------- Organiser Admin Modal ---------------- */
  openAdminModal() {
    const modal = document.getElementById("modal-admin-console");
    if (!modal) return;

    if (!window.admin.isAuthenticated) {
      const pin = prompt("ORGANISER AUTHENTICATION // ENTER ADMIN PIN:\n(Default: NEXUS-ADMIN or 1337)");
      if (!pin || !window.admin.verifyPin(pin)) {
        alert("Access Denied: Invalid Security Passcode.");
        return;
      }
    }

    this.renderAdminConsoleContent();
    modal.classList.add("active");
  }

  renderAdminConsoleContent() {
    const body = document.getElementById("admin-console-body");
    if (!body) return;

    this.adminActiveTab = this.adminActiveTab || 'leaderboard';
    this.adminSelectedJudgeTeam = this.adminSelectedJudgeTeam || 'ALL';

    const teams = window.admin.teams;
    const responses = window.admin.teamResponses || [];

    // Gather all distinct teams for judging filter
    const recordedTeams = Array.from(new Set(responses.map(r => r.teamId)));
    teams.forEach(t => { if (!recordedTeams.includes(t.id)) recordedTeams.push(t.id); });

    let contentHtml = '';

    // --- TAB 1: LEADERBOARD & TIMERS ---
    if (this.adminActiveTab === 'leaderboard') {
      contentHtml = `
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; margin-bottom: 12px;">
          <div style="font-family: var(--font-mono); font-size: 12px; color: var(--nexus-purple); font-weight: 700;">
            ORGANISER MASTER TERMINAL // LIVE LEADERBOARD &amp; ROSTER MANAGEMENT
          </div>
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            <button class="btn btn-secondary" id="btn-admin-timer-toggle">
              ${this.state.timerRunning ? 'PAUSE TIMER' : 'RESUME TIMER'}
            </button>
            <button class="btn btn-secondary" id="btn-admin-add-time">
              +5 MINS
            </button>
            <button class="btn btn-secondary" id="btn-admin-reset-all-master" style="color: var(--crimson-red); border-color: rgba(229,72,77,0.4); font-size: 10.5px;">
              RESET ALL TEAMS
            </button>
            <button class="btn btn-primary" id="btn-admin-export-csv">
              EXPORT SCORES CSV
            </button>
          </div>
        </div>

        <!-- Add Team Bar -->
        <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-line); border-radius: 4px; padding: 10px 14px; margin-bottom: 14px; display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
          <span style="font-family: var(--font-mono); font-size: 11px; font-weight: 700; color: var(--text-highlight);">+ REGISTER NEW TEAM:</span>
          <input type="text" id="admin-new-team-id" class="q-text-input" placeholder="Team ID (e.g. TEAM 08)" style="width: 150px; padding: 6px 10px; font-size: 11.5px;">
          <input type="text" id="admin-new-team-code" class="q-text-input" placeholder="Access Code (e.g. NEXUS-2026)" style="width: 180px; padding: 6px 10px; font-size: 11.5px;">
          <button class="btn btn-nexus" id="btn-admin-add-team" style="padding: 6px 14px; font-size: 11px;">
            ADD TEAM
          </button>
        </div>

        <!-- Teams Table -->
        <table class="admin-table">
          <thead>
            <tr>
              <th>Team ID</th>
              <th>Current Case</th>
              <th>C1</th>
              <th>C2</th>
              <th>C3</th>
              <th>Total Score</th>
              <th style="text-align: right;">Team Management &amp; Controls</th>
            </tr>
          </thead>
          <tbody>
            ${teams.map(t => `
              <tr>
                <td style="font-weight: 700; color: var(--text-highlight);">${t.id}</td>
                <td>Case 0${t.currentCase}</td>
                <td>${t.case1 || 0}/10</td>
                <td>${t.case2 || 0}/10</td>
                <td>${t.case3 || 0}/10</td>
                <td style="color: var(--cold-blue); font-weight: 700;">${t.score} / 30</td>
                <td style="text-align: right;">
                  <button class="btn btn-secondary btn-admin-action" data-action="add-pts" data-team="${t.id}" style="padding: 3px 6px; font-size: 10px;" title="Add 2 bonus points">+2</button>
                  <button class="btn btn-secondary btn-admin-action" data-action="sub-pts" data-team="${t.id}" style="padding: 3px 6px; font-size: 10px;" title="Deduct 2 points">-2</button>
                  <button class="btn btn-secondary btn-admin-action" data-action="unlock" data-team="${t.id}" style="padding: 3px 6px; font-size: 10px;" title="Force unlock next investigation">UNLOCK</button>
                  <button class="btn btn-secondary btn-admin-action" data-action="reset" data-team="${t.id}" style="padding: 3px 6px; font-size: 10px;" title="Reset current active case">RESET CASE</button>
                  <button class="btn btn-secondary btn-admin-action" data-action="full-reset" data-team="${t.id}" style="padding: 3px 6px; font-size: 10px; color: var(--electric-yellow); border-color: rgba(255,212,59,0.4);" title="Full reset of all 3 cases and scores">FULL RESET</button>
                  <button class="btn btn-secondary btn-admin-action" data-action="delete" data-team="${t.id}" style="padding: 3px 6px; font-size: 10px; color: var(--crimson-red); border-color: rgba(229,72,77,0.4);" title="Permanently delete team from competition">DELETE</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <!-- Audit Trail Preview -->
        <div style="margin-top: 14px;">
          <div style="font-family: var(--font-mono); font-size: 11px; color: var(--text-dim); text-transform: uppercase; margin-bottom: 6px;">
            Live Organiser Audit Log
          </div>
          <div style="background: rgba(7,10,15,0.8); border: 1px solid var(--border-line); max-height: 120px; overflow-y: auto; padding: 8px; font-family: var(--font-mono); font-size: 11px; color: var(--text-muted);">
            ${window.admin.auditLog.map(a => `<div>[${a.time}] [${a.action}] ${a.details}</div>`).join('')}
          </div>
        </div>
      `;
    }

    // --- TAB 2: JUDGES EVALUATION & RAW RESPONSES ---
    else if (this.adminActiveTab === 'judging') {
      const filtered = responses.filter(r => this.adminSelectedJudgeTeam === 'ALL' || r.teamId === this.adminSelectedJudgeTeam);

      contentHtml = `
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; margin-bottom: 14px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <label style="font-family: var(--font-mono); font-size: 11px; color: var(--text-dim); text-transform: uppercase; font-weight: 700;">
              Filter Team:
            </label>
            <select id="judge-team-select" class="q-text-input" style="padding: 6px 12px; font-size: 11.5px; width: 180px;">
              <option value="ALL" ${this.adminSelectedJudgeTeam === 'ALL' ? 'selected' : ''}>ALL TEAMS (${responses.length})</option>
              ${recordedTeams.map(t => `<option value="${t}" ${this.adminSelectedJudgeTeam === t ? 'selected' : ''}>${t}</option>`).join('')}
            </select>
          </div>
          <button class="btn btn-primary" id="btn-admin-export-judges-csv" style="padding: 8px 14px; font-size: 11px;">
            📊 EXPORT JUDGES SPREADSHEET (CSV)
          </button>
        </div>

        <div style="max-height: 460px; overflow-y: auto; padding-right: 4px;">
          ${filtered.length === 0 ? `
            <div style="text-align: center; padding: 40px 20px; border: 1px dashed var(--border-line); color: var(--text-muted); font-family: var(--font-mono); font-size: 12px; line-height: 1.6;">
              NO PARTICIPANT RESPONSES RECORDED YET FOR THIS FILTER.<br>
              <span style="font-size: 11px; color: var(--text-dim);">When a team completes and submits an investigation case, their full question choices, written justifications, and earned points will appear here immediately for judges' review.</span>
            </div>
          ` : filtered.map(r => `
            <div class="judge-card">
              <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-line); padding-bottom: 8px; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
                <div>
                  <span style="font-family: var(--font-mono); font-size: 14px; font-weight: 700; color: var(--text-highlight);">${r.teamId}</span>
                  <span style="color: var(--cold-blue); font-size: 12px; margin-left: 8px; font-family: var(--font-mono); font-weight: 600;">Case 0${r.caseIndex + 1}: ${r.caseTitle}</span>
                </div>
                <div style="display: flex; gap: 10px; align-items: center;">
                  <span style="font-size: 11px; color: var(--text-dim); font-family: var(--font-mono);">${r.timestamp}</span>
                  <span class="badge badge-verified" style="font-size: 11px;">SCORE: ${r.score} / ${r.maxScore} PTS</span>
                </div>
              </div>

              ${r.qualitative && (r.qualitative.whyText || (r.qualitative.markedRows && r.qualitative.markedRows.length > 0) || (r.qualitative.trailLinks && r.qualitative.trailLinks.length > 0)) ? `
                <div style="background: rgba(62,166,255,0.06); border-left: 3px solid var(--cold-blue); padding: 10px 14px; margin-bottom: 12px; font-size: 12px; line-height: 1.5;">
                  ${r.qualitative.whyText ? `<div><strong style="color: var(--cold-blue);">Participant Written Rationale ("Why?" Analysis):</strong> <span style="color: var(--text-highlight); font-style: italic;">"${r.qualitative.whyText}"</span></div>` : ''}
                  ${r.qualitative.markedRows && r.qualitative.markedRows.length > 0 ? `<div style="margin-top: 4px;"><strong style="color: var(--crimson-red);">Marked Suspicious Rows:</strong> <span style="font-family: var(--font-mono); font-size: 11px;">${r.qualitative.markedRows.join(', ')}</span></div>` : ''}
                  ${r.qualitative.bins ? `<div style="margin-top: 4px;"><strong style="color: var(--electric-yellow);">Categorized Evidence:</strong> <span style="font-family: var(--font-mono); font-size: 11px;">Verified: [${(r.qualitative.bins.verified || []).join(', ')}] | Questionable: [${(r.qualitative.bins.questionable || []).join(', ')}]</span></div>` : ''}
                  ${r.qualitative.trailLinks && r.qualitative.trailLinks.length > 0 ? `<div style="margin-top: 4px;"><strong style="color: var(--nexus-purple);">Correlated Trail Connections:</strong> <span style="font-family: var(--font-mono); font-size: 11px;">${r.qualitative.trailLinks.join(' ➔ ')}</span></div>` : ''}
                </div>
              ` : ''}

              <table class="admin-table" style="font-size: 12px; margin-bottom: 10px;">
                <thead>
                  <tr>
                    <th style="width: 10%;">Q-ID</th>
                    <th style="width: 38%;">Question Prompt</th>
                    <th style="width: 26%;">Participant Answer</th>
                    <th style="width: 14%;">Result</th>
                    <th style="width: 12%;">Score</th>
                  </tr>
                </thead>
                <tbody>
                  ${r.questions.map(q => {
                    const resultColor = q.isCorrect ? 'var(--cold-blue)' : (q.points > 0 ? 'var(--electric-yellow)' : 'var(--crimson-red)');
                    const statusText = q.isCorrect ? 'CORRECT' : (q.points > 0 ? 'PARTIAL' : 'INCORRECT');
                    const ansStr = Array.isArray(q.userAnswer) ? q.userAnswer.join('; ') : q.userAnswer;
                    return `
                      <tr>
                        <td style="font-family: var(--font-mono); font-weight: 700;">${q.qId}</td>
                        <td>${q.qText}</td>
                        <td style="font-family: var(--font-mono); color: var(--text-highlight); font-weight: 600;">${ansStr}</td>
                        <td style="color: ${resultColor}; font-weight: 700; font-family: var(--font-mono); font-size: 11px;">
                          ${statusText} ${q.hintsUsed > 0 ? `<span style="font-size: 9.5px; opacity: 0.8;">(-${q.hintPenalty} hint)</span>` : ''}
                        </td>
                        <td style="font-weight: 700; font-family: var(--font-mono); color: ${q.points > 0 ? 'var(--cold-blue)' : 'var(--text-muted)'};">${q.points} / ${q.maxPoints}</td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>

              <div style="display: flex; gap: 8px; justify-content: flex-end; align-items: center; padding-top: 6px;">
                <span style="font-size: 11px; color: var(--text-dim); font-family: var(--font-mono);">JUDGE ADJUSTMENT:</span>
                <button class="btn btn-secondary btn-judge-adjust" data-team="${r.teamId}" data-delta="1" style="padding: 4px 8px; font-size: 10px;">+1 BONUS</button>
                <button class="btn btn-secondary btn-judge-adjust" data-team="${r.teamId}" data-delta="-1" style="padding: 4px 8px; font-size: 10px;">-1 DEDUCTION</button>
                <button class="btn btn-secondary btn-judge-adjust" data-team="${r.teamId}" data-delta="custom" style="padding: 4px 8px; font-size: 10px;">CUSTOM SCORE</button>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    }

    // --- TAB 3: GOOGLE SHEETS LIVE SYNC ---
    else if (this.adminActiveTab === 'sheets') {
      contentHtml = `
        <div style="background: var(--bg-surface); border: 1px solid var(--border-line); padding: 16px; border-radius: 2px;">
          <div style="font-family: var(--font-mono); font-size: 12px; color: var(--cold-blue); font-weight: 700; margin-bottom: 6px;">
            GOOGLE SHEETS LIVE WEBHOOK INTEGRATION
          </div>
          <p style="font-size: 12.5px; color: var(--text-muted); margin-bottom: 14px; line-height: 1.5;">
            Connect your event Google Sheet so every team submission automatically streams directly into your spreadsheet in real time. (If not configured, all responses remain securely saved in local browser storage and can be exported at any time via CSV).
          </p>

          <div style="display: flex; gap: 10px; align-items: center; margin-bottom: 12px; flex-wrap: wrap;">
            <input type="text" id="input-sheets-webhook" class="q-text-input" placeholder="https://script.google.com/macros/s/.../exec" value="${window.admin.webhookUrl || ''}" style="flex: 1 1 350px; padding: 10px 12px; font-size: 12px;">
            <button class="btn btn-primary" id="btn-save-webhook" style="padding: 10px 14px; font-size: 11px;">
              SAVE WEBHOOK
            </button>
            <button class="btn btn-secondary" id="btn-sync-all-sheets" style="padding: 10px 14px; font-size: 11px;">
              🔄 SYNC ALL RESPONSES NOW
            </button>
          </div>

          <div style="font-family: var(--font-mono); font-size: 11.5px; color: ${window.admin.webhookUrl ? 'var(--cold-blue)' : 'var(--electric-yellow)'}; margin-bottom: 16px;">
            STATUS: ${window.admin.webhookUrl ? '● CONNECTED // Auto-sync active on each participant submission' : '○ OFFLINE // Submissions stored in browser memory & ready for CSV export'}
          </div>

          <div style="border-top: 1px solid var(--border-line); padding-top: 14px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span style="font-family: var(--font-mono); font-size: 11px; color: var(--text-highlight); font-weight: 700; text-transform: uppercase;">
                3-Step Setup Instructions & Google Apps Script
              </span>
              <button class="btn btn-secondary" id="btn-copy-script" style="padding: 4px 8px; font-size: 10px;">
                COPY SCRIPT CODE
              </button>
            </div>
            <ol style="font-size: 12px; color: var(--text-muted); line-height: 1.6; margin-left: 18px; margin-bottom: 12px;">
              <li>Open your Google Sheet and click <strong>Extensions > Apps Script</strong>.</li>
              <li>Replace the contents of <code style="color: var(--cold-blue);">Code.gs</code> with the snippet below and click <strong>Save</strong>.</li>
              <li>Click <strong>Deploy > New deployment</strong>, select <strong>Web app</strong>, set <em>Who has access</em> to <strong>Anyone</strong>, and click <strong>Deploy</strong>. Copy the Web app URL and paste it into the input above.</li>
            </ol>
            <textarea id="sheets-script-code" readonly rows="7" style="width: 100%; font-family: monospace; font-size: 11px; background: #040608; border: 1px solid var(--border-line); color: var(--cold-blue); padding: 8px; resize: vertical;">${window.admin.getGoogleAppsScriptTemplate()}</textarea>
          </div>
        </div>
      `;
    }

    body.innerHTML = `
      <!-- Tab Navigation -->
      <div class="admin-tab-nav">
        <button class="admin-tab-btn ${this.adminActiveTab === 'leaderboard' ? 'active' : ''}" data-tab="leaderboard">
          📋 LEADERBOARD & TIMERS
        </button>
        <button class="admin-tab-btn ${this.adminActiveTab === 'judging' ? 'active' : ''}" data-tab="judging">
          ⚖️ JUDGES EVALUATION & RAW RESPONSES (${responses.length})
        </button>
        <button class="admin-tab-btn ${this.adminActiveTab === 'sheets' ? 'active' : ''}" data-tab="sheets">
          📊 GOOGLE SHEETS LIVE SYNC
        </button>
      </div>

      ${contentHtml}
    `;

    // Tab switching listeners
    body.querySelectorAll(".admin-tab-btn").forEach(tabBtn => {
      tabBtn.addEventListener("click", () => {
        this.adminActiveTab = tabBtn.dataset.tab;
        this.renderAdminConsoleContent();
      });
    });

    // Attach Tab 1 Leaderboard actions
    if (this.adminActiveTab === 'leaderboard') {
      body.querySelectorAll(".btn-admin-action").forEach(btn => {
        btn.addEventListener("click", () => {
          const action = btn.dataset.action;
          const teamId = btn.dataset.team;

          if (action === 'add-pts') {
            const note = prompt("Enter audit note for +2 points bonus:");
            window.admin.adjustTeamPoints(teamId, 2, note);
          } else if (action === 'sub-pts') {
            const note = prompt("Enter audit note for -2 points deduction:");
            window.admin.adjustTeamPoints(teamId, -2, note);
          } else if (action === 'reset') {
            const targetTeam = window.admin.teams.find(t => t.id === teamId);
            const currentCaseNum = targetTeam ? targetTeam.currentCase : 1;
            if (confirm(`Reset Investigation 0${currentCaseNum} for ${teamId}?`)) {
              window.admin.resetTeamCase(teamId, currentCaseNum);
            }
          } else if (action === 'full-reset') {
            if (confirm(`FULL RESET FOR ${teamId}:\n\nReset all 3 cases back to 0 points, clear saved answers, and unlock Case 1 for ${teamId}?`)) {
              window.admin.resetEntireTeam(teamId);
            }
          } else if (action === 'delete') {
            if (confirm(`PERMANENTLY DELETE ${teamId}?\n\nThis will remove ${teamId} from the competition roster and wipe all recorded submissions. Proceed?`)) {
              window.admin.deleteTeam(teamId);
            }
          } else if (action === 'unlock') {
            window.admin.forceUnlockNext(teamId);
          }
          this.renderAdminConsoleContent();
        });
      });

      const btnAddTeam = document.getElementById("btn-admin-add-team");
      if (btnAddTeam) {
        btnAddTeam.addEventListener("click", () => {
          const teamIdInput = document.getElementById("admin-new-team-id");
          const teamCodeInput = document.getElementById("admin-new-team-code");
          if (teamIdInput && teamIdInput.value.trim()) {
            window.admin.addTeam(teamIdInput.value.trim(), teamCodeInput ? teamCodeInput.value.trim() : "");
            this.renderAdminConsoleContent();
          } else {
            alert("Please enter a valid Team Identifier.");
          }
        });
      }

      const btnMasterReset = document.getElementById("btn-admin-reset-all-master");
      if (btnMasterReset) {
        btnMasterReset.addEventListener("click", () => {
          if (confirm("ORGANISER MASTER RESET:\n\nAre you sure you want to reset ALL teams' scores and cases back to zero?")) {
            window.admin.resetAllTeams();
            this.renderAdminConsoleContent();
          }
        });
      }

      const btnCsv = document.getElementById("btn-admin-export-csv");
      if (btnCsv) btnCsv.addEventListener("click", () => window.admin.exportCSV());

      const btnToggleTimer = document.getElementById("btn-admin-timer-toggle");
      if (btnToggleTimer) {
        btnToggleTimer.addEventListener("click", () => {
          if (this.state.timerRunning) {
            this.pauseTimer();
          } else {
            this.startTimer();
          }
          this.renderAdminConsoleContent();
        });
      }

      const btnAddTime = document.getElementById("btn-admin-add-time");
      if (btnAddTime) {
        btnAddTime.addEventListener("click", () => {
          this.state.timerSeconds += 300;
          this.saveState();
          this.updateTimerDisplay();
          window.admin.logAction("TIMER_OVERRIDE", "+5 minutes manually added to global round timer.");
          this.renderAdminConsoleContent();
        });
      }
    }

    // Attach Tab 2 Judging actions
    else if (this.adminActiveTab === 'judging') {
      const selectTeam = document.getElementById("judge-team-select");
      if (selectTeam) {
        selectTeam.addEventListener("change", (e) => {
          this.adminSelectedJudgeTeam = e.target.value;
          this.renderAdminConsoleContent();
        });
      }

      const btnJudgesCsv = document.getElementById("btn-admin-export-judges-csv");
      if (btnJudgesCsv) {
        btnJudgesCsv.addEventListener("click", () => window.admin.exportJudgesCSV());
      }

      body.querySelectorAll(".btn-judge-adjust").forEach(btn => {
        btn.addEventListener("click", () => {
          const teamId = btn.dataset.team;
          const delta = btn.dataset.delta;

          if (delta === 'custom') {
            const amount = parseInt(prompt(`Enter point adjustment for ${teamId} (+/- integer):`, "0"));
            if (!isNaN(amount) && amount !== 0) {
              const note = prompt("Enter judge note / evaluation reason:");
              window.admin.adjustTeamPoints(teamId, amount, note || "Judge custom adjustment");
            }
          } else {
            const num = parseInt(delta);
            const note = prompt(`Enter reason for ${num >= 0 ? '+' : ''}${num} pts for ${teamId}:`);
            window.admin.adjustTeamPoints(teamId, num, note || "Judge quick adjustment");
          }
          this.renderAdminConsoleContent();
        });
      });
    }

    // Attach Tab 3 Sheets actions
    else if (this.adminActiveTab === 'sheets') {
      const btnSaveWebhook = document.getElementById("btn-save-webhook");
      if (btnSaveWebhook) {
        btnSaveWebhook.addEventListener("click", () => {
          const input = document.getElementById("input-sheets-webhook");
          if (input) {
            window.admin.setWebhookUrl(input.value);
            alert(input.value ? "Google Sheets Webhook URL saved successfully!" : "Webhook URL cleared.");
            this.renderAdminConsoleContent();
          }
        });
      }

      const btnSyncAll = document.getElementById("btn-sync-all-sheets");
      if (btnSyncAll) {
        btnSyncAll.addEventListener("click", () => {
          window.admin.syncAllToGoogleSheets();
        });
      }

      const btnCopyScript = document.getElementById("btn-copy-script");
      if (btnCopyScript) {
        btnCopyScript.addEventListener("click", () => {
          const textarea = document.getElementById("sheets-script-code");
          if (textarea) {
            navigator.clipboard.writeText(textarea.value).then(() => {
              alert("Google Apps Script code copied to clipboard! Paste this into Extensions > Apps Script in your Google Sheet.");
            }).catch(() => {
              textarea.select();
              document.execCommand("copy");
              alert("Code copied to clipboard!");
            });
          }
        });
      }
    }
  }

  /* ---------------- Summary Screen ---------------- */
  renderSummaryScreen() {
    const table = document.getElementById("summary-score-table-body");
    if (table) {
      table.innerHTML = `
        <tr>
          <td>CASE 01 // The Breach Report</td>
          <td style="text-align: right; font-family: var(--font-mono); color: var(--cold-blue); font-weight: 700;">
            ${this.state.caseScores[0]} / 10
          </td>
        </tr>
        <tr>
          <td>CASE 02 // AI or Authentic?</td>
          <td style="text-align: right; font-family: var(--font-mono); color: var(--cold-blue); font-weight: 700;">
            ${this.state.caseScores[1]} / 10
          </td>
        </tr>
        <tr>
          <td>CASE 03 // The Digital Trail</td>
          <td style="text-align: right; font-family: var(--font-mono); color: var(--cold-blue); font-weight: 700;">
            ${this.state.caseScores[2]} / 10
          </td>
        </tr>
        <tr>
          <td>TOTAL EVENT 1 SCORE</td>
          <td style="text-align: right; font-family: var(--font-mono); color: var(--text-highlight); font-size: 20px;">
            ${this.calculateTotalScore()} / 30
          </td>
        </tr>
      `;
    }
  }

  /* ---------------- Forensic Shell & Security Advisory ---------------- */
  showSecurityAdvisory(message) {
    const modal = document.getElementById("modal-security-advisory");
    const textEl = document.getElementById("security-advisory-text");
    if (modal) {
      if (textEl && message) textEl.textContent = message;
      modal.classList.add("active");
    } else {
      alert(message || "SECURITY ADVISORY // FORENSIC INTEGRITY PROTOCOL ACTIVE");
    }
  }

  toggleForensicShell(force) {
    const drawer = document.getElementById("forensic-shell-drawer");
    if (!drawer) return;
    const isOpen = drawer.classList.contains("open");
    const shouldOpen = typeof force === "boolean" ? force : !isOpen;
    if (shouldOpen) {
      drawer.classList.add("open");
      const input = document.getElementById("shell-cmd-input");
      if (input) setTimeout(() => input.focus(), 100);
      this.playSound("click");
    } else {
      drawer.classList.remove("open");
      this.playSound("click");
    }
  }

  handleShellCommand(rawCmd) {
    const output = document.getElementById("shell-output");
    if (!output) return;

    const trimmed = rawCmd.trim();
    if (!trimmed) return;

    // Append user input line
    const userLine = document.createElement("div");
    userLine.className = "shell-line in";
    userLine.textContent = `forensics@nexus-dfir:~$ ${trimmed}`;
    output.appendChild(userLine);

    const parts = trimmed.split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const arg = parts.slice(1).join(" ");

    const appendResp = (text, cls = "") => {
      const respLine = document.createElement("div");
      respLine.className = `shell-line ${cls}`;
      respLine.innerHTML = text;
      output.appendChild(respLine);
    };

    switch(cmd) {
      case "help":
      case "?":
        appendResp("<strong>AUTHORIZED DFIR INVESTIGATION COMMANDS (LEVEL 3):</strong>", "sys");
        appendResp("  <span class='cmd-highlight'>whoami</span>          Display active investigator credentials and terminal clearance");
        appendResp("  <span class='cmd-highlight'>status</span>          Incident response threat level, case progress, and clock state");
        appendResp("  <span class='cmd-highlight'>hash &lt;artifact&gt;</span>   Verify SHA-256 HMAC integrity checksum (e.g. hash EV-01, hash logs)");
        appendResp("  <span class='cmd-highlight'>trace &lt;ip&gt;</span>       Perform packet route inspection on internal/external IP tunnels");
        appendResp("  <span class='cmd-highlight'>cctv</span>            Query Sector 7 optical surveillance &amp; presence sensor status");
        appendResp("  <span class='cmd-highlight'>filter &lt;term&gt;</span>    Search active case records for matching keyword");
        appendResp("  <span class='cmd-highlight'>decrypt &lt;token&gt;</span>  Run timeline cipher analysis on intercepted tokens");
        appendResp("  <span class='cmd-highlight'>defcon</span>          Display current timeline alert status and protocols");
        appendResp("  <span class='cmd-highlight'>clear</span>           Clear terminal buffer");
        this.playSound("type");
        break;

      case "whoami":
        appendResp("<strong>TERMINAL IDENTITY AUDIT:</strong>", "sys");
        appendResp(`  CALLSIGN   : <span style="color: var(--electric-yellow);">${this.state.teamId || "INVESTIGATOR-07"}</span>`);
        appendResp("  CLEARANCE  : LEVEL 3 FORENSIC EXAMINER (RESTRICTED EVALUATION)");
        appendResp("  STATION    : SEC-STATION-4 // NEXUS TERMINAL N-04");
        appendResp("  SESSION IP : 10.244.18.91 (SEC-VLAN-04)");
        appendResp(`  REMAINING  : ${this.formatTime(this.state.timerSeconds)} // WALL-CLOCK HARD LOCK ACTIVE`);
        this.playSound("type");
        break;

      case "status":
      case "defcon":
        appendResp("<strong>DEFCON 2 // ELEVATED TIMELINE ANOMALY</strong>", "warn");
        appendResp(`  ACTIVE CASE  : Investigation 0${this.state.currentCase + 1} of 03 (${this.data.cases[this.state.currentCase]?.shortTitle || ''})`);
        appendResp(`  SCORE AUDIT  : Case 1: ${this.state.caseScores[0]}/10 | Case 2: ${this.state.caseScores[1]}/10 | Case 3: ${this.state.caseScores[2]}/10`);
        appendResp(`  TOTAL SCORE  : <span style="color: var(--text-highlight);">${this.calculateTotalScore()}/30 Points</span>`);
        appendResp("  LOCKOUT POL. : STRICT SINGLE-ATTEMPT PER CASE (JUDGES WEBHOOK LIVE)");
        appendResp(`  SUBMISSIONS  : ${this.state.caseState.filter(c => c.completed).length}/3 Cases Finalized`);
        this.playSound("type");
        break;

      case "hash":
        if (!arg) {
          appendResp("Usage: <span class='cmd-highlight'>hash &lt;evidence-id|artifact&gt;</span> (e.g. hash EV-01, hash EV-02, hash C01-LOGS)", "warn");
        } else {
          const upperArg = arg.toUpperCase();
          appendResp(`CALCULATING SHA-256 CRYPTOGRAPHIC CHECKSUM FOR [${upperArg}]...`, "sys");
          if (upperArg.includes("EV-01") || upperArg.includes("CCTV")) {
            appendResp("  [SHA-256] : <span style='color: var(--cold-blue);'>9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08</span>");
            appendResp("  CUSTODIAN : Shield Cyber Surveillance Unit // Sgt. Barnes");
            appendResp("  ACQUIRED  : 21:42:00 UTC (Camera 04, Sector 7 Terminal Room)");
            appendResp("  STATUS    : <span style='color: var(--terminal-green);'>[AUTHENTIC // ZERO FRAME INTERPOLATION]</span>");
          } else if (upperArg.includes("EV-02") || upperArg.includes("SCREENSHOT")) {
            appendResp("  [SHA-256] : <span style='color: var(--cold-blue);'>4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b</span>");
            appendResp("  CUSTODIAN : Internal Security Daemon (Auto-Dump)");
            appendResp("  STATUS    : <span style='color: var(--neon-red);'>[CRITICAL ANOMALY // SYNTHETIC RASTER &amp; STRIPPED EXIF]</span>", "err");
            appendResp("  NOTE      : Direct conflict with CCTV EV-01 presence sensors.");
          } else if (upperArg.includes("EV-03") || upperArg.includes("MESSAGE")) {
            appendResp("  [SHA-256] : <span style='color: var(--cold-blue);'>b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9</span>");
            appendResp("  CUSTODIAN : Comms Daemon (Internal Relay)");
            appendResp("  STATUS    : <span style='color: var(--terminal-green);'>[AUTHENTIC SYSTEM BROADCAST // NO SIGNATURE CORRUPTION]</span>");
          } else {
            let hVal = 0;
            for (let i = 0; i < upperArg.length; i++) hVal = (hVal * 31 + upperArg.charCodeAt(i)) & 0xffffffff;
            const pseudoHex = Math.abs(hVal).toString(16).padStart(8, '0') + "8f12c9b4e6d308a1b2c3d4e5f67890ab";
            appendResp(`  [SHA-256] : <span style='color: var(--cold-blue);'>${pseudoHex}</span>`);
            appendResp("  STATUS    : <span style='color: var(--terminal-green);'>[CHAIN OF CUSTODY VERIFIED // TAMPER-SEALED]</span>");
          }
        }
        this.playSound("type");
        break;

      case "trace":
        if (!arg) {
          appendResp("Usage: <span class='cmd-highlight'>trace &lt;ip-address&gt;</span> (e.g. trace 10.240.12.8 or trace 192.168.1.105)", "warn");
        } else {
          appendResp(`TRACING ROUTE TO TARGET [${arg}]...`, "sys");
          appendResp("  HOP 1: 10.244.18.1 (Gateway-Core-Alpha) [0.3ms]");
          appendResp("  HOP 2: 172.16.8.50 (VLAN-Isolation-Firewall) [0.8ms]");
          appendResp("  HOP 3: 192.168.1.1 (Subnet Edge Router) [1.9ms]");
          appendResp(`  TARGET RESOLUTION: [${arg}]`);
          if (arg.includes("105") || arg.includes("R-07") || arg.includes("10.240.12.8")) {
            appendResp("  DEVICE PROFILE : <span style='color: var(--neon-red); font-weight: 700;'>Remote Admin Device R-07</span>", "err");
            appendResp("  PHYSICAL LOC   : Outside Sector 7 Perimeter (Remote Subnet Bridge)");
            appendResp("  ANOMALY        : Bypassed biometric turnstile during Terminal N-04 active session.");
          } else {
            appendResp("  DEVICE PROFILE : Nexus Authorized Internal Host (VLAN 4)");
            appendResp("  STATUS         : Regular telemetry endpoint.");
          }
        }
        this.playSound("type");
        break;

      case "cctv":
        appendResp("<strong>SECTOR 7 CAMERA &amp; BIOMETRIC SURVEILLANCE TELEMETRY:</strong>", "sys");
        appendResp("  CAM-01 (Sector 7 Main Gate)     : [ONLINE] Normal traffic logged until 21:30 UTC");
        appendResp("  CAM-04 (Terminal N-04 Enclosure): [ONLINE] Timestamp: 21:42:00 UTC -> <span style='color: var(--cold-blue);'>ZERO HUMAN OCCUPANCY</span>");
        appendResp("  BIOMETRIC SEAT SENSOR N-04      : [STATUS: 0.0 KG PRESSURE] Room was physically vacant");
        appendResp("  FORENSIC CONCLUSION            : Physical presence claims in Screenshot EV-02 are fabricated.", "warn");
        this.playSound("type");
        break;

      case "filter":
        if (!arg) {
          appendResp("Usage: <span class='cmd-highlight'>filter &lt;keyword&gt;</span> (e.g. filter R-07, filter alter, filter Doom)", "warn");
        } else {
          appendResp(`SCANNING ACTIVE EVIDENCE REPOSITORY FOR KEYWORD: "<span style='color: var(--electric-yellow);'>${arg}</span>"...`);
          if (this.state.currentCase === 0) {
            const matches = this.data.cases[0].evidence.filter(e =>
              e.device.toLowerCase().includes(arg.toLowerCase()) ||
              e.event.toLowerCase().includes(arg.toLowerCase()) ||
              e.user.toLowerCase().includes(arg.toLowerCase()) ||
              e.details.toLowerCase().includes(arg.toLowerCase())
            );
            appendResp(`FOUND <span style='color: var(--terminal-green);'>${matches.length}</span> MATCHING EVIDENCE RECORD(S):`);
            matches.forEach(m => {
              appendResp(`  [${m.time}] ${m.id}: ${m.event} (${m.device}) - ${m.status}`);
            });
          } else {
            appendResp("Evidence filter executed. Consult the active investigation panel for visual cross-referencing.");
          }
        }
        this.playSound("type");
        break;

      case "decrypt":
        appendResp("INITIALIZING AES-256 FORENSIC DECRYPTION ENGINE...", "sys");
        appendResp(`  TARGET TOKEN : ${arg || "NEXUS-INTERCEPT-TOKEN"}`);
        appendResp("  HMAC SHA-256 : INTEGRITY VERIFIED");
        appendResp("  PLAINTEXT    : <span style='color: var(--terminal-green);'>\"REMOTE DEVICE R-07 INJECTED FILE WRITE INTO SESSION N-04. SPOOFED USER: DOCTOR DOOM.\"</span>");
        this.playSound("type");
        break;

      case "clear":
      case "cls":
        output.innerHTML = `
          <div class="shell-line sys">INFINITY NEXUS DFIR FORENSIC ENGINE [v4.2.108 - KERNEL-SEC-MONITOR]</div>
          <div class="shell-line sys">Buffer cleared. Ready for DFIR commands. Type <span class="cmd-highlight">help</span> for command directory.</div>
        `;
        this.playSound("click");
        return;

      default:
        appendResp(`Command not recognized: "<span style='color: var(--neon-red);'>${trimmed}</span>". Type <span class='cmd-highlight'>help</span> for valid commands.`, "err");
        this.playSound("alert");
        break;
    }

    output.scrollTop = output.scrollHeight;
  }
}

// Bootstrap on DOM Ready
window.addEventListener("DOMContentLoaded", () => {
  window.app = new SimulationApp();
});
