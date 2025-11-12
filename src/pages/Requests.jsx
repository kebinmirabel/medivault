import React, { useState } from "react";
import "./Requests.css";

const mockRequests = [
  {
    id: "r1",
    name: "Alicia Keys",
    time: "2025-11-12 09:02",
    otp: "824193",
    note: "Access to lab results",
  },
  {
    id: "r2",
    name: "John Doe",
    time: "2025-11-12 08:45",
    otp: "550712",
    note: "Share record with clinic",
  },
  {
    id: "r3",
    name: "Maria Lopez",
    time: "2025-11-11 19:20",
    otp: "092345",
    note: "Request emergency contact",
  },
  {
    id: "r4",
    name: "Dr. Samuel",
    time: "2025-11-10 15:05",
    otp: "771204",
    note: "Temporary viewing token",
  },
];

export default function Requests() {
  const [openId, setOpenId] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeNav, setActiveNav] = useState("Requests");

  const toggle = (id) => setOpenId((prev) => (prev === id ? null : id));

  const copyOtp = async (otp) => {
    if (!navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(otp);
    } catch (e) {
      console.warn("copy failed", e);
    }
  };

  return (
    <div className={"app-shell" + (sidebarCollapsed ? " collapsed" : "")}>
      <header className="topbar">
        <div className="topbar-left">
          <button
            className="hamburger-btn"
            aria-label={
              sidebarCollapsed ? "Expand navigation" : "Collapse navigation"
            }
            onClick={() => setSidebarCollapsed((s) => !s)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
          <div className="brand">MediVault</div>
        </div>
        <div className="topbar-right">M</div>
      </header>

      <div className="shell-body">
        <aside className="sidebar" aria-expanded={!sidebarCollapsed}>
          <nav className="side-nav">
            <ul>
              <li
                className={activeNav === "Requests" ? "active" : ""}
                onClick={() => setActiveNav("Requests")}
                title="Requests"
              >
                <span className="label">Requests</span>
              </li>
              <li
                className={activeNav === "Dashboard" ? "active" : ""}
                onClick={() => setActiveNav("Dashboard")}
                title="Dashboard"
              >
                <span className="label">Dashboard</span>
              </li>
              <li
                className={activeNav === "Profile" ? "active" : ""}
                onClick={() => setActiveNav("Profile")}
                title="Profile"
              >
                <span className="label">Profile</span>
              </li>
            </ul>
          </nav>

          {/* footer collapse removed; toggle is now the top-left hamburger */}
        </aside>

        <main className="content">
          <header className="requests-header">
            <h2>Requests</h2>
          </header>

          <section className="requests-panel full-width">
            <div className="requests-list">
              {mockRequests.map((r) => {
                const expanded = openId === r.id;
                return (
                  <article
                    key={r.id}
                    className={"req-card" + (expanded ? " expanded" : "")}
                    onClick={() => toggle(r.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && toggle(r.id)}
                  >
                    <div className="req-head">
                      <div className="req-who">{r.name}</div>
                      <div className="req-time">{r.time}</div>
                    </div>

                    <div className="req-body">
                      <div className="req-note">{r.note}</div>
                      <div className="req-expand">
                        {expanded ? "Click to collapse" : "Click to expand"}
                      </div>
                    </div>

                    <div
                      className={"req-details" + (expanded ? " show" : "")}
                      aria-hidden={!expanded}
                    >
                      <div className="req-otp-label">One-time passcode</div>
                      <div className="req-otp">
                        <span className="otp-val">{r.otp}</span>
                        <button
                          className="otp-copy"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyOtp(r.otp);
                          }}
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
