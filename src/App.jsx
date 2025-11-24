import React from "react";
import { Routes, Route } from "react-router-dom";
import LoginRegister from "./pages/LoginRegister";
import Dashboard from "./pages/Dashboard";
import Requests from "./pages/Requests";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginRegister />} />
      <Route path="/dashboard" element={<Requests />} />
    </Routes>
  );
}

export default App;
