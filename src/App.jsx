import React from "react";
import { Routes, Route } from "react-router-dom";
import LoginRegister from "./pages/LoginRegister";
import Dashboard from "./pages/Dashboard";
import Requests from "./pages/Requests";
import MedicalHistory from "./pages/MedicalHistory";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginRegister />} />
      <Route path="/dashboard" element={<Requests />} />
      <Route path="/medical-history" element={<MedicalHistory />} />
    </Routes>
  );
}

export default App;
