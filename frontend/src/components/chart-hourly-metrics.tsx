"use client"

import * as React from "react"
import { TrendingUp } from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const chartData = [
  { hour: "00:00", messages: 45, users: 12 },
  { hour: "01:00", messages: 32, users: 8 },
  { hour: "02:00", messages: 28, users: 6 },
  { hour: "03:00", messages: 25, users: 5 },
  { hour: "04:00", messages: 30, users: 7 },
  { hour: "05:00", messages: 42, users: 11 },
  { hour: "06:00", messages: 68, users: 18 },
  { hour: "07:00", messages: 95, users: 25 },
  { hour: "08:00", messages: 142, users: 38 },
  { hour: "09:00", messages: 186, users: 52 },
  { hour: "10:00", messages: 234, users: 68 },
  { hour: "11:00", messages: 278, users: 82 },
  { hour: "12:00", messages: 312, users: 95 },
  { hour: "13:00", messages: 298, users: 88 },
  { hour: "14:00", messages: 285, users: 85 },
  { hour: "15:00", messages: 267, users: 78 },
  { hour: "16:00", messages: 245, users: 72 },
  { hour: "17:00", messages: 198, users: 58 },
  { hour: "18:00", messages: 156, users: 45 },
  { hour: "19:00", messages: 128, users: 36 },
  { hour: "20:00", messages: 98, users: 28 },
  { hour: "21:00", messages: 76, users: 22 },
  { hour: "22:00", messages: 58, users: 16 },
  { hour: "23:00", messages: 48, users: 13 },
]

const chartConfig = {
  messages: {
    label: "Messages",
    color: "hsl(var(--chart-1))",
  },
  users: {
    label: "Active Users",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

export function ChartHourlyMetrics() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Hourly Chat Activity</CardTitle>
        <CardDescription>
          Real-time message and user activity over the last 24 hours
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="hour"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 5)}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Area
              dataKey="users"
              type="natural"
              fill="var(--color-users)"
              fillOpacity={0.4}
              stroke="var(--color-users)"
              stackId="a"
            />
            <Area
              dataKey="messages"
              type="natural"
              fill="var(--color-messages)"
              fillOpacity={0.4}
              stroke="var(--color-messages)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 font-medium leading-none">
              Peak activity at 12:00 PM <TrendingUp className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2 leading-none text-muted-foreground">
              24-hour activity monitoring across all connected sites
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}