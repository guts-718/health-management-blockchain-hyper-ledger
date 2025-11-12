// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar";
import Dashboard from "./pages/Dashboard";
import DoctorPortal from "./pages/DoctorPortal";
import AdminPortal from "./pages/AdminPortal";
import PatientDetails from "./pages/PatientDetails";
import PatientPortal from "./pages/PatientPortal"; // <-- new





export default function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <div className="p-6">
        
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/doctor" element={<DoctorPortal />} />
          <Route path="/admin" element={<AdminPortal />} />
          <Route path="/patient" element={<PatientPortal />} />    {/* patient page */}
          <Route path="/patient/:id" element={<PatientDetails />} /> {/* also support direct link */}
        </Routes>
      </div>
    </BrowserRouter>
  );
}
