"use client";

import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip } from "recharts";

const DEVICE_COLORS = ["#14213D", "#C9A24B"];

export interface DeviceCount {
  name: string;
  value: number;
}

export interface ReferrerCount {
  name: string;
  value: number;
}

export default function DeviceReferrerBreakdown({
  devices,
  referrers,
}: {
  devices: DeviceCount[];
  referrers: ReferrerCount[];
}) {
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      <div className="card-shadow rounded-2xl bg-white p-5">
        <h3 className="mb-4 font-display text-base font-bold text-navy">Cihaz Dağılımı (Site Geneli)</h3>
        {devices.every((d) => d.value === 0) ? (
          <p className="text-sm text-ink/40">Henüz veri yok.</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={devices} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={3}>
                {devices.map((d, i) => (
                  <Cell key={d.name} fill={DEVICE_COLORS[i % DEVICE_COLORS.length]} />
                ))}
              </Pie>
              <Legend verticalAlign="bottom" height={30} />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
      <div className="card-shadow rounded-2xl bg-white p-5">
        <h3 className="mb-4 font-display text-base font-bold text-navy">Trafik Kaynağı</h3>
        {referrers.length === 0 ? (
          <p className="text-sm text-ink/40">Henüz veri yok.</p>
        ) : (
          <div className="flex flex-col divide-y divide-line">
            {referrers.map((r) => (
              <div key={r.name} className="flex items-center justify-between py-2.5 text-sm">
                <span className="truncate font-semibold text-navy">{r.name}</span>
                <span className="text-xs font-semibold text-ink/50">{r.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
