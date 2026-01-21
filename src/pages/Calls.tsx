import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { Search } from "lucide-react"
import { useMemo, useState } from "react"
import { Link } from "react-router-dom"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatSeconds, timeAgo } from "@/lib/format"
import { cn } from "@/lib/utils"
import { listCalls, listUsers } from "@/services/api"
import { queryKeys } from "@/services/queryKeys"
import type { CallStatus } from "@/types/models"

type StatusFilter = "all" | CallStatus

export function CallsPage() {
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState<StatusFilter>("all")
  const [page, setPage] = useState(1)
  const pageSize = 8

  const usersQuery = useQuery({
    queryKey: queryKeys.users,
    queryFn: listUsers,
  })

  const callsQuery = useQuery({
    queryKey: queryKeys.calls({ query, status, page, pageSize }),
    queryFn: () => listCalls({ query, status, page, pageSize }),
    placeholderData: keepPreviousData,
  })

  const usersById = new Map(usersQuery.data?.map((u) => [u.id, u]) ?? [])

  const pageCount = useMemo(() => {
    const total = callsQuery.data?.total ?? 0
    return Math.max(1, Math.ceil(total / pageSize))
  }, [callsQuery.data?.total])

  function setStatusSafe(next: StatusFilter) {
    setStatus(next)
    setPage(1)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Calls</h2>
          <p className="text-sm text-muted-foreground">
            Call history, recordings, transcripts, and AI notes.
          </p>
        </div>
        <Badge variant="secondary">Demo</Badge>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Tabs value={status} onValueChange={(v) => setStatusSafe(v as StatusFilter)}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="missed">Missed</TabsTrigger>
            <TabsTrigger value="failed">Failed</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative w-full md:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setPage(1)
            }}
            placeholder="Search by user, phone, tags..."
            className="pl-9"
          />
        </div>
      </div>

      <div className="rounded-lg border bg-card">
        <div className="overflow-x-auto">
          <Table className="min-w-[760px]">
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Direction</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead className="text-right">Started</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {callsQuery.isLoading ? (
              <>
                {Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={5}>
                      <Skeleton className="h-8 w-full" />
                    </TableCell>
                  </TableRow>
                ))}
              </>
            ) : (
              (callsQuery.data?.items ?? []).map((c) => {
                const user = usersById.get(c.userId)
                return (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">
                      <div className="leading-tight">
                        <div>{user?.fullName ?? c.userId}</div>
                        <div className="text-xs text-muted-foreground">
                          {user?.phone ?? "—"}
                        </div>
                      </div>
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
                        className={cn(
                          c.status === "failed" && "border-rose-500/40 text-rose-600",
                        )}
                      >
                        {c.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {typeof c.durationSec === "number"
                        ? formatSeconds(c.durationSec)
                        : "—"}
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
                )
              })
            )}
          </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-muted-foreground">
          {callsQuery.data ? (
            <>
              Showing{" "}
              <span className="font-medium text-foreground">
                {callsQuery.data.items.length}
              </span>{" "}
              of{" "}
              <span className="font-medium text-foreground">
                {callsQuery.data.total}
              </span>
            </>
          ) : (
            "—"
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            Previous
          </Button>
          <div className="text-sm text-muted-foreground">
            Page <span className="font-medium text-foreground">{page}</span> of{" "}
            <span className="font-medium text-foreground">{pageCount}</span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
            disabled={page >= pageCount}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}

