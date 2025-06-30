'use client';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from 'recharts';

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

const chartData = [
  { day: 'Lunes', orders: Math.floor(Math.random() * 100) + 20 },
  { day: 'Martes', orders: Math.floor(Math.random() * 100) + 20 },
  { day: 'Miércoles', orders: Math.floor(Math.random() * 100) + 20 },
  { day: 'Jueves', orders: Math.floor(Math.random() * 100) + 20 },
  { day: 'Viernes', orders: Math.floor(Math.random() * 100) + 20 },
  { day: 'Sábado', orders: Math.floor(Math.random() * 100) + 20 },
  { day: 'Domingo', orders: Math.floor(Math.random() * 100) + 20 },
];

const chartConfig = {
  orders: {
    label: 'Pedidos',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

export function OverviewChart() {
  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <BarChart
        accessibilityLayer
        data={chartData}
        margin={{
          top: 5,
          right: 10,
          left: -10,
          bottom: 0,
        }}
      >
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="day"
          stroke="hsl(var(--muted-foreground))"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="dot" />}
        />
        <Bar dataKey="orders" fill="hsl(var(--primary))" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}
