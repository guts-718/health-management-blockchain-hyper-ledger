// // // src/pages/PatientPortal.jsx
// // import React, { useState, useEffect } from "react";
// // import { useParams } from "react-router-dom";
// // import VitalChart from "../components/VitalChart";
// // import client from "../api";

// // /**
// //  * PatientPortal
// //  * - If route contains :id (e.g. /patient/patient1) it will auto-load that id.
// //  * - Otherwise user types their patientId and (optionally) identity and clicks "Load".
// //  * - Shows patient basic details, records list and a small chart (temperature + sugar).
// //  */

// // export default function PatientPortal() {
// //   const params = useParams();
// //   const [patientId, setPatientId] = useState(params?.id || "");
// //   const [identity, setIdentity] = useState(""); // optional identity query param if your API requires it
// //   const [patient, setPatient] = useState(null);
// //   const [records, setRecords] = useState([]);
// //   const [chartData, setChartData] = useState([]);
// //   const [loading, setLoading] = useState(false);
// //   const [note, setNote] = useState("");
// //   console.log("i was here , ia fwslhgiewhgwieghw");
// //   useEffect(() => {
// //     if (params?.id) {
// //       // if route param present, auto-fetch
// //       handleLoad(params.id);
// //     }
// //     // eslint-disable-next-line react-hooks/exhaustive-deps
// //   }, [params?.id]);

// //   const normalizeRecordsForChart = (recs = []) => {
// //     // keep last 40 records and map to { time, sugar, temperature } sorted ascending by time
// //     const mapped = (recs || [])
// //       .map((r) => {
// //         const t = r.ts || r.sourceTs || r.time || r.timestamp;
// //         const time = t ? new Date(t) : null;
// //         return {
// //           time: time ? time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "",
// //           iso: time ? time.toISOString() : "",
// //           sugar: typeof r.sugar === "number" ? r.sugar : (Number(r.sugar) || null),
// //           temperature: typeof r.temperature === "number" ? r.temperature : (Number(r.temperature) || null),
// //           bp: r.bp || "",
// //           deviceId: r.deviceId || r.source || "",
// //         };
// //       })
// //       .filter((d) => d.iso) // require time for charting
// //       .sort((a, b) => (a.iso > b.iso ? 1 : -1))
// //       .slice(-40);
// //     return mapped;
// //   };

// //   const handleLoad = async (explicitId) => {
// //     const idToUse = (explicitId || patientId || "").trim();
// //     if (!idToUse) {
// //       setNote("Please enter your patient ID.");
// //       return;
// //     }
// //     setLoading(true);
// //     setNote("");
// //     setPatient(null);
// //     setRecords([]);
// //     setChartData([]);

// //     try {
// //       // If your backend expects GET /patients/:id
// //       // and optionally ?identity=<walletIdentity>, append identity if provided
// //       let url = `/patients/${encodeURIComponent(idToUse)}`;
// //       if (identity) url += `?identity=${encodeURIComponent(identity)}`;
// //       const resp = await client.get(url);
// //       // backend returns patient object or an error
// //       const p = resp?.data;
// //       // some APIs return paging object with patients array; handle that
// //       let resolved = null;
// //       if (p && p.id) resolved = p;
// //       else if (p && Array.isArray(p.patients) && p.patients.length) {
// //         resolved = p.patients.find((x) => (x.id || x.patientId) === idToUse) || p.patients[0];
// //       } else if (p && p.patient) resolved = p.patient;
// //       else resolved = p;

// //       setPatient(resolved || null);
// //       const recs = (resolved && (resolved.records || resolved.patient?.records)) || [];
// //       setRecords(recs || []);
// //       const chart = normalizeRecordsForChart(recs || []);
// //       setChartData(chart);
// //       if (!resolved) setNote("Patient not found.");
// //     } catch (err) {
// //       console.error("load patient err", err);
// //       const errMsg = err?.response?.data?.error || err?.message || String(err);
// //       setNote(`Failed to load patient: ${errMsg}`);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   return (
// //     <div>
// //       <h2 className="text-2xl font-bold mb-4">Patient Portal</h2>

// //       <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
// //         <input
// //           value={patientId}
// //           onChange={(e) => setPatientId(e.target.value)}
// //           placeholder="Enter patient id (e.g. patient1)"
// //           className="border p-2 rounded md:col-span-1"
// //         />
// //         <input
// //           value={identity}
// //           onChange={(e) => setIdentity(e.target.value)}
// //           placeholder="Optional identity (wallet name)"
// //           className="border p-2 rounded md:col-span-1"
// //         />
// //         <div className="flex gap-2">
// //           <button
// //             onClick={() => handleLoad()}
// //             disabled={loading}
// //             className="bg-blue-600 text-white px-3 py-2 rounded"
// //           >
// //             {loading ? "Loading..." : "Load My Records"}
// //           </button>
// //           <button
// //             onClick={() => { setPatientId(""); setIdentity(""); setPatient(null); setRecords([]); setChartData([]); setNote(""); }}
// //             className="px-3 py-2 border rounded"
// //           >
// //             Clear
// //           </button>
// //         </div>
// //       </div>

// //       {note && <div className="mb-4 text-sm text-red-600">{note}</div>}

// //       {patient ? (
// //         <div className="space-y-6">
// //           <div className="bg-white p-4 rounded-2xl shadow">
// //             <h3 className="text-lg font-semibold">{patient.name || patient.patient?.name || patient.id || "Patient"}</h3>
// //             <div className="text-sm text-gray-700 space-y-1">
// //               <div>Patient ID: {patient.id || patient.patientId || patient.patient?.id || "—"}</div>
// //               <div>Age: {patient.age || patient.patient?.age || "—"}</div>
// //               <div>Doctor: {patient.doctor || patient.patient?.doctor || "—"}</div>
// //               <div>Records: {Array.isArray(records) ? records.length : 0}</div>
// //             </div>
// //           </div>

// //           <div className="bg-white p-4 rounded-2xl shadow">
// //             <h4 className="font-semibold mb-2">Vitals chart (temperature & sugar)</h4>
// //             {chartData.length ? (
// //               // VitalChart expects array of objects; we pass sugar+temperature/time
// //               <VitalChart data={chartData.map(d => ({ time: d.time, temperature: d.temperature, sugar: d.sugar }))} />
// //             ) : (
// //               <div className="text-gray-600">No time-series vitals available to chart.</div>
// //             )}
// //           </div>

