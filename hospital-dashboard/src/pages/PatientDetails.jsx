// / src/pages/PatientDetail.jsx
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

// /* timestamp helpers */
// function sanitizeTs(ts) {
//   if (!ts) return ts;
//   if (typeof ts !== "string") return ts;
//   let s = ts.trim();
//   s = s.replace(/\s+/g, "T");
//   s = s.replace(/(\.\d{3})\d*(Z|[+-]\d{2}:\d{2}|$)/, "$1$2");
//   return s;
// }
// function tryParseDate(raw) {
//   if (raw === undefined || raw === null) return null;
//   if (typeof raw === "number") {
//     if (raw < 1e12) return new Date(raw * 1000);
//     return new Date(raw);
//   }
//   if (typeof raw === "string") {
//     const s = sanitizeTs(raw);
//     const d = new Date(s);
//     if (!isNaN(d.getTime())) return d;
//     const noFrac = s.replace(/\.\d+(Z|[+-]\d{2}:\d{2}|$)/, "$1");
//     const d2 = new Date(noFrac);
//     if (!isNaN(d2.getTime())) return d2;
//     const parsed = Date.parse(s);
//     if (!isNaN(parsed)) return new Date(parsed);
//     return null;
//   }
//   return null;
// }

// /* normalize records -> ensure date, numeric fields and systolic/diastolic */
// function normalizeRecords(records = []) {
//   if (!Array.isArray(records)) return [];
//   return records
//     .map((r) => {
//       const rawTs = r.ts ?? r.time ?? r.sourceTs ?? r.timestamp ?? r.date ?? null;
//       const date = tryParseDate(rawTs);
//       let systolic = null;
//       let diastolic = null;
//       if (r.bp && typeof r.bp === "string") {
//         const parts = r.bp.split("/").map((s) => s.trim());
//         const sVal = parseInt(parts[0], 10);
//         const dVal = parseInt(parts[1], 10);
//         if (!Number.isNaN(sVal)) systolic = sVal;
//         if (!Number.isNaN(dVal)) diastolic = dVal;
//       }
//       const temperature = r.temperature != null ? Number(r.temperature) : null;
//       const sugar = r.sugar != null ? Number(r.sugar) : null;
//       const heartRate = r.heartRate != null ? Number(r.heartRate) : null;
//       return {
//         raw: r,
//         ts: rawTs,
//         date,
//         temperature,
//         sugar,
//         systolic,
//         diastolic,
//         heartRate,
//         deviceId: r.deviceId || r.source || null,
//       };
//     })
//     .map((n, i) => ({ ...n, _index: i }))
//     .filter((x) => x.date && !isNaN(x.date.getTime()))
//     .sort((a, b) => a.date - b.date);
// }

// function buildSeries(normalized = []) {
//   const maxPoints = 80;
//   const slice = normalized.slice(-maxPoints);
//   return slice.map((r) => ({
//     time: r.date ? r.date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "",
//     temperature: r.temperature,
//     sugar: r.sugar,
//     systolic: r.systolic,
//     diastolic: r.diastolic,
//     heartRate: r.heartRate,
//   }));
// }

// export default function PatientDetails() {
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
//       const resp = await client.get(`/patients/${encodeURIComponent(id)}`);
//       const body = resp?.data;
//       const p = body?.patient || body;
//       if (p) {
//         setPatient(p);
//         setRawRecords(Array.isArray(p.records) ? p.records : (Array.isArray(p.patient?.records) ? p.patient.records : []));
//         setLoading(false);
//         return;
//       }
//     } catch (err) {
//       // fallback to list lookup below
//     }

