/**
 * MARVEL vs DC: THE LAST TIMELINE
 * Event 1: Round 1 Cyber Investigation Simulation
 * Cases Data Model, Evidence Sets, Questions, Hints, and Answer Keys
 */

window.INVESTIGATION_DATA = {
  // Global Case Definitions
  cases: [
    {
      id: "case-01",
      number: "01",
      title: "CASE 01 // THE BREACH REPORT",
      shortTitle: "The Breach Report",
      skill: "Timeline Reconstruction & Forensic Observation",
      points: 10,
      intendedTime: "12–15 Minutes",
      framing: "A suspicious access event occurred inside the Infinity Nexus system. You are not expected to hack anything. Your job is to read the security records, reconstruct what happened, and identify the record that does not fit.",
      objective: "Reconstruct the chronological breach sequence and isolate the anomalous record and device.",
      categories: ["ALL RECORDS", "ACCESS LOGS", "DEVICE RECORDS", "SYSTEM ALERTS", "LOCATION DATA"],
      evidence: [
        {
          id: "REC-101",
          time: "00:17:43",
          rawTime: 1063,
          category: "ACCESS LOGS",
          event: "Login attempt",
          device: "Nexus Terminal N-04",
          location: "Control Room",
          status: "Accepted",
          badgeClass: "badge-accepted",
          authLevel: "Clearance Level 4 (Lead Scientist)",
          user: "VICTOR-07 (Dr. V. Von D.)",
          ip: "10.144.12.4",
          mac: "00:50:56:A1:04:88",
          details: "Standard cryptographic handshake accepted via physical terminal card slot. Dual-token biometric clearance approved.",
          anomalous: false
        },
        {
          id: "REC-102",
          time: "00:18:02",
          rawTime: 1082,
          category: "SYSTEM ALERTS",
          event: "Security alert",
          device: "Nexus Terminal N-04",
          location: "Control Room",
          status: "Warning",
          badgeClass: "badge-warning",
          authLevel: "Automated Daemon",
          user: "SYSTEM-DAEMON",
          ip: "10.144.12.4",
          mac: "00:50:56:A1:04:88",
          details: "Non-critical telemetry drift: ambient room temperature lowered by 4.2°C. Internal security gateway flagged transient latency fluctuation.",
          anomalous: false
        },
        {
          id: "REC-103",
          time: "00:18:16",
          rawTime: 1096,
          category: "ACCESS LOGS",
          event: "Access granted",
          device: "Nexus Terminal N-04",
          location: "Control Room",
          status: "Verified",
          badgeClass: "badge-verified",
          authLevel: "Clearance Level 4",
          user: "VICTOR-07",
          ip: "10.144.12.4",
          mac: "00:50:56:A1:04:88",
          details: "Master database session initiated. Read-only permissions on Timeline Fragment telemetry unlocked.",
          anomalous: false
        },
        {
          id: "REC-104",
          time: "00:19:12",
          rawTime: 1152,
          category: "DEVICE RECORDS",
          event: "File alteration",
          device: "Remote Admin Device R-07",
          location: "Control Room",
          status: "Verified",
          badgeClass: "badge-danger",
          authLevel: "System Override",
          user: "VICTOR-07 (Relayed)",
          ip: "192.168.99.12 (External Tunnel)",
          mac: "E4:8D:8C:3F:07:9B",
          details: "CRITICAL CONTRADICTION: Incident_Record_07 modified while the active physical session on N-04 was in idle state. Device R-07 is labeled 'Control Room' in the log metadata, but R-07 is designated an external wireless remote bridge.",
          anomalous: true
        },
        {
          id: "REC-105",
          time: "00:19:30",
          rawTime: 1170,
          category: "SYSTEM ALERTS",
          event: "Camera interruption",
          device: "CCTV-04",
          location: "Control Room",
          status: "Warning",
          badgeClass: "badge-warning",
          authLevel: "Subsystem Monitor",
          user: "FACILITY-IO",
          ip: "10.144.18.22",
          mac: "70:85:C2:5E:04:11",
          details: "Video feed packet transmission dropped for 18 seconds. Automated log notes: 'Scheduled diagnostic ping timeout'. Occurred 18 seconds after file alteration.",
          anomalous: false
        },
        {
          id: "REC-106",
          time: "00:21:06",
          rawTime: 1266,
          category: "ACCESS LOGS",
          event: "Account logout",
          device: "Nexus Terminal N-04",
          location: "Control Room",
          status: "Completed",
          badgeClass: "badge-muted",
          authLevel: "Clearance Level 4",
          user: "VICTOR-07",
          ip: "10.144.12.4",
          mac: "00:50:56:A1:04:88",
          details: "Physical card ejection recorded at Terminal N-04. User session ended with standard termination handshake.",
          anomalous: false
        },
        {
          id: "REC-107",
          time: "00:21:20",
          rawTime: 1280,
          category: "DEVICE RECORDS",
          event: "Device disconnect",
          device: "Remote Admin Device R-07",
          location: "Control Room",
          status: "Completed",
          badgeClass: "badge-muted",
          authLevel: "External Bridge",
          user: "UNKNOWN (Encrypted)",
          ip: "192.168.99.12 (External Tunnel)",
          mac: "E4:8D:8C:3F:07:9B",
          details: "Remote session terminated 14 seconds after terminal logout. External tunnel port 4438 closed.",
          anomalous: false
        }
      ],
      questions: [
        {
          id: "c1_q1",
          text: "1. Which timestamp should be investigated first because it breaks the expected sequence of the breach?",
          type: "select",
          points: 2,
          options: [
            "00:17:43 (Login attempt)",
            "00:18:16 (Access granted)",
            "00:19:12 (File alteration)",
            "00:21:06 (Account logout)"
          ],
          correct: "00:19:12 (File alteration)",
          hints: [
            "Category Hint: Review the DEVICE RECORDS tab specifically for non-standard activity during the session.",
            "Narrowing Hint: Look for the record where a completely new device suddenly performs a file write operation.",
            "Direct Clue: The anomalous event occurred midway through the session at 00:19:12."
          ],
          explanation: "Timestamp 00:19:12 records an unexpected 'File alteration' from Remote Admin Device R-07, completely interrupting the normal sequence of the Terminal N-04 login session."
        },
        {
          id: "c1_q2",
          text: "2. Which device appears in the suspicious alteration record?",
          type: "select",
          points: 2,
          options: [
            "Nexus Terminal N-04",
            "Remote Admin Device R-07",
            "CCTV-04",
            "Gateway Router G-01"
          ],
          correct: "Remote Admin Device R-07",
          hints: [
            "Category Hint: Inspect the Device column of the suspicious timestamp identified in Question 1.",
            "Narrowing Hint: It is an external/remote apparatus, not the primary Control Room terminal.",
            "Direct Clue: The record lists device code 'R-07'."
          ],
          explanation: "Remote Admin Device R-07 was used to execute the modification, bypassing the physical terminal N-04 console."
        },
        {
          id: "c1_q3",
          text: "3. What is the strongest reason this record is suspicious?",
          type: "radio",
          points: 2,
          options: [
            "The timestamp uses 24-hour military notation instead of civilian time",
            "The record conflicts with the preceding access/device sequence and injects an external device into a local session",
            "The CCTV camera had completely run out of system storage memory",
            "The user typed their password with an incorrect capitalization pattern"
          ],
          correct: "The record conflicts with the preceding access/device sequence and injects an external device into a local session",
          hints: [
            "Category Hint: Compare the device type and IP tunnel of this event against the initial login event.",
            "Narrowing Hint: Why would a physical terminal login suddenly execute a write command via a remote IP tunnel?",
            "Direct Clue: An external device injected a file change into what was supposed to be a localized session."
          ],
          explanation: "The alteration record contradicts the active terminal's local scope by introducing a remote device tunnel pretending to share the Control Room location."
        },
        {
          id: "c1_q4",
          text: "4. Based on the complete sequence, was the breach initiated from the logged-in terminal or from the remote device?",
          type: "radio",
          points: 2,
          options: [
            "Logged-in terminal (Nexus Terminal N-04)",
            "Remote device (Remote Admin Device R-07)"
          ],
          correct: "Remote device (Remote Admin Device R-07)",
          hints: [
            "Category Hint: Look at which machine actually initiated and performed the unauthorized data modification.",
            "Narrowing Hint: Terminal N-04 provided the valid account session, but the attack payload originated elsewhere.",
            "Direct Clue: The unauthorized file modification came through device R-07."
          ],
          explanation: "While Terminal N-04 held the legitimate open user session, the breach action itself was triggered and injected from the remote device R-07."
        },
        {
          id: "c1_q5",
          text: "5. Submit the reconstructed breach conclusion in one sentence.",
          type: "text",
          placeholder: "e.g. The legitimate terminal access was hijacked/exploited by a remote admin device to alter the incident record.",
          points: 2,
          keywords: ["remote", "alter", "device", "terminal", "session", "hijack", "exploit", "unauthorized", "r-07", "n-04", "account"],
          hints: [
            "Category Hint: Synthesize the relationship between Terminal N-04's login and Device R-07's alteration.",
            "Narrowing Hint: Your sentence must mention that the logged-in session was exploited or bridged by the remote device.",
            "Direct Clue: State clearly: 'The legitimate account session on Terminal N-04 was used to execute an unauthorized remote file alteration via Device R-07.'"
          ],
          explanation: "Accepted conclusion: An active authorized terminal session was exploited or bridged to execute an unauthorized file alteration via the remote device."
        }
      ]
    },

    {
      id: "case-02",
      number: "02",
      title: "CASE 02 // AI OR AUTHENTIC?",
      shortTitle: "AI or Authentic?",
      skill: "Evidence Verification & Forensic Comparison",
      points: 10,
      intendedTime: "12–15 Minutes",
      framing: "The breach report contains digital evidence. Some evidence is authentic. Some has been altered or generated. Your task is not to detect AI by intuition. Compare the evidence and identify objective contradictions.",
      objective: "Inspect the four digital evidence packets, uncover timestamp and location contradictions, and categorize authentic vs manipulated items.",
      evidence: [
        {
          id: "EV-01",
          title: "CCTV FRAME // CAM-04",
          category: "SURVEILLANCE FEED",
          timestamp: "00:19:12",
          source: "CCTV-04 Control Room High-Angle",
          fileHash: "SHA256: 8f92a174c8b03e29f...",
          resolution: "1920x1080 @ 60fps",
          location: "Sector 7 Control Room",
          description: "Surveillance capture at 00:19:12. Shows the Control Room Terminal N-04 workstation completely EMPTY. Terminal monitor displays active prompt, but zero personnel are physically seated or standing nearby.",
          metadata: {
            "Camera Sensor": "Sony IMX-485 High Sensitivity",
            "Frame Integrity": "Watermark Verified (Nexus Security Protocol)",
            "Room Occupancy": "0 Detected",
            "Lighting Lux": "140 Lux (Standard Operational)"
          },
          svgType: "cctv"
        },
        {
          id: "EV-02",
          title: "SECURITY SCREENSHOT // TERMINAL N-04",
          category: "CONSOLE SCREENSHOT",
          timestamp: "00:19:12",
          source: "Terminal N-04 Display Buffer Dump",
          fileHash: "SHA256: e3b0c44298fc1c149...",
          resolution: "1920x1080 Digital Dump",
          location: "Control Room Terminal N-04",
          description: "Screen grab recorded at 00:19:12 displaying a modal dialog: 'Manual Authorization Confirmed — Physical Biometric Scanner Verified In-Person Operator Presence'.",
          metadata: {
            "Render Engine": "Nexus OS Framebuffer v4.2",
            "Status Text": "In-Person Operator Present",
            "Auth Token": "LOCAL-BIO-9941",
            "Contradiction Note": "Claims operator was present in-person at 00:19:12, but CCTV-04 and Biometrics prove room was empty at this exact second."
          },
          svgType: "screen"
        },
        {
          id: "EV-03",
          title: "INCIDENT MESSAGE // COMMS DAEMON",
          category: "SYSTEM BROADCAST",
          timestamp: "00:19:30",
          source: "Automated Facility Communications Daemon",
          fileHash: "SHA256: 7d1b3398b1e4f0142...",
          resolution: "Text Payload Log",
          location: "Subsystem Channel 09",
          description: "System notice logged 18 seconds after the breach: 'CCTV-04 video stream suspended due to routine scheduled maintenance protocol.' However, routine maintenance was logged on the calendar for 04:00:00, not 00:19:30.",
          metadata: {
            "Originating Process": "cron_facility_comms.sh",
            "Priority": "P3-Informational",
            "Calendar Check": "Scheduled maintenance mismatch",
            "Anomaly": "Fabricated maintenance pretext masking blackout"
          },
          svgType: "alert"
        },
        {
          id: "EV-04",
          title: "LOCATION REPORT // SENSOR GRID",
          category: "BIOMETRIC TELEMETRY",
          timestamp: "00:19:12",
          source: "Nexus Overhead Biometric & Pressure Sensor Grid",
          fileHash: "SHA256: 4a210b42901ce8821...",
          resolution: "Multi-Sensor Matrix",
          location: "Control Room Floor Zone 7A",
          description: "Overhead floor pressure and infrared thermal report for Control Room Zone 7A at 00:19:12. Thermal signature: 21.0°C (Ambient). Floor pressure plates: 0.00 kg. Zero human biomass detected.",
          metadata: {
            "Floor Sensors": "16/16 Active — 0.0 kg load",
            "Thermal Sensor": "No human heat signature (Threshold >35°C not met)",
            "Status": "ZONE CLEAR / UNOCCUPIED",
            "Integrity Hash": "Hardware tamper-proof secure enclave valid"
          },
          svgType: "telemetry"
        }
      ],
      questions: [
        {
          id: "c2_q1",
          text: "1. Which evidence item contains a timestamp or sequence contradiction?",
          type: "select",
          points: 2,
          options: [
            "EV-01 (CCTV Frame // Cam-04)",
            "EV-02 (Security Screenshot // Terminal N-04)",
            "EV-03 (Incident Message // Comms Daemon)",
            "EV-04 (Location Report // Sensor Grid)"
          ],
          correct: "EV-03 (Incident Message // Comms Daemon)",
          hints: [
            "Category Hint: Inspect the explanation and timing of the system broadcast message.",
            "Narrowing Hint: Look at which item cites a 'routine maintenance schedule' that contradicts facility operating hours.",
            "Direct Clue: The Comms Daemon message EV-03 claims a scheduled maintenance occurred at 00:19:30 instead of 04:00."
          ],
          explanation: "EV-03 claims a 'routine scheduled maintenance' occurred at 00:19:30, whereas standard facility logs show scheduled maintenance only takes place at 04:00:00."
        },
        {
          id: "c2_q2",
          text: "2. Which evidence item directly conflicts with the physical location reality?",
          type: "select",
          points: 2,
          options: [
            "EV-01 (CCTV Frame // Cam-04)",
            "EV-02 (Security Screenshot // Terminal N-04)",
            "EV-03 (Incident Message // Comms Daemon)",
            "EV-04 (Location Report // Sensor Grid)"
          ],
          correct: "EV-02 (Security Screenshot // Terminal N-04)",
          hints: [
            "Category Hint: Compare the screenshot's on-screen claim against what the cameras and floor sensors recorded.",
            "Narrowing Hint: The screenshot asserts someone was physically present right at the console.",
            "Direct Clue: EV-02 displays 'In-Person Operator Presence' when physical sensors proved the room was empty."
          ],
          explanation: "EV-02 claims an operator was physically present at Terminal N-04 verifying biometric access at 00:19:12, while both CCTV (EV-01) and Sensor Grid (EV-04) show zero occupants."
        },
        {
          id: "c2_q3",
          text: "3. Which two evidence items cannot both be authentic?",
          type: "multiselect",
          maxSelect: 2,
          points: 2,
          options: [
            "EV-01 (CCTV Frame showing empty room)",
            "EV-02 (Screenshot asserting in-person physical presence)",
            "EV-03 (Comms notice regarding camera)",
            "EV-04 (Biometric telemetry showing 0.0 kg weight)"
          ],
          correct: [
            "EV-01 (CCTV Frame showing empty room)",
            "EV-02 (Screenshot asserting in-person physical presence)"
          ],
          hints: [
            "Category Hint: Find the two items describing the exact same room at 00:19:12 with opposite physical conditions.",
            "Narrowing Hint: One shows an empty chair while the other claims an authorized human was actively standing there.",
            "Direct Clue: EV-01 and EV-02 represent an irreconcilable contradiction."
          ],
          explanation: "EV-01 (camera confirming empty room) and EV-02 (screenshot asserting local in-person presence) directly contradict each other at 00:19:12."
        },
        {
          id: "c2_q4",
          text: "4. Which evidence item(s) should be classified as QUESTIONABLE / UNRELIABLE?",
          type: "multiselect",
          points: 2,
          options: [
            "EV-01 (CCTV Frame)",
            "EV-02 (Security Screenshot)",
            "EV-03 (Incident Message)",
            "EV-04 (Location Report)"
          ],
          correct: [
            "EV-02 (Security Screenshot)",
            "EV-03 (Incident Message)"
          ],
          hints: [
            "Category Hint: Check which items were fabricated to support the false narrative of legitimate in-person access.",
            "Narrowing Hint: The screenshot fabricated in-person presence, and the message fabricated a maintenance excuse.",
            "Direct Clue: EV-02 and EV-03 are the manipulated records."
          ],
          explanation: "EV-02 was fabricated to simulate physical presence, and EV-03 was forged to mask the CCTV blackout."
        },
        {
          id: "c2_q5",
          text: "5. What is the strongest objective indicator that the evidence was manipulated?",
          type: "radio",
          points: 2,
          options: [
            "The image exhibits a vague AI aesthetic or unusual color gradient",
            "Direct objective contradiction between biometric sensor telemetry/CCTV (empty room) and the screenshot record claiming in-person operator presence",
            "The file hash contains more lowercase letters than usual",
            "The camera lens resolution is slightly lower than 4K"
          ],
          correct: "Direct objective contradiction between biometric sensor telemetry/CCTV (empty room) and the screenshot record claiming in-person operator presence",
          hints: [
            "Category Hint: Remember the rule: simulation rules require objective contradiction, not subjective guesswork.",
            "Narrowing Hint: Reject vague aesthetic answers. Look for hard factual contradictions between independent systems.",
            "Direct Clue: The physical sensor and video data objectively refute the terminal's on-screen claim."
          ],
          explanation: "Investigation methodology relies on factual contradictions between independent telemetry sources (hardware sensors + surveillance vs. fabricated software modal)."
        }
      ]
    },

    {
      id: "case-03",
      number: "03",
      title: "CASE 03 // THE DIGITAL TRAIL",
      shortTitle: "The Digital Trail",
      skill: "Sequence Logic & Identity Correlation Deduction",
      points: 10,
      intendedTime: "12–15 Minutes",
      framing: "The evidence tells you that the official story is unreliable. Now follow the trail: LOGIN → DEVICE → FILE → USER → LOCATION. Determine where the manipulation entered the system.",
      objective: "Correlate the five forensic nodes, uncover the junction where malicious tampering entered, and reach the final deduction.",
      nodes: [
        {
          id: "node-login",
          key: "LOGIN",
          label: "01. LOGIN STAGE",
          icon: "key",
          summary: "Initial Access Verification",
          data: {
            "Account Utilized": "VICTOR-07",
            "Clearance": "Omega-Class Research Director",
            "Timestamp": "00:17:43",
            "Auth Result": "Accepted (Cryptographic Card + Dual-PIN)",
            "Forensic Status": "Authentic Credentials Used"
          },
          status: "verified",
          description: "Legitimate high-clearance account credentials were submitted. Cryptographic token match confirmed."
        },
        {
          id: "node-device",
          key: "DEVICE",
          label: "02. DEVICE STAGE",
          icon: "monitor",
          summary: "Session Hardware Discrepancy",
          data: {
            "Terminal In-Use": "Nexus Terminal N-04 (Local)",
            "Injected Device": "Remote Admin Device R-07 (Tunnel)",
            "Handoff Time": "00:19:12",
            "Network Route": "Virtual Bridge via Port 4438",
            "Forensic Status": "TAMPERING DETECTED"
          },
          status: "danger",
          description: "While Terminal N-04 was authenticated, Device R-07 hijacked the socket tunnel to execute privileged commands remotely."
        },
        {
          id: "node-file",
          key: "FILE",
          label: "03. FILE STAGE",
          icon: "file-text",
          summary: "Target Asset Modification",
          data: {
            "Target File": "Incident_Record_07",
            "Modification Time": "00:19:12",
            "Changes Made": "Log timestamps shifted by 180s; suspect ID rewritten to 'Dr. Doom (Latverian Diplomatic Seal)'",
            "Checksum Status": "Mismatched against Master Ledger"
          },
          status: "danger",
          description: "Incident_Record_07 was deliberately altered during the 18-second camera outage to frame a specific suspect."
        },
        {
          id: "node-user",
          key: "USER",
          label: "04. USER STAGE",
          icon: "user-check",
          summary: "Identity & Motive Analysis",
          data: {
            "Apparent Suspect": "Doctor Victor Von Doom",
            "Account Record": "VICTOR-07",
            "Physical Presence": "UNPROVEN (Room was unoccupied)",
            "Temporal Telemetry": "Speed-Force tachyon radiation detected on relay node",
            "Forensic Status": "IDENTITY CONTRADICTION"
          },
          status: "warning",
          description: "The official system report names Doctor Doom, but forensic logs show his account was used remotely while he was absent from the room. Speed-force temporal residue was detected."
        },
        {
          id: "node-location",
          key: "LOCATION",
          label: "05. LOCATION STAGE",
          icon: "map-pin",
          summary: "Geofence & Physical Audit",
          data: {
            "Reported Location": "Control Room (Sector 7)",
            "Actual Telemetry": "Remote Relay Node 09 (External Perimeter)",
            "Sensor Match": "Mismatch (0 occupants at terminal)",
            "Discrepancy": "Spoofed location header"
          },
          status: "warning",
          description: "The remote connection packet spoofed the location header as 'Control Room', but network latency indicates an external origin."
        }
      ],
      trails: [
        { from: "LOGIN", to: "DEVICE", status: "divergent", note: "Account authorized locally, but commands bridged to remote R-07." },
        { from: "DEVICE", to: "FILE", status: "danger", note: "Device R-07 performed malicious modification on Incident_Record_07." },
        { from: "FILE", to: "USER", status: "contradictory", note: "Altered file explicitly frames Doctor Doom despite physical absence." },
        { from: "USER", to: "LOCATION", status: "contradictory", note: "Spoofed local location disguises external remote intrusion." }
      ],
      questions: [
        {
          id: "c3_q1",
          text: "1. Which account was used during the initial access?",
          type: "select",
          points: 2,
          options: [
            "VICTOR-07",
            "BARRY-24",
            "STARK-01",
            "ROOT-SYS"
          ],
          correct: "VICTOR-07",
          hints: [
            "Category Hint: Review the 01. LOGIN STAGE node details.",
            "Narrowing Hint: The account belongs to the Nexus Lead Scientist.",
            "Direct Clue: Account identifier is VICTOR-07."
          ],
          explanation: "Account VICTOR-07 was used for the initial credential authentication at 00:17:43."
        },
        {
          id: "c3_q2",
          text: "2. Which device introduced the suspicious modification?",
          type: "select",
          points: 2,
          options: [
            "Nexus Terminal N-04",
            "Remote Admin Device R-07",
            "CCTV-04",
            "Security Hub SH-02"
          ],
          correct: "Remote Admin Device R-07",
          hints: [
            "Category Hint: Inspect the 02. DEVICE STAGE node.",
            "Narrowing Hint: The modification did not come from the physical terminal.",
            "Direct Clue: Remote Admin Device R-07 injected the file write."
          ],
          explanation: "Remote Admin Device R-07 bypassed the terminal and performed the unauthorized alteration."
        },
        {
          id: "c3_q3",
          text: "3. Which file was altered?",
          type: "select",
          points: 2,
          options: [
            "Incident_Record_07",
            "Timeline_Core.bin",
            "Nexus_Kernel.sys",
            "Access_Policy_01"
          ],
          correct: "Incident_Record_07",
          hints: [
            "Category Hint: Inspect the 03. FILE STAGE node.",
            "Narrowing Hint: It contains the record numbered 07.",
            "Direct Clue: The altered document is Incident_Record_07."
          ],
          explanation: "Incident_Record_07 was rewritten during the camera outage."
        },
        {
          id: "c3_q4",
          text: "4. At which stage does the evidence first become unreliable or manipulated?",
          type: "select",
          points: 2,
          options: [
            "LOGIN stage",
            "DEVICE stage",
            "FILE stage",
            "USER stage",
            "LOCATION stage"
          ],
          correct: "DEVICE stage",
          hints: [
            "Category Hint: Where in the progression from LOGIN → DEVICE → FILE does the first contradiction occur?",
            "Narrowing Hint: The LOGIN credentials were valid, but the execution hardware diverted.",
            "Direct Clue: Tampering begins at the DEVICE stage when R-07 hijacks the session."
          ],
          explanation: "The initial LOGIN credentials were authenticated correctly, but the chain was corrupted at the DEVICE stage when Remote Admin Device R-07 injected itself into the session."
        },
        {
          id: "c3_q5",
          text: "5. Who should NOT yet be considered the confirmed culprit?",
          type: "radio",
          points: 2,
          options: [
            "The legitimate account owner (VICTOR-07 / Doctor Doom)",
            "The remote device operator",
            "The security gateway daemon",
            "The facility surveillance coordinator"
          ],
          correct: "The legitimate account owner (VICTOR-07 / Doctor Doom)",
          hints: [
            "Category Hint: Read the intended conclusion in the case briefing.",
            "Narrowing Hint: Merely having one's account stolen or framed does not prove guilt.",
            "Direct Clue: The legitimate account owner whose credentials were used remotely while absent must not be prematurely judged."
          ],
          explanation: "The legitimate account owner (VICTOR-07 / Doctor Doom) must NOT be confirmed as the culprit. The evidence clearly demonstrates that his account was manipulated from a remote device while the physical terminal room was unoccupied, leaving the primary perpetrator unresolved."
        }
      ]
    }
  ]
};