// //           <div className="bg-white p-4 rounded-2xl shadow">
// //             <h4 className="font-semibold mb-2">Recent Records</h4>
// //             {records && records.length ? (
// //               <div className="space-y-2">
// //                 {records.slice().reverse().map((r, idx) => (
// //                   <div key={`${r.ts || r.sourceTs || r.time || idx}`} className="p-2 border rounded">
// //                     <div className="text-sm text-gray-700">
// //                       <strong>Time:</strong> {new Date(r.ts || r.sourceTs || r.time || Date.now()).toLocaleString()}
// //                     </div>
// //                     <div className="text-sm"><strong>BP:</strong> {r.bp || "—"} &nbsp; <strong>Sugar:</strong> {r.sugar ?? "—"} &nbsp; <strong>Temp:</strong> {r.temperature ?? "—"}</div>
// //                     <div className="text-xs text-gray-500">Device: {r.deviceId || r.source || "—"}</div>
// //                   </div>
// //                 ))}
// //               </div>
// //             ) : (
// //               <p className="text-gray-600">No records found.</p>
// //             )}
// //           </div>
// //         </div>
// //       ) : (
// //         <div className="text-gray-600">Enter your patient id above and click "Load My Records" to view your data.</div>
// //       )}
// //     </div>
// //   );
// // }


// // src/pages/PatientPortal.jsx
// import React, { useState, useEffect, useCallback } from "react";
// import { useParams } from "react-router-dom";
// import {
//   ResponsiveContainer,
//   LineChart,
//   Line,
//   CartesianGrid,
//   XAxis,
//   YAxis,
//   Tooltip,
//   Legend,
// } from "recharts";
// import client from "../api";

// /* Helpers for parsing timestamps robustly */
// function sanitizeTs(s) {
//   if (!s) return s;
//   let t = String(s).trim();
//   // normalize spaces -> T for many inputs
//   t = t.replace(/\s+/g, "T");
//   // keep milliseconds to 3 digits (if too many)
//   t = t.replace(/(\.\d{3})\d+(Z|[+-]\d{2}:\d{2}|$)/, "$1$2");
//   return t;
// }
// function tryParseDate(raw) {
//   if (raw == null) return null;
//   if (typeof raw === "number") {
//     // if seconds (small) convert to ms
//     if (raw < 1e12) return new Date(raw * 1000);
//     return new Date(raw);
//   }
//   if (typeof raw === "string") {
//     const s = sanitizeTs(raw);
//     const d = new Date(s);
//     if (!isNaN(d.getTime())) return d;
//     // fallback: strip fractional seconds
//     const noFrac = s.replace(/\.\d+(Z|[+-]\d{2}:\d{2}|$)/, "$1");
//     const d2 = new Date(noFrac);
//     if (!isNaN(d2.getTime())) return d2;
//     const parsed = Date.parse(s);
//     if (!isNaN(parsed)) return new Date(parsed);
//     return null;
//   }
//   return null;
// }

// /* Normalize records to structured objects */
// function normalizeRecords(records = []) {
//   if (!Array.isArray(records)) return [];
//   return records
//     .map((r, idx) => {
//       const rawTs = r.ts ?? r.sourceTs ?? r.time ?? r.timestamp ?? r.date ?? null;
//       const date = tryParseDate(rawTs) || null;
//       let systolic = null;
//       let diastolic = null;
//       if (r.bp && typeof r.bp === "string") {
//         const parts = r.bp.split("/").map((s) => s.trim());
//         const sVal = parseInt(parts[0], 10);
//         const dVal = parseInt(parts[1], 10);
//         if (!Number.isNaN(sVal)) systolic = sVal;
//         if (!Number.isNaN(dVal)) diastolic = dVal;
//       }
//       return {
//         _idx: idx,
//         raw: r,
//         tsRaw: rawTs,
//         date,
//         timeISO: date ? date.toISOString() : "",
//         timeLabel: date ? date.toLocaleString() : "",
//         temperature: r.temperature != null ? Number(r.temperature) : null,
//         sugar: r.sugar != null ? Number(r.sugar) : null,
//         systolic,
//         diastolic,
//         heartRate: r.heartRate != null ? Number(r.heartRate) : null,
//         deviceId: r.deviceId ?? r.source ?? null,
//       };
//     })
//     .filter((x) => x.date && !isNaN(x.date.getTime()))
//     .sort((a, b) => a.date - b.date);
// }

// /* Build series for recharts (limit points) */
// function buildSeries(normalized = [], maxPoints = 80) {
//   const slice = normalized.slice(-maxPoints);
//   return slice.map((r) => ({
//     time: r.timeLabel, // full locale string
//     timeShort: r.date ? r.date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "",
//     temperature: r.temperature,
//     sugar: r.sugar,
//     systolic: r.systolic,
//     diastolic: r.diastolic,
//     heartRate: r.heartRate,
//   }));
// }

// export default function PatientPortal() {
//   const params = useParams();
//   const [patientId, setPatientId] = useState(params?.id || "");
//   const [identity, setIdentity] = useState("");
//   const [patient, setPatient] = useState(null);
//   const [rawRecords, setRawRecords] = useState([]);
//   const [series, setSeries] = useState([]);
//   const [normalized, setNormalized] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [note, setNote] = useState("");
//   const [now, setNow] = useState(new Date());

//   // live current time update
//   useEffect(() => {
//     const t = setInterval(() => setNow(new Date()), 1000);
//     return () => clearInterval(t);
//   }, []);

//   // auto-load if param id present
//   useEffect(() => {
//     if (params?.id) {
//       handleLoad(params.id);
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [params?.id]);

//   const handleLoad = useCallback(
//     async (explicitId) => {
//       const idToUse = (explicitId || patientId || "").trim();
//       if (!idToUse) {
//         setNote("Please enter your patient ID.");
//         return;
//       }
//       setLoading(true);
//       setNote("");
//       setPatient(null);
//       setRawRecords([]);
//       setSeries([]);
//       setNormalized([]);

