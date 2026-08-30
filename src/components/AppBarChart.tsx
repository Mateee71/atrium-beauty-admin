"use client";
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

const chartConfig = {
  fulfilled: {
    label: "Teljesült",
    color: "var(--chart-1)",
  },
  resigned: {
    label: "Lemondott",
    color: "var(--chart-4)",
  },
  pending: {
    label: "Foglalt",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

type AppBarChartProps = {
  data: {
    month: string;
    fulfilled: number;
    resigned: number;
    pending: number;
  }[];
};

const AppBarChart = ({ data }: AppBarChartProps) => {
  return (
    <div className="">
      <h1 className="text-lg font-medium mb-6">Időpontok havi bontásban</h1>
      <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
        <BarChart accessibilityLayer data={data}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="month"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            tickFormatter={(value) => value.slice(0, 3)}
          />
          <YAxis
            tickLine={false}
            tickMargin={10}
            axisLine={false}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar dataKey="pending" fill="var(--color-pending)" radius={4} />
          <Bar dataKey="fulfilled" fill="var(--color-fulfilled)" radius={4} />
          <Bar dataKey="resigned" fill="var(--color-resigned)" radius={4} />
        </BarChart>
      </ChartContainer>
    </div>
  );
};

export default AppBarChart;
