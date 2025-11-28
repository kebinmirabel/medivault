import React from 'react'
import { Routes, Route } from 'react-router-dom'
import LoginRegister from './pages/LoginRegister'
import Dashboard from './pages/Dashboard'
import HospitalLogin from './pages/HospitalLogin'
import HospitalDashboard from './pages/HospitalDashboard'
import HospitalRequestData from './pages/HospitalRequestData'
import HospitalAcceptedRequests from './pages/HospitalAcceptedRequests'
import Requests from "./pages/Requests";
import MedicalHistory from "./pages/MedicalHistory";
import AcceptedRequests from "./pages/AcceptedRequests";
import HospitalPatientDetail from './pages/HospitalPatientDetail'


function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginRegister />} />
      <Route path="/hospital-login" element={<HospitalLogin />} />
      <Route path="/hospital-dashboard" element={<HospitalDashboard />} />
      <Route path="/hospital-request-data" element={<HospitalRequestData />} />
      <Route path="/dashboard" element={<Requests />} />
      <Route path="/medical-history" element={<MedicalHistory />} />
      <Route path="/accepted-requests" element={<AcceptedRequests />} />
      <Route path="/hospital-accepted-requests" element={<HospitalAcceptedRequests />} />
      <Route path="/hospital-accepted-request/:patient_id" element={<HospitalPatientDetail />} />
    </Routes>
  );
}

export default App;