//       try {
//         let url = `/patients/${encodeURIComponent(idToUse)}`;
//         if (identity) url += `?identity=${encodeURIComponent(identity)}`;
//         const resp = await client.get(url);
//         let p = resp?.data;
//         // handle different shapes
//         if (p && p.patient) p = p.patient;
//         // fallback: if endpoint returned paging object
//         if (p && Array.isArray(p.patients) && p.patients.length) {
//           const found = p.patients.find((x) => (x.id || x.patientId) === idToUse) || p.patients[0];
//           p = found;
//         }
//         setPatient(p || null);
//         const recs = (p && (p.records || p.patient?.records)) || [];
//         setRawRecords(recs || []);
//         const norm = normalizeRecords(recs || []);
//         setNormalized(norm);
//         setSeries(buildSeries(norm, 120));
//         if (!p) setNote("Patient not found.");
//       } catch (err) {
//         const errMsg = err?.response?.data?.error || err?.message || String(err);
//         setNote(`Failed to load patient: ${errMsg}`);
//       } finally {
//         setLoading(false);
//       }
//     },
//     [identity, patientId]
//   );

//   return (
//     <div>
//       <h2 className="text-2xl font-bold mb-4">Patient Portal</h2>

//       <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
//         <input
//           value={patientId}
//           onChange={(e) => setPatientId(e.target.value)}
//           placeholder="Enter patient id (e.g. patient1)"
//           className="border p-2 rounded md:col-span-1"
//         />
//         <input
//           value={identity}
//           onChange={(e) => setIdentity(e.target.value)}
//           placeholder="Optional identity (wallet name)"
//           className="border p-2 rounded md:col-span-1"
//         />
//         <div className="flex gap-2">
//           <button
//             onClick={() => handleLoad()}
//             disabled={loading}
//             className="bg-blue-600 text-white px-3 py-2 rounded"
//           >
//             {loading ? "Loading..." : "Load My Records"}
//           </button>
//           <button
//             onClick={() => {
//               setPatientId("");
//               setIdentity("");
//               setPatient(null);
//               setRawRecords([]);
//               setSeries([]);
//               setNormalized([]);
//               setNote("");
//             }}
//             className="px-3 py-2 border rounded"
//           >
//             Clear
//           </button>
//         </div>

//         {/* current time display */}
//         <div className="md:col-span-1 text-right text-sm text-gray-600">
//           <div>Local time</div>
//           <div className="font-mono">{now.toLocaleString()}</div>
//         </div>
//       </div>

//       {note && <div className="mb-4 text-sm text-red-600">{note}</div>}

//       {patient ? (
//         <div className="space-y-6">
//           {/* Chart at top - multi series */}
//           <div className="bg-white p-4 rounded-2xl shadow">
//             <h4 className="font-semibold mb-2">Vitals chart (Temperature · Sugar · BP · HR)</h4>
//             <div style={{ width: "100%", height: 340, minWidth: 0 }}>
//               {series.length === 0 ? (
//                 <div className="p-4 text-gray-600">No time-series vitals available to chart.</div>
//               ) : (
//                 <ResponsiveContainer width="100%" height="100%">
//                   <LineChart data={series}>
//                     <CartesianGrid strokeDasharray="3 3" />
//                     <XAxis dataKey="timeShort" minTickGap={10} />
//                     <YAxis yAxisId="left" />
//                     <YAxis yAxisId="bp" orientation="right" domain={[40, "dataMax + 10"]} />
//                     <Tooltip />
//                     <Legend />
//                     <Line type="monotone" dataKey="temperature" name="Temp (°C)" stroke="#ff7300" dot={false} yAxisId="left" />
//                     <Line type="monotone" dataKey="sugar" name="Sugar" stroke="#387908" dot={false} yAxisId="left" />
//                     <Line type="monotone" dataKey="systolic" name="Systolic" stroke="#1f77b4" dot={false} yAxisId="bp" />
//                     <Line type="monotone" dataKey="diastolic" name="Diastolic" stroke="#9467bd" dot={false} yAxisId="bp" />
//                     <Line type="monotone" dataKey="heartRate" name="Heart Rate" stroke="#e377c2" dot={false} yAxisId="left" />
//                   </LineChart>
//                 </ResponsiveContainer>
//               )}
//             </div>
//           </div>

//           {/* Patient summary */}
//           <div className="bg-white p-4 rounded-2xl shadow">
//             <h3 className="text-lg font-semibold">
//               {patient.name || patient.patient?.name || patient.id || "Patient"}
//             </h3>
//             <div className="text-sm text-gray-700 mt-1 space-y-1">
//               <div>Patient ID: {patient.id || patient.patientId || patient.patient?.id || "—"}</div>
//               <div>Age: {patient.age || patient.patient?.age || "—"}</div>
//               <div>Doctor: {patient.doctor || patient.patient?.doctor || "—"}</div>
//               <div>Records: {Array.isArray(rawRecords) ? rawRecords.length : 0}</div>
//               <div>Last seen: {normalized.length ? normalized[normalized.length - 1].timeLabel : "—"}</div>
//             </div>
//           </div>

//           {/* Records list */}
//           <div className="bg-white p-4 rounded-2xl shadow">
//             <h4 className="font-semibold mb-2">Recent Records</h4>
//             {normalized.length === 0 ? (
//               <p className="text-gray-600">No records found.</p>
//             ) : (
//               <div className="space-y-3 max-h-96 overflow-y-auto">
//                 {[...normalized].slice().reverse().map((r) => {
//                   const key = `${r.timeISO || r._idx}`;
//                   return (
//                     <div key={key} className="p-3 border rounded">
//                       <div className="flex justify-between items-start">
//                         <div className="text-sm text-gray-600">{r.timeLabel}</div>
//                         <div className="text-xs text-gray-500">Device: {r.deviceId || "—"}</div>
//                       </div>
//                       <div className="mt-1">
//                         <div><strong>BP:</strong> {r.systolic != null && r.diastolic != null ? `${r.systolic}/${r.diastolic}` : (r.raw.bp || "—")}</div>
//                         <div><strong>Sugar:</strong> {r.sugar != null ? r.sugar : "—"}</div>
//                         <div><strong>Temperature:</strong> {r.temperature != null ? `${r.temperature} °C` : "—"}</div>
//                         <div><strong>Heart Rate:</strong> {r.heartRate != null ? `${r.heartRate} bpm` : "—"}</div>
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>
//             )}
//           </div>
//         </div>
//       ) : (
//         <div className="text-gray-600">Enter your patient id above and click "Load My Records" to view your data.</div>
//       )}
//     </div>
//   );
// }



