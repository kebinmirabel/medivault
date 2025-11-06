import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import "./LoginRegister.css";

export default function LoginRegister() {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    first_name: "",
    middle_name: "",
    last_name: "",
    birthday: "",
    contact_num: "",
    blood_type: "",
    contact_person: "",
    contact_person_rs: "",
    contact_person_num: "",
    address: "",
  });

  const calcAge = (birthday) => {
    if (!birthday) return null;
    const birthDate = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isRegister) {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });
      if (authError) return alert(authError.message);

      const { error: dbError } = await supabase.from("patient_tbl").insert([
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
          address: formData.address || null,
        },
      ]);

      if (dbError) return alert(dbError.message);

      alert("Registration successful!");
      navigate("/dashboard"); // ✅ redirect to dashboard after registration
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });
      if (error) return alert(error.message);
      alert("Logged in!");
      navigate("/dashboard"); // ✅ redirect after login
    }
  };

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
          <form className="lr-form" onSubmit={handleSubmit}>
            {isRegister && (
              <div className="lr-grid">
                <input
                  name="first_name"
                  className="lr-input"
                  placeholder="First Name"
                  required
                  onChange={handleChange}
                />
                <input
                  name="middle_name"
                  className="lr-input"
                  placeholder="Middle Name"
                  onChange={handleChange}
                />
                <input
                  name="last_name"
                  className="lr-input"
                  placeholder="Last Name"
                  required
                  onChange={handleChange}
                />
                <input
                  name="birthday"
                  className="lr-input"
                  type="date"
                  onChange={handleChange}
                />
                <input
                  name="contact_num"
                  className="lr-input"
                  placeholder="Contact Number"
                  onChange={handleChange}
                />
                <input
                  name="blood_type"
                  className="lr-input"
                  placeholder="Blood Type"
                  onChange={handleChange}
                />
                <input
                  name="contact_person"
                  className="lr-input"
                  placeholder="Contact Person"
                  onChange={handleChange}
                />
                <input
                  name="contact_person_rs"
                  className="lr-input"
                  placeholder="Relationship"
                  onChange={handleChange}
                />
                <input
                  name="contact_person_num"
                  className="lr-input"
                  placeholder="Contact Person Number"
                  onChange={handleChange}
                />
                <input
                  name="address"
                  className="lr-input"
                  placeholder="Address"
                  onChange={handleChange}
                />
              </div>
            )}

            <input
              name="email"
              type="email"
              className="lr-input lr-pulse"
              placeholder="E-mail"
              required
              onChange={handleChange}
            />
            <input
              name="password"
              type="password"
              className="lr-input lr-pulse"
              placeholder="Password"
              required
              onChange={handleChange}
            />

            <button type="submit" className="lr-submit">
              {isRegister ? "Register" : "Login"}
            </button>
          </form>

          <div className="lr-switch">
            <span className="lr-text">
              {isRegister ? "Already have an account?" : "No account?"}
            </span>
            <button
              className="lr-link"
              type="button"
              onClick={() => setIsRegister(!isRegister)}
            >
              {isRegister ? "Login" : "Register"}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
