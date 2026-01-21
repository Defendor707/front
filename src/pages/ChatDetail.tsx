import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Copy, PhoneCall, Send } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import { Link, useParams } from "react-router-dom"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDateTime, timeAgo } from "@/lib/format"
import { cn } from "@/lib/utils"
import {
  getChatById,
  getUserById,
  sendChatMessage,
  type SendChatMessageParams,
} from "@/services/api"
import { queryKeys } from "@/services/queryKeys"
import { useUserContextStore } from "@/stores/userContextStore"
import type { ChatMessage, Sentiment } from "@/types/models"

function sentimentClass(sentiment: Sentiment) {
  if (sentiment === "positive") return "border-emerald-500/40 text-emerald-600"
  if (sentiment === "negative") return "border-rose-500/40 text-rose-600"
  return ""
}

function messageBubbleClass(role: ChatMessage["role"]) {
  switch (role) {
    case "user":
      return "bg-muted text-foreground"
    case "ai":
      return "bg-primary text-primary-foreground"
    case "system":
      return "bg-secondary text-secondary-foreground"
    default:
      return "bg-muted text-foreground"
  }
}

function messageAlign(role: ChatMessage["role"]) {
  if (role === "ai") return "justify-end"
  if (role === "system") return "justify-center"
  return "justify-start"
}