// // src/pages/PatientPortal.jsx
// import React, { useState, useEffect, useCallback } from "react";
// import { useParams } from "react-router-dom";
// import {
//   ResponsiveContainer,
//   LineChart,
//   Line,
//   CartesianGrid,
//   XAxis,
//   YAxis,
//   Tooltip,
//   Legend,
// } from "recharts";
// import client from "../api";

// /* ---------- Helpers ---------- */
// function sanitizeTs(s) {
//   if (!s) return s;
//   let t = String(s).trim();
//   t = t.replace(/\s+/g, "T");
//   t = t.replace(/(\.\d{3})\d+(Z|[+-]\d{2}:\d{2}|$)/, "$1$2");
//   return t;
// }
// function tryParseDate(raw) {
//   if (raw == null) return null;
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
// function normalizeRecords(records = []) {
//   if (!Array.isArray(records)) return [];
//   return records
//     .map((r, idx) => {
//       const rawTs = r.ts ?? r.sourceTs ?? r.time ?? r.timestamp ?? null;
//       const date = tryParseDate(rawTs);
//       let systolic = null, diastolic = null;
//       if (r.bp && typeof r.bp === "string") {
//         const parts = r.bp.split("/").map((s) => s.trim());
//         const sVal = parseInt(parts[0], 10);
//         const dVal = parseInt(parts[1], 10);
//         if (!Number.isNaN(sVal)) systolic = sVal;
//         if (!Number.isNaN(dVal)) diastolic = dVal;
//       }
//       return {
//         _idx: idx,
//         raw: r,
//         date,
//         timeISO: date ? date.toISOString() : "",
//         timeLabel: date ? date.toLocaleString() : "",
//         temperature: Number(r.temperature ?? NaN),
//         sugar: Number(r.sugar ?? NaN),
//         systolic,
//         diastolic,
//         heartRate: Number(r.heartRate ?? NaN),
//         deviceId: r.deviceId ?? r.source ?? null,
//       };
//     })
//     .filter((x) => x.date && !isNaN(x.date.getTime()))
//     .sort((a, b) => a.date - b.date);
// }
// function buildSeries(normalized = [], maxPoints = 80) {
//   const slice = normalized.slice(-maxPoints);
//   return slice.map((r) => ({
//     time: r.timeLabel,
//     timeShort: r.date
//       ? r.date.toLocaleTimeString([], {
//           hour: "2-digit",
//           minute: "2-digit",
//           second: "2-digit",
//         })
//       : "",
//     temperature: r.temperature,
//     sugar: r.sugar,
//     systolic: r.systolic,
//     diastolic: r.diastolic,
//     heartRate: r.heartRate,
//   }));
// }

// /* ---------- Component ---------- */
// export default function PatientPortal() {
//   const params = useParams();
//   const [patientId, setPatientId] = useState(params?.id || "");
//   const [identity, setIdentity] = useState("");
//   const [patient, setPatient] = useState(null);
//   const [rawRecords, setRawRecords] = useState([]);
//   const [series, setSeries] = useState([]);
//   const [normalized, setNormalized] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [note, setNote] = useState("");
//   const [now, setNow] = useState(new Date());

//   // Update live clock
//   useEffect(() => {
//     const t = setInterval(() => setNow(new Date()), 1000);
//     return () => clearInterval(t);
//   }, []);

//   const handleLoad = useCallback(
//     async (explicitId) => {
//       const idToUse = (explicitId || patientId || "").trim();
//       if (!idToUse) {
//         setNote("Please enter your patient ID.");
//         return;
//       }
//       setLoading(true);
//       setNote("");
//       try {
//         let url = `/patients/${encodeURIComponent(idToUse)}`;
//         if (identity) url += `?identity=${encodeURIComponent(identity)}`;
//         const resp = await client.get(url);
//         let p = resp?.data;
//         if (p?.patient) p = p.patient;
//         if (p?.patients && Array.isArray(p.patients)) {
//           p = p.patients.find((x) => (x.id || x.patientId) === idToUse) || p.patients[0];
//         }
//         setPatient(p || null);
//         const recs = (p && (p.records || p.patient?.records)) || [];
//         const norm = normalizeRecords(recs || []);
//         setRawRecords(recs || []);
//         setNormalized(norm);
//         setSeries(buildSeries(norm, 120));
//         if (!p) setNote("Patient not found.");
//       } catch (err) {
//         const errMsg = err?.response?.data?.error || err?.message || String(err);
//         setNote(`Failed to load patient: ${errMsg}`);
//       } finally {
//         setLoading(false);
//       }
//     },
//     [identity, patientId]
//   );

//   // Auto-refresh every 10 seconds when a patient is loaded
//   useEffect(() => {
//     if (!patientId) return;
//     handleLoad(patientId); // initial
//     const interval = setInterval(() => handleLoad(patientId), 10000);
//     return () => clearInterval(interval);
//   }, [patientId, handleLoad]);

//   // If opened with /patient/:id, auto-load immediately
//   useEffect(() => {
//     if (params?.id) handleLoad(params.id);
//   }, [params?.id, handleLoad]);

//   return (
//     <div>
//       <h2 className="text-2xl font-bold mb-4">Patient Portal</h2>

