import React, { useState, useEffect } from "react";
import "../css/MedicalHistory.css";
import { supabase } from "../lib/supabaseClient";

export default function MedicalHistory() {
  const [openId, setOpenId] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMedicalRecords();
  }, []);

  const fetchMedicalRecords = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("patient_records_tbl")
        .select(
          `
          *,
          patient:patient_id (first_name, last_name),
          hospital_tbl:hospital_id (name)
        `
        )
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      console.log("Raw medical records data:", data);

      // Transform the data to match the card display format
      const transformed = (data || []).map((item) => ({
        id: item.id,
        patientName: item.patient
          ? `${item.patient.first_name} ${item.patient.last_name}`
          : "Unknown Patient",
        hospitalName: item.hospital_tbl?.name || "Unknown Hospital",
        time: new Date(item.created_at).toLocaleString("en-US", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }),
        // Medical details
        bloodPressure: item.blood_pressure || "N/A",
        height: item.height ? `${item.height} cm` : "N/A",
        weight: item.weight ? `${item.weight} kg` : "N/A",
        assessment: item.assessment || "N/A",
        medication: item.medication || "N/A",
        notes: item.notes || "N/A",
        smoking: item.smoking !== null ? (item.smoking ? "Yes" : "No") : "N/A",
        drinking:
          item.drinking !== null ? (item.drinking ? "Yes" : "No") : "N/A",
        transaction: item.transaction || "N/A",
      }));

      setRecords(transformed);
    } catch (err) {
      console.error("Error fetching medical records:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggle = (id) => setOpenId((prev) => (prev === id ? null : id));

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-left">
          <div className="brand">MediVault</div>
        </div>
        <div className="topbar-right">M</div>
      </header>

      <div className="shell-body">
        <main className="content">
          <header className="medical-history-header">
            <h2>Medical History</h2>
          </header>

          <section className="medical-history-panel full-width">
            {loading && (
              <div className="medical-history-status">
                Loading medical records...
              </div>
            )}

            {error && (
              <div className="medical-history-status error">
                Error loading medical records: {error}
              </div>
            )}

            {!loading && !error && records.length === 0 && (
              <div className="medical-history-status">
                No medical records found.
              </div>
            )}

            {!loading && !error && records.length > 0 && (
              <div className="medical-history-list">
                {records.map((r) => {
                  const expanded = openId === r.id;
                  return (
                    <article
                      key={r.id}
                      className={"record-card" + (expanded ? " expanded" : "")}
                      onClick={() => toggle(r.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === "Enter" && toggle(r.id)}
                    >
                      <div className="record-head">
                        <div className="record-patient">{r.transaction}</div>
                        <div className="record-time">{r.time}</div>
                      </div>

                      <div className="record-body">
                        <div className="record-body-left">
                          <div className="record-hospital">
                            Hospital: {r.hospitalName}
                          </div>
                          <div className="record-vitals">
                            BP: {r.bloodPressure} | Height: {r.height} | Weight:{" "}
                            {r.weight}
                          </div>
                        </div>
                        <div className="record-expand">
                          {expanded ? "Click to collapse" : "Click to expand"}
                        </div>
                      </div>

                      <div
                        className={"record-details" + (expanded ? " show" : "")}
                        aria-hidden={!expanded}
                      >
                        <div className="record-info-grid">
                          <div className="record-info-item">
                            <div className="record-info-label">Assessment</div>
                            <div className="record-info-value">
                              {r.assessment}
                            </div>
                          </div>
                          <div className="record-info-item">
                            <div className="record-info-label">Medication</div>
                            <div className="record-info-value">
                              {r.medication}
                            </div>
                          </div>
                          <div className="record-info-item">
                            <div className="record-info-label">Smoking</div>
                            <div className="record-info-value">{r.smoking}</div>
                          </div>
                          <div className="record-info-item">
                            <div className="record-info-label">Drinking</div>
                            <div className="record-info-value">
                              {r.drinking}
                            </div>
                          </div>
                          {r.notes !== "N/A" && (
                            <div className="record-info-item full-width">
                              <div className="record-info-label">Notes</div>
                              <div className="record-info-value">{r.notes}</div>
                            </div>
                          )}
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
