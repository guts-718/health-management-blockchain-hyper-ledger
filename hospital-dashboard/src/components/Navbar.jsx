// src/components/NavBar.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function NavBar() {
  return (
    <nav className="bg-blue-600 text-white p-4 flex justify-between rounded-b-2xl">
      <h1 className="font-bold text-xl">🏥 HospitalLedger</h1>
      <div className="space-x-4">
        <Link to="/" className="hover:text-gray-200">Dashboard</Link>
        <Link to="/doctor" className="hover:text-gray-200">Doctor Portal</Link>
        <Link to="/patient" className="hover:text-gray-200">Patient Portal</Link>
      </div>
    </nav>
  );
}