//       {/* Top Controls */}
//       <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
//         <input
//           value={patientId}
//           onChange={(e) => setPatientId(e.target.value)}
//           placeholder="Enter patient id (e.g. patient1)"
//           className="border p-2 rounded md:col-span-1"
//         />
//         <input
//           value={identity}
//           onChange={(e) => setIdentity(e.target.value)}
//           placeholder="Optional identity (wallet name)"
//           className="border p-2 rounded md:col-span-1"
//         />
//         <div className="flex gap-2">
//           <button
//             onClick={() => handleLoad()}
//             disabled={loading}
//             className="bg-blue-600 text-white px-3 py-2 rounded"
//           >
//             {loading ? "Loading..." : "Load My Records"}
//           </button>
//           <button
//             onClick={() => {
//               setPatientId("");
//               setIdentity("");
//               setPatient(null);
//               setRawRecords([]);
//               setSeries([]);
//               setNormalized([]);
//               setNote("");
//             }}
//             className="px-3 py-2 border rounded"
//           >
//             Clear
//           </button>
//         </div>

//         {/* Current time display */}
//         <div className="md:col-span-1 text-right text-sm text-gray-600">
//           <div>Local time</div>
//           <div className="font-mono">{now.toLocaleString()}</div>
//         </div>
//       </div>

//       {note && <div className="mb-4 text-sm text-red-600">{note}</div>}

//       {/* Content */}
//       {patient ? (
//         <div className="space-y-6">
//           {/* Chart */}
//           <div className="bg-white p-4 rounded-2xl shadow">
//             <h4 className="font-semibold mb-2">
//               Vitals Chart (auto-refreshing every 10 s)
//             </h4>
//             <div style={{ width: "100%", height: 340, minWidth: 0 }}>
//               {series.length === 0 ? (
//                 <div className="p-4 text-gray-600">No time-series vitals available.</div>
//               ) : (
//                 <ResponsiveContainer width="100%" height="100%">
//                   <LineChart data={series}>
//                     <CartesianGrid strokeDasharray="3 3" />
//                     <XAxis dataKey="timeShort" minTickGap={10} />
//                     <YAxis yAxisId="left" />
//                     <YAxis yAxisId="bp" orientation="right" domain={[40, "dataMax + 10"]} />
//                     <Tooltip />
//                     <Legend />
//                     <Line type="monotone" dataKey="temperature" name="Temp (°C)" stroke="#ff7300" dot={false} yAxisId="left" />
//                     <Line type="monotone" dataKey="sugar" name="Sugar (mg/dL)" stroke="#387908" dot={false} yAxisId="left" />
//                     <Line type="monotone" dataKey="systolic" name="Systolic" stroke="#1f77b4" dot={false} yAxisId="bp" />
//                     <Line type="monotone" dataKey="diastolic" name="Diastolic" stroke="#9467bd" dot={false} yAxisId="bp" />
//                     <Line type="monotone" dataKey="heartRate" name="Heart Rate" stroke="#e377c2" dot={false} yAxisId="left" />
//                   </LineChart>
//                 </ResponsiveContainer>
//               )}
//             </div>
//           </div>

//           {/* Patient Summary */}
//           <div className="bg-white p-4 rounded-2xl shadow">
//             <h3 className="text-lg font-semibold">
//               {patient.name || patient.patient?.name || patient.id || "Patient"}
//             </h3>
//             <div className="text-sm text-gray-700 mt-1 space-y-1">
//               <div>Patient ID: {patient.id || patient.patientId || "—"}</div>
//               <div>Age: {patient.age || "—"}</div>
//               <div>Doctor: {patient.doctor || "—"}</div>
//               <div>Records: {rawRecords.length}</div>
//               <div>
//                 Last seen:{" "}
//                 {normalized.length
//                   ? normalized[normalized.length - 1].timeLabel
//                   : "—"}
//               </div>
//             </div>
//           </div>

//           {/* Recent Records */}
//           <div className="bg-white p-4 rounded-2xl shadow">
//             <h4 className="font-semibold mb-2">Recent Records</h4>
//             {normalized.length === 0 ? (
//               <p className="text-gray-600">No records found.</p>
//             ) : (
//               <div className="space-y-3 max-h-96 overflow-y-auto">
//                 {[...normalized].slice().reverse().map((r) => (
//                   <div key={r.timeISO || r._idx} className="p-3 border rounded">
//                     <div className="flex justify-between items-start">
//                       <div className="text-sm text-gray-600">{r.timeLabel}</div>
//                       <div className="text-xs text-gray-500">
//                         Device: {r.deviceId || "—"}
//                       </div>
//                     </div>
//                     <div className="mt-1">
//                       <div>
//                         <strong>BP:</strong>{" "}
//                         {r.systolic && r.diastolic
//                           ? `${r.systolic}/${r.diastolic}`
//                           : r.raw.bp || "—"}
//                       </div>
//                       <div>
//                         <strong>Sugar:</strong>{" "}
//                         {r.sugar != null ? r.sugar : "—"}
//                       </div>
//                       <div>
//                         <strong>Temperature:</strong>{" "}
//                         {r.temperature != null ? `${r.temperature} °C` : "—"}
//                       </div>
//                       <div>
//                         <strong>Heart Rate:</strong>{" "}
//                         {r.heartRate != null ? `${r.heartRate} bpm` : "—"}
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         </div>
//       ) : (
//         <div className="text-gray-600">
//           Enter your patient ID above and click “Load My Records” to view your
//           data.
//         </div>
//       )}
//     </div>
//   );
// }



// // src/pages/PatientPortal.jsx
// import React, { useState, useEffect, useCallback } from "react";
// import { useParams } from "react-router-dom";
// import {
//   ResponsiveContainer,
//   LineChart,
//   Line,
//   CartesianGrid,
//   XAxis,
//   YAxis,
//   Tooltip,
//   Legend,
// } from "recharts";
// import client from "../api";

