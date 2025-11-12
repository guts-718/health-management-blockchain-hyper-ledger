// // // src/pages/PatientDetail.jsx
// // import React, { useEffect, useState } from "react";
// // import { useParams, Link } from "react-router-dom";
// // import client from "../api";
// // import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

// // function transformRecordsToSeries(records = []) {
// //   // keep last 50 records, map ts -> time, pick sugar & temperature
// //   const sorted = [...records].sort((a, b) => new Date(a.ts || a.time) - new Date(b.ts || b.time));
// //   const slice = sorted.slice(-50);
// //   return slice.map((r) => {
// //     const t = r.ts || r.time || r.sourceTs || "";
// //     const dt = t ? new Date(t) : new Date();
// //     const timeLabel = dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
// //     return {
// //       time: timeLabel,
// //       temperature: r.temperature != null ? Number(r.temperature) : null,
// //       sugar: r.sugar != null ? Number(r.sugar) : null,
// //       bp: r.bp || ""
// //     };
// //   });
// // }

// // export default function PatientDetail() {
// //   const { id } = useParams();
// //   const [patient, setPatient] = useState(null);
// //   const [records, setRecords] = useState([]);
// //   const [loading, setLoading] = useState(true);

// //   useEffect(() => {
// //     async function load() {
// //       setLoading(true);
// //       try {
// //         // call your API for patient detail — backend earlier supported GET /patients/{id}?identity=admin
// //         const resp = await client.get(`/patients/${encodeURIComponent(id)}?identity=admin`);
// //         // resp.data might be the patient object directly
// //         const p = resp.data;
// //         // if wrapped: e.g. { patient: {...} } handle it:
// //         const patientObj = p.patient || p || {};
// //         setPatient(patientObj);
// //         const recs = patientObj.records || [];
// //         setRecords(recs);
// //       } catch (e) {
// //         console.error("fetch patient", e);
// //         // fallback try listing and finding the patient
// //         try {
// //           const all = await client.get("/patients");
// //           const list = Array.isArray(all.data) ? all.data : all.data.patients || [];
// //           const found = list.find((x) => (x.id || x.patientId) === id || x.id === decodeURIComponent(id));
// //           setPatient(found || null);
// //           setRecords(found?.records || []);
// //         } catch (e2) {
// //           console.error("fallback failed", e2);
// //         }
// //       } finally {
// //         setLoading(false);
// //       }
// //     }
// //     load();
// //   }, [id]);

// //   const series = transformRecordsToSeries(records);

// //   return (
// //     <div>
// //       <div className="flex items-center justify-between mb-4">
// //         <h2 className="text-2xl font-bold">Patient Details</h2>
// //         <Link to="/" className="text-blue-600 hover:underline">Back to Dashboard</Link>
// //       </div>

// //       {loading ? (
// //         <div>Loading...</div>
// //       ) : !patient ? (
// //         <div>Patient not found.</div>
// //       ) : (
// //         <>
// //           <div className="p-4 bg-white rounded-2xl shadow mb-6">
// //             <h3 className="text-xl font-semibold">{patient.name || patient.patient?.name || "Unnamed"}</h3>
// //             <p>Id: {patient.id || patient.patientId || "—"}</p>
// //             <p>Age: {patient.age || patient.patient?.age || "—"}</p>
// //             <p>Doctor: {patient.doctor || patient.patient?.doctor || "—"}</p>
// //           </div>

// //           <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
// //             <div className="bg-white p-4 rounded-2xl shadow">
// //               <h4 className="font-semibold mb-2">Vitals Chart (Temperature + Sugar)</h4>
// //               {series.length === 0 ? (
// //                 <p>No vitals yet.</p>
// //               ) : (
// //                 <ResponsiveContainer width="100%" height={300}>
// //                   <LineChart data={series}>
// //                     <CartesianGrid strokeDasharray="3 3" />
// //                     <XAxis dataKey="time" />
// //                     <YAxis />
// //                     <Tooltip />
// //                     <Line type="monotone" dataKey="temperature" name="Temp (°C)" stroke="#ff7300" dot={false} />
// //                     <Line type="monotone" dataKey="sugar" name="Sugar" stroke="#387908" dot={false} />
// //                   </LineChart>
// //                 </ResponsiveContainer>
// //               )}
// //             </div>

