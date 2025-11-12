#!/usr/bin/env python3
# iot_simulator.py
# Usage: python3 iot_simulator.py
import time
import random
import requests
from datetime import datetime, timezone

API_BASE = "http://localhost:4000"   # change if your API gateway is elsewhere
IOT_IDENTITY = "iotclient"           # identity in wallet
SLEEP_SECONDS = 5                    # time between each push cycle

def fetch_patients():
    try:
        r = requests.get(f"{API_BASE}/patients", timeout=5)
        r.raise_for_status()
        j = r.json()
        if isinstance(j, list):
            return j
        if isinstance(j, dict) and "patients" in j:
            return j["patients"]
        # fallback: if API returns page structure
        return j.get("patients", [])
    except Exception as e:
        print("Failed to fetch patients:", e)
        return []

def random_vitals():
    return {
        "bp": f"{random.randint(110, 140)}/{random.randint(65, 95)}",
        "sugar": random.randint(70, 180),
        "temperature": round(random.uniform(36.0, 38.6), 1),
        "deviceId": "simulator",
        "ts": datetime.now(timezone.utc).isoformat()
    }

def push_record(patient_id, record):
    try:
        url = f"{API_BASE}/patients/{patient_id}/record?identity={IOT_IDENTITY}"
        r = requests.post(url, json=record, timeout=5)
        r.raise_for_status()
        return r.json()
    except Exception as e:
        return {"error": str(e), "status_text": getattr(e, "response", None) and getattr(e.response, "text", None)}

def main():
    print("IoT simulator starting. Ctrl+C to stop.")
    while True:
        patients = fetch_patients()
        if not patients:
            print("No patients returned. Retrying in 5s...")
            time.sleep(SLEEP_SECONDS)
            continue

        # send one reading per patient (or adapt to send multiple)
        for p in patients:
            pid = p.get("id") or p.get("patientId") or p.get("patient", {}).get("id")
            if not pid:
                # skip if no usable id
                continue
            rec = random_vitals()
            resp = push_record(pid, rec)
            print(f"{datetime.now().isoformat()} -> pushed to {pid}: {rec} => {resp}")
            # small per-patient delay to avoid bursts
            time.sleep(0.2)

        # sleep before next cycle
        time.sleep(SLEEP_SECONDS)

if __name__ == "__main__":
    main()