// /* ---------- Helpers ---------- */
// function sanitizeTs(s) {
//   if (!s) return s;
//   let t = String(s).trim();
//   t = t.replace(/\s+/g, "T");
//   t = t.replace(/(\.\d{3})\d+(Z|[+-]\d{2}:\d{2}|$)/, "$1$2");
//   return t;
// }
// function tryParseDate(raw) {
//   if (raw == null) return null;
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
// function normalizeRecords(records = []) {
//   if (!Array.isArray(records)) return [];
//   return records
//     .map((r, idx) => {
//       const rawTs = r.ts ?? r.sourceTs ?? r.time ?? r.timestamp ?? null;
//       const date = tryParseDate(rawTs);
//       let systolic = null,
//         diastolic = null;
//       if (r.bp && typeof r.bp === "string") {
//         const parts = r.bp.split("/").map((s) => s.trim());
//         const sVal = parseInt(parts[0], 10);
//         const dVal = parseInt(parts[1], 10);
//         if (!Number.isNaN(sVal)) systolic = sVal;
//         if (!Number.isNaN(dVal)) diastolic = dVal;
//       }
//       return {
//         _idx: idx,
//         raw: r,
//         date,
//         timeISO: date ? date.toISOString() : "",
//         timeLabel: date ? date.toLocaleString() : "",
//         temperature: Number(r.temperature ?? NaN),
//         sugar: Number(r.sugar ?? NaN),
//         systolic,
//         diastolic,
//         heartRate: Number(r.heartRate ?? NaN),
//         deviceId: r.deviceId ?? r.source ?? null,
//       };
//     })
//     .filter((x) => x.date && !isNaN(x.date.getTime()))
//     .sort((a, b) => a.date - b.date);
// }
// function buildSeries(normalized = [], maxPoints = 80) {
//   const slice = normalized.slice(-maxPoints);
//   return slice.map((r) => ({
//     time: r.timeLabel,
//     timeShort: r.date
//       ? r.date.toLocaleTimeString([], {
//           hour: "2-digit",
//           minute: "2-digit",
//           second: "2-digit",
//         })
//       : "",
//     temperature: r.temperature,
//     sugar: r.sugar,
//     systolic: r.systolic,
//     diastolic: r.diastolic,
//     heartRate: r.heartRate,
//   }));
// }

// /* ---------- Component ---------- */
// export default function PatientPortal() {
//   const params = useParams();
//   const [patientId, setPatientId] = useState(params?.id || "");
//   const [identity, setIdentity] = useState("");
//   const [patient, setPatient] = useState(null);
//   const [rawRecords, setRawRecords] = useState([]);
//   const [series, setSeries] = useState([]);
//   const [normalized, setNormalized] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [note, setNote] = useState("");
//   const [now, setNow] = useState(new Date());
//   const [autoReload, setAutoReload] = useState(false); // 🟢 controls refresh loop

//   // Live clock
//   useEffect(() => {
//     const t = setInterval(() => setNow(new Date()), 1000);
//     return () => clearInterval(t);
//   }, []);

//   const handleLoad = useCallback(
//     async (explicitId) => {
//       const idToUse = (explicitId || patientId || "").trim();
//       if (!idToUse) {
//         setNote("Please enter your patient ID.");
//         return;
//       }
//       setLoading(true);
//       setNote("");

//       try {
//         let url = `/patients/${encodeURIComponent(idToUse)}`;
//         if (identity) url += `?identity=${encodeURIComponent(identity)}`;
//         const resp = await client.get(url);
//         let p = resp?.data;
//         if (p?.patient) p = p.patient;
//         if (p?.patients && Array.isArray(p.patients)) {
//           p = p.patients.find((x) => (x.id || x.patientId) === idToUse) || p.patients[0];
//         }

//         setPatient(p || null);
//         const recs = (p && (p.records || p.patient?.records)) || [];
//         const norm = normalizeRecords(recs || []);
//         setRawRecords(recs || []);
//         setNormalized(norm);
//         setSeries(buildSeries(norm, 120));

//         if (p) {
//           setAutoReload(true); // ✅ Start auto-refresh only after success
//         } else {
//           setNote("Patient not found.");
//         }
//       } catch (err) {
//         const errMsg = err?.response?.data?.error || err?.message || String(err);
//         setNote(`Failed to load patient: ${errMsg}`);
//       } finally {
//         setLoading(false);
//       }
//     },
//     [identity, patientId]
//   );

//   // 🕒 Auto-refresh every 10 seconds (only if autoReload is true)
//   useEffect(() => {
//     if (!autoReload || !patientId) return;
//     const interval = setInterval(() => handleLoad(patientId), 10000);
//     return () => clearInterval(interval);
//   }, [autoReload, patientId, handleLoad]);

//   // Auto-load if route param exists
//   useEffect(() => {
//     if (params?.id) handleLoad(params.id);
//   }, [params?.id, handleLoad]);

//   return (
//     <div>
//       <h2 className="text-2xl font-bold mb-4">Patient Portal</h2>

//       {/* Top Inputs */}
//       <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
//         <input
//           value={patientId}
//           onChange={(e) => setPatientId(e.target.value)}
//           placeholder="Enter patient id (e.g. patient1)"
//           className="border p-2 rounded md:col-span-1"
//         />
//         <input
//           value={identity}
//           onChange={(e) => setIdentity(e.target.value)}
//           placeholder="Optional identity (wallet name)"
//           className="border p-2 rounded md:col-span-1"
//         />
//         <div className="flex gap-2">
//           <button
//             onClick={() => handleLoad()}
//             disabled={loading}
//             className="bg-blue-600 text-white px-3 py-2 rounded"
//           >
//             {loading ? "Loading..." : "Load My Records"}
//           </button>
//           <button
//             onClick={() => {
//               setPatientId("");
//               setIdentity("");
//               setPatient(null);
//               setRawRecords([]);
//               setSeries([]);
//               setNormalized([]);
//               setNote("");
//               setAutoReload(false); // 🔴 Stop auto-refresh when cleared
//             }}
//             className="px-3 py-2 border rounded"
//           >
//             Clear
//           </button>
//         </div>

//         <div className="md:col-span-1 text-right text-sm text-gray-600">
//           <div>Local time</div>
//           <div className="font-mono">{now.toLocaleString()}</div>
//         </div>
//       </div>

//       {note && <div className="mb-4 text-sm text-red-600">{note}</div>}

