/**
 Extended API Gateway for Hospital project
 - REST endpoints for patients, doctors, records (CRUD + queries)
 - WebSocket server for live IoT feed
 - Simple file-backed cache for recent vitals (data/patients.json + data/records.json)
 - Uses Fabric Gateway for ledger writes/reads
*/
const express = require('express');
const bodyParser = require('body-parser');
const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs-extra');
const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');



// require at top
const cors = require('cors');

// ... create app
const app = express();

// allow the dev UI (Vite default) and local API calls — adjust origin list as needed
app.use(cors());

// optional: allow preflight for all routes



const DATA_DIR = path.join(__dirname, 'data');
fs.ensureDirSync(DATA_DIR);
const PATIENTS_FILE = path.join(DATA_DIR, 'patients.json');
const RECORDS_FILE = path.join(DATA_DIR, 'records.json');
const AUDIT_FILE = path.join(DATA_DIR, 'audit.log');

function readJSONSafe(fp){ try { return fs.readJsonSync(fp); } catch(e){ return {}; } }
function writeJSONSafe(fp, obj){ fs.writeJsonSync(fp, obj, { spaces: 2 }); }

let patientsCache = readJSONSafe(PATIENTS_FILE);
let recordsCache = readJSONSafe(RECORDS_FILE);
setInterval(()=>{ writeJSONSafe(PATIENTS_FILE, patientsCache); writeJSONSafe(RECORDS_FILE, recordsCache); }, 5000);

const ccpPath = path.resolve(__dirname, '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));


app.use(bodyParser.json());

async function getContractForUser(userId='admin') {
  const walletPath = path.join(__dirname, 'wallet');
  const wallet = await Wallets.newFileSystemWallet(walletPath);
  if (!await wallet.get(userId)) {
    throw new Error(`Identity ${userId} not found in wallet`);
  }
  const gateway = new Gateway();
  await gateway.connect(ccp, {
    wallet,
    identity: userId,
    discovery: { enabled: true, asLocalhost: true }
  });
  const network = await gateway.getNetwork('hospitalchannel');
  const contract = network.getContract('hospitalcc');
  return { contract, gateway };
}

function audit(event) {
  const entry = { id: uuidv4(), ts: new Date().toISOString(), ...event };
  fs.appendFileSync(AUDIT_FILE, JSON.stringify(entry) + '\n');
}

// --- REST endpoints ---
app.get('/patients', async (req, res) => {
  try {
    const page = parseInt(req.query.page || '1');
    const pageSize = parseInt(req.query.pageSize || '50');
    const keys = Object.keys(patientsCache);
    const slice = keys.slice((page-1)*pageSize, page*pageSize);
    const data = slice.map(k => ({ id: k, ...patientsCache[k] }));
    res.json({ total: keys.length, page, pageSize, patients: data });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/patients', async (req, res) => {
  try {
    const { patientId, patient, identity='admin' } = req.body;
    if (!patientId || !patient) return res.status(400).json({ error: 'patientId and patient required' });

    const { contract, gateway } = await getContractForUser(identity);
    await contract.submitTransaction('CreatePatient', patientId, JSON.stringify(patient));
    await gateway.disconnect();

    patientsCache[patientId] = patient;
    audit({ type:'CreatePatient', patientId, by: identity });
    res.json({ success: true, patient });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/patients/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const identity = req.query.identity || 'admin';
    const { contract, gateway } = await getContractForUser(identity);
    const resp = await contract.evaluateTransaction('GetPatient', id);
    await gateway.disconnect();
    res.json(JSON.parse(resp.toString()));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/patients/:id/assign', async (req, res) => {
  try {
    const id = req.params.id;
    const { doctorId, identity='admin' } = req.body;
    const { contract, gateway } = await getContractForUser(identity);
    const resp = await contract.submitTransaction('AssignDoctor', id, doctorId);
    await gateway.disconnect();
    const updated = JSON.parse(resp.toString());
    patientsCache[id] = updated;
    audit({ type:'AssignDoctor', patientId:id, doctorId, by: identity });
    res.json(updated);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/patients/:id/record', async (req, res) => {
  try {
    const id = req.params.id;
    const record = req.body;
    const identity = req.query.identity || 'iotclient';
    const { contract, gateway } = await getContractForUser(identity);
    const resp = await contract.submitTransaction('AddRecord', id, JSON.stringify(record));
    await gateway.disconnect();
    const updated = JSON.parse(resp.toString());
    recordsCache[id] = recordsCache[id] || [];
    recordsCache[id].push({ ...record, ts: new Date().toISOString() });
    if (recordsCache[id].length > 1000) recordsCache[id].shift();
    patientsCache[id] = updated;
    broadcastWS({ type:'newRecord', patientId: id, record });
    audit({ type:'AddRecord', patientId:id, by: identity, record });
    res.json({ success:true, patient: updated });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/patients/:id/records', (req, res) => {
  try {
    const id = req.params.id;
    const from = req.query.from ? new Date(req.query.from) : null;
    const to = req.query.to ? new Date(req.query.to) : null;
    const raw = recordsCache[id] || [];
    const filtered = raw.filter(r => {
      const t = new Date(r.ts);
      if (from && t < from) return false;
      if (to && t > to) return false;
      return true;
    });
    res.json({ patientId: id, records: filtered });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/audit/tail', (req, res) => {
  try {
    const tail = fs.readFileSync(AUDIT_FILE, 'utf8').split('\\n').filter(Boolean).slice(-100);
    res.json(tail.map(l=>JSON.parse(l)));
  } catch (e) { res.json([]); }
});

app.get('/export/patients', (req, res) => {
  res.json(patientsCache);
});

// --- WebSocket server for live updates ---
const server = require('http').createServer(app);
const wss = new WebSocket.Server({ server });
function broadcastWS(obj) {
  const msg = JSON.stringify(obj);
  wss.clients.forEach(client => { if (client.readyState === WebSocket.OPEN) client.send(msg); });
}
wss.on('connection', ws => {
  ws.send(JSON.stringify({ type:'welcome', ts: new Date().toISOString() }));
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`server running on ${PORT}`));
