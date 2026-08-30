"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis, LabelList } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

export const description = "An interactive bar chart"

const chartData = [
  { date: "2024-04-01", customers: 222},
  { date: "2024-04-02", customers: 97,},
  { date: "2024-04-03", customers: 167},
  { date: "2024-04-04", customers: 242},
  { date: "2024-04-05", customers: 373},
  { date: "2024-04-06", customers: 301},
  { date: "2024-04-07", customers: 245},
  { date: "2024-04-08", customers: 409},
  { date: "2024-04-09", customers: 59},
  { date: "2024-04-10", customers: 261},
  { date: "2024-04-11", customers: 327},
  { date: "2024-04-12", customers: 292},
  { date: "2024-04-13", customers: 342},
  { date: "2024-04-14", customers: 137},
  { date: "2024-04-15", customers: 120},
  { date: "2024-04-16", customers: 138},
  { date: "2024-04-17", customers: 446},
  { date: "2024-04-18", customers: 364},
  { date: "2024-04-19", customers: 243},
  { date: "2024-04-20", customers: 89},
  { date: "2024-04-21", customers: 137},
  { date: "2024-04-22", customers: 224},
  { date: "2024-04-23", customers: 138},
  { date: "2024-04-24", customers: 387},
  { date: "2024-04-25", customers: 215},
  { date: "2024-04-26", customers: 75},
  { date: "2024-04-27", customers: 383},
  { date: "2024-04-28", customers: 122},
  { date: "2024-04-29", customers: 315},
  { date: "2024-04-30", customers: 454},
  { date: "2024-05-01", customers: 165},
  { date: "2024-05-02", customers: 293},
  { date: "2024-05-03", customers: 247},
  { date: "2024-05-04", customers: 385},
  { date: "2024-05-05", customers: 481},
  { date: "2024-05-06", customers: 498},
  { date: "2024-05-07", customers: 388},
  { date: "2024-05-08", customers: 149},
  { date: "2024-05-09", customers: 227},
  { date: "2024-05-10", customers: 293},
  { date: "2024-05-11", customers: 335},
  { date: "2024-05-12", customers: 197},
  { date: "2024-05-13", customers: 197},
  { date: "2024-05-14", customers: 448},
  { date: "2024-05-15", customers: 473},
  { date: "2024-05-16", customers: 338},
  { date: "2024-05-17", customers: 499},
  { date: "2024-05-18", customers: 315},
  { date: "2024-05-19", customers: 235},
  { date: "2024-05-20", customers: 177},
  { date: "2024-05-21", customers: 82},
  { date: "2024-05-22", customers: 81},
  { date: "2024-05-23", customers: 252},
  { date: "2024-05-24", customers: 294},
  { date: "2024-05-25", customers: 201},
  { date: "2024-05-26", customers: 213},
  { date: "2024-05-27", customers: 420},
  { date: "2024-05-28", customers: 233},
  { date: "2024-05-29", customers: 78},
  { date: "2024-05-30", customers: 340},
  { date: "2024-05-31", customers: 178},
  { date: "2025-10-01", customers: 178},
  { date: "2025-10-02", customers: 470},
  { date: "2025-10-03", customers: 103},
  { date: "2025-10-04", customers: 439},
  { date: "2025-10-05", customers: 88},
  { date: "2025-10-06", customers: 294},
  { date: "2025-10-07", customers: 323},
  { date: "2025-10-08", customers: 385},
  { date: "2025-10-09", customers: 438},
  { date: "2025-10-10", customers: 155},
  { date: "2025-10-11", customers: 92},
  { date: "2025-10-12", customers: 492},
  { date: "2025-10-13", customers: 81},
  { date: "2025-10-14", customers: 426},
  { date: "2025-10-15", customers: 307},
  { date: "2025-10-16", customers: 371},
  { date: "2025-10-17", customers: 475},
  { date: "2025-10-18", customers: 107},
  { date: "2025-10-19", customers: 341},
  { date: "2025-10-20", customers: 408},
  { date: "2025-10-21", customers: 169},
  { date: "2025-10-22", customers: 317},
  { date: "2025-10-23", customers: 480},
  { date: "2025-10-24", customers: 132},
  { date: "2025-10-25", customers: 141},
  { date: "2025-10-26", customers: 434},
  { date: "2025-10-27", customers: 448},
  { date: "2025-10-28", customers: 149},
  { date: "2025-10-29", customers: 103},
  { date: "2025-10-30", customers: 446},
  { date: "2025-10-31", customers: 400},
]

const chartConfig = {
  views: {
    label: "Ügyfelek",
  },
  customers: {
    label: "Ügyfelek",
    color: "var(--chart-2)",
  },
  mobile: {
    label: "Mobile",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

const ChartBarInteractive = () => {
  const [activeChart, setActiveChart] =
    React.useState<keyof typeof chartConfig>("customers")

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    const currentMonthData = chartData.filter(d => {
    const dDate = new Date(d.date);
    return dDate.getFullYear() === currentYear && dDate.getMonth() === currentMonth;
    });

    const dataMap: Record<number, number> = {};
    currentMonthData.forEach(d => {
    const dDate = new Date(d.date);
    dataMap[dDate.getDate()] = d.customers;
    });

    const mergedData = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    return {
        date: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
        customers: dataMap[day] || 0,
    };
    });




  const total = React.useMemo(
    () => ({
      customers: mergedData.reduce((acc, curr) => acc + curr.customers, 0),
    }),
    [mergedData]
  )

  return (
    <Card className="py-0 border-0 bg-transparent shadow-none">
      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <BarChart
            accessibilityLayer
            data={mergedData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                const month = date
                  .toLocaleDateString("hu-HU", { month: "short" })
                  .replace(/^./, (c) => c.toUpperCase())
                const day = date.getDate()
                return `${month} ${day}.`
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[150px]"
                  nameKey="views"
                  labelFormatter={(value) =>
                    new Date(value).toLocaleDateString("hu-HU", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  }
                />
              }
            />
            <Bar dataKey={activeChart} fill={`var(--color-${activeChart})`}>
                <LabelList
                dataKey={activeChart}
                position="top"
                className="fill-current text-xs font-medium"
                />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
export default ChartBarInteractive