// //             <div className="bg-white p-4 rounded-2xl shadow">
// //               <h4 className="font-semibold mb-2">Latest Records (most recent first)</h4>
// //               {records.length === 0 ? (
// //                 <p>No records.</p>
// //               ) : (
// //                 <div className="space-y-3 max-h-72 overflow-y-auto">
// //                   {[...records].slice().reverse().map((r, idx) => {
// //                     const ts = r.ts || r.time || r.sourceTs || "";
// //                     return (
// //                       <div key={idx} className="p-3 border rounded">
// //                         <div className="text-sm text-gray-600">{ts ? new Date(ts).toLocaleString() : "unknown time"}</div>
// //                         <div>BP: {r.bp || "—"}</div>
// //                         <div>Sugar: {r.sugar ?? "—"}</div>
// //                         <div>Temperature: {r.temperature ?? "—"} °C</div>
// //                         <div>Device: {r.deviceId || r.source || "—"}</div>
// //                       </div>
// //                     );
// //                   })}
// //                 </div>
// //               )}
// //             </div>
// //           </div>
// //         </>
// //       )}
// //     </div>
// //   );



// // }


// // src/pages/PatientDetail.jsx
// import React, { useEffect, useState, useCallback } from "react";
// import { useParams, Link } from "react-router-dom";
// import client from "../api";
// import {
//   LineChart,
//   Line,
//   CartesianGrid,
//   XAxis,
//   YAxis,
//   Tooltip,
//   ResponsiveContainer,
//   Legend,
// } from "recharts";

// /**
//  * Normalize records and prepare series for recharts.
//  * Will extract systolic/diastolic from bp string "120/80" when present.
//  */
// function normalizeRecords(records = []) {
//   if (!Array.isArray(records)) return [];
//   return records
//     .map((r) => {
//       // flexible timestamp extraction
//       const ts = r.ts || r.time || r.sourceTs || r.timestamp || r.date || null;
//       // parse bp
//       let systolic = null;
//       let diastolic = null;
//       if (r.bp && typeof r.bp === "string") {
//         const parts = r.bp.split("/").map((s) => s.trim());
//         const sVal = parseInt(parts[0], 10);
//         const dVal = parseInt(parts[1], 10);
//         if (!Number.isNaN(sVal)) systolic = sVal;
//         if (!Number.isNaN(dVal)) diastolic = dVal;
//       }
//       // other numeric fields
//       const temperature = r.temperature != null ? Number(r.temperature) : null;
//       const sugar = r.sugar != null ? Number(r.sugar) : null;
//       const heartRate = r.heartRate != null ? Number(r.heartRate) : null;

//       return {
//         raw: r,
//         ts,
//         date: ts ? new Date(ts) : null,
//         temperature,
//         sugar,
//         systolic,
//         diastolic,
//         heartRate,
//         deviceId: r.deviceId || r.source || null,
//       };
//     })
//     .filter((x) => x.date) // keep only items with a usable date
//     .sort((a, b) => a.date - b.date);
// }

// /**
//  * Prepare series for the chart (format time labels and pick numeric keys).
//  */
// function buildChartSeries(normalizedRecords = []) {
//   // keep last N points (avoid huge charts)
//   const maxPoints = 80;
//   const slice = normalizedRecords.slice(-maxPoints);
//   return slice.map((r) => ({
//     time: r.date ? r.date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "",
//     temperature: r.temperature,
//     sugar: r.sugar,
//     systolic: r.systolic,
//     diastolic: r.diastolic,
//     heartRate: r.heartRate,
//   }));
// }