export function ChatDetailPage() {
  const params = useParams<{ chatId: string }>()
  const chatId = params.chatId ?? ""

  const [copied, setCopied] = useState(false)
  const [messageInput, setMessageInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const queryClient = useQueryClient()
  const userContextStore = useUserContextStore()

  const chatQuery = useQuery({
    queryKey: queryKeys.chat(chatId),
    queryFn: () => getChatById(chatId),
    enabled: Boolean(chatId),
    refetchInterval: () => {
      // Real-time chat uchun polling (backend WebSocket bo'lsa uni ishlatamiz)
      return false
    },
  })

  const userId = chatQuery.data?.userId
  const userQuery = useQuery({
    queryKey: userId ? queryKeys.user(userId) : ["user", "missing"],
    queryFn: () => (userId ? getUserById(userId) : Promise.resolve(null)),
    enabled: Boolean(userId),
  })

  const sendMessageMutation = useMutation({
    mutationFn: (params: SendChatMessageParams) => sendChatMessage(params),
    onSuccess: async (response) => {
      // AI javobini chat'ga qo'shish
      const chat = chatQuery.data
      if (chat) {
        const newMessages: ChatMessage[] = [
          ...chat.messages,
          {
            id: `msg_${Date.now()}`,
            role: "user",
            text: messageInput,
            timestamp: new Date().toISOString(),
          },
          {
            id: response.messageId,
            role: "ai",
            text: response.response,
            timestamp: new Date().toISOString(),
          },
        ]

        // Context yangilangan bo'lsa, saqlaymiz
        if (response.contextUpdated && userId) {
          const nameMatch = messageInput.match(/(?:mening ismim|men)\s+(\w+)/i)
          if (nameMatch) {
            userContextStore.updateAIContext(userId, {
              knownName: nameMatch[1],
            })
          }
        }

        // Chat'ni yangilaymiz (backend'da real bo'lsa, optimistic update)
        queryClient.setQueryData(queryKeys.chat(chatId), {
          ...chat,
          messages: newMessages,
          updatedAt: new Date().toISOString(),
        })

        setMessageInput("")
      }
    },
  })

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chatQuery.data?.messages.length])

  function handleSendMessage() {
    if (!messageInput.trim() || !userId) return

    const userContext = userContextStore.getContext(userId)
    sendMessageMutation.mutate({
      chatId: chatId || undefined,
      userId,
      message: messageInput,
      userContext: {
        name: userContext?.aiContext?.knownName || userQuery.data?.fullName,
        phone: userQuery.data?.phone,
        language: userQuery.data?.language,
      },
    })
  }

  const headerBadges = useMemo(() => {
    const c = chatQuery.data
    if (!c) return null
    return (
      <div className="flex flex-wrap items-center gap-2">
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
        <Badge variant="outline" className={cn(sentimentClass(c.sentiment))}>
          {c.sentiment}
        </Badge>
        <Badge variant="outline">{c.id}</Badge>
      </div>
    )
  }, [chatQuery.data])

  async function copySummary() {
    const summary = chatQuery.data?.aiSummary
    if (!summary) return
    try {
      await navigator.clipboard.writeText(summary)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1200)
    } catch {
      // ignore
    }
  }

  const chat = chatQuery.data
  const user = userQuery.data

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Chat details</h2>
          <p className="text-sm text-muted-foreground">
            Conversation, AI summary, and context.
          </p>
        </div>
        {chatQuery.isLoading ? <Skeleton className="h-8 w-56" /> : headerBadges}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle className="text-base">
                {chat ? chat.topic : "Loading..."}
              </CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                {userQuery.isLoading ? (
                  <span className="inline-block">
                    <Skeleton className="h-4 w-48" />
                  </span>
                ) : user ? (
                  <>
                    <span className="font-medium text-foreground">
                      {user.fullName}
                    </span>{" "}
                    • {user.phone} •{" "}
                    <span className="capitalize">{user.region ?? "—"}</span>
                  </>
                ) : chat ? (
                  <>User: {chat.userId}</>
                ) : (
                  "—"
                )}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline" size="sm">
                <Link to="/chats">Back</Link>
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={!user?.phone}
                title={
                  user?.phone
                    ? "Navigate to Live Call to start a call"
                    : "No phone available"
                }
                asChild={Boolean(user?.phone)}
              >
                {user?.phone ? (
                  <Link to={`/call?to=${encodeURIComponent(user.phone)}`}>
                    <PhoneCall className="mr-2 h-4 w-4" />
                    Call user
                  </Link>
                ) : (
                  <>
                    <PhoneCall className="mr-2 h-4 w-4" />
                    Call user
                  </>
                )}
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {(chat?.tags ?? []).map((t) => (
                <Badge key={t} variant="outline">
                  {t}
                </Badge>
              ))}
            </div>

            <Separator />

            {chatQuery.isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-12 w-2/3" />
                <Skeleton className="h-12 w-3/4" />
                <Skeleton className="h-12 w-1/2" />
              </div>
            ) : chat ? (
              <>
                <ScrollArea className="h-[460px] pr-4">
                  <div className="space-y-3">
                    {chat.messages.map((m) => (
                      <div key={m.id} className={cn("flex", messageAlign(m.role))}>
                        <div
                          className={cn(
                            "max-w-[85%] rounded-2xl px-3 py-2 text-sm shadow-sm",
                            m.role === "ai" ? "rounded-tr-sm" : "rounded-tl-sm",
                            m.role === "system" && "max-w-[92%] rounded-xl",
                            messageBubbleClass(m.role),
                          )}
                        >
                          {m.role === "system" ? (
                            <div className="text-center text-xs font-medium">
                              {m.text}
                            </div>
                          ) : (
                            <div className="whitespace-pre-wrap leading-relaxed">
                              {m.text}
                            </div>
                          )}
                          <div
                            className={cn(
                              "mt-1 text-[11px] opacity-80",
                              m.role === "ai"
                                ? "text-primary-foreground/80"
                                : "text-muted-foreground",
                              m.role === "system" && "text-center",
                            )}
                          >
                            {new Date(m.timestamp).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                    {sendMessageMutation.isPending && (
                      <div className={cn("flex", messageAlign("ai"))}>
                        <div
                          className={cn(
                            "max-w-[85%] rounded-2xl rounded-tr-sm px-3 py-2 text-sm shadow-sm",
                            messageBubbleClass("ai"),
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 animate-bounce rounded-full bg-primary-foreground/60 [animation-delay:-0.3s]" />
                            <div className="h-2 w-2 animate-bounce rounded-full bg-primary-foreground/60 [animation-delay:-0.15s]" />
                            <div className="h-2 w-2 animate-bounce rounded-full bg-primary-foreground/60" />
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                <Separator className="my-4" />

                <div className="flex gap-2">
                  <Input
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                    placeholder="Xabar yozing... (Enter - yuborish)"
                    disabled={sendMessageMutation.isPending || !userId}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={handleSendMessage}
                    disabled={
                      !messageInput.trim() ||
                      sendMessageMutation.isPending ||
                      !userId
                    }
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
                Chat not found.
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">AI summary</CardTitle>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={copySummary}
                disabled={!chat?.aiSummary}
                aria-label="Copy summary"
                title={copied ? "Copied" : "Copy"}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {chatQuery.isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ) : chat ? (
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {chat.aiSummary}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">—</p>
              )}
              {copied ? (
                <div className="mt-3 text-xs text-muted-foreground">Copied.</div>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Context</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {chatQuery.isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ) : chat ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Created</span>
                    <span className="font-medium">
                      {formatDateTime(chat.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Last updated</span>
                    <span className="font-medium">{timeAgo(chat.updatedAt)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Messages</span>
                    <span className="font-medium">{chat.messages.length}</span>
                  </div>
                </>
              ) : (
                <div className="text-muted-foreground">—</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              <Button type="button" variant="secondary" disabled>
                Mark as resolved (demo)
              </Button>
              <Button type="button" variant="outline" disabled>
                Escalate to supervisor (demo)
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