//     try {
//       const all = await client.get("/patients");
//       const list = Array.isArray(all.data) ? all.data : all.data?.patients || [];
//       const decodedId = decodeURIComponent(id || "");
//       const found = list.find((x) => {
//         const cand = [x.id, x.patientId, x.patient?.id, x.patient?.patientId].filter(Boolean).map(String);
//         return cand.includes(String(id)) || cand.includes(decodedId);
//       });
//       if (found) {
//         setPatient(found);
//         setRawRecords(found.records || found.patient?.records || []);
//       } else {
//         setErrMsg("Patient not found.");
//       }
//     } catch (e) {
//       setErrMsg("Could not load patient: " + (e?.message || String(e)));
//     } finally {
//       setLoading(false);
//     }
//   }, [id]);

//   useEffect(() => {
//     loadPatient();
//   }, [loadPatient]);

//   const normalized = normalizeRecords(rawRecords);
//   const series = buildSeries(normalized);

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
//           {/* Chart at the TOP */}
//           <div className="bg-white p-4 rounded-2xl shadow mb-6">
//             <h4 className="font-semibold mb-2">Vitals Chart</h4>
//             <div style={{ width: "100%", height: 340, minWidth: 0 }}>
//               {series.length === 0 ? (
//                 <div className="p-4 text-gray-600">No vitals yet.</div>
//               ) : (
//                 <ResponsiveContainer width="100%" height="100%">
//                   <LineChart data={series}>
//                     <CartesianGrid strokeDasharray="3 3" />
//                     <XAxis dataKey="time" minTickGap={20} />
//                     <YAxis yAxisId="left" />
//                     <YAxis yAxisId="bp" orientation="right" domain={[40, "dataMax + 10"]} />
//                     <Tooltip />
//                     <Legend />
//                     <Line type="monotone" dataKey="temperature" name="Temp (°C)" stroke="#ff7300" dot={false} yAxisId="left" />
//                     <Line type="monotone" dataKey="sugar" name="Sugar" stroke="#387908" dot={false} yAxisId="left" />
//                     <Line type="monotone" dataKey="systolic" name="Systolic" stroke="#1f77b4" dot={false} yAxisId="bp" />
//                     <Line type="monotone" dataKey="diastolic" name="Diastolic" stroke="#9467bd" dot={false} yAxisId="bp" />
//                     <Line type="monotone" dataKey="heartRate" name="HR" stroke="#e377c2" dot={false} yAxisId="left" />
//                   </LineChart>
//                 </ResponsiveContainer>
//               )}
//             </div>
//           </div>

//           {/* Patient info + latest records BELOW the chart */}
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
//             <div className="p-4 bg-white rounded-2xl shadow">
//               <h3 className="text-xl font-semibold mb-2">{patient.name || patient.patient?.name || "Unnamed"}</h3>
//               <div className="text-sm text-gray-600 mb-1">Id: {patient.id || patient.patientId || "—"}</div>
//               <div className="text-sm text-gray-600 mb-1">Age: {patient.age || patient.patient?.age || "—"}</div>
//               <div className="text-sm text-gray-600 mb-1">Doctor: {patient.doctor || patient.patient?.doctor || "—"}</div>
//               <div className="mt-3">
//                 <div className="text-sm text-gray-500">Records</div>
//                 <div className="font-medium">{normalized.length}</div>
//                 <div className="text-sm text-gray-500 mt-2">Last seen</div>
//                 <div className="font-medium">{normalized.length ? normalized[normalized.length - 1].date.toLocaleString() : "—"}</div>
//               </div>
//             </div>

//             <div className="p-4 bg-white rounded-2xl shadow">
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
import React, { useEffect, useState, useCallback, useRef } from "react";
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

/* ---------- Helpers ---------- */
function sanitizeTs(ts) {
  if (!ts) return ts;
  if (typeof ts !== "string") return ts;
  let s = ts.trim();
  s = s.replace(/\s+/g, "T");
  s = s.replace(/(\.\d{3})\d*(Z|[+-]\d{2}:\d{2}|$)/, "$1$2");
  return s;
}

