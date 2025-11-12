// src/pages/DoctorPortal.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import client from "../api";

/**
 * DoctorPortal
 * - Enter a doctor id (e.g. "doc001") and click "Load Patients"
 * - Tries server endpoint: GET /doctor/patients?doctorId=<id>
 * - Falls back to client-side filtering of /patients if server returns 404 or no endpoint exists
 * - Patient names are links to /patient/:id
 * - Shows a friendly note / loading state
 */

export default function DoctorPortal() {
  const [doctorId, setDoctorId] = useState("");
  const [assignedPatients, setAssignedPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState("");

  const fetchAssigned = async () => {
    const id = (doctorId || "").trim();
    if (!id) {
      setNote("Please enter a doctor id (e.g. doc001) to load assigned patients.");
      setAssignedPatients([]);
      return;
    }

    setLoading(true);
    setNote("");
    setAssignedPatients([]);

    // First try server-side endpoint
    try {
      const url = `/doctor/patients?doctorId=${encodeURIComponent(id)}`;
      const resp = await client.get(url);
      // server may return an array or a paging object
      let list = [];
      if (Array.isArray(resp.data)) list = resp.data;
      else if (resp.data && Array.isArray(resp.data.patients)) list = resp.data.patients;
      else if (resp.data && Array.isArray(resp.data.data)) list = resp.data.data;
      else if (resp.data && resp.data.total !== undefined && Array.isArray(resp.data.patients)) list = resp.data.patients;
      else if (resp.data && resp.data.id) list = [resp.data];

      setAssignedPatients(list);
      if (list.length === 0) setNote("No patients returned from server for that doctor.");
      setLoading(false);
      return;
    } catch (err) {
      const status = err?.response?.status;
      // if 404, treat as missing endpoint and fall through to client-side fallback
      if (status && status !== 404) {
        setNote(`Server error: ${err?.response?.data || err?.message}`);
        setLoading(false);
        return;
      }
    }

    // Fallback: client-side filter from /patients
    try {
      const resp = await client.get("/patients");
      let all = [];
      if (Array.isArray(resp.data)) all = resp.data;
      else if (resp.data && Array.isArray(resp.data.patients)) all = resp.data.patients;
      else if (resp.data && Array.isArray(resp.data.data)) all = resp.data.data;
      else if (resp.data && resp.data.id) all = [resp.data];

      const filtered = all.filter((p) => {
        if (!p) return false;
        const doctorVals = [
          p.doctor,
          p.doctorId,
          p.patient?.doctor,
          p.patient?.doctorId,
        ];
        return doctorVals.some((dv) => dv && String(dv).toLowerCase() === id.toLowerCase());
      });

      setAssignedPatients(filtered);
      if (filtered.length === 0) setNote("No patients found for that doctor (client-side filter).");
    } catch (err) {
      setNote(`Could not load patients: ${err?.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  // safe helper to get a stable key for list items
  const patientKey = (p, idx) => p?.id || p?.patientId || p?.patient?.id || `${p?.name || "p"}-${idx}`;

  // helper to show last-record timestamp
  const lastRecordTime = (p) => {
    const records = p.records || p.patient?.records || [];
    if (!Array.isArray(records) || records.length === 0) return "No records";
    // choose latest by ts/sourceTs/time if available
    const latest = records.slice().sort((a, b) => {
      const ta = new Date(a.ts || a.sourceTs || a.time || 0).getTime();
      const tb = new Date(b.ts || b.sourceTs || b.time || 0).getTime();
      return tb - ta;
    })[0];
    try {
      return new Date(latest.ts || latest.sourceTs || latest.time).toLocaleString();
    } catch {
      return "Unknown time";
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Doctor Portal</h2>

      <div className="mb-4 flex items-center gap-3">
        <input
          value={doctorId}
          onChange={(e) => setDoctorId(e.target.value)}
          placeholder="Enter doctor id (e.g. doc001)"
          className="border p-2 rounded w-64"
        />
        <button
          onClick={fetchAssigned}
          className="bg-blue-600 text-white px-3 py-2 rounded disabled:opacity-60"
          disabled={loading}
        >
          {loading ? "Loading..." : "Load Patients"}
        </button>
        <button
          onClick={() => { setDoctorId(""); setAssignedPatients([]); setNote(""); }}
          className="ml-2 px-3 py-2 border rounded text-sm"
        >
          Clear
        </button>
      </div>

      {note && <div className="mb-4 text-sm text-gray-600">{note}</div>}

      {assignedPatients.length === 0 && !loading ? (
        <p className="text-gray-600">No assigned patients to show.</p>
      ) : (
        <ul className="space-y-3">
          {assignedPatients.map((p, idx) => {
            const id = p?.id || p?.patientId || p?.patient?.id || `unknown-${idx}`;
            const name = p?.name || p?.patient?.name || "Unnamed";
            return (
              <li key={patientKey(p, idx)} className="p-4 bg-white shadow rounded-2xl">
                <h3 className="font-semibold mb-1">
                  <Link to={`/patient/${encodeURIComponent(id)}`} className="text-blue-600 hover:underline">
                    {name}
                  </Link>
                </h3>
                <div className="text-sm text-gray-700 space-y-1">
                  <div>Prescription: {p.prescription || "—"}</div>
                  <div>Next Visit: {p.nextVisit || "—"}</div>
                  <div>Last record: {lastRecordTime(p)}</div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
