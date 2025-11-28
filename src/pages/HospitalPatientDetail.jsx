import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useHealthcareStaff } from "../lib/hooks/useHealthcareStaff";
import "../css/HospitalUI.css";

export default function HospitalPatientDetail() {
  const { patient_id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [patientHistory, setPatientHistory] = useState([]);
  const [hospitals, setHospitals] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNewRecordModal, setShowNewRecordModal] = useState(false);
  const [newRecordForm, setNewRecordForm] = useState({
    transaction: '',
    medication: '',
    notes: '',
    assessment: '',
    blood_pressure: '',
    drinking: '',
    smoking: '',
    height: '',
    weight: '',
    doctor: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [doctorSearch, setDoctorSearch] = useState('');
  const [showDoctorDropdown, setShowDoctorDropdown] = useState(false);

  // Filter doctors based on search
  const filteredDoctors = doctors.filter(doctor => {
    const fullName = `${doctor.first_name} ${doctor.last_name}`.toLowerCase();
    return fullName.includes(doctorSearch.toLowerCase());
  });

  // useHealthcareStaff handles authentication & staff lookup
  const { staffData, loading: staffLoading, error: staffError } = useHealthcareStaff();

  useEffect(() => {
    if (staffData && patient_id) {
      fetchPatientData();
      fetchDoctors();
    }
  }, [staffData, patient_id]);

  async function fetchPatientData() {
    try {
      setLoading(true);

      // Fetch patient basic info
      const { data: patientData, error: patientError } = await supabase
        .from("patient_tbl")
        .select("*")
        .eq('id', patient_id)
        .single();

      if (patientError) throw patientError;

      // Fetch patient medical history
      const { data: historyData, error: historyError } = await supabase
        .from("patient_records_tbl")
        .select("*")
        .eq('patient_id', patient_id)
        .order('created_at', { ascending: false });

      if (historyError) throw historyError;

      // Get unique hospital IDs from history
      const hospitalIds = [...new Set(historyData.map(record => record.hospital_id).filter(Boolean))];

      // Fetch hospital names
      let hospitalData = {};
      if (hospitalIds.length > 0) {
        const { data: hospitals, error: hospitalError } = await supabase
          .from("hospital_tbl")
          .select("id, name")
          .in('id', hospitalIds);

        if (!hospitalError) {
          hospitalData = hospitals.reduce((acc, hospital) => {
            acc[hospital.id] = hospital.name;
            return acc;
          }, {});
        }
      }

      setPatient(patientData);
      setPatientHistory(historyData || []);
      setHospitals(hospitalData);
    } catch (err) {
      console.error("Error fetching patient data:", err);
      setError(err.message || "Failed to load patient data");
    } finally {
      setLoading(false);
    }
  }

  async function fetchDoctors() {
    try {
      const { data: doctorData, error: doctorError } = await supabase
        .from('doctor_tbl')
        .select('id, first_name, last_name')
        .order('first_name');

      if (doctorError) {
        console.error('Error fetching doctors:', doctorError);
      } else {
        setDoctors(doctorData || []);
      }
    } catch (error) {
      console.error('Error in fetchDoctors:', error);
    }
  }

  // Modal handlers
  const handleFormChange = (field, value) => {
    setNewRecordForm(prev => ({ ...prev, [field]: value }));
  };

  const handleDoctorSearch = (value) => {
    setDoctorSearch(value);
    setShowDoctorDropdown(true);
    setNewRecordForm(prev => ({ ...prev, doctor: '' }));
  };

  const selectDoctor = (doctor) => {
    setDoctorSearch(`Dr. ${doctor.first_name} ${doctor.last_name}`);
    setNewRecordForm(prev => ({ ...prev, doctor: doctor.id }));
    setShowDoctorDropdown(false);
  };

  const openNewRecordModal = () => {
    setNewRecordForm({
      transaction: '',
      medication: '',
      notes: '',
      assessment: '',
      blood_pressure: '',
      drinking: '',
      smoking: '',
      height: '',
      weight: '',
      doctor: ''
    });
    setDoctorSearch('');
    setShowDoctorDropdown(false);
    setShowNewRecordModal(true);
  };

  const closeNewRecordModal = () => {
    setShowNewRecordModal(false);
    setDoctorSearch('');
    setShowDoctorDropdown(false);
    setNewRecordForm({
      transaction: '',
      medication: '',
      notes: '',
      assessment: '',
      blood_pressure: '',
      drinking: '',
      smoking: '',
      height: '',
      weight: '',
      doctor: ''
    });
  };

  const handleCreateRecord = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const hospital_id = staffData?.hospital_id || staffData?.hospitalId || staffData?.hospital?.id;
      const healthcare_staff_id = staffData?.id || staffData?.healthcare_staff_id || staffData?.staff_id;
      
      if (!hospital_id || !healthcare_staff_id) {
        throw new Error('Missing hospital or staff information');
      }

      const recordData = {
        patient_id: patient_id,
        hospital_id: hospital_id,
        healthcare_staff_id: healthcare_staff_id,
        transaction: newRecordForm.transaction || null,
        medication: newRecordForm.medication || null,
        notes: newRecordForm.notes || null,
        assessment: newRecordForm.assessment || null,
        blood_pressure: newRecordForm.blood_pressure || null,
        drinking: newRecordForm.drinking === 'Yes' ? true : newRecordForm.drinking === 'No' ? false : null,
        smoking: newRecordForm.smoking === 'Yes' ? true : newRecordForm.smoking === 'No' ? false : null,
        height: newRecordForm.height || null,
        weight: newRecordForm.weight || null,
        doctor_id: newRecordForm.doctor || null,
        created_at: new Date().toISOString()
      };

      const { data, error: insertError } = await supabase
        .from('patient_records_tbl')
        .insert([recordData])
        .select();

      if (insertError) {
        throw insertError;
      }

      // Refresh the patient history to include the new record
      await fetchPatientData();
      
      // Close modal and show success
      closeNewRecordModal();
      alert('Medical record created successfully!');

    } catch (error) {
      console.error('Error creating record:', error);
      alert(`Failed to create record: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Helper function to get full name
  const fullName = (p) => `${p.first_name || ""} ${p.middle_name || ""} ${p.last_name || ""}`.replace(/\s+/g, " ").trim();

  // Get latest height and weight
  const getLatestVitals = () => {
    let latestHeight = null;
    let latestWeight = null;
    
    for (const record of patientHistory) {
      if (!latestHeight && record.height) {
        latestHeight = record.height;
      }
      if (!latestWeight && record.weight) {
        latestWeight = record.weight;
      }
      if (latestHeight && latestWeight) break;
    }
    
    return { height: latestHeight, weight: latestWeight };
  };

  if (staffLoading || loading) {
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
            <p>You are not authorized to view patient records.</p>
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="lr-page">
        <div className="lr-inner">
          <main className="lr-box">
            <p style={{ color: "#b00" }}>{error}</p>
            <button onClick={() => navigate(-1)} className="lr-submit">Go Back</button>
          </main>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="lr-page">
        <div className="lr-inner">
          <main className="lr-box">
            <p>Patient not found.</p>
            <button onClick={() => navigate(-1)} className="lr-submit">Go Back</button>
          </main>
        </div>
      </div>
    );
  }

  const { height, weight } = getLatestVitals();

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
          <button type="button" className="nav-btn">Request Data</button>
          <button type="button" className="nav-btn">Accepted Requests</button>
          <div className="nav-avatar">M</div>
        </div>
      </nav>

      <div className="patient-detail-container">
        {/* Back Button */}
        <button onClick={() => navigate(-1)} className="patient-detail-back-btn">
          ← Back
        </button>

        {/* Patient Info Header */}
        <div className="patient-info-header">
          <h2>{fullName(patient)}</h2>
          <div className="patient-vitals-grid">
            <div className="patient-vital-item">
              <p>
                <strong>Latest Height:</strong> {height ? `${height} cm` : 'Not recorded'}
              </p>
            </div>
            <div className="patient-vital-item">
              <p>
                <strong>Latest Weight:</strong> {weight ? `${weight} kg` : 'Not recorded'}
              </p>
            </div>
            <div className="patient-vital-item">
              <p>
                <strong>Blood Type:</strong> {patient.blood_type || 'Not recorded'}
              </p>
            </div>
          </div>
        </div>

        {/* Medical History */}
        <div className="medical-history-section">
            <div className="medical-history-header"><h3 className="medical-history-title">Medical History</h3>
                <button className="insert-record" onClick={openNewRecordModal}>New Record</button>
            </div>
          {/* Scrollable container for medical history */}
          <div className="medical-history-container">
            {patientHistory.length > 0 ? (
              <div className="medical-history-list">
                {patientHistory.map((record, index) => {
                  // Check if current staff can edit this record (role=3 and same hospital)
                  const canEdit = staffData?.role === 3 && 
                                staffData?.hospital_id === record.hospital_id;
                  
                  return (
                    <div key={record.id || index} className="medical-record-card">
                      <div className="medical-record-content">
                        {/* Column 1: Main Info */}
                        <div className="medical-record-col1">
                          <p className="medical-record-transaction">
                            {record.transaction || 'Medical Record'}
                          </p>
                          {record.medication && (
                            <p className="medical-record-field">
                              <strong>Medication/s:</strong> {record.medication}
                            </p>
                          )}
                          {record.notes && (
                            <p className="medical-record-field">
                              <strong>Notes:</strong> {record.notes}
                            </p>
                          )}
                          {record.assessment && (
                            <p className="medical-record-field">
                              <strong>Assessment:</strong> {record.assessment}
                            </p>
                          )}
                        </div>
                        
                        {/* Column 2: Vitals & Habits */}
                        <div className="medical-record-col2">
                          {record.blood_pressure && (
                            <p className="medical-record-field">
                              <strong>Blood Pressure:</strong> {record.blood_pressure}
                            </p>
                          )}
                          <p className="medical-record-field">
                            <strong>Drinking:</strong> {
                              record.drinking === true ? 'Yes' : 
                              record.drinking === false ? 'No' : 
                              record.drinking || 'Not recorded'
                            }
                          </p>
                          <p className="medical-record-field">
                            <strong>Smoking:</strong> {
                              record.smoking === true ? 'Yes' : 
                              record.smoking === false ? 'No' : 
                              record.smoking || 'Not recorded'
                            }
                          </p>
                        </div>
                        
                        {/* Column 3: Meta & Actions */}
                        <div className="medical-record-col3">
                          <div className="medical-record-meta">
                            <p className="medical-record-hospital">
                              {hospitals[record.hospital_id] || 'Unknown Hospital'}
                            </p>
                            <p className="medical-record-date">
                              {record.created_at ? new Date(record.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              }) : 'Unknown date'}
                            </p>
                          </div>
                          {canEdit && (
                            <div className="medical-record-actions">
                              <button className="medical-record-btn update" title="Edit Record">
                                ✎
                              </button>
                              <button className="medical-record-btn delete" title="Delete Record">
                                ✕
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="medical-history-empty">
                No medical history found for this patient.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New Record Modal */}
      {showNewRecordModal && (
        <div className="hr-modal-overlay">
          <div className="hr-modal" onClick={(e) => e.stopPropagation()}>
            <button className="hr-modal-close" onClick={closeNewRecordModal}>×</button>
            <h2>New Medical Record</h2>
            
            <form onSubmit={handleCreateRecord}>
              <div className="form-group">
                <label>Patient Name</label>
                <input
                  type="text"
                  value={fullName(patient)}
                  readOnly
                  className="form-input readonly"
                />
              </div>

              <div className="form-group">
                <label>Transaction *</label>
                <input
                  type="text"
                  value={newRecordForm.transaction}
                  onChange={(e) => handleFormChange('transaction', e.target.value)}
                  required
                  className="form-input"
                  placeholder="Enter transaction/procedure name"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Blood Pressure</label>
                  <input
                    type="text"
                    value={newRecordForm.blood_pressure}
                    onChange={(e) => handleFormChange('blood_pressure', e.target.value)}
                    className="form-input"
                    placeholder="120/80"
                  />
                </div>
                <div className="form-group">
                  <label>Medication</label>
                  <input
                    type="text"
                    value={newRecordForm.medication}
                    onChange={(e) => handleFormChange('medication', e.target.value)}
                    className="form-input"
                    placeholder="Prescribed medications"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Height</label>
                  <input
                    type="text"
                    value={newRecordForm.height}
                    onChange={(e) => handleFormChange('height', e.target.value)}
                    className="form-input"
                    placeholder="e.g., 170 cm"
                  />
                </div>
                <div className="form-group">
                  <label>Weight</label>
                  <input
                    type="text"
                    value={newRecordForm.weight}
                    onChange={(e) => handleFormChange('weight', e.target.value)}
                    className="form-input"
                    placeholder="e.g., 70 kg"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Doctor</label>
                <div className="doctor-search-container">
                  <input
                    type="text"
                    value={doctorSearch}
                    onChange={(e) => handleDoctorSearch(e.target.value)}
                    onFocus={() => setShowDoctorDropdown(true)}
                    className="form-input"
                    placeholder="Search for a doctor..."
                  />
                  {showDoctorDropdown && filteredDoctors.length > 0 && (
                    <div className="doctor-dropdown">
                      {filteredDoctors.slice(0, 5).map(doctor => (
                        <div
                          key={doctor.id}
                          className="doctor-option"
                          onClick={() => selectDoctor(doctor)}
                        >
                          Dr. {doctor.first_name} {doctor.last_name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Drinking</label>
                  <select
                    value={newRecordForm.drinking}
                    onChange={(e) => handleFormChange('drinking', e.target.value)}
                    className="form-input"
                  >
                    <option value="">Select...</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Smoking</label>
                  <select
                    value={newRecordForm.smoking}
                    onChange={(e) => handleFormChange('smoking', e.target.value)}
                    className="form-input"
                  >
                    <option value="">Select...</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Assessment</label>
                <textarea
                  value={newRecordForm.assessment}
                  onChange={(e) => handleFormChange('assessment', e.target.value)}
                  rows={3}
                  className="form-input"
                  placeholder="Medical assessment and findings"
                />
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea
                  value={newRecordForm.notes}
                  onChange={(e) => handleFormChange('notes', e.target.value)}
                  rows={3}
                  className="form-input"
                  placeholder="Additional notes and observations"
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={closeNewRecordModal}
                  className="btn-cancel"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-submit"
                  disabled={submitting}
                >
                  {submitting ? 'Creating...' : 'Create Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}