"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const chartConfig = {
  pending: {
    label: "Foglalt",
    color: "var(--chart-2)",
  },
  fulfilled: {
    label: "Teljesült",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

type AppAreaChartProps = {
  data: {
    day: string;
    pending: number;
    fulfilled: number;
  }[];
};

const AppAreaChart = ({ data }: AppAreaChartProps) => {
  return (
    <div>
      <h1 className="text-lg font-medium mb-6">Aktuális havi időpontok</h1>

      <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
        <AreaChart accessibilityLayer data={data}>
          <CartesianGrid vertical={false} />

          <XAxis
            dataKey="day"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
          />

          <YAxis tickLine={false} tickMargin={10} axisLine={false} />

          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />

          <defs>
            <linearGradient id="fillPending" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="var(--color-pending)"
                stopOpacity={0.8}
              />
              <stop
                offset="95%"
                stopColor="var(--color-pending)"
                stopOpacity={0.1}
              />
            </linearGradient>

            <linearGradient id="fillFulfilled" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="var(--color-fulfilled)"
                stopOpacity={0.8}
              />
              <stop
                offset="95%"
                stopColor="var(--color-fulfilled)"
                stopOpacity={0.1}
              />
            </linearGradient>
          </defs>

          <Area
            dataKey="pending"
            type="natural"
            fill="url(#fillPending)"
            fillOpacity={0.4}
            stroke="var(--color-pending)"
            stackId="a"
          />

          <Area
            dataKey="fulfilled"
            type="natural"
            fill="url(#fillFulfilled)"
            fillOpacity={0.4}
            stroke="var(--color-fulfilled)"
            stackId="a"
          />
        </AreaChart>
      </ChartContainer>
    </div>
  );
};

export default AppAreaChart;