function tryParseDate(raw) {
  if (raw === undefined || raw === null) return null;
  if (typeof raw === "number") {
    if (raw < 1e12) return new Date(raw * 1000);
    return new Date(raw);
  }
  if (typeof raw === "string") {
    const s = sanitizeTs(raw);
    const d = new Date(s);
    if (!isNaN(d.getTime())) return d;
    const noFrac = s.replace(/\.\d+(Z|[+-]\d{2}:\d{2}|$)/, "$1");
    const d2 = new Date(noFrac);
    if (!isNaN(d2.getTime())) return d2;
    const parsed = Date.parse(s);
    if (!isNaN(parsed)) return new Date(parsed);
    return null;
  }
  return null;
}

/* ---------- Normalize IoT Records ---------- */
function normalizeRecords(records = []) {
  if (!Array.isArray(records)) return [];
  return records
    .map((r, idx) => {
      const rawTs = r.ts ?? r.time ?? r.sourceTs ?? r.timestamp ?? r.date ?? null;
      const date = tryParseDate(rawTs);
      let systolic = null,
        diastolic = null;
      if (r.bp && typeof r.bp === "string") {
        const parts = r.bp.split("/").map((s) => s.trim());
        const sVal = parseInt(parts[0], 10);
        const dVal = parseInt(parts[1], 10);
        if (!Number.isNaN(sVal)) systolic = sVal;
        if (!Number.isNaN(dVal)) diastolic = dVal;
      }
      return {
        _idx: idx,
        raw: r,
        ts: rawTs,
        date,
        temperature: r.temperature != null ? Number(r.temperature) : null,
        sugar: r.sugar != null ? Number(r.sugar) : null,
        systolic,
        diastolic,
        heartRate: r.heartRate != null ? Number(r.heartRate) : null,
        deviceId: r.deviceId || r.source || null,
      };
    })
    .filter((x) => x.date && !isNaN(x.date.getTime()))
    .sort((a, b) => a.date - b.date);
}

function buildSeries(normalized = []) {
  const slice = normalized.slice(-80);
  return slice.map((r) => ({
    time: r.date
      ? r.date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      : "",
    temperature: r.temperature,
    sugar: r.sugar,
    systolic: r.systolic,
    diastolic: r.diastolic,
    heartRate: r.heartRate,
  }));
}