// function computeSummary(normalized = []) {
//   if (!normalized.length) {
//     return { lastSeen: null, avgTemp: null, avgSugar: null, avgSys: null, avgDia: null, avgHR: null, total: 0 };
//   }
//   const lastSeen = normalized[normalized.length - 1].date;
//   const totals = normalized.reduce(
//     (acc, r) => {
//       if (r.temperature != null) { acc.tempSum += r.temperature; acc.tempCount++; }
//       if (r.sugar != null) { acc.sugarSum += r.sugar; acc.sugarCount++; }
//       if (r.systolic != null) { acc.sysSum += r.systolic; acc.sysCount++; }
//       if (r.diastolic != null) { acc.diaSum += r.diastolic; acc.diaCount++; }
//       if (r.heartRate != null) { acc.hrSum += r.heartRate; acc.hrCount++; }
//       return acc;
//     },
//     { tempSum: 0, tempCount: 0, sugarSum: 0, sugarCount: 0, sysSum: 0, sysCount: 0, diaSum: 0, diaCount: 0, hrSum: 0, hrCount: 0 }
//   );
//   return {
//     lastSeen,
//     avgTemp: totals.tempCount ? (totals.tempSum / totals.tempCount).toFixed(1) : null,
//     avgSugar: totals.sugarCount ? Math.round(totals.sugarSum / totals.sugarCount) : null,
//     avgSys: totals.sysCount ? Math.round(totals.sysSum / totals.sysCount) : null,
//     avgDia: totals.diaCount ? Math.round(totals.diaSum / totals.diaCount) : null,
//     avgHR: totals.hrCount ? Math.round(totals.hrSum / totals.hrCount) : null,
//     total: normalized.length,
//   };
// }

// export default function PatientDetail() {
//   const { id } = useParams();
//   const [patient, setPatient] = useState(null);
//   const [rawRecords, setRawRecords] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [errMsg, setErrMsg] = useState("");

//   const loadPatient = useCallback(async () => {
//     setLoading(true);
//     setErrMsg("");
//     setPatient(null);
//     setRawRecords([]);

//     try {
//       // Try direct detail endpoint first
//       const resp = await client.get(`/patients/${encodeURIComponent(id)}`);
//       const body = resp?.data;
//       // handle /patients/:id returning wrapped object or patient directly
//       const p = body?.patient || body;
//       if (p) {
//         setPatient(p);
//         const recs = p.records || p.patient?.records || [];
//         setRawRecords(Array.isArray(recs) ? recs : []);
//         setLoading(false);
//         return;
//       }
//     } catch (err) {
//       // swallow — we'll try fallback
//       // console.warn("detail endpoint failed:", err);
//     }

//     // fallback: list and find
//     try {
//       const all = await client.get("/patients");
//       const list = Array.isArray(all.data) ? all.data : all.data?.patients || [];
//       const found = list.find((x) => {
//         const candidateIds = [x.id, x.patientId, x.patient?.id, x.patient?.patientId].filter(Boolean).map(String);
//         return candidateIds.includes(String(id)) || candidateIds.includes(decodeURIComponent(id));
//       });
//       if (found) {
//         setPatient(found);
//         setRawRecords(found.records || found.patient?.records || []);
//       } else {
//         setErrMsg("Patient not found.");
//       }
//     } catch (err2) {
//       setErrMsg("Could not load patient: " + (err2?.message || String(err2)));
//     } finally {
//       setLoading(false);
//     }
//   }, [id]);

//   useEffect(() => {
//     loadPatient();
//   }, [loadPatient]);

//   const normalized = normalizeRecords(rawRecords);
//   const series = buildChartSeries(normalized);
//   const summary = computeSummary(normalized);

//   return (
//     <div>
//       <div className="flex items-center justify-between mb-4">
//         <h2 className="text-2xl font-bold">Patient Details</h2>
//         <div className="flex items-center gap-3">
//           <Link to="/" className="text-blue-600 hover:underline">Back to Dashboard</Link>
//           <button
//             onClick={loadPatient}
//             className="px-3 py-1 bg-gray-100 border rounded text-sm hover:bg-gray-200"
//             disabled={loading}
//           >
//             {loading ? "Refreshing..." : "Refresh"}
//           </button>
//         </div>
//       </div>

//       {loading ? (
//         <div>Loading...</div>
//       ) : errMsg ? (
//         <div className="text-red-600">{errMsg}</div>
//       ) : !patient ? (
//         <div>Patient not found.</div>
//       ) : (
//         <>
//           <div className="p-4 bg-white rounded-2xl shadow mb-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <h3 className="text-xl font-semibold">{patient.name || patient.patient?.name || "Unnamed"}</h3>
//                 <div className="text-sm text-gray-600">Id: {patient.id || patient.patientId || "—"}</div>
//                 <div className="text-sm text-gray-600">Age: {patient.age || patient.patient?.age || "—"}</div>
//                 <div className="text-sm text-gray-600">Doctor: {patient.doctor || patient.patient?.doctor || "—"}</div>
//               </div>

