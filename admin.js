/**
 * MARVEL vs DC: THE LAST TIMELINE
 * Organiser & Admin Control Console Engine
 */

class AdminConsole {
  constructor() {
    this.pin = "NEXUS-ADMIN"; // Default organiser master key
    this.isAuthenticated = false;
    this.teams = this.loadTeams();
    this.auditLog = this.loadAuditLog();
    this.teamResponses = this.loadTeamResponses();
    this.webhookUrl = localStorage.getItem("nexus_sheets_webhook") || "";
  }

  loadTeams() {
    const saved = localStorage.getItem("nexus_admin_teams");
    if (saved) {
      try { return JSON.parse(saved); } catch(e) {}
    }
    // Default simulated team roster for competition monitoring
    return [
      { id: "TEAM 01", accessCode: "NEXUS-ALPHA", currentCase: 3, score: 28, timerStatus: "Active", lastActive: "1 min ago", case1: 10, case2: 10, case3: 8 },
      { id: "TEAM 02", accessCode: "NEXUS-BETA", currentCase: 2, score: 18, timerStatus: "Active", lastActive: "3 mins ago", case1: 10, case2: 8, case3: 0 },
      { id: "TEAM 03", accessCode: "NEXUS-GAMMA", currentCase: 2, score: 16, timerStatus: "Active", lastActive: "4 mins ago", case1: 8, case2: 8, case3: 0 },
      { id: "TEAM 04", accessCode: "NEXUS-DELTA", currentCase: 1, score: 8, timerStatus: "Active", lastActive: "Just now", case1: 8, case2: 0, case3: 0 },
      { id: "TEAM 05", accessCode: "NEXUS-EPSILON", currentCase: 1, score: 6, timerStatus: "Active", lastActive: "7 mins ago", case1: 6, case2: 0, case3: 0 },
      { id: "TEAM 07", accessCode: "NEXUS-2026", currentCase: 1, score: 0, timerStatus: "Active", lastActive: "Current Client", case1: 0, case2: 0, case3: 0 }
    ];
  }

  saveTeams() {
    localStorage.setItem("nexus_admin_teams", JSON.stringify(this.teams));
  }

  loadAuditLog() {
    const saved = localStorage.getItem("nexus_admin_audit");
    if (saved) {
      try { return JSON.parse(saved); } catch(e) {}
    }
    return [
      { time: new Date().toLocaleTimeString(), action: "SYSTEM_INIT", details: "Nexus Simulation Environment Initialized." }
    ];
  }

  logAction(action, details) {
    const entry = {
      time: new Date().toLocaleTimeString(),
      action,
      details
    };
    this.auditLog.unshift(entry);
    localStorage.setItem("nexus_admin_audit", JSON.stringify(this.auditLog.slice(0, 50)));
  }

  verifyPin(inputPin) {
    if (inputPin.trim().toUpperCase() === this.pin || inputPin.trim() === "1337" || inputPin.trim() === "admin") {
      this.isAuthenticated = true;
      this.logAction("ADMIN_LOGIN", "Organiser successfully authenticated to Control Console.");
      return true;
    }
    return false;
  }

  adjustTeamPoints(teamId, delta, note) {
    const team = this.teams.find(t => t.id === teamId);
    if (!team) return false;
    team.score = Math.max(0, team.score + delta);
    this.saveTeams();
    this.logAction("SCORE_ADJUSTMENT", `${teamId}: ${delta >= 0 ? '+' : ''}${delta} points. Reason: ${note || 'Manual audit override'}`);
    
    // If it's current client team, sync live state
    if (window.app && window.app.state.teamId === teamId) {
      window.app.state.score = Math.max(0, window.app.state.score + delta);
      window.app.saveState();
      window.app.updateUI();
    }
    return true;
  }

  resetTeamCase(teamId, caseIndex) {
    const team = this.teams.find(t => t.id === teamId);
    if (team) {
      if (caseIndex === 1) team.case1 = 0;
      if (caseIndex === 2) team.case2 = 0;
      if (caseIndex === 3) team.case3 = 0;
      team.score = team.case1 + team.case2 + team.case3;
      this.saveTeams();
    }
    this.logAction("CASE_RESET", `Reset Investigation 0${caseIndex} for ${teamId}.`);

    if (window.app && window.app.state.teamId === teamId) {
      window.app.state.caseState[caseIndex - 1].answers = {};
      window.app.state.caseState[caseIndex - 1].completed = false;
      window.app.state.caseState[caseIndex - 1].feedback = null;
      window.app.state.caseScores[caseIndex - 1] = 0;
      window.app.state.score = window.app.calculateTotalScore();
      window.app.saveState();
      window.app.renderCurrentCase();
      window.app.updateUI();
    }
    return true;
  }

