import React from 'react'
import { supabase } from '../lib/supabaseClient'
import { useNavigate } from 'react-router-dom'
import { useHealthcareStaff } from '../lib/hooks/useHealthcareStaff'

export default function HospitalDashboard() {
  const navigate = useNavigate()
  const { staffData, loading, error } = useHealthcareStaff()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  // Show loading state while checking staff access
  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '50px' }}><p>Loading...</p></div>
  }

  // If error, show the error message
  if (error) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <h2 style={{ color: '#dc3545' }}>Access Denied</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/')}>Back to Login</button>
      </div>
    )
  }

  // If no staff data, show access denied
  if (!staffData) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <h2 style={{ color: '#dc3545' }}>Access Denied</h2>
        <p>Healthcare Staff User not found. Check your credentials.</p>
        <button onClick={() => navigate('/')}>Back to Login</button>
      </div>
    )
  }

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Welcome to the Healthcare Staff Dashboard</h1>
      <p>Logged in as: {staffData.first_name} {staffData.last_name}</p>
      <p>Role: {staffData.role} | Occupation: {staffData.occupation}</p>
      <button onClick={handleLogout}>Logout</button>
    </div>
  )
}