//               <div className="text-right">
//                 <div className="text-sm text-gray-500">Last seen</div>
//                 <div className="font-medium">
//                   {summary.lastSeen ? summary.lastSeen.toLocaleString() : "—"}
//                 </div>
//                 <div className="text-sm text-gray-500 mt-2">Records</div>
//                 <div className="font-medium">{summary.total}</div>
//               </div>
//             </div>

//             <div className="mt-3 flex gap-4 text-sm text-gray-700">
//               {summary.avgTemp != null && <div>Avg Temp: {summary.avgTemp} °C</div>}
//               {summary.avgSugar != null && <div>Avg Sugar: {summary.avgSugar}</div>}
//               {summary.avgSys != null && <div>Avg BP: {summary.avgSys}/{summary.avgDia}</div>}
//               {summary.avgHR != null && <div>Avg HR: {summary.avgHR}</div>}
//             </div>
//           </div>

//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
//             <div className="bg-white p-4 rounded-2xl shadow">
//               <h4 className="font-semibold mb-2">Vitals Chart</h4>

//               {series.length === 0 ? (
//                 <p>No vitals yet.</p>
//               ) : (
//                 <ResponsiveContainer width="100%" height={320}>
//                   <LineChart data={series}>
//                     <CartesianGrid strokeDasharray="3 3" />
//                     <XAxis dataKey="time" minTickGap={20} />
//                     <YAxis />
//                     <Tooltip />
//                     <Legend />
//                     {/* Temperature */}
//                     <Line type="monotone" dataKey="temperature" name="Temp (°C)" stroke="#ff7300" dot={false} />
//                     {/* Sugar */}
//                     <Line type="monotone" dataKey="sugar" name="Sugar" stroke="#387908" dot={false} />
//                     {/* Systolic/Diastolic */}
//                     <Line type="monotone" dataKey="systolic" name="Systolic" stroke="#1f77b4" dot={false} />
//                     <Line type="monotone" dataKey="diastolic" name="Diastolic" stroke="#9467bd" dot={false} />
//                     {/* Heart rate if present */}
//                     <Line type="monotone" dataKey="heartRate" name="HR" stroke="#e377c2" dot={false} />
//                   </LineChart>
//                 </ResponsiveContainer>
//               )}
//             </div>

//             <div className="bg-white p-4 rounded-2xl shadow">
//               <h4 className="font-semibold mb-2">Latest Records (most recent first)</h4>
//               {normalized.length === 0 ? (
//                 <p>No records.</p>
//               ) : (
//                 <div className="space-y-3 max-h-96 overflow-y-auto">
//                   {[...normalized].slice().reverse().map((r, idx) => {
//                     const key = `${r.ts || r.date?.toISOString() || idx}-${idx}`;
//                     return (
//                       <div key={key} className="p-3 border rounded">
//                         <div className="flex justify-between items-start">
//                           <div className="text-sm text-gray-600">{r.date ? r.date.toLocaleString() : "unknown time"}</div>
//                           <div className="text-xs text-gray-500">Device: {r.deviceId || "—"}</div>
//                         </div>

//                         <div className="mt-1">
//                           <div>BP: {r.systolic != null && r.diastolic != null ? `${r.systolic}/${r.diastolic}` : (r.raw.bp || "—")}</div>
//                           <div>Sugar: {r.sugar != null ? r.sugar : "—"}</div>
//                           <div>Temperature: {r.temperature != null ? `${r.temperature} °C` : "—"}</div>
//                           <div>Heart Rate: {r.heartRate != null ? `${r.heartRate} bpm` : "—"}</div>
//                         </div>
//                       </div>
//                     );
//                   })}
//                 </div>
//               )}
//             </div>
//           </div>
//         </>
//       )}
//     </div>
//   );
// }
// src/pages/PatientDetail.jsx
// src/pages/PatientDetail.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import client from "../api";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

/* sanitize ISO-like timestamps: truncate fractional seconds to milliseconds,
   replace space with T if user provided '2025-11-11 19:14:55.274748Z' style,
   remove stray characters if necessary */
function sanitizeTs(ts) {
  if (!ts) return ts;
  if (typeof ts !== "string") return ts;
  // normalize space separated date/time -> T
  let s = ts.replace(/\s+/g, "T");
  // truncate microseconds to milliseconds, keep timezone or Z
  s = s.replace(/(\.\d{3})\d*(Z|[+-]\d{2}:\d{2}|$)/, "$1$2");
  // sometimes there may be trailing garbage — trim
  return s.trim();
}

