// // src/pages/Dashboard.jsx
// import React, { useEffect, useState } from "react";
// import VitalChart from "../components/VitalChart";
// import { Link } from "react-router-dom";
// import client from "../api";

// /**
//  * Dashboard
//  * - robustly handles API shapes:
//  *    - /patients may return an array OR { total, patients: [...] }
//  *    - /iotdata may return an array OR { data: [...] }
//  * - patient names link to /patient/:id
//  * - each patient card shows a latest-record summary when available
//  */

// export default function Dashboard() {
//   const [patients, setPatients] = useState([]);
//   const [vitals, setVitals] = useState([]);
//   const [loadingPatients, setLoadingPatients] = useState(true);
//   const [loadingVitals, setLoadingVitals] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     let cancelled = false;

//     async function loadPatients() {
//       setLoadingPatients(true);
//       try {
//         const r = await client.get("/patients");
//         // support multiple response shapes
//         let all = [];
//         if (Array.isArray(r.data)) {
//           all = r.data;
//         } else if (r.data && Array.isArray(r.data.patients)) {
//           all = r.data.patients;
//         } else if (r.data && Array.isArray(r.data.data)) {
//           // fallback if API wraps in { data: [...] }
//           all = r.data.data;
//         } else {
//           // if single patient object returned
//           if (r.data && r.data.id) all = [r.data];
//         }

//         if (!cancelled) setPatients(all);
//       } catch (e) {
//         console.error("fetch patients", e);
//         if (!cancelled) {
//           setPatients([]);
//           setError("Failed to load patients");
//         }
//       } finally {
//         if (!cancelled) setLoadingPatients(false);
//       }
//     }

//     async function loadVitals() {
//       setLoadingVitals(true);
//       try {
//         const r = await client.get("/iotdata");
//         let d = [];
//         if (Array.isArray(r.data)) d = r.data;
//         else if (r.data && Array.isArray(r.data.data)) d = r.data.data;
//         else if (r.data && Array.isArray(r.data.iot)) d = r.data.iot;
//         if (!cancelled) setVitals(d);
//       } catch (e) {
//         console.warn("no iotdata", e);
//         if (!cancelled) setVitals([]);
//       } finally {
//         if (!cancelled) setLoadingVitals(false);
//       }
//     }

//     loadPatients();
//     loadVitals();

//     return () => {
//       cancelled = true;
//     };
//   }, []);

//   // helper: extract latest record from patient object
//   function latestRecordFor(p) {
//     const records = p.records || p.patient?.records || [];
//     if (!Array.isArray(records) || records.length === 0) return null;
//     // pick the record with latest ts / sourceTs if available
//     const sorted = records.slice().sort((a, b) => {
//       const ta = new Date(a.ts || a.sourceTs || 0).getTime();
//       const tb = new Date(b.ts || b.sourceTs || 0).getTime();
//       return tb - ta;
//     });
//     return sorted[0];
//   }

//   return (
//     <div className="p-6">
//       <div className="flex items-center justify-between mb-6">
//         <h2 className="text-2xl font-bold">Patient Dashboard</h2>
//         <div className="text-sm text-gray-600">
//           {loadingPatients ? "Loading patients..." : `${patients.length} patient(s)`}
//         </div>
//       </div>

//       <div className="mb-6">
//         <div className="bg-white p-4 rounded-2xl shadow">
//           <h3 className="text-lg font-semibold mb-3">Live Vitals Overview</h3>
//           {loadingVitals ? (
//             <div className="text-sm text-gray-600">Loading vitals…</div>
//           ) : vitals.length === 0 ? (
//             <div className="text-sm text-gray-600">No IoT data available</div>
//           ) : (
//             <VitalChart data={vitals} />
//           )}
//         </div>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//         {error && (
//           <div className="col-span-full text-red-600">{error}</div>
//         )}

//         {!loadingPatients && patients.length === 0 && (
//           <div className="col-span-full text-gray-600">No patients found.</div>
//         )}

