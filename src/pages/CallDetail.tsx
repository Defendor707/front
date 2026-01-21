import { useQuery } from "@tanstack/react-query"
import { Copy, Download, PhoneCall } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { Link, useParams } from "react-router-dom"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDateTime, formatSeconds, timeAgo } from "@/lib/format"
import { cn } from "@/lib/utils"
import { getCallById, getUserById } from "@/services/api"
import { queryKeys } from "@/services/queryKeys"
import type { Sentiment } from "@/types/models"

function sentimentClass(sentiment: Sentiment) {
  if (sentiment === "positive") return "border-emerald-500/40 text-emerald-600"
  if (sentiment === "negative") return "border-rose-500/40 text-rose-600"
  return ""
}

function createDemoToneUrl(durationSec = 3, freqHz = 880): string {
  const sampleRate = 44100
  const length = Math.max(1, Math.floor(sampleRate * durationSec))
  const buffer = new ArrayBuffer(44 + length * 2)
  const view = new DataView(buffer)

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i))
  }

  // WAV header (PCM 16-bit mono)
  writeString(0, "RIFF")
  view.setUint32(4, 36 + length * 2, true)
  writeString(8, "WAVE")
  writeString(12, "fmt ")
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true) // PCM
  view.setUint16(22, 1, true) // channels
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * 2, true) // byte rate
  view.setUint16(32, 2, true) // block align
  view.setUint16(34, 16, true) // bits per sample
  writeString(36, "data")
  view.setUint32(40, length * 2, true)

  const amplitude = 0.2
  for (let i = 0; i < length; i++) {
    const t = i / sampleRate
    // Slight fade in/out to avoid clicks
    const fade = Math.min(1, Math.min(i / 500, (length - i) / 500))
    const sample = Math.sin(2 * Math.PI * freqHz * t) * amplitude * fade
    view.setInt16(44 + i * 2, Math.floor(sample * 32767), true)
  }

  const blob = new Blob([buffer], { type: "audio/wav" })
  return URL.createObjectURL(blob)
}

export function CallDetailPage() {
  const params = useParams<{ callId: string }>()
  const callId = params.callId ?? ""

  const [copied, setCopied] = useState(false)
  const [demoAudioUrl, setDemoAudioUrl] = useState<string | null>(null)

  const callQuery = useQuery({
    queryKey: queryKeys.call(callId),
    queryFn: () => getCallById(callId),
    enabled: Boolean(callId),
  })

  const userId = callQuery.data?.userId
  const userQuery = useQuery({
    queryKey: userId ? queryKeys.user(userId) : ["user", "missing"],
    queryFn: () => (userId ? getUserById(userId) : Promise.resolve(null)),
    enabled: Boolean(userId),
  })

  useEffect(() => {
    return () => {
      if (demoAudioUrl) URL.revokeObjectURL(demoAudioUrl)
    }
  }, [demoAudioUrl])

  const call = callQuery.data
  const user = userQuery.data

  const headerBadges = useMemo(() => {
    if (!call) return null
    return (
      <div className="flex flex-wrap items-center gap-2">
        <Badge
          variant={
            call.status === "completed"
              ? "outline"
              : call.status === "missed"
                ? "secondary"
                : "destructive"
          }
        >
          {call.status}
        </Badge>
        <Badge variant="outline" className={cn(sentimentClass(call.sentiment))}>
          {call.sentiment}
        </Badge>
        <Badge variant="outline" className="capitalize">
          {call.direction}
        </Badge>
        <Badge variant="outline">{call.id}</Badge>
      </div>
    )
  }, [call])

  async function copySummary() {
    const summary = call?.aiSummary
    if (!summary) return
    try {
      await navigator.clipboard.writeText(summary)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1200)
    } catch {
      // ignore
    }
  }

  function downloadTranscript() {
    const text = call?.transcript?.trim()
    if (!text) return
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${call?.id ?? "call"}-transcript.txt`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  const recordingSrc = call?.recordingUrl || demoAudioUrl || ""

  function generateDemoAudio() {
    if (demoAudioUrl) return
    const url = createDemoToneUrl(2.2, 660)
    setDemoAudioUrl(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Call details</h2>
          <p className="text-sm text-muted-foreground">
            Recording, transcript, and AI summary.
          </p>
        </div>
        {callQuery.isLoading ? <Skeleton className="h-8 w-64" /> : headerBadges}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle className="text-base">
                {userQuery.isLoading ? (
                  <Skeleton className="h-5 w-56" />
                ) : user ? (
                  user.fullName
                ) : call ? (
                  `User: ${call.userId}`
                ) : (
                  "Loading..."
                )}
              </CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                {user ? (
                  <>
                    {user.phone} • <span className="capitalize">{user.region ?? "—"}</span>
                  </>
                ) : null}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline" size="sm">
                <Link to="/calls">Back</Link>
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={!user?.phone}
                asChild={Boolean(user?.phone)}
              >
                {user?.phone ? (
                  <Link to={`/call?to=${encodeURIComponent(user.phone)}`}>
                    <PhoneCall className="mr-2 h-4 w-4" />
                    Call back
                  </Link>
                ) : (
                  <>
                    <PhoneCall className="mr-2 h-4 w-4" />
                    Call back
                  </>
                )}
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {(call?.tags ?? []).map((t) => (
                <Badge key={t} variant="outline">
                  {t}
                </Badge>
              ))}
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">Recording</div>
                {!call?.recordingUrl && demoAudioUrl ? (
                  <Badge variant="secondary">Demo audio</Badge>
                ) : null}
              </div>
              <div className="rounded-lg border bg-muted/20 p-3">
                {callQuery.isLoading ? (
                  <Skeleton className="h-10 w-full" />
                ) : call ? (
                  recordingSrc ? (
                    <audio controls className="w-full">
                      <source src={recordingSrc} />
                      Your browser does not support audio playback.
                    </audio>
                  ) : (
                    <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                      <div>No recording available.</div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={generateDemoAudio}
                        disabled={call.status !== "completed" || Boolean(demoAudioUrl)}
                      >
                        Generate demo audio
                      </Button>
                    </div>
                  )
                ) : (
                  <div className="text-sm text-muted-foreground">Call not found.</div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">Transcript</div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={downloadTranscript}
                  disabled={!call?.transcript?.trim()}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
              <div className="rounded-lg border bg-card">
                {callQuery.isLoading ? (
                  <div className="p-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="mt-2 h-4 w-11/12" />
                    <Skeleton className="mt-2 h-4 w-10/12" />
                  </div>
                ) : call?.transcript?.trim() ? (
                  <ScrollArea className="h-[220px]">
                    <div className="p-4 text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                      {call.transcript}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="p-4 text-sm text-muted-foreground">
                    Transcript not available.
                  </div>
                )}
              </div>
            </div>
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
                disabled={!call?.aiSummary}
                aria-label="Copy summary"
                title={copied ? "Copied" : "Copy"}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {callQuery.isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ) : call ? (
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {call.aiSummary}
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
              {callQuery.isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ) : call ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Started</span>
                    <span className="font-medium">
                      {formatDateTime(call.startedAt)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Ended</span>
                    <span className="font-medium">
                      {call.endedAt ? timeAgo(call.endedAt) : "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="font-medium">
                      {typeof call.durationSec === "number"
                        ? formatSeconds(call.durationSec)
                        : "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Operator</span>
                    <span className="font-medium">{call.operatorName ?? "—"}</span>
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
                Add tag (demo)
              </Button>
              <Button type="button" variant="outline" disabled>
                Create follow-up (demo)
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