//       {patient ? (
//         <div className="space-y-6">
//           {/* Chart */}
//           <div className="bg-white p-4 rounded-2xl shadow">
//             <h4 className="font-semibold mb-2">
//               Vitals Chart (auto-refresh every 10s)
//             </h4>
//             <div style={{ width: "100%", height: 340, minWidth: 0 }}>
//               {series.length === 0 ? (
//                 <div className="p-4 text-gray-600">No time-series vitals yet.</div>
//               ) : (
//                 <ResponsiveContainer width="100%" height="100%">
//                   <LineChart data={series}>
//                     <CartesianGrid strokeDasharray="3 3" />
//                     <XAxis dataKey="timeShort" minTickGap={10} />
//                     <YAxis yAxisId="left" />
//                     <YAxis yAxisId="bp" orientation="right" domain={[40, "dataMax + 10"]} />
//                     <Tooltip />
//                     <Legend />
//                     <Line type="monotone" dataKey="temperature" name="Temp (°C)" stroke="#ff7300" dot={false} yAxisId="left" />
//                     <Line type="monotone" dataKey="sugar" name="Sugar (mg/dL)" stroke="#387908" dot={false} yAxisId="left" />
//                     <Line type="monotone" dataKey="systolic" name="Systolic" stroke="#1f77b4" dot={false} yAxisId="bp" />
//                     <Line type="monotone" dataKey="diastolic" name="Diastolic" stroke="#9467bd" dot={false} yAxisId="bp" />
//                     <Line type="monotone" dataKey="heartRate" name="Heart Rate" stroke="#e377c2" dot={false} yAxisId="left" />
//                   </LineChart>
//                 </ResponsiveContainer>
//               )}
//             </div>
//           </div>

//           {/* Patient Info */}
//           <div className="bg-white p-4 rounded-2xl shadow">
//             <h3 className="text-lg font-semibold">
//               {patient.name || patient.id || "Patient"}
//             </h3>
//             <div className="text-sm text-gray-700 mt-1 space-y-1">
//               <div>Patient ID: {patient.id || patient.patientId || "—"}</div>
//               <div>Age: {patient.age || "—"}</div>
//               <div>Doctor: {patient.doctor || "—"}</div>
//               <div>Records: {rawRecords.length}</div>
//               <div>
//                 Last seen:{" "}
//                 {normalized.length
//                   ? normalized[normalized.length - 1].timeLabel
//                   : "—"}
//               </div>
//             </div>
//           </div>

//           {/* Records List */}
//           <div className="bg-white p-4 rounded-2xl shadow">
//             <h4 className="font-semibold mb-2">Recent Records</h4>
//             {normalized.length === 0 ? (
//               <p className="text-gray-600">No records found.</p>
//             ) : (
//               <div className="space-y-3 max-h-96 overflow-y-auto">
//                 {[...normalized].slice().reverse().map((r) => (
//                   <div key={r.timeISO || r._idx} className="p-3 border rounded">
//                     <div className="flex justify-between items-start">
//                       <div className="text-sm text-gray-600">{r.timeLabel}</div>
//                       <div className="text-xs text-gray-500">
//                         Device: {r.deviceId || "—"}
//                       </div>
//                     </div>
//                     <div className="mt-1">
//                       <div>
//                         <strong>BP:</strong>{" "}
//                         {r.systolic && r.diastolic
//                           ? `${r.systolic}/${r.diastolic}`
//                           : r.raw.bp || "—"}
//                       </div>
//                       <div>
//                         <strong>Sugar:</strong> {r.sugar ?? "—"}
//                       </div>
//                       <div>
//                         <strong>Temperature:</strong>{" "}
//                         {r.temperature != null ? `${r.temperature} °C` : "—"}
//                       </div>
//                       <div>
//                         <strong>Heart Rate:</strong>{" "}
//                         {r.heartRate != null ? `${r.heartRate} bpm` : "—"}
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         </div>
//       ) : (
//         <div className="text-gray-600">
//           Enter your patient ID above and click “Load My Records” to view your data.
//         </div>
//       )}
//     </div>
//   );
// }



// src/pages/PatientPortal.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import client from "../api";

