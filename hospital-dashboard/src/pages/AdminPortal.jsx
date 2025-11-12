import React, { useState } from "react";
import client from "../api"; // axios instance from earlier

export default function AdminPortal() {
  const [form, setForm] = useState({ name: "", age: "", doctor: "" });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg(null);

    if (!form.name) {
      setMsg({ type: "error", text: "Please enter a patient name." });
      return;
    }

    setLoading(true);
    try {
      // Build payload in the shape your backend expects
      const patientId = `p-${Date.now()}`; // or compute / let admin enter
      const payload = {
        patientId,
        patient: {
          name: form.name,
          age: Number(form.age) || null,
          doctor: form.doctor || null
        },
        identity: "admin" // many endpoints need identity query/body as earlier
      };

      // POST to /patients (Vite proxies /api -> http://localhost:4000)
      const resp = await client.post("/patients", payload);

      setMsg({ type: "success", text: `Request succeeded: ${resp.data?.success ? "Saved" : JSON.stringify(resp.data)}` });
      setForm({ name: "", age: "", doctor: "" });
    } catch (err) {
      console.error("Add patient error:", err);
      // try to extract server message from axios error
      let serverMsg = "Unknown error";
      if (err?.response?.data) serverMsg = JSON.stringify(err.response.data);
      else if (err?.message) serverMsg = err.message;

      setMsg({ type: "error", text: `Add failed: ${serverMsg}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Admin Portal</h2>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow space-y-4 max-w-md">
        <input type="text" name="name" placeholder="Patient Name" value={form.name} onChange={handleChange} className="border p-2 w-full rounded" />
        <input type="number" name="age" placeholder="Age" value={form.age} onChange={handleChange} className="border p-2 w-full rounded" />
        <input type="text" name="doctor" placeholder="Assign Doctor (optional)" value={form.doctor} onChange={handleChange} className="border p-2 w-full rounded" />

        <div className="flex items-center space-x-3">
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" disabled={loading}>
            {loading ? "Adding..." : "Add Patient"}
          </button>
          {msg && (
            <div className={`px-3 py-2 rounded text-sm ${msg.type === "error" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}>
              {msg.text}
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