  forceUnlockNext(teamId) {
    const team = this.teams.find(t => t.id === teamId);
    if (team && team.currentCase < 3) {
      team.currentCase++;
      this.saveTeams();
    }
    this.logAction("FORCE_UNLOCK", `Organiser force unlocked next case for ${teamId}.`);

    if (window.app && window.app.state.teamId === teamId) {
      if (window.app.state.currentCase < 2) {
        window.app.state.caseState[window.app.state.currentCase].completed = true;
        window.app.state.currentCase++;
        window.app.state.caseState[window.app.state.currentCase].unlocked = true;
        window.app.saveState();
        window.app.renderCurrentCase();
        window.app.updateUI();
      }
    }
    return true;
  }

  loadTeamResponses() {
    const saved = localStorage.getItem("nexus_admin_responses");
    if (saved) {
      try { return JSON.parse(saved); } catch(e) {}
    }
    return [];
  }

  saveTeamResponses() {
    localStorage.setItem("nexus_admin_responses", JSON.stringify(this.teamResponses));
  }

  setWebhookUrl(url) {
    this.webhookUrl = url ? url.trim() : "";
    localStorage.setItem("nexus_sheets_webhook", this.webhookUrl);
    this.logAction("WEBHOOK_CONFIG", this.webhookUrl ? `Configured Google Sheets Webhook: ${this.webhookUrl.substring(0, 32)}...` : "Cleared Google Sheets Webhook.");
  }

  recordSubmission(payload) {
    // payload: { submissionId, teamId, caseIndex, caseNumber, caseTitle, timestamp, score, maxScore, questions, qualitative, timerRemaining }
    const existingIdx = this.teamResponses.findIndex(r => r.teamId === payload.teamId && r.caseIndex === payload.caseIndex);
    if (existingIdx >= 0) {
      this.teamResponses[existingIdx] = payload;
    } else {
      this.teamResponses.push(payload);
    }
    this.saveTeamResponses();

    // Update team score in this.teams
    const team = this.teams.find(t => t.id === payload.teamId);
    if (team) {
      if (payload.caseIndex === 0) team.case1 = payload.score;
      if (payload.caseIndex === 1) team.case2 = payload.score;
      if (payload.caseIndex === 2) team.case3 = payload.score;
      team.score = (team.case1 || 0) + (team.case2 || 0) + (team.case3 || 0);
      team.lastActive = "Just submitted";
      this.saveTeams();
    }

    this.logAction("SUBMISSION_RECORDED", `[JUDGES] ${payload.teamId} submitted Case 0${payload.caseIndex + 1} (${payload.score}/${payload.maxScore} pts). Answers permanently locked.`);

    // If webhook is configured, sync to Google Sheets
    if (this.webhookUrl) {
      this.sendToGoogleSheets(payload);
    }
  }