function tryParseDate(raw) {
  if (!raw && raw !== 0) return null;
  // if number, treat as epoch ms (or seconds)
  if (typeof raw === "number") {
    // if looks like seconds (10 digits) convert to ms
    if (raw < 1e12) return new Date(raw * 1000);
    return new Date(raw);
  }
  if (typeof raw === "string") {
    const s = sanitizeTs(raw);
    const d = new Date(s);
    if (!isNaN(d.getTime())) return d;
    // fallback: try Date.parse directly
    const parsed = Date.parse(s);
    if (!isNaN(parsed)) return new Date(parsed);
    // give one more shot: remove subsecond entirely
    const noFrac = s.replace(/\.\d+(Z|[+-]\d{2}:\d{2}|$)/, "$1");
    const d2 = new Date(noFrac);
    if (!isNaN(d2.getTime())) return d2;
    return null;
  }
  return null;
}

function normalizeRecords(records = []) {
  if (!Array.isArray(records)) return [];
  return records
    .map((r) => {
      // flexible ts keys
      const rawTs = r.ts ?? r.time ?? r.sourceTs ?? r.timestamp ?? r.date ?? null;
      const date = tryParseDate(rawTs);
      // parse bp
      let systolic = null;
      let diastolic = null;
      if (r.bp && typeof r.bp === "string") {
        const parts = r.bp.split("/").map((s) => s.trim());
        const sVal = parseInt(parts[0], 10);
        const dVal = parseInt(parts[1], 10);
        if (!Number.isNaN(sVal)) systolic = sVal;
        if (!Number.isNaN(dVal)) diastolic = dVal;
      }
      const temperature = r.temperature != null ? Number(r.temperature) : null;
      const sugar = r.sugar != null ? Number(r.sugar) : null;
      const heartRate = r.heartRate != null ? Number(r.heartRate) : null;

      return {
        raw: r,
        ts: rawTs,
        date,
        temperature,
        sugar,
        systolic,
        diastolic,
        heartRate,
        deviceId: r.deviceId || r.source || null,
      };
    })
    .filter((x) => x.date && !isNaN(x.date.getTime()))
    .sort((a, b) => a.date - b.date);
}

function buildSeries(normalized = []) {
  const maxPoints = 80;
  const slice = normalized.slice(-maxPoints);
  return slice.map((r) => ({
    time: r.date ? r.date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "",
    temperature: r.temperature,
    sugar: r.sugar,
    systolic: r.systolic,
    diastolic: r.diastolic,
    heartRate: r.heartRate,
  }));
}

