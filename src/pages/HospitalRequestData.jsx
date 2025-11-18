import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import { useHealthcareStaff } from "../lib/hooks/useHealthcareStaff";
import "../css/LoginRegister.css"; // reuse styles already present for inputs/buttons

export default function HospitalRequestData() {
  const navigate = useNavigate();
  const [term, setTerm] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
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

            <div style={{ overflowX: "auto", marginTop: 8 }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ textAlign: "left", borderBottom: "1px solid #ddd" }}>
                    <th style={{ padding: 8 }}>Name</th>
                    <th style={{ padding: 8 }}>DOB</th>
                    <th style={{ padding: 8 }}>Age</th>
                    <th style={{ padding: 8 }}>Email</th>
                    <th style={{ padding: 8 }}>Contact</th>
                    <th style={{ padding: 8 }}>Blood</th>
                    <th style={{ padding: 8 }}>Address</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((p) => (
                    <tr key={p.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                      <td style={{ padding: 8 }}>{fullName(p)}</td>
                      <td style={{ padding: 8 }}>{p.birthday || "—"}</td>
                      <td style={{ padding: 8 }}>{p.age ?? "—"}</td>
                      <td style={{ padding: 8 }}>{p.email}</td>
                      <td style={{ padding: 8 }}>{p.contact_num}</td>
                      <td style={{ padding: 8 }}>{p.blood_type}</td>
                      <td style={{ padding: 8 }}>{p.address}</td>
                    </tr>
                  ))}
                  {results.length === 0 && !loading && (
                    <tr>
                      <td colSpan={7} style={{ padding: 12, textAlign: "center", color: "#666" }}>
                        No results
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
