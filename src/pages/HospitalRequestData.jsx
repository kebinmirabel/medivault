import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import { useHealthcareStaff } from "../lib/hooks/useHealthcareStaff";
import "../css/HospitalUI.css";
import requestPatientData from "../lib/hospitalFunctions";


export default function HospitalRequestData() {
  const navigate = useNavigate();
  const [term, setTerm] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  // useHealthcareStaff handles authentication & staff lookup and redirects on unauthenticated users
  const { staffData, loading: staffLoading, error: staffError } = useHealthcareStaff();

  // debounce search by 400ms
  useEffect(() => {
    // do not search until staff access is confirmed
    if (!staffData) {
      setResults([]);
      setError(null);
      return;
    }

    if (!term || term.trim().length < 2) {
      setResults([]);
      setError(null);
      return;
    }

    const timeout = setTimeout(() => {
      runSearch(term.trim());
    }, 400);
    return () => clearTimeout(timeout);
  }, [term, staffData]);

  async function runSearch(query) {
    setLoading(true);
    setError(null);

    // search across several columns using `or` + ilike
    const filter = `first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%,contact_num.ilike.%${query}%`;
    const { data, error: sbError } = await supabase
      .from("patient_tbl")
      .select("id, first_name, middle_name, last_name, birthday, age, email, contact_num, blood_type, address")
      .or(filter)
      .limit(100);

    if (sbError) {
      console.error(sbError);
      setError(sbError.message || "Search failed");
      setResults([]);
    } else {
      setResults(data || []);
    }
    setLoading(false);
  }

  // simple helper to render full name
  const fullName = (p) => `${p.first_name || ""} ${p.middle_name || ""} ${p.last_name || ""}`.replace(/\s+/g, " ").trim();

  // Request OTP/data for a patient using the currently-logged-in staff's hospital id
  async function handleRequestData(patient) {
    setError(null);
    if (!patient || !patient.id) {
      setError('No patient selected');
      return;
    }

    // derive hospital_id and healthcare_staff_id from staffData (hook provides the staff row)
    const hospital_id = staffData?.hospital_id || staffData?.hospitalId || staffData?.hospital?.id || null;
    const healthcare_staff_id = staffData?.id || staffData?.healthcare_staff_id || staffData?.staff_id || null;

    if (!hospital_id || !healthcare_staff_id) {
      setError('Missing hospital or staff information for the logged-in user');
      return;
    }

    setLoading(true);
    const { data, error: hfError } = await requestPatientData({ hospital_id, patient_id: patient.id, healthcare_staff_id });
    setLoading(false);

    if (hfError) {
      console.error("requestPatientData error", hfError);
      setError(hfError.message || String(hfError));
    } else {
      // success — show a small toast message
      setError(null);
      setSuccessMessage("OTP request sent successfully");
      // auto-dismiss
      setTimeout(() => setSuccessMessage(null), 3500);
    }
  }

  // Show loading/authorization states from the hook
  if (staffLoading) {
    return (
      <div className="lr-page">
        <div className="lr-inner">
          <main className="lr-box">
            <p>Loading...</p>
          </main>
        </div>
      </div>
    );
  }

  if (staffError) {
    return (
      <div className="lr-page">
        <div className="lr-inner">
          <main className="lr-box">
            <p style={{ color: "#b00" }}>{staffError}</p>
          </main>
        </div>
      </div>
    );
  }

  if (!staffData) {
    return (
      <div className="lr-page">
        <div className="lr-inner">
          <main className="lr-box">
            <p>You are not authorized to search patient records.</p>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="lr-page">
      {/* small success toast */}
      {successMessage && (
        <div
          style={{
            position: "fixed",
            top: 18,
            right: 18,
            background: "#1f8e4a",
            color: "white",
            padding: "10px 14px",
            borderRadius: 8,
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            zIndex: 1400,
            fontSize: 14,
          }}
        >
          {successMessage}
        </div>
      )}
      <div className="lr-inner">
        <header className="lr-logo" aria-hidden>
          <h1>
            <span className="logo-medi">Medi</span>
            <span className="logo-vault">Vault</span>
          </h1>
        </header>

        <main className="lr-box">
          <div style={{ width: "100%" }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12 }}>
              <input
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="Search by name, email or contact (min 2 chars)"
                className="lr-input"
                style={{ maxWidth: 520 }}
              />
              <button
                className="lr-submit"
                type="button"
                onClick={() => {
                  if (term && term.trim().length >= 2) runSearch(term.trim());
                }}
              >
                Search
              </button>
            </div>

            {loading && <p>Searching…</p>}
            {error && <p style={{ color: "#b00" }}>{error}</p>}

            <div style={{ marginTop: 8 }}>
              <div className="patient-grid">
                {results.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className="patient-card"
                    onClick={() => setSelectedPatient(p)}
                    title={`Open ${fullName(p)}`}
                  >
                    <h3 style={{ margin: 0, marginBottom: 6 }}>{fullName(p)}</h3>
                    <p style={{ margin: 0, color: "#666" }}>Age: {p.age ?? "—"}</p>
                    <p style={{ marginTop: 8, color: "#234" }}>{p.email}</p>
                  </button>
                ))}
              </div>

              {results.length === 0 && !loading && (
                <div style={{ padding: 12, textAlign: "center", color: "#666" }}>No results</div>
              )}
            </div>
          </div>
        </main>
      </div>
      {/* Patient detail modal */}
      {selectedPatient && (
        <div
          className="hr-modal-overlay"
          role="dialog"
          aria-modal="true"
          onClick={() => setSelectedPatient(null)}
        >
          <div className="hr-modal" onClick={(e) => e.stopPropagation()}>
            <button className="hr-modal-close" aria-label="Close" onClick={() => setSelectedPatient(null)}>×</button>
            <h2 style={{ marginTop: 0 }}>{fullName(selectedPatient)}</h2>
            <p><strong>Age:</strong> {selectedPatient.age ?? '—'}</p>
            <p><strong>Date of Birth:</strong> {selectedPatient.birthday ?? '—'}</p>
            <p><strong>Email:</strong> {selectedPatient.email ?? '—'}</p>
            <p><strong>Contact:</strong> {selectedPatient.contact_num ?? '—'}</p>
            <p><strong>Blood Type:</strong> {selectedPatient.blood_type ?? '—'}</p>
            <p style={{ marginBottom: 12 }}><strong>Address:</strong> {selectedPatient.address ?? '—'}</p>

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="lr-submit"
                onClick={async () => {
                  // use the logged-in staff data to derive hospital & staff ids
                  await handleRequestData(selectedPatient);
                  // close modal regardless (or change this to after success if preferred)
                  setSelectedPatient(null);
                }}
              >
                Request Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
