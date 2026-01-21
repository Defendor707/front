import { useQuery } from "@tanstack/react-query"
import { BarChart3, MessageSquare, PhoneCall, Timer } from "lucide-react"
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Link } from "react-router-dom"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatPercent, formatSeconds, timeAgo } from "@/lib/format"
import { USE_REAL_API, FORCE_REAL_API } from "@/lib/apiConfig"
import {
  getAnalytics,
  getDashboardSummary,
  listUsers,
} from "@/services/api"
import { queryKeys } from "@/services/queryKeys"

export function DashboardPage() {
  const dashboard = useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: getDashboardSummary,
  })

  const usersQuery = useQuery({
    queryKey: queryKeys.users,
    queryFn: listUsers,
  })

  const analyticsQuery = useQuery({
    queryKey: queryKeys.analytics("7d"),
    queryFn: () => getAnalytics("7d"),
  })

  const usersById = new Map(usersQuery.data?.map((u) => [u.id, u]) ?? [])

  const callsToday = dashboard.data?.callsToday ?? 0
  const activeChats = dashboard.data?.activeChats ?? 0
  const avgResponseSec = dashboard.data?.avgResponseSec ?? 0
  const aiSuccessRate = dashboard.data?.aiSuccessRate ?? 0

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Overview</h2>
          <p className="text-sm text-muted-foreground">
            {USE_REAL_API || FORCE_REAL_API
              ? "Real-time snapshot from backend API."
              : "Real-time snapshot (mock data until backend is connected)."}
          </p>
        </div>
        {!(USE_REAL_API || FORCE_REAL_API) && (
          <Badge variant="secondary">Demo</Badge>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Calls today</CardTitle>
            <PhoneCall className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {dashboard.isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-semibold">{callsToday}</div>
            )}
            <p className="text-xs text-muted-foreground">Inbound + outbound</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active chats</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {dashboard.isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-semibold">{activeChats}</div>
            )}
            <p className="text-xs text-muted-foreground">Currently open</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg response</CardTitle>
            <Timer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {dashboard.isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-semibold">
                {formatSeconds(avgResponseSec)}
              </div>
            )}
            <p className="text-xs text-muted-foreground">Chat response time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI success</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {dashboard.isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-semibold">
                {formatPercent(aiSuccessRate)}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Resolved without escalation
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>Volume</CardTitle>
            <Badge variant="outline">Last 7 days</Badge>
          </CardHeader>
          <CardContent>
            {analyticsQuery.isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-[240px] w-full" />
              </div>
            ) : (
              <Tabs defaultValue="calls" className="w-full">
                <TabsList>
                  <TabsTrigger value="calls">Calls</TabsTrigger>
                  <TabsTrigger value="chats">Chats</TabsTrigger>
                </TabsList>
                <TabsContent value="calls" className="mt-4">
                  <div className="h-[260px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={analyticsQuery.data?.callsSeries ?? []}>
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
                </TabsContent>
                <TabsContent value="chats" className="mt-4">
                  <div className="h-[260px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={analyticsQuery.data?.chatsSeries ?? []}>
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
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top topics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {analyticsQuery.isLoading ? (
              <>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </>
            ) : (
              <ul className="space-y-2 text-sm">
                {(analyticsQuery.data?.topTopics ?? []).map((t) => (
                  <li key={t.topic} className="flex items-center justify-between">
                    <span className="text-muted-foreground">{t.topic}</span>
                    <span className="font-medium">{t.count}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>Recent chats</CardTitle>
            <Button asChild variant="outline" size="sm">
              <Link to="/chats">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {dashboard.isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-9 w-full" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table className="min-w-[560px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Topic</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(dashboard.data?.recentChats ?? []).map((c) => (
                    <TableRow key={c.id} className="cursor-pointer">
                      <TableCell className="font-medium">
                        {usersById.get(c.userId)?.fullName ?? c.userId}
                      </TableCell>
                      <TableCell>
                        <Link
                          to={`/chats/${c.id}`}
                          className="text-primary hover:underline"
                        >
                          {c.topic}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            c.status === "open"
                              ? "secondary"
                              : c.status === "escalated"
                                ? "destructive"
                                : "outline"
                          }
                        >
                          {c.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {timeAgo(c.updatedAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>Recent calls</CardTitle>
            <Button asChild variant="outline" size="sm">
              <Link to="/calls">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {dashboard.isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-9 w-full" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table className="min-w-[560px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Direction</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Started</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(dashboard.data?.recentCalls ?? []).map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">
                        {usersById.get(c.userId)?.fullName ?? c.userId}
                      </TableCell>
                      <TableCell className="capitalize">{c.direction}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            c.status === "completed"
                              ? "outline"
                              : c.status === "missed"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {c.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        <Link
                          to={`/calls/${c.id}`}
                          className="hover:underline"
                        >
                          {timeAgo(c.startedAt)}
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

