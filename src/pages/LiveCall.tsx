import { Headphones, Mic, PhoneCall, PhoneIncoming, PhoneOff } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { useAudioLevel } from "@/hooks/useAudioLevel"
import { useTwilioVoice } from "@/hooks/useTwilioVoice"
import { useSettingsStore } from "@/stores/settingsStore"

function StatusBadge({ status }: { status: string }) {
  const variant =
    status === "ready"
      ? "outline"
      : status === "in_call" || status === "calling"
        ? "secondary"
        : status === "incoming"
          ? "secondary"
          : status === "error"
            ? "destructive"
            : "outline"
  return <Badge variant={variant}>{status}</Badge>
}

export function LiveCallPage() {
  const [searchParams] = useSearchParams()
  const initialTo = searchParams.get("to") ?? ""

  const twilioToken = useSettingsStore((s) => s.twilioToken)
  const setTwilioToken = useSettingsStore((s) => s.setTwilioToken)
  const aiAssistEnabled = useSettingsStore((s) => s.aiAssistEnabled)

  const [to, setTo] = useState(initialTo)
  const [hold, setHold] = useState(false)

  const voice = useTwilioVoice(twilioToken)
  const audio = useAudioLevel(
    voice.status === "calling" || voice.status === "in_call",
  )

  useEffect(() => {
    if (initialTo && !to) setTo(initialTo)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTo])

  const canCall = useMemo(() => {
    return Boolean(to.trim()) && (voice.status === "ready" || voice.status === "idle")
  }, [to, voice.status])

  const suggestions = useMemo(() => {
    if (!aiAssistEnabled) return []
    if (voice.status === "incoming")
      return [
        "Salomlashib, murojaat mavzusini aniqlang.",
        "Shaxsni tasdiqlash uchun 2 ta savol bering (FIO, telefon).",
        "Muammo murakkab bo‘lsa, operatorga eskalatsiya qiling.",
      ]
    if (voice.status === "in_call")
      return [
        "Javobni qisqa va aniq bering, keyin tasdiqlang: “To‘g‘rimi?”",
        "Agar link kerak bo‘lsa, SMS/Chat orqali yuborishni taklif qiling.",
        "Yakunida keyingi qadamni ayting va xayrlashing.",
      ]
    return [
      "Qo‘ng‘iroqni boshlashdan oldin raqam formatini tekshiring (+998...).",
      "Mijozga qayta qo‘ng‘iroq vaqti haqida kelishib oling.",
    ]
  }, [aiAssistEnabled, voice.status])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Live Call</h2>
          <p className="text-sm text-muted-foreground">
            Start/accept calls via Twilio Voice SDK (token required).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">Twilio</Badge>
          <StatusBadge status={voice.status} />
        </div>
      </div>

      {voice.error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {voice.error}
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Call panel</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!twilioToken.trim() ? (
              <div className="rounded-lg border bg-muted/20 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="text-sm font-medium">Twilio token required</div>
                    <div className="text-sm text-muted-foreground">
                      For demo, you can paste an access token here. In production,
                      token should be fetched from backend.
                    </div>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link to="/settings">Open Settings</Link>
                  </Button>
                </div>
                <div className="mt-3 flex gap-2">
                  <Input
                    value={twilioToken}
                    onChange={(e) => setTwilioToken(e.target.value)}
                    placeholder="Paste Twilio access token..."
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => voice.initialize()}
                    disabled={!twilioToken.trim() || voice.status === "initializing"}
                  >
                    <Headphones className="mr-2 h-4 w-4" />
                    Initialize
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => voice.initialize()}
                  disabled={
                    voice.status === "initializing" ||
                    voice.status === "calling" ||
                    voice.status === "in_call"
                  }
                >
                  <Headphones className="mr-2 h-4 w-4" />
                  Register device
                </Button>
                <div className="text-xs text-muted-foreground">
                  Registering enables incoming calls.
                </div>
              </div>
            )}

            <Separator />

            {voice.status === "incoming" ? (
              <div className="rounded-lg border bg-muted/20 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="text-sm font-medium">Incoming call</div>
                    <div className="text-sm text-muted-foreground">
                      From:{" "}
                      <span className="font-medium text-foreground">
                        {voice.incomingFrom ?? "Unknown"}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" onClick={() => voice.acceptIncoming()}>
                      <PhoneIncoming className="mr-2 h-4 w-4" />
                      Accept
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => voice.rejectIncoming()}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="grid gap-3 md:grid-cols-3">
              <div className="md:col-span-2">
                <label className="text-sm font-medium">To (phone number)</label>
                <div className="mt-2 flex gap-2">
                  <Input
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    placeholder="+998901112233"
                    disabled={voice.status === "calling" || voice.status === "in_call"}
                  />
                  <Button
                    type="button"
                    onClick={() => voice.startCall(to.trim())}
                    disabled={!canCall || !twilioToken.trim()}
                  >
                    <PhoneCall className="mr-2 h-4 w-4" />
                    Call
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Audio level</label>
                <div className="mt-2 flex h-10 items-center gap-1 rounded-md border bg-muted/20 px-2">
                  {Array.from({ length: 14 }).map((_, i) => {
                    const filled = audio.level * 14 >= i + 1
                    return (
                      <div
                        key={i}
                        className={cn(
                          "h-4 w-1 rounded-sm transition-colors",
                          filled ? "bg-primary" : "bg-muted-foreground/20",
                        )}
                      />
                    )
                  })}
                  <div className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
                    <Mic className="h-3.5 w-3.5" />
                    {audio.permission === "denied" ? "No mic" : "Mic"}
                  </div>
                </div>
                {audio.error ? (
                  <div className="mt-1 text-xs text-muted-foreground">{audio.error}</div>
                ) : null}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => voice.toggleMute()}
                disabled={!voice.hasActiveCall}
              >
                {voice.muted ? "Unmute" : "Mute"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setHold((h) => !h)
                }}
                disabled={!voice.hasActiveCall}
              >
                {hold ? "Resume" : "Hold"} (demo)
              </Button>
              <Button type="button" variant="outline" disabled>
                Transfer (demo)
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={() => voice.hangUp()}
                disabled={!voice.hasActiveCall}
              >
                <PhoneOff className="mr-2 h-4 w-4" />
                Hang up
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">AI suggestions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {!aiAssistEnabled ? (
              <div className="text-muted-foreground">
                AI assist is disabled in Settings.
              </div>
            ) : (
              <ul className="space-y-2">
                {suggestions.map((s) => (
                  <li key={s} className="rounded-lg border bg-muted/20 px-3 py-2">
                    {s}
                  </li>
                ))}
              </ul>
            )}
            <Separator className="my-3" />
            <div className="text-xs text-muted-foreground">
              Tip: For incoming calls, register the device first.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

