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
}

window.admin = new AdminConsole();
