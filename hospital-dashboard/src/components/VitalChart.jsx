import React from "react";
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

/**
 * VitalChart
 * props:
 *   data: array of { time: ISOstring or Date, temperature: number, sugar: number, systolic: number, diastolic: number }
 */
export default function VitalChart({ data = [], height = 300 }) {
  // defensive: ensure data is an array of objects with 'time' as label
  const chartData = (Array.isArray(data) ? data : []).map((d) => ({
    ...d,
    // ensure time is a readable string for x-axis
    time: d.ts ? new Date(d.ts).toLocaleTimeString() : (d.time ? new Date(d.time).toLocaleTimeString() : d.time || ""),
    // numbers may come as strings — coerce
    temperature: d.temperature !== undefined ? Number(d.temperature) : undefined,
    sugar: d.sugar !== undefined ? Number(d.sugar) : undefined,
    systolic: d.systolic !== undefined ? Number(d.systolic) : undefined,
    diastolic: d.diastolic !== undefined ? Number(d.diastolic) : undefined,
  }));

  return (
    <div className="bg-white shadow rounded-2xl p-4">
      <h2 className="text-lg font-semibold mb-2">Vitals</h2>
      <div style={{ width: "100%", height }}>
        <ResponsiveContainer>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" minTickGap={20} />
            <YAxis />
            <Tooltip />
            <Legend verticalAlign="top" height={36} />
            {/* Plot lines only if the value exists for a point; Recharts will skip missing values */}
            <Line dot={false} type="monotone" dataKey="temperature" name="Temperature (°C)" stroke="#ef4444" />
            <Line dot={false} type="monotone" dataKey="sugar" name="Sugar (mg/dL)" stroke="#f59e0b" />
            <Line dot={false} type="monotone" dataKey="systolic" name="BP Systolic" stroke="#3b82f6" strokeDasharray="5 3" />
            <Line dot={false} type="monotone" dataKey="diastolic" name="BP Diastolic" stroke="#10b981" strokeDasharray="2 2" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
