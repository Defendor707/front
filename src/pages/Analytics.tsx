import { useQuery } from "@tanstack/react-query"
import { Download, Printer } from "lucide-react"
import { useMemo, useState } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatPercent, formatSeconds } from "@/lib/format"
import { getAnalytics } from "@/services/api"
import { queryKeys } from "@/services/queryKeys"
import type { AnalyticsSnapshot } from "@/types/models"

function downloadFile(filename: string, content: string, mime = "text/plain") {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export function AnalyticsPage() {
  const [range, setRange] = useState<AnalyticsSnapshot["range"]>("7d")

  const analyticsQuery = useQuery({
    queryKey: queryKeys.analytics(range),
    queryFn: () => getAnalytics(range),
  })

  const topTopicChart = useMemo(() => {
    const items = analyticsQuery.data?.topTopics ?? []
    return items.map((t) => ({ name: t.topic, value: t.count }))
  }, [analyticsQuery.data?.topTopics])

  function exportJson() {
    if (!analyticsQuery.data) return
    downloadFile(
      `analytics-${analyticsQuery.data.range}.json`,
      JSON.stringify(analyticsQuery.data, null, 2),
      "application/json",
    )
  }

  function exportCsv() {
    if (!analyticsQuery.data) return
    const a = analyticsQuery.data
    const lines: string[] = []
    lines.push("metric,value")
    lines.push(`range,${a.range}`)
    lines.push(`callsTotal,${a.callsTotal}`)
    lines.push(`callsAnswered,${a.callsAnswered}`)
    lines.push(`callsMissed,${a.callsMissed}`)
    lines.push(`chatsTotal,${a.chatsTotal}`)
    lines.push(`chatsResolved,${a.chatsResolved}`)
    lines.push(`avgResponseSec,${a.avgResponseSec}`)
    lines.push(`avgHandleTimeSec,${a.avgHandleTimeSec}`)
    lines.push(`aiSuccessRate,${a.aiSuccessRate}`)
    lines.push("")
    lines.push("topTopic,count")
    for (const t of a.topTopics) lines.push(`${t.topic},${t.count}`)
    downloadFile(`analytics-${a.range}.csv`, lines.join("\n"), "text/csv")
  }

  const a = analyticsQuery.data

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Analytics</h2>
          <p className="text-sm text-muted-foreground">
            Stats, trends, and exports (mock first).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">Demo</Badge>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => window.print()}
          >
            <Printer className="mr-2 h-4 w-4" />
            Print (PDF)
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={exportCsv}
            disabled={!a}
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={exportJson}
            disabled={!a}
          >
            <Download className="mr-2 h-4 w-4" />
            Export JSON
          </Button>
        </div>
      </div>

      <Tabs value={range} onValueChange={(v) => setRange(v as AnalyticsSnapshot["range"])}>
        <TabsList>
          <TabsTrigger value="24h">24h</TabsTrigger>
          <TabsTrigger value="7d">7d</TabsTrigger>
          <TabsTrigger value="30d">30d</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Calls total</CardTitle>
          </CardHeader>
          <CardContent>
            {analyticsQuery.isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-semibold">{a?.callsTotal ?? 0}</div>
            )}
            <p className="text-xs text-muted-foreground">All directions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Calls answered</CardTitle>
          </CardHeader>
          <CardContent>
            {analyticsQuery.isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-semibold">{a?.callsAnswered ?? 0}</div>
            )}
            <p className="text-xs text-muted-foreground">Answered by AI/operator</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chats total</CardTitle>
          </CardHeader>
          <CardContent>
            {analyticsQuery.isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-semibold">{a?.chatsTotal ?? 0}</div>
            )}
            <p className="text-xs text-muted-foreground">Messages & sessions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI success rate</CardTitle>
          </CardHeader>
          <CardContent>
            {analyticsQuery.isLoading ? (
              <Skeleton className="h-8 w-28" />
            ) : (
              <div className="text-2xl font-semibold">
                {formatPercent(a?.aiSuccessRate ?? 0)}
              </div>
            )}
            <div className="mt-3">
              <Progress value={(a?.aiSuccessRate ?? 0) * 100} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>Trends</CardTitle>
            <Badge variant="outline">{range.toUpperCase()}</Badge>
          </CardHeader>
          <CardContent>
            {analyticsQuery.isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-[260px] w-full" />
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <div className="mb-2 text-sm font-medium">Calls</div>
                  <div className="h-[240px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={a?.callsSeries ?? []}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
                        <XAxis
                          dataKey="t"
                          tickFormatter={(v) =>
                            new Date(v as string).toLocaleDateString()
                          }
                          tick={{ fontSize: 12 }}
                          interval="preserveStartEnd"
                        />
                        <YAxis tick={{ fontSize: 12 }} />
                        <RechartsTooltip
                          labelFormatter={(v) =>
                            new Date(v as string).toLocaleDateString()
                          }
                        />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="hsl(var(--chart-1))"
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div>
                  <div className="mb-2 text-sm font-medium">Chats</div>
                  <div className="h-[240px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={a?.chatsSeries ?? []}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
                        <XAxis
                          dataKey="t"
                          tickFormatter={(v) =>
                            new Date(v as string).toLocaleDateString()
                          }
                          tick={{ fontSize: 12 }}
                          interval="preserveStartEnd"
                        />
                        <YAxis tick={{ fontSize: 12 }} />
                        <RechartsTooltip
                          labelFormatter={(v) =>
                            new Date(v as string).toLocaleDateString()
                          }
                        />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="hsl(var(--chart-2))"
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top topics</CardTitle>
          </CardHeader>
          <CardContent>
            {analyticsQuery.isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-[260px] w-full" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="h-[240px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topTopicChart}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 11 }}
                        interval={0}
                        angle={-25}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis tick={{ fontSize: 12 }} />
                      <RechartsTooltip />
                      <Bar dataKey="value" fill="hsl(var(--chart-4))" radius={6} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid gap-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Avg response</span>
                    <span className="font-medium">
                      {formatSeconds(a?.avgResponseSec ?? 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Avg handle time</span>
                    <span className="font-medium">
                      {formatSeconds(a?.avgHandleTimeSec ?? 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Chats resolved</span>
                    <span className="font-medium">{a?.chatsResolved ?? 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Calls missed</span>
                    <span className="font-medium">{a?.callsMissed ?? 0}</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

