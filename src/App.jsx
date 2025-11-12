import React from 'react'
import { Routes, Route } from 'react-router-dom'
import LoginRegister from './pages/LoginRegister'
import Dashboard from './pages/Dashboard'
import HospitalLogin from './pages/HospitalLogin'
import HospitalDashboard from './pages/HospitalDashboard'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginRegister />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/hospital-login" element={<HospitalLogin />} />
      <Route path="/hospital-dashboard" element={<HospitalDashboard />} />
    </Routes>
  )
}

export default App
