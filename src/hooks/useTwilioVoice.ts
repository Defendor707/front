import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import { Call, Device } from "@twilio/voice-sdk"

export type VoiceStatus =
  | "idle"
  | "initializing"
  | "ready"
  | "incoming"
  | "calling"
  | "in_call"
  | "ended"
  | "error"

export type VoiceState = {
  status: VoiceStatus
  error?: string
  muted: boolean
  hasDevice: boolean
  hasActiveCall: boolean
  incomingFrom?: string
}

export type UseTwilioVoice = VoiceState & {
  initialize: () => Promise<void>
  startCall: (to: string) => Promise<void>
  acceptIncoming: () => void
  rejectIncoming: () => void
  hangUp: () => void
  toggleMute: () => void
}

export function useTwilioVoice(token: string): UseTwilioVoice {
  const deviceRef = useRef<Device | null>(null)
  const activeCallRef = useRef<Call | null>(null)
  const incomingCallRef = useRef<Call | null>(null)
  const [activeCall, setActiveCall] = useState<Call | null>(null)
  const [incomingCall, setIncomingCall] = useState<Call | null>(null)

  const [status, setStatus] = useState<VoiceStatus>("idle")
  const [error, setError] = useState<string | undefined>()
  const [muted, setMuted] = useState(false)
  const [incomingFrom, setIncomingFrom] = useState<string | undefined>()
  const [hasDevice, setHasDevice] = useState(false)

  const hasActiveCall = Boolean(activeCall)

  const attachCallHandlers = useCallback((call: Call) => {
    call.on("accept", () => {
      setStatus("in_call")
    })
    call.on("disconnect", () => {
      activeCallRef.current = null
      incomingCallRef.current = null
      setActiveCall(null)
      setIncomingCall(null)
      setIncomingFrom(undefined)
      setMuted(false)
      setStatus(deviceRef.current ? "ready" : "idle")
    })
    call.on("cancel", () => {
      incomingCallRef.current = null
      setIncomingCall(null)
      setIncomingFrom(undefined)
      setStatus(deviceRef.current ? "ready" : "idle")
    })
    call.on("reject", () => {
      incomingCallRef.current = null
      setIncomingCall(null)
      setIncomingFrom(undefined)
      setStatus(deviceRef.current ? "ready" : "idle")
    })
    call.on("error", (e) => {
      const message = e instanceof Error ? e.message : "Call error"
      setError(message)
      setStatus("error")
    })
  }, [])

  const ensureDevice = useCallback(async () => {
    if (!token.trim()) {
      setHasDevice(false)
      setError("Twilio token is missing. Add it in Settings.")
      setStatus("error")
      return null
    }

    let device = deviceRef.current
    if (!device) {
      device = new Device(token, {
        // Keep logs light in production; useful during integration.
        logLevel: 1,
      })
      deviceRef.current = device
      setHasDevice(true)

      device.on("registered", () => {
        setError(undefined)
        setStatus("ready")
      })

      device.on("unregistered", () => {
        if (!activeCallRef.current) setStatus("idle")
      })

      device.on("incoming", (call) => {
        if (activeCallRef.current) {
          // Busy: reject new incoming call
          try {
            call.reject()
          } catch {
            // ignore
          }
          return
        }

        incomingCallRef.current = call
        setIncomingCall(call)
        const from =
          (call.parameters as Record<string, string> | undefined)?.From ??
          (call.customParameters?.get?.("From") as string | undefined) ??
          "Unknown"
        setIncomingFrom(from)
        setStatus("incoming")
        attachCallHandlers(call)
      })

      device.on("error", (e) => {
        const message = e instanceof Error ? e.message : "Device error"
        setError(message)
        setStatus("error")
      })

      device.on("tokenWillExpire", () => {
        // In real setup, fetch a new token here.
      })
    } else {
      // Keep token updated.
      try {
        device.updateToken(token)
      } catch {
        // ignore
      }
    }

    return device
  }, [attachCallHandlers, token])

  const initialize = useCallback(async () => {
    setError(undefined)
    setStatus("initializing")
    const device = await ensureDevice()
    if (!device) return

    try {
      await device.register()
      setStatus("ready")
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to register device"
      setError(message)
      setStatus("error")
    }
  }, [ensureDevice])

  const startCall = useCallback(
    async (to: string) => {
      setError(undefined)
      const device = deviceRef.current ?? (await ensureDevice())
      if (!device) return

      if (status === "idle") {
        // Ensure device is registered for best reliability.
        try {
          await device.register()
        } catch {
          // ignore (outgoing calls can still work)
        }
      }

      try {
        const call = await device.connect({
          params: { To: to },
        })
        activeCallRef.current = call
        setActiveCall(call)
        setStatus("calling")
        attachCallHandlers(call)
      } catch (e) {
        const message = e instanceof Error ? e.message : "Failed to start call"
        setError(message)
        setStatus("error")
      }
    },
    [attachCallHandlers, ensureDevice, status],
  )

  const acceptIncoming = useCallback(() => {
    const call = incomingCall
    if (!call) return
    incomingCallRef.current = null
    activeCallRef.current = call
    setIncomingCall(null)
    setActiveCall(call)
    setIncomingFrom(undefined)
    try {
      call.accept()
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to accept call"
      setError(message)
      setStatus("error")
    }
  }, [incomingCall])

  const rejectIncoming = useCallback(() => {
    const call = incomingCall
    if (!call) return
    incomingCallRef.current = null
    setIncomingCall(null)
    setIncomingFrom(undefined)
    try {
      call.reject()
    } catch {
      // ignore
    }
    setStatus(deviceRef.current ? "ready" : "idle")
  }, [incomingCall])

  const hangUp = useCallback(() => {
    const call = activeCall
    if (!call) return
    try {
      call.disconnect()
    } catch {
      // ignore
    }
  }, [activeCall])

  const toggleMute = useCallback(() => {
    const call = activeCall
    if (!call) return
    const next = !muted
    try {
      call.mute(next)
    } catch {
      // ignore
    }
    setMuted(next)
  }, [activeCall, muted])

  useEffect(() => {
    return () => {
      try {
        deviceRef.current?.destroy()
      } catch {
        // ignore
      }
      deviceRef.current = null
      setHasDevice(false)
      setActiveCall(null)
      setIncomingCall(null)
    }
  }, [])

  useEffect(() => {
    activeCallRef.current = activeCall
  }, [activeCall])

  useEffect(() => {
    incomingCallRef.current = incomingCall
  }, [incomingCall])

  return useMemo(
    () => ({
      status,
      error,
      muted,
      hasDevice,
      hasActiveCall,
      incomingFrom,
      initialize,
      startCall,
      acceptIncoming,
      rejectIncoming,
      hangUp,
      toggleMute,
    }),
    [
      acceptIncoming,
      error,
      hangUp,
      hasActiveCall,
      hasDevice,
      incomingFrom,
      initialize,
      muted,
      rejectIncoming,
      startCall,
      status,
      toggleMute,
    ],
  )
}

