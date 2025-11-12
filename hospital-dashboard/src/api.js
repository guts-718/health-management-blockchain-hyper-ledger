import axios from "axios";

// Use Vite proxy default '/api' so dev server proxies to backend
const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || "/api",
  timeout: 8000,
});

export async function fetchPatients() {
  const resp = await client.get("/patients");
  const data = resp.data;

  // your provided shape: { total, page, pageSize, patients: [...] }
  const arr = Array.isArray(data) ? data : Array.isArray(data?.patients) ? data.patients : [];

  // normalize into consistent patient objects
  return arr.map((item, idx) => {
    // prefer id or patientId
    const id = item.id ?? item.patientId ?? `p-${idx}`;
    // records may be array
    const records = Array.isArray(item.records) ? item.records : (item.patient?.records ?? []);
    return {
      id,
      name: item.name ?? item.patient?.name ?? id,
      age: item.age ?? item.patient?.age ?? null,
      records: records.map((r) => ({
        bp: r.bp ?? null,
        sugar: r.sugar ?? null,
        temperature: r.temperature ?? null,
        deviceId: r.deviceId ?? r.device ?? null,
        ts: r.ts ?? r.timestamp ?? r.sourceTs ?? null,
      })),
      raw: item,
    };
  });
}

// Build vitals array suitable for charting: flatten records with patient ref
export async function fetchVitalsFlattened() {
  const patients = await fetchPatients();
  const points = [];
  for (const p of patients) {
    for (const r of p.records || []) {
      // skip invalid ts
      if (!r.ts) continue;
      points.push({
        patientId: p.id,
        name: p.name,
        time: new Date(r.ts).toISOString(),
        temperature: Number(r.temperature) || null,
        sugar: Number(r.sugar) || null,
        bp: r.bp || null,
        deviceId: r.deviceId || null,
      });
    }
  }
  // sort ascending by time
  points.sort((a, b) => new Date(a.time) - new Date(b.time));
  return points;
}

export async function addPatient(payload) {
  return client.post("/patients", payload);
}

export default client;