/* ---------- Component ---------- */
export default function PatientDetails() {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [rawRecords, setRawRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState("");
  const [autoReload, setAutoReload] = useState(false);

  // Cached JSON to prevent redundant updates
  const prevSeriesJsonRef = useRef("");

  const loadPatient = useCallback(async () => {
    setLoading(true);
    setErrMsg("");

    try {
      const resp = await client.get(`/patients/${encodeURIComponent(id)}`);
      let p = resp?.data?.patient || resp?.data || null;
      if (!p) throw new Error("Not found");

      setPatient(p);
      const recs =
        Array.isArray(p.records) ||
        Array.isArray(p?.patient?.records)
          ? p.records || p?.patient?.records
          : [];
      setRawRecords(recs);
      setAutoReload(true); // ✅ Start auto-refresh after first success
      setLoading(false);
      return true;
    } catch {
      // fallback
      try {
        const all = await client.get("/patients");
        const list =
          Array.isArray(all.data) ? all.data : all.data?.patients || [];
        const found = list.find(
          (x) =>
            [x.id, x.patientId, x.patient?.id, x.patient?.patientId]
              .filter(Boolean)
              .map(String)
              .includes(String(id))
        );
        if (found) {
          setPatient(found);
          setRawRecords(found.records || found.patient?.records || []);
          setAutoReload(true);
          setLoading(false);
          return true;
        } else {
          setErrMsg("Patient not found.");
        }
      } catch (e) {
        setErrMsg("Could not load patient: " + (e?.message || String(e)));
      }
    } finally {
      setLoading(false);
    }
    return false;
  }, [id]);

  // 🔁 Auto-refresh every 10 seconds only after success
  useEffect(() => {
    if (!autoReload) return;
    const interval = setInterval(() => loadPatient(), 10000);
    return () => clearInterval(interval);
  }, [autoReload, loadPatient]);

  useEffect(() => {
    loadPatient();
  }, [loadPatient]);

  // Normalize & cache data
  const normalized = normalizeRecords(rawRecords);
  const newSeries = buildSeries(normalized);
  const newJson = JSON.stringify(newSeries);
  const [series, setSeries] = useState(newSeries);

  useEffect(() => {
    if (newJson !== prevSeriesJsonRef.current) {
      prevSeriesJsonRef.current = newJson;
      setSeries(newSeries);
    }
  }, [newJson, newSeries]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Patient Details</h2>
        <div className="flex items-center gap-3">
          <Link to="/" className="text-blue-600 hover:underline">
            Back to Dashboard
          </Link>
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
          {/* Chart at the TOP */}
          <div className="bg-white p-4 rounded-2xl shadow mb-6">
            <h4 className="font-semibold mb-2">
              Vitals Chart (auto-refresh every 10s)
            </h4>
            <div style={{ width: "100%", height: 340, minWidth: 0 }}>
              {series.length === 0 ? (
                <div className="p-4 text-gray-600">No vitals yet.</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={series}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" minTickGap={20} />
                    <YAxis yAxisId="left" />
                    <YAxis
                      yAxisId="bp"
                      orientation="right"
                      domain={[40, "dataMax + 10"]}
                    />
                    <Tooltip />
                    <Legend />
                    {/* Animations disabled to prevent jitter */}
                    <Line
                      type="monotone"
                      dataKey="temperature"
                      name="Temp (°C)"
                      stroke="#ff7300"
                      dot={false}
                      yAxisId="left"
                      isAnimationActive={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="sugar"
                      name="Sugar"
                      stroke="#387908"
                      dot={false}
                      yAxisId="left"
                      isAnimationActive={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="systolic"
                      name="Systolic"
                      stroke="#1f77b4"
                      dot={false}
                      yAxisId="bp"
                      isAnimationActive={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="diastolic"
                      name="Diastolic"
                      stroke="#9467bd"
                      dot={false}
                      yAxisId="bp"
                      isAnimationActive={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="heartRate"
                      name="HR"
                      stroke="#e377c2"
                      dot={false}
                      yAxisId="left"
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Patient info + latest records BELOW the chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="p-4 bg-white rounded-2xl shadow">
              <h3 className="text-xl font-semibold mb-2">
                {patient.name || patient.patient?.name || "Unnamed"}
              </h3>
              <div className="text-sm text-gray-600 mb-1">
                Id: {patient.id || patient.patientId || "—"}
              </div>
              <div className="text-sm text-gray-600 mb-1">
                Age: {patient.age || patient.patient?.age || "—"}
              </div>
              <div className="text-sm text-gray-600 mb-1">
                Doctor: {patient.doctor || patient.patient?.doctor || "—"}
              </div>
              <div className="mt-3">
                <div className="text-sm text-gray-500">Records</div>
                <div className="font-medium">{normalized.length}</div>
                <div className="text-sm text-gray-500 mt-2">Last seen</div>
                <div className="font-medium">
                  {normalized.length
                    ? normalized[normalized.length - 1].date.toLocaleString()
                    : "—"}
                </div>
              </div>
            </div>

            <div className="p-4 bg-white rounded-2xl shadow">
              <h4 className="font-semibold mb-2">
                Latest Records (most recent first)
              </h4>
              {normalized.length === 0 ? (
                <p>No records.</p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {[...normalized].slice().reverse().map((r, idx) => (
                    <div
                      key={`${r.ts || r.date?.toISOString() || idx}-${idx}`}
                      className="p-3 border rounded"
                    >
                      <div className="flex justify-between items-start">
                        <div className="text-sm text-gray-600">
                          {r.date
                            ? r.date.toLocaleString()
                            : "unknown time"}
                        </div>
                        <div className="text-xs text-gray-500">
                          Device: {r.deviceId || "—"}
                        </div>
                      </div>
                      <div className="mt-1">
                        <div>
                          BP:{" "}
                          {r.systolic != null && r.diastolic != null
                            ? `${r.systolic}/${r.diastolic}`
                            : r.raw.bp || "—"}
                        </div>
                        <div>Sugar: {r.sugar ?? "—"}</div>
                        <div>
                          Temperature:{" "}
                          {r.temperature != null ? `${r.temperature} °C` : "—"}
                        </div>
                        <div>
                          Heart Rate:{" "}
                          {r.heartRate != null ? `${r.heartRate} bpm` : "—"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}


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

// /* sanitize ISO-like timestamps: truncate fractional seconds to milliseconds,
//    replace space with T if user provided '2025-11-11 19:14:55.274748Z' style,
//    remove stray characters if necessary */
// function sanitizeTs(ts) {
//   if (!ts) return ts;
//   if (typeof ts !== "string") return ts;
//   // normalize space separated date/time -> T
//   let s = ts.replace(/\s+/g, "T");
//   // truncate microseconds to milliseconds, keep timezone or Z
//   s = s.replace(/(\.\d{3})\d*(Z|[+-]\d{2}:\d{2}|$)/, "$1$2");
//   // sometimes there may be trailing garbage — trim
//   return s.trim();
// }

// function tryParseDate(raw) {
//   if (!raw && raw !== 0) return null;
//   // if number, treat as epoch ms (or seconds)
//   if (typeof raw === "number") {
//     // if looks like seconds (10 digits) convert to ms
//     if (raw < 1e12) return new Date(raw * 1000);
//     return new Date(raw);
//   }
//   if (typeof raw === "string") {
//     const s = sanitizeTs(raw);
//     const d = new Date(s);
//     if (!isNaN(d.getTime())) return d;
//     // fallback: try Date.parse directly
//     const parsed = Date.parse(s);
//     if (!isNaN(parsed)) return new Date(parsed);
//     // give one more shot: remove subsecond entirely
//     const noFrac = s.replace(/\.\d+(Z|[+-]\d{2}:\d{2}|$)/, "$1");
//     const d2 = new Date(noFrac);
//     if (!isNaN(d2.getTime())) return d2;
//     return null;
//   }
//   return null;
// }

// function normalizeRecords(records = []) {
//   if (!Array.isArray(records)) return [];
//   return records
//     .map((r) => {
//       // flexible ts keys
//       const rawTs = r.ts ?? r.time ?? r.sourceTs ?? r.timestamp ?? r.date ?? null;
//       const date = tryParseDate(rawTs);
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
//       const temperature = r.temperature != null ? Number(r.temperature) : null;
//       const sugar = r.sugar != null ? Number(r.sugar) : null;
//       const heartRate = r.heartRate != null ? Number(r.heartRate) : null;

//       return {
//         raw: r,
//         ts: rawTs,
//         date,
//         temperature,
//         sugar,
//         systolic,
//         diastolic,
//         heartRate,
//         deviceId: r.deviceId || r.source || null,
//       };
//     })
//     .filter((x) => x.date && !isNaN(x.date.getTime()))
//     .sort((a, b) => a.date - b.date);
// }

// function buildSeries(normalized = []) {
//   const maxPoints = 80;
//   const slice = normalized.slice(-maxPoints);
//   return slice.map((r) => ({
//     time: r.date ? r.date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "",
//     temperature: r.temperature,
//     sugar: r.sugar,
//     systolic: r.systolic,
//     diastolic: r.diastolic,
//     heartRate: r.heartRate,
//   }));
// }

// export default function PatientDetail() {
//   const { id } = useParams();
//   const [patient, setPatient] = useState(null);
//   const [rawRecords, setRawRecords] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [errMsg, setErrMsg] = useState("");
//   const [showDebug, setShowDebug] = useState(false);

//   const loadPatient = useCallback(async () => {
//     setLoading(true);
//     setErrMsg("");
//     setPatient(null);
//     setRawRecords([]);

//     // try direct endpoint first
//     try {
//       const resp = await client.get(`/patients/${encodeURIComponent(id)}`);
//       const body = resp?.data;
//       const p = body?.patient || body;
//       if (p) {
//         setPatient(p);
//         setRawRecords(Array.isArray(p.records) ? p.records : (Array.isArray(p.patient?.records) ? p.patient.records : []));
//         setLoading(false);
//         return;
//       }
//     } catch (err) {
//       // ignore and fall back
//     }

//     // fallback: list and search
//     try {
//       const all = await client.get("/patients");
//       const list = Array.isArray(all.data) ? all.data : all.data?.patients || [];
//       const decodedId = decodeURIComponent(id || "");
//       const found = list.find((x) => {
//         const cand = [x.id, x.patientId, x.patient?.id, x.patient?.patientId].filter(Boolean).map(String);
//         return cand.includes(String(id)) || cand.includes(decodedId);
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
//   const series = buildSeries(normalized);

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
//                 <div className="text-sm text-gray-500">Records</div>
//                 <div className="font-medium">{normalized.length}</div>
//                 <div className="text-sm text-gray-500 mt-2">Last seen</div>
//                 <div className="font-medium">{normalized.length ? normalized[normalized.length - 1].date.toLocaleString() : "—"}</div>
//               </div>
//             </div>
//           </div>

//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
//             <div className="bg-white p-4 rounded-2xl shadow">
//               <h4 className="font-semibold mb-2">Vitals Chart</h4>

//               {/* Chart parent must have an explicit size for ResponsiveContainer to compute width/height */}
//               <div style={{ width: "100%", height: 320, minWidth: 0 }}>
//                 {series.length === 0 ? (
//                   <div className="p-4 text-gray-600">No vitals yet.</div>
//                 ) : (
//                   <ResponsiveContainer width="100%" height="100%">
//                     <LineChart data={series}>
//                       <CartesianGrid strokeDasharray="3 3" />
//                       <XAxis dataKey="time" minTickGap={20} />
//                       <YAxis />
//                       <Tooltip />
//                       <Legend />
//                       <Line type="monotone" dataKey="temperature" name="Temp (°C)" stroke="#ff7300" dot={false} />
//                       <Line type="monotone" dataKey="sugar" name="Sugar" stroke="#387908" dot={false} />
//                       <Line type="monotone" dataKey="systolic" name="Systolic" stroke="#1f77b4" dot={false} />
//                       <Line type="monotone" dataKey="diastolic" name="Diastolic" stroke="#9467bd" dot={false} />
//                       <Line type="monotone" dataKey="heartRate" name="HR" stroke="#e377c2" dot={false} />
//                     </LineChart>
//                   </ResponsiveContainer>
//                 )}
//               </div>
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

//           {/* Debugging UI: shows a few raw & normalized records so you can inspect parsing */}
//           <div className="bg-white p-3 rounded shadow text-sm">
//             <div className="flex items-center justify-between mb-2">
//               <div className="font-semibold">Debug (first records)</div>
//               <button
//                 onClick={() => setShowDebug((s) => !s)}
//                 className="text-xs px-2 py-1 border rounded bg-gray-50"
//               >
//                 {showDebug ? "Hide" : "Show"}
//               </button>
//             </div>

//             {showDebug && (
//               <>
//                 <div className="mb-2">
//                   <div className="text-xs text-gray-600">Raw (first 5):</div>
//                   <pre style={{ maxHeight: 140, overflow: "auto" }}>{JSON.stringify((rawRecords || []).slice(0, 5), null, 2)}</pre>
//                 </div>

//                 <div>
//                   <div className="text-xs text-gray-600">Normalized (first 8):</div>
//                   <pre style={{ maxHeight: 180, overflow: "auto" }}>{JSON.stringify((normalized || []).slice(0, 8), (k, v) => {
//                     if (k === "date" && v instanceof Date) return new Date(v).toISOString();
//                     return v;
//                   }, 2)}</pre>
//                 </div>
//               </>
//             )}
//           </div>
//         </>
//       )}
//     </div>
//   );
// }
