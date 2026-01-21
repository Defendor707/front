import { useEffect, useRef, useState } from "react"

export type AudioLevelState = {
  level: number // 0..1
  permission: "unknown" | "granted" | "denied"
  error?: string
}

export function useAudioLevel(enabled: boolean): AudioLevelState {
  const [state, setState] = useState<AudioLevelState>({
    level: 0,
    permission: "unknown",
  })

  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    if (!enabled) return

    let stream: MediaStream | null = null
    let audioCtx: AudioContext | null = null
    let analyser: AnalyserNode | null = null
    let cancelled = false

    async function start() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        if (cancelled) return

        setState((s) => ({ ...s, permission: "granted", error: undefined }))

        audioCtx = new AudioContext()
        const source = audioCtx.createMediaStreamSource(stream)
        analyser = audioCtx.createAnalyser()
        analyser.fftSize = 1024
        source.connect(analyser)

        const data = new Uint8Array(analyser.fftSize)

        const tick = () => {
          if (!analyser) return
          analyser.getByteTimeDomainData(data)

          // RMS from 0..1
          let sum = 0
          for (let i = 0; i < data.length; i++) {
            const v = (data[i] - 128) / 128
            sum += v * v
          }
          const rms = Math.sqrt(sum / data.length)
          const level = Math.min(1, Math.max(0, rms * 1.8))

          setState((s) => ({ ...s, level }))
          rafRef.current = requestAnimationFrame(tick)
        }

        tick()
      } catch (e) {
        const message =
          e instanceof Error
            ? e.message
            : "Microphone permission is required for audio visualization."

        setState({ level: 0, permission: "denied", error: message })
      }
    }

    start()

    return () => {
      cancelled = true
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = null

      if (stream) {
        for (const t of stream.getTracks()) t.stop()
      }

      if (audioCtx) {
        audioCtx.close().catch(() => undefined)
      }
    }
  }, [enabled])

  if (!enabled) return { ...state, level: 0 }
  return state
}