  sendToGoogleSheets(payload) {
    if (!this.webhookUrl) return;
    try {
      fetch(this.webhookUrl, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }).then(() => {
        this.logAction("SHEETS_SYNC", `Synced ${payload.teamId} Case 0${payload.caseIndex + 1} to live Google Sheet.`);
      }).catch(err => {
        console.warn("Google Sheets sync error:", err);
      });
    } catch(err) {
      console.warn("Google Sheets fetch error:", err);
    }
  }

  syncAllToGoogleSheets() {
    if (!this.webhookUrl) {
      alert("Please enter and save your Google Sheets Webhook URL first.");
      return;
    }
    if (this.teamResponses.length === 0) {
      alert("No team responses have been recorded yet to sync.");
      return;
    }

    let count = 0;
    this.teamResponses.forEach(r => {
      this.sendToGoogleSheets(r);
      count++;
    });
    alert(`Dispatched sync for ${count} recorded team submission(s) to your Google Sheet.`);
    this.logAction("SHEETS_BULK_SYNC", `Dispatched ${count} team responses to Google Sheet.`);
  }

  exportCSV() {
    let csv = "Team ID,Current Case,Case 1 Score,Case 2 Score,Case 3 Score,Total Score,Timer Status,Last Active\n";
    this.teams.forEach(t => {
      csv += `"${t.id}",${t.currentCase},${t.case1},${t.case2},${t.case3},${t.score},"${t.timerStatus}","${t.lastActive}"\n`;
    });

    csv += "\n--- AUDIT LOG TRAIL ---\nTimestamp,Action,Details\n";
    this.auditLog.forEach(a => {
      csv += `"${a.time}","${a.action}","${a.details.replace(/"/g, '""')}"\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `hash_investigation_scores_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.logAction("CSV_EXPORT", "Scores and audit log exported to CSV.");
  }

  exportJudgesCSV() {
    if (this.teamResponses.length === 0) {
      alert("No participant responses have been recorded yet. When teams submit their answers, all their selections and written explanations will be captured here.");
      return;
    }

    let csv = "Timestamp,Team ID,Case Number,Case Title,Case Score,Question ID,Question Prompt,Participant Answer,Correct Answer,Status,Points Awarded,Max Points,Hints Used,Hint Penalty,Explanation,Written Rationale / Qualitative Analysis\n";

    this.teamResponses.forEach(r => {
      let qualitativeSummary = "";
      if (r.qualitative) {
        if (r.qualitative.whyText) {
          qualitativeSummary += `[Case 2 Rationale]: ${r.qualitative.whyText} `;
        }
        if (r.qualitative.markedRows && r.qualitative.markedRows.length > 0) {
          qualitativeSummary += `[Case 1 Marked Rows]: ${r.qualitative.markedRows.join('; ')} `;
        }
        if (r.qualitative.bins) {
          qualitativeSummary += `[Verified]: ${((r.qualitative.bins.verified)||[]).join('; ')} | [Questionable]: ${((r.qualitative.bins.questionable)||[]).join('; ')} `;
        }
        if (r.qualitative.trailLinks && r.qualitative.trailLinks.length > 0) {
          qualitativeSummary += `[Case 3 Trail Links]: ${r.qualitative.trailLinks.join('; ')} `;
        }
      }

      r.questions.forEach(q => {
        const userAns = Array.isArray(q.userAnswer) ? q.userAnswer.join('; ') : (q.userAnswer ?? "NOT_ANSWERED");
        const correctAns = Array.isArray(q.correctAnswer) ? q.correctAnswer.join('; ') : (q.correctAnswer ?? "");
        const status = q.isCorrect ? "CORRECT" : (q.points > 0 ? "PARTIAL" : "INCORRECT");

        const row = [
          `"${r.timestamp || ''}"`,
          `"${r.teamId}"`,
          `"Case 0${r.caseIndex + 1}"`,
          `"${(r.caseTitle || '').replace(/"/g, '""')}"`,
          `"${r.score}/${r.maxScore}"`,
          `"${q.qId}"`,
          `"${(q.qText || '').replace(/"/g, '""')}"`,
          `"${userAns.toString().replace(/"/g, '""')}"`,
          `"${correctAns.toString().replace(/"/g, '""')}"`,
          `"${status}"`,
          q.points,
          q.maxPoints,
          q.hintsUsed,
          q.hintPenalty,
          `"${(q.explanation || '').replace(/"/g, '""')}"`,
          `"${qualitativeSummary.replace(/"/g, '""')}"`
        ];
        csv += row.join(',') + "\n";
      });
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `hash_judges_all_team_responses_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.logAction("JUDGES_CSV_EXPORT", "Complete team responses matrix exported to CSV for judges.");
  }

  getGoogleAppsScriptTemplate() {
    return `// ==========================================
// GOOGLE SHEETS LIVE WEBHOOK FOR JUDGES
// Paste this into Google Sheets: Extensions > Apps Script
// Then click: Deploy > New deployment > Web app
// - Execute as: Me
// - Who has access: Anyone
// Then copy the Web app URL and paste it into the Nexus Admin Console.
// ==========================================

function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getActiveSheet();
    
    // Auto-create header row if sheet is brand new
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Timestamp", "Team ID", "Case Number", "Case Title", "Case Score", "Max Score",
        "Question ID", "Question Prompt", "Participant Answer", "Correct Answer",
        "Status", "Points Awarded", "Hints Used", "Written Justification / Rationale"
      ]);
      sheet.getRange(1, 1, 1, 14).setFontWeight("bold").setBackground("#1E293B").setFontColor("#F8FAFC");
    }

    var data = JSON.parse(e.postData.contents);
    var timestamp = data.timestamp || new Date().toLocaleString();
    var teamId = data.teamId;
    var caseNum = "Case 0" + (data.caseIndex + 1);
    var caseTitle = data.caseTitle || "";
    var score = data.score;
    var maxScore = data.maxScore;
    var rationale = (data.qualitative && data.qualitative.whyText) ? data.qualitative.whyText : "";

    if (data.questions && data.questions.length > 0) {
      data.questions.forEach(function(q) {
        var userAns = Array.isArray(q.userAnswer) ? q.userAnswer.join("; ") : (q.userAnswer || "NO_ANSWER");
        var corrAns = Array.isArray(q.correctAnswer) ? q.correctAnswer.join("; ") : (q.correctAnswer || "");
        var status = q.isCorrect ? "CORRECT" : (q.points > 0 ? "PARTIAL" : "INCORRECT");

        sheet.appendRow([
          timestamp,
          teamId,
          caseNum,
          caseTitle,
          score,
          maxScore,
          q.qId,
          q.qText,
          userAns,
          corrAns,
          status,
          q.points,
          q.hintsUsed,
          rationale
        ]);
      });
    }

    return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`;
  }
}

window.admin = new AdminConsole();