//         {patients.map((p) => {
//           // normalize fields
//           const id = p.id || p.patientId || p.patient?.id || `${p.name}-${p.age}`;
//           const name = p.name || p.patient?.name || "Unnamed";
//           const age = p.age || p.patient?.age || "—";
//           const doctor = p.doctor || p.patient?.doctor || "—";
//           const recordsCount = Array.isArray(p.records)
//             ? p.records.length
//             : Array.isArray(p.patient?.records)
//             ? p.patient.records.length
//             : 0;

//           const latest = latestRecordFor(p);

//           return (
//             <div key={id} className="p-4 bg-white rounded-2xl shadow">
//               <h3 className="font-semibold mb-1">
//                 <Link
//                   to={`/patient/${encodeURIComponent(id)}`}
//                   className="text-blue-600 hover:underline"
//                 >
//                   {name}
//                 </Link>
//               </h3>

//               <div className="text-sm text-gray-600 mb-2">
//                 Age: {age} • Doctor: {doctor}
//               </div>

//               {latest ? (
//                 <div className="text-sm space-y-1">
//                   <div>
//                     <span className="font-medium">Latest:</span>{" "}
//                     <span className="text-gray-700">
//                       {new Date(latest.ts || latest.sourceTs || Date.now()).toLocaleString()}
//                     </span>
//                   </div>
//                   <div>BP: {latest.bp ?? "—"}</div>
//                   <div>Sugar: {latest.sugar ?? "—"}</div>
//                   <div>Temp: {latest.temperature ?? "—"} °C</div>
//                 </div>
//               ) : (
//                 <div className="text-sm text-gray-500">No records yet</div>
//               )}

//               <div className="mt-3 flex items-center justify-between">
//                 <Link
//                   to={`/patient/${encodeURIComponent(id)}`}
//                   className="text-xs text-white bg-blue-600 px-3 py-1 rounded hover:bg-blue-700"
//                 >
//                   View
//                 </Link>
//                 <div className="text-xs text-gray-500">Records: {recordsCount}</div>
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// }


// // src/pages/Dashboard.jsx
// import React, { useEffect, useState } from "react";
// import VitalChart from "../components/VitalChart";
// import { Link } from "react-router-dom";
// import client from "../api";

// /**
//  * Dashboard (merged with Admin form)
//  * - Top: Admin form to add a patient
//  * - Below: live vitals chart + grid of patients (clickable names -> /patient/:id)
//  */

// export default function Dashboard() {
//   // page data
//   const [patients, setPatients] = useState([]);
//   const [vitals, setVitals] = useState([]);

//   // admin form state
//   const [form, setForm] = useState({
//     patientId: "",
//     name: "",
//     age: "",
//     doctor: "",
//     identity: "admin", // default value; change if needed
//   });
//   const [adding, setAdding] = useState(false);
//   const [message, setMessage] = useState(null);

//   // load patients + iotdata
//   useEffect(() => {
//     let mounted = true;

//     const load = async () => {
//       try {
//         const r = await client.get("/patients");
//         if (!mounted) return;
//         const all = Array.isArray(r.data) ? r.data : r.data?.patients || [];
//         setPatients(all);
//       } catch (err) {
//         console.warn("fetch patients err", err);
//         setPatients([]);
//       }

//       try {
//         const r2 = await client.get("/iotdata"); // adjust endpoint if your backend differs
//         if (!mounted) return;
//         const i = Array.isArray(r2.data) ? r2.data : r2.data?.data || [];
//         setVitals(i);
//       } catch (err) {
//         console.warn("fetch iotdata err", err);
//         setVitals([]);
//       }
//     };

//     load();
//     return () => {
//       mounted = false;
//     };
//   }, []);


//   // input: records: array of { bp: "115/75", sugar: 92, temperature: 36.6, ts: "2025-11-11T18:36:40.000Z", ... }
// function recordsToChartData(records = []) {
//   return (records || [])
//     .map((r) => {
//       let systolic, diastolic;
//       if (r.bp && typeof r.bp === "string") {
//         const parts = r.bp.split("/").map((s) => s.trim());
//         const sVal = parseInt(parts[0], 10);
//         const dVal = parseInt(parts[1], 10);
//         if (!Number.isNaN(sVal)) systolic = sVal;
//         if (!Number.isNaN(dVal)) diastolic = dVal;
//       }
//       // prefer r.ts, fallback to r.time or r.sourceTs
//       const ts = r.ts || r.time || r.sourceTs || r.timestamp;
//       return {
//         ts,
//         temperature: r.temperature !== undefined ? Number(r.temperature) : undefined,
//         sugar: r.sugar !== undefined ? Number(r.sugar) : undefined,
//         systolic,
//         diastolic,
//         deviceId: r.deviceId,
//         raw: r,
//       };
//     })
//     .filter((p) => p.ts) // only points with a timestamp
//     .sort((a, b) => new Date(a.ts) - new Date(b.ts));
// }

