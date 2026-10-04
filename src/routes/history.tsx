import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CartesianGrid, Line, LineChart, Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";
import { AppShell } from "@/components/app/AppShell";
import { PageHeader, Panel, PanchayatPicker, DemoTag } from "@/components/app/widgets";
import { tooltipStyle } from "@/components/app/sections";
import { api, DEFAULT_PANCHAYAT } from "@/lib/services/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "Forecast History — SUKSHMA-AI" },
      { name: "description", content: "Past forecasts versus observations for each Panchayat with temperature and rainfall trends." },
      { property: "og:title", content: "Forecast History — SUKSHMA-AI" },
      { property: "og:description", content: "Forecast vs observation trends by Panchayat." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const [id, setId] = useState(DEFAULT_PANCHAYAT);
  const [days, setDays] = useState("30");
  const rows = api.history(id, Number(days)).map((r) => ({
    ...r,
    forecastTemp: +r.forecastTemp.toFixed(1),
    observedTemp: +r.observedTemp.toFixed(1),
    forecastRain: +r.forecastRain.toFixed(1),
    observedRain: +r.observedRain.toFixed(1),
  }));
  return (
    <AppShell>
      <PageHeader
        eyebrow="Historical trends"
        title="Forecast History"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <PanchayatPicker value={id} onChange={setId} />
            <ToggleGroup type="single" value={days} onValueChange={(v) => v && setDays(v)}>
              {["7", "14", "30"].map((d) => (
                <ToggleGroupItem key={d} value={d} className="rounded-full border px-3 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">{d}d</ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        }
      />
      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Temperature (°C)" action={<DemoTag />}>
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={rows} margin={{ left: -20, right: 8 }}>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" minTickGap={20} />
                <YAxis tick={{ fontSize: 10 }} domain={["dataMin - 1", "dataMax + 1"]} tickFormatter={(v: number) => v.toFixed(0)} stroke="var(--muted-foreground)" />
                <Tooltip {...tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line dataKey="observedTemp" name="Observed" stroke="var(--foreground)" strokeWidth={2} dot={false} />
                <Line dataKey="forecastTemp" name="Forecast" stroke="var(--amber)" strokeWidth={2} dot={false} strokeDasharray="4 3" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel title="Rainfall (mm)" action={<DemoTag />}>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={rows} margin={{ left: -20, right: 8 }}>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" minTickGap={20} />
                <YAxis tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" />
                <Tooltip {...tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="observedRain" name="Observed" fill="var(--sky)" radius={[3, 3, 0, 0]} />
                <Bar dataKey="forecastRain" name="Forecast" fill="var(--teal)" fillOpacity={0.5} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>
      <Panel className="mt-5" title="Forecast vs observation log">
        <div className="max-h-[420px] overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead><TableHead>Panchayat</TableHead>
                <TableHead className="text-right">Forecast</TableHead><TableHead className="text-right">Observation</TableHead><TableHead className="text-right">Difference</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...rows].reverse().map((r) => {
                const d = r.forecastRain - r.observedRain;
                return (
                  <TableRow key={r.iso}>
                    <TableCell className="font-mono text-xs">{r.iso}</TableCell>
                    <TableCell>{api.weather(id).panchayat.name}</TableCell>
                    <TableCell className="tabular text-right">{r.forecastRain} mm · {r.forecastTemp}°</TableCell>
                    <TableCell className="tabular text-right">{r.observedRain} mm · {r.observedTemp}°</TableCell>
                    <TableCell className="tabular text-right">{d > 0 ? "+" : ""}{d.toFixed(1)} mm</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Panel>
    </AppShell>
  );
}
