import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import { useHealthcareStaff } from "../lib/hooks/useHealthcareStaff";
import "../css/HospitalUI.css";
import requestPatientData, { verifyOtp } from "../lib/hospitalFunctions";

export default function HospitalRequestData() {
  const navigate = useNavigate();
  const [term, setTerm] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [otpError, setOtpError] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [otpInput, setOtpInput] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  // useHealthcareStaff handles authentication & staff lookup and redirects on unauthenticated users
  const {
    staffData,
    loading: staffLoading,
    error: staffError,
  } = useHealthcareStaff();

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
      .select(
        "id, first_name, middle_name, last_name, birthday, age, email, contact_num, blood_type, address"
      )
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
  const fullName = (p) =>
    `${p.first_name || ""} ${p.middle_name || ""} ${p.last_name || ""}`
      .replace(/\s+/g, " ")
      .trim();

  // Request OTP/data for a patient using the currently-logged-in staff's hospital id
  async function handleRequestData(patient) {
    setError(null);
    if (!patient || !patient.id) {
      setError("No patient selected");
      return;
    }

    // derive hospital_id and healthcare_staff_id from staffData (hook provides the staff row)
    const hospital_id =
      staffData?.hospital_id ||
      staffData?.hospitalId ||
      staffData?.hospital?.id ||
      null;
    const healthcare_staff_id =
      staffData?.id ||
      staffData?.healthcare_staff_id ||
      staffData?.staff_id ||
      null;

    if (!hospital_id || !healthcare_staff_id) {
      setError("Missing hospital or staff information for the logged-in user");
      return;
    }

    setLoading(true);
    const { data, error: hfError } = await requestPatientData({
      hospital_id,
      patient_id: patient.id,
      healthcare_staff_id,
    });
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

  async function handleVerifyOtp() {
    if (!otpInput || otpInput.trim().length === 0) {
      setOtpError("Please enter an OTP");
      return;
    }

    setOtpLoading(true);
    setOtpError(null);
    const { data, error: verifyError } = await verifyOtp(otpInput.trim());
    setOtpLoading(false);

    if (verifyError) {
      setOtpError(verifyError.message || "OTP verification failed");
    } else {
      setSuccessMessage("OTP verified successfully");
      setOtpInput("");
      setOtpError(null);
      setTimeout(() => setSuccessMessage(null), 3500);
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/hospital-login");
  };

  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownOpen && !event.target.closest(".user-dropdown")) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [dropdownOpen]);

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
    <>
      <nav className="hospital-nav">
        <div className="nav-brand">
          <h2>
            <span className="medi">Medi</span>
            <span className="vault">Vault</span>
          </h2>
        </div>

        <div className="nav-actions">
          <button type="button" className="nav-btn">
            Request Data
          </button>
          <button type="button" className="nav-btn">
            Accepted Requests
          </button>
          <div className="user-dropdown">
            <button
              className="nav-avatar"
              onClick={toggleDropdown}
              aria-label="User menu"
            >
              {staffData
                ? (
                    staffData.first_name?.[0] ||
                    staffData.email?.[0] ||
                    "S"
                  ).toUpperCase()
                : "S"}
            </button>

            {dropdownOpen && (
              <div className="dropdown-menu">
                <div className="dropdown-header">
                  <div className="user-name">
                    {staffData
                      ? `${staffData.first_name || ""} ${
                          staffData.last_name || ""
                        }`.trim() || staffData.email
                      : "Staff"}
                  </div>
                  <div className="user-email">{staffData?.email}</div>
                  <div className="user-role">
                    {staffData?.role} - {staffData?.occupation}
                  </div>
                </div>
                <div className="dropdown-divider"></div>
                <button
                  className="dropdown-item logout-btn"
                  onClick={handleLogout}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <polyline
                      points="16,17 21,12 16,7"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <line
                      x1="21"
                      y1="12"
                      x2="9"
                      y2="12"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* OTP Box - Fixed on left edge */}
      <div className="otp-sidebar">
        <h4>Enter OTP</h4>
        <input
          type="text"
          placeholder="6-digit OTP"
          className="otp-sidebar-input"
          value={otpInput}
          onChange={(e) => setOtpInput(e.target.value)}
        />
        <button
          className="otp-sidebar-btn"
          onClick={handleVerifyOtp}
          disabled={otpLoading}
        >
          {otpLoading ? "Verifying..." : "Verify"}
        </button>
        {otpError && <div className="otp-sidebar-error">{otpError}</div>}
      </div>

      <div className="lr-page page-container">
        {/* small success toast */}
        {successMessage && (
          <div className="toast-success">{successMessage}</div>
        )}
        <div className="lr-inner">
          <h3>Request Patient Data</h3>

          <main className="lr-box">
            <div style={{ width: "100%" }}>
              <div className="search-row">
                <input
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  placeholder="Search by name, email or contact (min 2 chars)"
                  className="lr-input search-input"
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
                      <h3 style={{ margin: 0, marginBottom: 6 }}>
                        {fullName(p)}
                      </h3>
                      <p style={{ margin: 0, color: "#666" }}>
                        Age: {p.age ?? "—"}
                      </p>
                      <p style={{ marginTop: 8, color: "#234" }}>{p.email}</p>
                    </button>
                  ))}
                </div>

                {results.length === 0 && !loading && (
                  <div
                    style={{ padding: 12, textAlign: "center", color: "#666" }}
                  >
                    No results
                  </div>
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
              <button
                className="hr-modal-close"
                aria-label="Close"
                onClick={() => setSelectedPatient(null)}
              >
                ×
              </button>
              <h2 style={{ marginTop: 0 }}>{fullName(selectedPatient)}</h2>
              <p>
                <strong>Age:</strong> {selectedPatient.age ?? "—"}
              </p>
              <p>
                <strong>Date of Birth:</strong>{" "}
                {selectedPatient.birthday ?? "—"}
              </p>
              <p>
                <strong>Email:</strong> {selectedPatient.email ?? "—"}
              </p>
              <p>
                <strong>Contact:</strong> {selectedPatient.contact_num ?? "—"}
              </p>
              <p>
                <strong>Blood Type:</strong> {selectedPatient.blood_type ?? "—"}
              </p>
              <p style={{ marginBottom: 12 }}>
                <strong>Address:</strong> {selectedPatient.address ?? "—"}
              </p>

              <div
                style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}
              >
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
    </>
  );
}
