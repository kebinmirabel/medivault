import React, { useState } from 'react'
import { supabase } from './lib/supabaseClient'

function App() {
  const [isRegister, setIsRegister] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    middle_name: '',
    last_name: '',
    birthday: '',
    contact_num: '',
    blood_type: '',
    contact_person: '',
    contact_person_rs: '',
    contact_person_num: '',
    address: ''
  })

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const calcAge = (birthday) => {
    if (!birthday) return null
    const birthDate = new Date(birthday)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const m = today.getMonth() - birthDate.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--
    return age
  }


  const handleSubmit = async (e) => {
    e.preventDefault()

    if (isRegister) {
      // Register user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password
      })

      if (authError) return alert(authError.message)

      // Insert user data into patient_tbl
      const { error: dbError } = await supabase.from('patient_tbl').insert([
        {
          id: authData.user.id,
          first_name: formData.first_name,
          middle_name: formData.middle_name || null,
          last_name: formData.last_name,
          birthday: formData.birthday || null,
          age: calcAge(formData.birthday),
          contact_num: formData.contact_num || null,
          email: formData.email,
          blood_type: formData.blood_type || null,
          contact_person: formData.contact_person || null,
          contact_person_rs: formData.contact_person_rs || null,
          contact_person_num: formData.contact_person_num || null,
          address: formData.address || null
        }
      ])

      if (dbError) return alert(dbError.message)

      alert('Registration successful!')
    } else {
      // Login
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      })
      if (error) return alert(error.message)
      alert('Logged in!')
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: '50px auto' }}>
      <h2>{isRegister ? 'Register' : 'Login'}</h2>
      <form onSubmit={handleSubmit}>
        {isRegister && (
          <>
            <input name="first_name" placeholder="First Name" required onChange={handleChange} /><br />
            <input name="middle_name" placeholder="Middle Name" onChange={handleChange} /><br />
            <input name="last_name" placeholder="Last Name" required onChange={handleChange} /><br />
            <input name="birthday" type="date" onChange={handleChange} /><br />
            <input name="contact_num" placeholder="Contact Number" onChange={handleChange} /><br />
            <input name="blood_type" placeholder="Blood Type" onChange={handleChange} /><br />
            <input name="contact_person" placeholder="Contact Person" onChange={handleChange} /><br />
            <input name="contact_person_rs" placeholder="Relationship" onChange={handleChange} /><br />
            <input name="contact_person_num" placeholder="Contact Person Number" onChange={handleChange} /><br />
            <input name="address" placeholder="Address" onChange={handleChange} /><br />
          </>
        )}
        <input name="email" type="email" placeholder="Email" required onChange={handleChange} /><br />
        <input name="password" type="password" placeholder="Password" required onChange={handleChange} /><br />
        <button type="submit">{isRegister ? 'Register' : 'Login'}</button>
      </form>
      <p>
        {isRegister ? 'Already have an account?' : "Don't have an account?"}
        <button type="button" onClick={() => setIsRegister(!isRegister)}>
          {isRegister ? 'Login' : 'Register'}
        </button>
      </p>
    </div>
  )
}

export default App
