export function formatSeconds(sec: number): string {
  const s = Math.max(0, Math.floor(sec))
  const m = Math.floor(s / 60)
  const r = s % 60
  if (m <= 0) return `${r}s`
  return `${m}m ${r}s`
}

export function formatPercent(value01: number): string {
  const v = Number.isFinite(value01) ? value01 : 0
  return `${Math.round(v * 100)}%`
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString()
}

export function timeAgo(iso: string): string {
  const d = new Date(iso)
  const ms = d.getTime()
  if (Number.isNaN(ms)) return ""

  const diff = ms - Date.now()
  const abs = Math.abs(diff)
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" })

  const minutes = Math.round(abs / 60_000)
  const hours = Math.round(abs / 3_600_000)

  if (minutes < 60) return rtf.format(Math.round(diff / 60_000), "minute")
  if (hours < 24) return rtf.format(Math.round(diff / 3_600_000), "hour")
  return rtf.format(Math.round(diff / 86_400_000), "day")
}

