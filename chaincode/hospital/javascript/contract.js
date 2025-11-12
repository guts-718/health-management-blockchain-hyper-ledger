'use strict';

const { Contract } = require('fabric-contract-api');

class HospitalContract extends Contract {
  // Patient key helper
  _patientKey(ctx, patientId) {
    return ctx.stub.createCompositeKey('patient', [patientId]);
  }

  // Create patient (upsert-friendly for demo)
  async CreatePatient(ctx, patientId, patientJSON) {
    const key = this._patientKey(ctx, patientId);
    let patient;
    try {
      patient = JSON.parse(patientJSON);
    } catch (e) {
      throw new Error('Invalid patient JSON');
    }
    const exists = await ctx.stub.getState(key);
    if (exists && exists.length > 0) {
      // merge for demo simplicity
      const cur = JSON.parse(exists.toString());
      patient = { ...cur, ...patient };
    }
    // Ensure a records array exists
    if (!patient.records) patient.records = [];
    await ctx.stub.putState(key, Buffer.from(JSON.stringify(patient)));
    return JSON.stringify(patient);
  }

  // Get patient
  async GetPatient(ctx, patientId) {
    const key = this._patientKey(ctx, patientId);
    const data = await ctx.stub.getState(key);
    if (!data || data.length === 0) {
      throw new Error(`Patient ${patientId} not found`);
    }
    return data.toString();
  }

  // Assign doctor
  async AssignDoctor(ctx, patientId, doctorId) {
    const key = this._patientKey(ctx, patientId);
    const data = await ctx.stub.getState(key);
    if (!data || data.length === 0) {
      throw new Error(`Patient ${patientId} not found`);
    }
    const patient = JSON.parse(data.toString());
    patient.doctorId = doctorId;
    await ctx.stub.putState(key, Buffer.from(JSON.stringify(patient)));
    return JSON.stringify(patient);
  }

  // Add a vitals/record entry
  async AddRecord(ctx, patientId, recordJSON) {
    const key = this._patientKey(ctx, patientId);
    const data = await ctx.stub.getState(key);
    if (!data || data.length === 0) {
      throw new Error(`Patient ${patientId} not found`);
    }
    const patient = JSON.parse(data.toString());
    let record;
    try {
      record = JSON.parse(recordJSON);
    } catch (e) {
      throw new Error('Invalid record JSON');
    }
    if (!patient.records) patient.records = [];
    const ts = new Date((await ctx.stub.getTxTimestamp()).seconds.low * 1000).toISOString();
    record.ts = ts;
    patient.records.push(record);
    await ctx.stub.putState(key, Buffer.from(JSON.stringify(patient)));
    return JSON.stringify(patient);
  }
}

module.exports = HospitalContract;
