import React from "react";
import { Routes, Route } from "react-router-dom";
import LoginRegister from "./pages/LoginRegister";
import Dashboard from "./pages/Dashboard";
import HospitalLogin from "./pages/HospitalLogin";
import HospitalDashboard from "./pages/HospitalDashboard";
import HospitalRequestData from "./pages/HospitalRequestData";
import HospitalAcceptedRequests from "./pages/HospitalAcceptedRequests";
import Requests from "./pages/Requests";
import MedicalHistory from "./pages/MedicalHistory";
import AcceptedRequests from "./pages/AcceptedRequests";
import PatientAcceptedRequests from "./pages/PatientAcceptedRequests";
import HospitalPatientDetail from "./pages/HospitalPatientDetail";
import HospitalProtectedRoute from "./components/HospitalProtectedRoute";

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LoginRegister />} />
      <Route path="/hospital-login" element={<HospitalLogin />} />

      {/* Patient/User routes */}
      <Route path="/dashboard" element={<Requests />} />
      <Route path="/requests" element={<Requests />} />
      <Route path="/medical-history" element={<MedicalHistory />} />
      <Route path="/accepted-requests" element={<AcceptedRequests />} />
      <Route
        path="/patient-accepted-requests"
        element={<PatientAcceptedRequests />}
      />

      {/* Protected Hospital routes */}
      <Route
        path="/hospital-dashboard"
        element={
          <HospitalProtectedRoute>
            <HospitalDashboard />
          </HospitalProtectedRoute>
        }
      />
      <Route
        path="/hospital-request-data"
        element={
          <HospitalProtectedRoute>
            <HospitalRequestData />
          </HospitalProtectedRoute>
        }
      />
      <Route
        path="/hospital-accepted-requests"
        element={
          <HospitalProtectedRoute>
            <HospitalAcceptedRequests />
          </HospitalProtectedRoute>
        }
      />
      <Route
        path="/hospital-accepted-request/:patient_id"
        element={
          <HospitalProtectedRoute>
            <HospitalPatientDetail />
          </HospitalProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