/* ---------- Helpers ---------- */
function sanitizeTs(s) {
  if (!s) return s;
  let t = String(s).trim();
  t = t.replace(/\s+/g, "T");
  t = t.replace(/(\.\d{3})\d+(Z|[+-]\d{2}:\d{2}|$)/, "$1$2");
  return t;
}
function tryParseDate(raw) {
  if (raw == null) return null;
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
function normalizeRecords(records = []) {
  if (!Array.isArray(records)) return [];
  return records
    .map((r, idx) => {
      const rawTs = r.ts ?? r.sourceTs ?? r.time ?? r.timestamp ?? null;
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
        date,
        timeISO: date ? date.toISOString() : "",
        timeLabel: date ? date.toLocaleString() : "",
        temperature: r.temperature != null ? Number(r.temperature) : null,
        sugar: r.sugar != null ? Number(r.sugar) : null,
        systolic,
        diastolic,
        heartRate: r.heartRate != null ? Number(r.heartRate) : null,
        deviceId: r.deviceId ?? r.source ?? null,
      };
    })
    .filter((x) => x.date && !isNaN(x.date.getTime()))
    .sort((a, b) => a.date - b.date);
}
function buildSeries(normalized = [], maxPoints = 80) {
  const slice = normalized.slice(-maxPoints);
  return slice.map((r) => ({
    time: r.timeLabel,
    timeShort: r.date
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

/* ---------- Small standalone clock (won't re-render whole page) ---------- */
const NowClock = React.memo(function NowClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return <div className="font-mono">{now.toLocaleString()}</div>;
});

/* ---------- Component ---------- */
export default function PatientPortal() {
  const params = useParams();
  const [patientId, setPatientId] = useState(params?.id || "");
  const [identity, setIdentity] = useState("");
  const [patient, setPatient] = useState(null);
  const [rawRecords, setRawRecords] = useState([]);
  const [series, setSeries] = useState([]);
  const [normalized, setNormalized] = useState([]);
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState("");
  const [autoReload, setAutoReload] = useState(false);

  // keep prev series JSON to avoid updating state if unchanged
  const prevSeriesJsonRef = useRef("");

  const handleLoad = useCallback(
    async (explicitId) => {
      const idToUse = (explicitId || patientId || "").trim();
      if (!idToUse) {
        setNote("Please enter your patient ID.");
        return false;
      }
      setLoading(true);
      setNote("");

      try {
        let url = `/patients/${encodeURIComponent(idToUse)}`;
        if (identity) url += `?identity=${encodeURIComponent(identity)}`;
        const resp = await client.get(url);
        let p = resp?.data;
        if (p?.patient) p = p.patient;
        if (p?.patients && Array.isArray(p.patients)) {
          p = p.patients.find((x) => (x.id || x.patientId) === idToUse) || p.patients[0];
        }

        setPatient(p || null);
        const recs = (p && (p.records || p.patient?.records)) || [];
        setRawRecords(recs || []);
        const norm = normalizeRecords(recs || []);
        setNormalized(norm);

        // build series and update only if changed
        const newSeries = buildSeries(norm, 120);
        const newJson = JSON.stringify(newSeries);
        if (newJson !== prevSeriesJsonRef.current) {
          prevSeriesJsonRef.current = newJson;
          setSeries(newSeries);
        }
        if (p) {
          setAutoReload(true); // start auto-refresh only after success
          return true;
        } else {
          setNote("Patient not found.");
          return false;
        }
      } catch (err) {
        const errMsg = err?.response?.data?.error || err?.message || String(err);
        setNote(`Failed to load patient: ${errMsg}`);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [identity, patientId]
  );

  // auto-refresh every 10s but only when autoReload true
  useEffect(() => {
    if (!autoReload || !patientId) return;
    const iv = setInterval(() => {
      // fire-and-forget; handleLoad will compare and only set state if changed
      void handleLoad(patientId);
    }, 10000);
    return () => clearInterval(iv);
  }, [autoReload, patientId, handleLoad]);

  // auto-load route param
  useEffect(() => {
    if (params?.id) {
      void handleLoad(params.id);
    }
  }, [params?.id, handleLoad]);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Patient Portal</h2>

      <div className="mb-4 grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
        <input
          value={patientId}
          onChange={(e) => setPatientId(e.target.value)}
          placeholder="Enter patient id (e.g. patient1)"
          className="border p-2 rounded md:col-span-1"
        />
        <input
          value={identity}
          onChange={(e) => setIdentity(e.target.value)}
          placeholder="Optional identity (wallet name)"
          className="border p-2 rounded md:col-span-1"
        />
        <div className="flex gap-2">
          <button
            onClick={() => void handleLoad()}
            disabled={loading}
            className="bg-blue-600 text-white px-3 py-2 rounded"
          >
            {loading ? "Loading..." : "Load My Records"}
          </button>
          <button
            onClick={() => {
              setPatientId("");
              setIdentity("");
              setPatient(null);
              setRawRecords([]);
              setSeries([]);
              setNormalized([]);
              setNote("");
              setAutoReload(false);
              prevSeriesJsonRef.current = "";
            }}
            className="px-3 py-2 border rounded"
          >
            Clear
          </button>
        </div>

        <div className="md:col-span-1 text-right text-sm text-gray-600">
          <div>Local time</div>
          <NowClock />
        </div>
      </div>

      {note && <div className="mb-4 text-sm text-red-600">{note}</div>}

      {patient ? (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-2xl shadow">
            <h4 className="font-semibold mb-2">Vitals Chart (Temperature · Sugar · BP · HR)</h4>
            <div style={{ width: "100%", height: 340, minWidth: 0 }}>
              {series.length === 0 ? (
                <div className="p-4 text-gray-600">No time-series vitals available to chart.</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={series}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timeShort" minTickGap={10} />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="bp" orientation="right" domain={[40, "dataMax + 10"]} />
                    <Tooltip />
                    <Legend />
                    {/* animations disabled so chart stays static between updates */}
                    <Line type="monotone" dataKey="temperature" name="Temp (°C)" stroke="#ff7300" dot={false} yAxisId="left" isAnimationActive={false} />
                    <Line type="monotone" dataKey="sugar" name="Sugar (mg/dL)" stroke="#387908" dot={false} yAxisId="left" isAnimationActive={false} />
                    <Line type="monotone" dataKey="systolic" name="Systolic" stroke="#1f77b4" dot={false} yAxisId="bp" isAnimationActive={false} />
                    <Line type="monotone" dataKey="diastolic" name="Diastolic" stroke="#9467bd" dot={false} yAxisId="bp" isAnimationActive={false} />
                    <Line type="monotone" dataKey="heartRate" name="Heart Rate" stroke="#e377c2" dot={false} yAxisId="left" isAnimationActive={false} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Patient summary */}
          <div className="bg-white p-4 rounded-2xl shadow">
            <h3 className="text-lg font-semibold">{patient.name || patient.id || "Patient"}</h3>
            <div className="text-sm text-gray-700 mt-1 space-y-1">
              <div>Patient ID: {patient.id || patient.patientId || "—"}</div>
              <div>Age: {patient.age || patient.patient?.age || "—"}</div>
              <div>Doctor: {patient.doctor || patient.patient?.doctor || "—"}</div>
              <div>Records: {Array.isArray(rawRecords) ? rawRecords.length : 0}</div>
              <div>Last seen: {normalized.length ? normalized[normalized.length - 1].timeLabel : "—"}</div>
            </div>
          </div>

          {/* Records list */}
          <div className="bg-white p-4 rounded-2xl shadow">
            <h4 className="font-semibold mb-2">Recent Records</h4>
            {normalized.length === 0 ? (
              <p className="text-gray-600">No records found.</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {[...normalized].slice().reverse().map((r) => (
                  <div key={r.timeISO || r._idx} className="p-3 border rounded">
                    <div className="flex justify-between items-start">
                      <div className="text-sm text-gray-600">{r.timeLabel}</div>
                      <div className="text-xs text-gray-500">Device: {r.deviceId || "—"}</div>
                    </div>
                    <div className="mt-1">
                      <div><strong>BP:</strong> {r.systolic && r.diastolic ? `${r.systolic}/${r.diastolic}` : r.raw.bp || "—"}</div>
                      <div><strong>Sugar:</strong> {r.sugar ?? "—"}</div>
                      <div><strong>Temperature:</strong> {r.temperature != null ? `${r.temperature} °C` : "—"}</div>
                      <div><strong>Heart Rate:</strong> {r.heartRate != null ? `${r.heartRate} bpm` : "—"}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-gray-600">Enter your patient ID above and click “Load My Records” to view your data.</div>
      )}
    </div>
  );
}
