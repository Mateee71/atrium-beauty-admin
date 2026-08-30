"use client";

import { Label, Pie, PieChart } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "./ui/chart";

const chartConfig = {
  value: {
    label: "Ügyfelek",
  },
} satisfies ChartConfig;

type AppPieChartProps = {
  data: {
    role: string;
    value: number;
    fill: string;
  }[];
};

const AppPieChart = ({ data }: AppPieChartProps) => {
  const totalCustomers = data.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div>
      <h1 className="text-lg font-medium mb-6">Havi ügyfél eloszlás</h1>

      {data.length === 0 ? (
        <div className="flex min-h-[250px] items-center justify-center text-sm text-muted-foreground">
          Nincs megjeleníthető adat ebben a hónapban.
        </div>
      ) : (
        <>
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[250px]"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />

              <Pie
                data={data}
                dataKey="value"
                nameKey="role"
                innerRadius={60}
                strokeWidth={5}
              >
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="fill-foreground text-3xl font-bold"
                          >
                            {totalCustomers.toLocaleString("hu-HU")}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 24}
                            className="fill-muted-foreground"
                          >
                            Ügyfél
                          </tspan>
                        </text>
                      );
                    }
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>

          <div className="mt-4 flex flex-col gap-2">
            {data.map((item) => (
              <div
                key={item.role}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="size-3 rounded-full"
                    style={{ backgroundColor: item.fill }}
                  />
                  <span>{item.role}</span>
                </div>

                <span className="font-medium">{item.value} db</span>
              </div>
            ))}
          </div>

          <div className="mt-4 text-center text-sm text-muted-foreground">
            Aktuális havi foglalások szakmai beosztás szerint
          </div>
        </>
      )}
    </div>
  );
};

export default AppPieChart;