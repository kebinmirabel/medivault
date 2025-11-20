import React, { useState, useEffect } from "react";
import "./Requests.css";
import { supabase } from "../lib/supabaseClient";

export default function Requests() {
  const [openId, setOpenId] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeNav, setActiveNav] = useState("Requests");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOtpRequests();
  }, []);

  const fetchOtpRequests = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("otp")
        .select(
          `
          *,
          patient:patient_id (first_name, last_name),
          healthcare_staff:healthcare_staff_id (first_name, last_name),
          hospital:hospital_id (name)
        `
        )
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      // Debug: log raw data to check hospital reference
      console.log("Raw OTP data:", data);

      // Transform the data to match the card display format
      const transformed = (data || []).map((item) => ({
        id: item.id,
        name: item.patient
          ? `${item.patient.first_name} ${item.patient.last_name}`
          : "Unknown Patient",
        staffName: item.healthcare_staff
          ? `${item.healthcare_staff.first_name} ${item.healthcare_staff.last_name}`
          : "Unknown Staff",
        hospitalName: item.hospital?.name || "Unknown Hospital",
        time: new Date(item.created_at).toLocaleString("en-US", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }),
        otp: item.otp || "N/A",
        note: `Request from ${item.hospital?.name || "hospital"}`,
      }));

      setRequests(transformed);
    } catch (err) {
      console.error("Error fetching OTP requests:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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
            {loading && (
              <div className="requests-status">Loading requests...</div>
            )}

            {error && (
              <div className="requests-status error">
                Error loading requests: {error}
              </div>
            )}

            {!loading && !error && requests.length === 0 && (
              <div className="requests-status">No OTP requests found.</div>
            )}

            {!loading && !error && requests.length > 0 && (
              <div className="requests-list">
                {requests.map((r) => {
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
                        {r.staffName && r.staffName !== "Unknown Staff" && (
                          <div className="req-staff">Staff: {r.staffName}</div>
                        )}
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
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
