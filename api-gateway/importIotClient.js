const fs = require('fs'), path = require('path');

const mspBase = path.resolve(__dirname, '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'users', 'iotclient@org1.example.com', 'msp');

// defensive checks
if (!fs.existsSync(mspBase)) {
  console.error('ERROR: MSP path not found:', mspBase);
  console.error('List the users directory to inspect what exists:');
  try { console.error(fs.readdirSync(path.resolve(__dirname, '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'users'))); } catch(e) {}
  process.exit(1);
}

const certPath = path.join(mspBase, 'signcerts', 'cert.pem');
const keyDir = path.join(mspBase, 'keystore');
if (!fs.existsSync(certPath)) {
  console.error('ERROR: certificate not found at', certPath);
  process.exit(1);
}
if (!fs.existsSync(keyDir)) {
  console.error('ERROR: keystore directory not found at', keyDir);
  process.exit(1);
}
const keyFiles = fs.readdirSync(keyDir);
if (keyFiles.length === 0) {
  console.error('ERROR: no key file found in keystore:', keyDir);
  process.exit(1);
}
const keyFile = keyFiles[0];

const cert = fs.readFileSync(certPath, 'utf8');
const key = fs.readFileSync(path.join(keyDir, keyFile), 'utf8');

const walletDir = path.join(__dirname, 'wallet');
fs.mkdirSync(walletDir, { recursive: true });

const identity = {
  credentials: { certificate: cert, privateKey: key },
  mspId: 'Org1MSP',
  type: 'X.509'
};

fs.writeFileSync(path.join(walletDir, 'iotclient'), JSON.stringify(identity));
console.log('Imported iotclient into wallet:', path.join(walletDir, 'iotclient'));