export default function PatientDetail() {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [rawRecords, setRawRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");
  const [showDebug, setShowDebug] = useState(false);

  const loadPatient = useCallback(async () => {
    setLoading(true);
    setErrMsg("");
    setPatient(null);
    setRawRecords([]);

    // try direct endpoint first
    try {
      const resp = await client.get(`/patients/${encodeURIComponent(id)}`);
      const body = resp?.data;
      const p = body?.patient || body;
      if (p) {
        setPatient(p);
        setRawRecords(Array.isArray(p.records) ? p.records : (Array.isArray(p.patient?.records) ? p.patient.records : []));
        setLoading(false);
        return;
      }
    } catch (err) {
      // ignore and fall back
    }

    // fallback: list and search
    try {
      const all = await client.get("/patients");
      const list = Array.isArray(all.data) ? all.data : all.data?.patients || [];
      const decodedId = decodeURIComponent(id || "");
      const found = list.find((x) => {
        const cand = [x.id, x.patientId, x.patient?.id, x.patient?.patientId].filter(Boolean).map(String);
        return cand.includes(String(id)) || cand.includes(decodedId);
      });
      if (found) {
        setPatient(found);
        setRawRecords(found.records || found.patient?.records || []);
      } else {
        setErrMsg("Patient not found.");
      }
    } catch (err2) {
      setErrMsg("Could not load patient: " + (err2?.message || String(err2)));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadPatient();
  }, [loadPatient]);

  const normalized = normalizeRecords(rawRecords);
  const series = buildSeries(normalized);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Patient Details</h2>
        <div className="flex items-center gap-3">
          <Link to="/" className="text-blue-600 hover:underline">Back to Dashboard</Link>
          <button
            onClick={loadPatient}
            className="px-3 py-1 bg-gray-100 border rounded text-sm hover:bg-gray-200"
            disabled={loading}
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : errMsg ? (
        <div className="text-red-600">{errMsg}</div>
      ) : !patient ? (
        <div>Patient not found.</div>
      ) : (
        <>
          <div className="p-4 bg-white rounded-2xl shadow mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold">{patient.name || patient.patient?.name || "Unnamed"}</h3>
                <div className="text-sm text-gray-600">Id: {patient.id || patient.patientId || "—"}</div>
                <div className="text-sm text-gray-600">Age: {patient.age || patient.patient?.age || "—"}</div>
                <div className="text-sm text-gray-600">Doctor: {patient.doctor || patient.patient?.doctor || "—"}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Records</div>
                <div className="font-medium">{normalized.length}</div>
                <div className="text-sm text-gray-500 mt-2">Last seen</div>
                <div className="font-medium">{normalized.length ? normalized[normalized.length - 1].date.toLocaleString() : "—"}</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            <div className="bg-white p-4 rounded-2xl shadow">
              <h4 className="font-semibold mb-2">Vitals Chart</h4>

              {/* Chart parent must have an explicit size for ResponsiveContainer to compute width/height */}
              <div style={{ width: "100%", height: 320, minWidth: 0 }}>
                {series.length === 0 ? (
                  <div className="p-4 text-gray-600">No vitals yet.</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={series}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" minTickGap={20} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="temperature" name="Temp (°C)" stroke="#ff7300" dot={false} />
                      <Line type="monotone" dataKey="sugar" name="Sugar" stroke="#387908" dot={false} />
                      <Line type="monotone" dataKey="systolic" name="Systolic" stroke="#1f77b4" dot={false} />
                      <Line type="monotone" dataKey="diastolic" name="Diastolic" stroke="#9467bd" dot={false} />
                      <Line type="monotone" dataKey="heartRate" name="HR" stroke="#e377c2" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl shadow">
              <h4 className="font-semibold mb-2">Latest Records (most recent first)</h4>
              {normalized.length === 0 ? (
                <p>No records.</p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {[...normalized].slice().reverse().map((r, idx) => {
                    const key = `${r.ts || r.date?.toISOString() || idx}-${idx}`;
                    return (
                      <div key={key} className="p-3 border rounded">
                        <div className="flex justify-between items-start">
                          <div className="text-sm text-gray-600">{r.date ? r.date.toLocaleString() : "unknown time"}</div>
                          <div className="text-xs text-gray-500">Device: {r.deviceId || "—"}</div>
                        </div>

                        <div className="mt-1">
                          <div>BP: {r.systolic != null && r.diastolic != null ? `${r.systolic}/${r.diastolic}` : (r.raw.bp || "—")}</div>
                          <div>Sugar: {r.sugar != null ? r.sugar : "—"}</div>
                          <div>Temperature: {r.temperature != null ? `${r.temperature} °C` : "—"}</div>
                          <div>Heart Rate: {r.heartRate != null ? `${r.heartRate} bpm` : "—"}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Debugging UI: shows a few raw & normalized records so you can inspect parsing */}
          <div className="bg-white p-3 rounded shadow text-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold">Debug (first records)</div>
              <button
                onClick={() => setShowDebug((s) => !s)}
                className="text-xs px-2 py-1 border rounded bg-gray-50"
              >
                {showDebug ? "Hide" : "Show"}
              </button>
            </div>

            {showDebug && (
              <>
                <div className="mb-2">
                  <div className="text-xs text-gray-600">Raw (first 5):</div>
                  <pre style={{ maxHeight: 140, overflow: "auto" }}>{JSON.stringify((rawRecords || []).slice(0, 5), null, 2)}</pre>
                </div>

                <div>
                  <div className="text-xs text-gray-600">Normalized (first 8):</div>
                  <pre style={{ maxHeight: 180, overflow: "auto" }}>{JSON.stringify((normalized || []).slice(0, 8), (k, v) => {
                    if (k === "date" && v instanceof Date) return new Date(v).toISOString();
                    return v;
                  }, 2)}</pre>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