//   // helper: update form fields
//   const setField = (k, v) => setForm((s) => ({ ...s, [k]: v }));

//   // create a patientId if not provided
//   const makePatientId = (name) => {
//     if (!name) return `patient_${Date.now()}`;
//     const slug = String(name).trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
//     return `${slug}-${Date.now().toString().slice(-5)}`;
//   };

//   // submit admin form
//   const handleAddPatient = async (ev) => {
//     ev.preventDefault();
//     setMessage(null);

//     const name = (form.name || "").trim();
//     const ageVal = form.age === "" ? "" : Number(form.age);
//     const doctor = (form.doctor || "").trim();
//     if (!name || !ageVal) {
//       setMessage({ type: "error", text: "Name and age are required." });
//       return;
//     }

//     const patientIdToUse = form.patientId && form.patientId.trim() ? form.patientId.trim() : makePatientId(name);
//     const payload = {
//       // backend in this project expects { patientId, patient: { name, age, doctor }, identity }
//       patientId: patientIdToUse,
//       patient: { name, age: ageVal, doctor },
//       identity: form.identity || undefined,
//     };

//     setAdding(true);
//     setMessage({ type: "info", text: "Adding patient..." });

//     try {
//       const resp = await client.post("/patients", payload);
//       // some backends return { success: true, patient: {...} } while others return the patient directly
//       const returnedPatient = resp?.data?.patient || resp?.data || null;

//       // optimistic UI update: add to front of list if we can extract id
//       if (returnedPatient && (returnedPatient.id || returnedPatient.patientId || returnedPatient.patient?.id)) {
//         const normalized = {
//           id: returnedPatient.id || returnedPatient.patientId || returnedPatient.patient?.id || patientIdToUse,
//           name: returnedPatient.name || returnedPatient.patient?.name || name,
//           age: returnedPatient.age || returnedPatient.patient?.age || ageVal,
//           doctor: returnedPatient.doctor || returnedPatient.patient?.doctor || doctor,
//           records: returnedPatient.records || returnedPatient.patient?.records || [],
//         };
//         setPatients((prev) => [normalized, ...prev]);
//       } else {
//         // if backend doesn't return patient, reload the list
//         try {
//           const r = await client.get("/patients");
//           const all = Array.isArray(r.data) ? r.data : r.data?.patients || [];
//           setPatients(all);
//         } catch (err) {
//           // ignore
//         }
//       }

//       setMessage({ type: "success", text: `Patient added (${patientIdToUse}).` });
//       setForm({ patientId: "", name: "", age: "", doctor: "", identity: form.identity }); // keep identity
//     } catch (err) {
//       const errText = err?.response?.data?.error || err?.response?.data || err?.message || String(err);
//       setMessage({ type: "error", text: `Add failed: ${errText}` });
//     } finally {
//       setAdding(false);
//       // remove info message after a short while
//       setTimeout(() => {
//         setMessage((m) => (m && m.type === "info" ? null : m));
//       }, 1500);
//     }
//   };

//   return (
//     <div>
//       <h2 className="text-2xl font-bold mb-4">Patient Dashboard & Admin</h2>

//       {/* ===== Admin form (top) ===== */}
//       <div className="bg-white p-4 rounded-2xl shadow mb-6">
//         <h3 className="font-semibold mb-3">Add new patient (Admin)</h3>

//         <form onSubmit={handleAddPatient} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
//           <div className="md:col-span-1">
//             <label className="text-sm block mb-1">Patient ID (optional)</label>
//             <input
//               value={form.patientId}
//               onChange={(e) => setField("patientId", e.target.value)}
//               placeholder="patient1 (auto if blank)"
//               className="border p-2 rounded w-full"
//             />
//           </div>

