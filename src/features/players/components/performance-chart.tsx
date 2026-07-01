"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PerformanceDataPoint } from "@/types";

interface Props {
  data: PerformanceDataPoint[];
}

export function PerformanceChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <Card className="glass">
        <CardHeader>
          <CardTitle className="text-base">Rendimiento ELO</CardTitle>
        </CardHeader>
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          Juega partidos para ver tu evolución
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle className="text-base">Rendimiento ELO</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
            <XAxis
              dataKey="date"
              stroke="#A1A1AA"
              fontSize={12}
              tickLine={false}
            />
            <YAxis stroke="#A1A1AA" fontSize={12} tickLine={false} />
            <Tooltip
              contentStyle={{
                background: "#141414",
                border: "1px solid #2A2A2A",
                borderRadius: "8px",
              }}
            />
            <Line
              type="monotone"
              dataKey="elo"
              stroke="#39FF14"
              strokeWidth={2}
              dot={{ fill: "#39FF14", r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
