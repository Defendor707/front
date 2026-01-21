import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { MessageSquarePlus, Search } from "lucide-react"
import { useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"

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
import { timeAgo } from "@/lib/format"
import { cn } from "@/lib/utils"
import { USE_REAL_API, FORCE_REAL_API } from "@/lib/apiConfig"
import { listChats, listUsers, sendChatMessage } from "@/services/api"
import { queryKeys } from "@/services/queryKeys"
import type { ChatStatus } from "@/types/models"

type StatusFilter = "all" | ChatStatus

export function ChatsPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [query, setQuery] = useState("")
  const [status, setStatus] = useState<StatusFilter>("all")
  const [page, setPage] = useState(1)
  const pageSize = 8

  const usersQuery = useQuery({
    queryKey: queryKeys.users,
    queryFn: listUsers,
  })

  const chatsQuery = useQuery({
    queryKey: queryKeys.chats({ query, status, page, pageSize }),
    queryFn: () => listChats({ query, status, page, pageSize }),
    placeholderData: keepPreviousData,
  })

  const createChatMutation = useMutation({
    mutationFn: async () => {
      // Demo: birinchi foydalanuvchini tanlash
      const firstUser = usersQuery.data?.[0]
      if (!firstUser) throw new Error("No users available")

      // Yangi chat yaratish (backend'da real bo'lsa, API chaqiruvi)
      const response = await sendChatMessage({
        userId: firstUser.id,
        message: "Salom, AI yordamchi bilan gaplashmoqchiman.",
        userContext: {
          name: firstUser.fullName,
          phone: firstUser.phone,
          language: firstUser.language,
        },
      })

      return response.chatId
    },
    onSuccess: (chatId) => {
      // Chat list'ni yangilash
      queryClient.invalidateQueries({ queryKey: queryKeys.chats({}) })
      // Yangi chat'ga o'tish
      navigate(`/chats/${chatId}`)
    },
  })

  const usersById = new Map(usersQuery.data?.map((u) => [u.id, u]) ?? [])

  const pageCount = useMemo(() => {
    const total = chatsQuery.data?.total ?? 0
    return Math.max(1, Math.ceil(total / pageSize))
  }, [chatsQuery.data?.total])

  function setStatusSafe(next: StatusFilter) {
    setStatus(next)
    setPage(1)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">AI Chats</h2>
          <p className="text-sm text-muted-foreground">
            Browse conversations, AI summaries, and user details.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            onClick={() => createChatMutation.mutate()}
            disabled={createChatMutation.isPending || !usersQuery.data?.length}
          >
            <MessageSquarePlus className="mr-2 h-4 w-4" />
            New chat
          </Button>
          {!(USE_REAL_API || FORCE_REAL_API) && (
            <Badge variant="secondary">Demo</Badge>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Tabs value={status} onValueChange={(v) => setStatusSafe(v as StatusFilter)}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="open">Open</TabsTrigger>
            <TabsTrigger value="resolved">Resolved</TabsTrigger>
            <TabsTrigger value="escalated">Escalated</TabsTrigger>
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
            placeholder="Search by user, phone, topic, tags..."
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
              <TableHead>Topic</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Sentiment</TableHead>
              <TableHead className="text-right">Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {chatsQuery.isLoading ? (
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
              (chatsQuery.data?.items ?? []).map((c) => {
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
                    <TableCell>
                      <Link
                        to={`/chats/${c.id}`}
                        className="text-primary hover:underline"
                      >
                        {c.topic}
                      </Link>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {c.tags.slice(0, 3).map((t) => (
                          <Badge
                            key={t}
                            variant="outline"
                            className="px-1.5 py-0 text-[10px]"
                          >
                            {t}
                          </Badge>
                        ))}
                      </div>
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
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          c.sentiment === "positive" && "border-emerald-500/40 text-emerald-600",
                          c.sentiment === "negative" && "border-rose-500/40 text-rose-600",
                        )}
                      >
                        {c.sentiment}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {timeAgo(c.updatedAt)}
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
          {chatsQuery.data ? (
            <>
              Showing{" "}
              <span className="font-medium text-foreground">
                {chatsQuery.data.items.length}
              </span>{" "}
              of{" "}
              <span className="font-medium text-foreground">
                {chatsQuery.data.total}
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