//           <div className="md:col-span-1">
//             <label className="text-sm block mb-1">Name</label>
//             <input
//               value={form.name}
//               onChange={(e) => setField("name", e.target.value)}
//               placeholder="Full name"
//               className="border p-2 rounded w-full"
//               required
//             />
//           </div>

//           <div className="md:col-span-1">
//             <label className="text-sm block mb-1">Age</label>
//             <input
//               value={form.age}
//               onChange={(e) => setField("age", e.target.value)}
//               type="number"
//               placeholder="Age"
//               className="border p-2 rounded w-full"
//               required
//             />
//           </div>

//           <div className="md:col-span-1">
//             <label className="text-sm block mb-1">Doctor ID</label>
//             <input
//               value={form.doctor}
//               onChange={(e) => setField("doctor", e.target.value)}
//               placeholder="doc001"
//               className="border p-2 rounded w-full"
//             />
//           </div>

//           <div className="md:col-span-2">
//             <label className="text-sm block mb-1">Identity (wallet name)</label>
//             <input
//               value={form.identity}
//               onChange={(e) => setField("identity", e.target.value)}
//               placeholder="admin"
//               className="border p-2 rounded w-full"
//             />
//           </div>

//           <div className="md:col-span-2 flex gap-2">
//             <button
//               type="submit"
//               disabled={adding}
//               className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-60"
//             >
//               {adding ? "Adding..." : "Add Patient"}
//             </button>

//             <button
//               type="button"
//               onClick={() => setForm({ patientId: "", name: "", age: "", doctor: "", identity: form.identity })}
//               className="px-4 py-2 border rounded"
//             >
//               Clear
//             </button>

//             <div className="ml-2 text-sm self-center">
//               {message && (
//                 <span className={message.type === "error" ? "text-red-600" : message.type === "success" ? "text-green-600" : "text-gray-600"}>
//                   {message.text}
//                 </span>
//               )}
//             </div>
//           </div>
//         </form>
//       </div>

//       {/* ===== Live vitals chart ===== */}
//       <div className="mb-6">
//         <VitalChart data={vitals} />
//       </div>

//       {/* ===== Patients list ===== */}
//       <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
//         {patients.length === 0 ? (
//           <div className="text-gray-600">No patients found.</div>
//         ) : (
//           patients.map((p) => {
//             const id = p.id || p.patientId || p.patient?.id || `${p.name || "unknown"}-${Math.random().toString(36).slice(2, 7)}`;
//             const name = p.name || p.patient?.name || "Unnamed";
//             const age = p.age || p.patient?.age || "—";
//             const doctor = p.doctor || p.patient?.doctor || "—";
//             const recordsCount = Array.isArray(p.records) ? p.records.length : (Array.isArray(p.patient?.records) ? p.patient.records.length : 0);

//             return (
//               <div key={id} className="p-4 bg-white rounded-2xl shadow">
//                 <h3 className="font-semibold">
//                   <Link to={`/patient/${encodeURIComponent(id)}`} className="text-blue-600 hover:underline">
//                     {name}
//                   </Link>
//                 </h3>
//                 <p>Age: {age}</p>
//                 <p>Doctor: {doctor}</p>
//                 <p>Records: {recordsCount}</p>
//               </div>
//             );
//           })
//         )}
//       </div>
//     </div>
//   );
// }

// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import VitalChart from "../components/VitalChart";
import { Link } from "react-router-dom";
import client from "../api";

/**
 * Dashboard (merged with Admin form)
 * - Top: Admin form to add a patient
 * - Below: live vitals chart + grid of patients (clickable names -> /patient/:id)
 */

export default function Dashboard() {
  // page data
  const [patients, setPatients] = useState([]);
  const [vitals, setVitals] = useState([]);

  // admin form state
  const [form, setForm] = useState({
    patientId: "",
    name: "",
    age: "",
    doctor: "",
    identity: "admin", // default value; change if needed
  });
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState(null);

  // load patients + iotdata
  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const r = await client.get("/patients");
        if (!mounted) return;
        const all = Array.isArray(r.data) ? r.data : r.data?.patients || [];
        setPatients(all);
      } catch (err) {
        console.warn("fetch patients err", err);
        setPatients([]);
      }

      try {
        const r2 = await client.get("/iotdata"); // adjust endpoint if your backend differs
        if (!mounted) return;
        const i = Array.isArray(r2.data) ? r2.data : r2.data?.data || [];
        setVitals(i);
      } catch (err) {
        console.warn("fetch iotdata err", err);
        setVitals([]);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  // input: records: array of { bp: "115/75", sugar: 92, temperature: 36.6, ts: "2025-11-11T18:36:40.000Z", ... }
  function recordsToChartData(records = []) {
    return (records || [])
      .map((r) => {
        let systolic, diastolic;
        if (r.bp && typeof r.bp === "string") {
          const parts = r.bp.split("/").map((s) => s.trim());
          const sVal = parseInt(parts[0], 10);
          const dVal = parseInt(parts[1], 10);
          if (!Number.isNaN(sVal)) systolic = sVal;
          if (!Number.isNaN(dVal)) diastolic = dVal;
        }
        // prefer r.ts, fallback to r.time or r.sourceTs
        const ts = r.ts || r.time || r.sourceTs || r.timestamp;
        return {
          ts,
          // keep original ts field name so VitalChart or downstream code can format it
          temperature: r.temperature !== undefined ? Number(r.temperature) : undefined,
          sugar: r.sugar !== undefined ? Number(r.sugar) : undefined,
          systolic,
          diastolic,
          deviceId: r.deviceId,
          raw: r,
        };
      })
      .filter((p) => p.ts) // only points with a timestamp
      .sort((a, b) => new Date(a.ts) - new Date(b.ts));
  }

  // helper: update form fields
  const setField = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  // create a patientId if not provided
  const makePatientId = (name) => {
    if (!name) return `patient_${Date.now()}`;
    const slug = String(name).trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    return `${slug}-${Date.now().toString().slice(-5)}`;
  };

  // submit admin form
  const handleAddPatient = async (ev) => {
    ev.preventDefault();
    setMessage(null);

    const name = (form.name || "").trim();
    const ageVal = form.age === "" ? "" : Number(form.age);
    const doctor = (form.doctor || "").trim();
    if (!name || !ageVal) {
      setMessage({ type: "error", text: "Name and age are required." });
      return;
    }

    const patientIdToUse = form.patientId && form.patientId.trim() ? form.patientId.trim() : makePatientId(name);
    const payload = {
      // backend in this project expects { patientId, patient: { name, age, doctor }, identity }
      patientId: patientIdToUse,
      patient: { name, age: ageVal, doctor },
      identity: form.identity || undefined,
    };

    setAdding(true);
    setMessage({ type: "info", text: "Adding patient..." });

    try {
      const resp = await client.post("/patients", payload);
      // some backends return { success: true, patient: {...} } while others return the patient directly
      const returnedPatient = resp?.data?.patient || resp?.data || null;

      // optimistic UI update: add to front of list if we can extract id
      if (returnedPatient && (returnedPatient.id || returnedPatient.patientId || returnedPatient.patient?.id)) {
        const normalized = {
          id: returnedPatient.id || returnedPatient.patientId || returnedPatient.patient?.id || patientIdToUse,
          name: returnedPatient.name || returnedPatient.patient?.name || name,
          age: returnedPatient.age || returnedPatient.patient?.age || ageVal,
          doctor: returnedPatient.doctor || returnedPatient.patient?.doctor || doctor,
          records: returnedPatient.records || returnedPatient.patient?.records || [],
        };
        setPatients((prev) => [normalized, ...prev]);
      } else {
        // if backend doesn't return patient, reload the list
        try {
          const r = await client.get("/patients");
          const all = Array.isArray(r.data) ? r.data : r.data?.patients || [];
          setPatients(all);
        } catch (err) {
          // ignore
        }
      }

      setMessage({ type: "success", text: `Patient added (${patientIdToUse}).` });
      setForm({ patientId: "", name: "", age: "", doctor: "", identity: form.identity }); // keep identity
    } catch (err) {
      const errText = err?.response?.data?.error || err?.response?.data || err?.message || String(err);
      setMessage({ type: "error", text: `Add failed: ${errText}` });
    } finally {
      setAdding(false);
      // remove info message after a short while (but keep success/error visible)
      setTimeout(() => {
        setMessage((m) => (m && m.type === "info" ? null : m));
      }, 1500);
    }
  };

  // convenience: render chart data for a highlighted patient or aggregated vitals
  // Use vitals (global IoT stream) for live chart if available; fallback to first patient's records.
  const chartData = (() => {
    if (Array.isArray(vitals) && vitals.length > 0) return vitals;
    if (Array.isArray(patients) && patients.length > 0) {
      // if patients list contains records, pick first patient's records to show small chart
      const p = patients[0];
      const recs = p.records || p.patient?.records || p.patient?.records || [];
      return recordsToChartData(recs);
    }
    return [];
  })();

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Patient Dashboard & Admin</h2>

      {/* ===== Admin form (top) ===== */}
      <div className="bg-white p-4 rounded-2xl shadow mb-6">
        <h3 className="font-semibold mb-3">Add new patient (Admin)</h3>

        <form onSubmit={handleAddPatient} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
          <div className="md:col-span-1">
            <label className="text-sm block mb-1">Patient ID (optional)</label>
            <input
              value={form.patientId}
              onChange={(e) => setField("patientId", e.target.value)}
              placeholder="patient1 (auto if blank)"
              className="border p-2 rounded w-full"
            />
          </div>

          <div className="md:col-span-1">
            <label className="text-sm block mb-1">Name</label>
            <input
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              placeholder="Full name"
              className="border p-2 rounded w-full"
              required
            />
          </div>

          <div className="md:col-span-1">
            <label className="text-sm block mb-1">Age</label>
            <input
              value={form.age}
              onChange={(e) => setField("age", e.target.value)}
              type="number"
              placeholder="Age"
              className="border p-2 rounded w-full"
              required
            />
          </div>

          <div className="md:col-span-1">
            <label className="text-sm block mb-1">Doctor ID</label>
            <input
              value={form.doctor}
              onChange={(e) => setField("doctor", e.target.value)}
              placeholder="doc001"
              className="border p-2 rounded w-full"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-sm block mb-1">Identity (wallet name)</label>
            <input
              value={form.identity}
              onChange={(e) => setField("identity", e.target.value)}
              placeholder="admin"
              className="border p-2 rounded w-full"
            />
          </div>

          <div className="md:col-span-2 flex gap-2">
            <button
              type="submit"
              disabled={adding}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-60"
            >
              {adding ? "Adding..." : "Add Patient"}
            </button>

            <button
              type="button"
              onClick={() => setForm({ patientId: "", name: "", age: "", doctor: "", identity: form.identity })}
              className="px-4 py-2 border rounded"
            >
              Clear
            </button>

            <div className="ml-2 text-sm self-center">
              {message && (
                <span
                  className={
                    message.type === "error"
                      ? "text-red-600"
                      : message.type === "success"
                      ? "text-green-600"
                      : "text-gray-600"
                  }
                >
                  {message.text}
                </span>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* ===== Live vitals chart ===== */}
      <div className="mb-6">
        <VitalChart data={chartData} />
      </div>

      {/* ===== Patients list ===== */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {patients.length === 0 ? (
          <div className="text-gray-600">No patients found.</div>
        ) : (
          patients.map((p) => {
            const id = p.id || p.patientId || p.patient?.id || `${(p.name || "unknown").replace(/\s+/g, "-")}-${Math.random().toString(36).slice(2, 7)}`;
            const name = p.name || p.patient?.name || "Unnamed";
            const age = p.age || p.patient?.age || "—";
            const doctor = p.doctor || p.patient?.doctor || "—";
            const recordsCount = Array.isArray(p.records) ? p.records.length : (Array.isArray(p.patient?.records) ? p.patient.records.length : 0);

            return (
              <div key={id} className="p-4 bg-white rounded-2xl shadow">
                <h3 className="font-semibold">
                  <Link to={`/patient/${encodeURIComponent(id)}`} className="text-blue-600 hover:underline">
                    {name}
                  </Link>
                </h3>
                <p>Age: {age}</p>
                <p>Doctor: {doctor}</p>
                <p>Records: {recordsCount}</p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
