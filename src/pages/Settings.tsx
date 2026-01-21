import { zodResolver } from "@hookform/resolvers/zod"
import { LogOut, Save, Trash2 } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useForm, useWatch } from "react-hook-form"
import { z } from "zod"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/stores/authStore"
import { useSettingsStore } from "@/stores/settingsStore"

const schema = z.object({
  theme: z.enum(["system", "light", "dark"]),
  notificationsEnabled: z.boolean(),
  aiAssistEnabled: z.boolean(),
  twilioToken: z.string(),
})

type FormValues = z.infer<typeof schema>

export function SettingsPage() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)

  const theme = useSettingsStore((s) => s.theme)
  const notificationsEnabled = useSettingsStore((s) => s.notificationsEnabled)
  const aiAssistEnabled = useSettingsStore((s) => s.aiAssistEnabled)
  const twilioToken = useSettingsStore((s) => s.twilioToken)

  const setTheme = useSettingsStore((s) => s.setTheme)
  const setNotificationsEnabled = useSettingsStore((s) => s.setNotificationsEnabled)
  const setAiAssistEnabled = useSettingsStore((s) => s.setAiAssistEnabled)
  const setTwilioToken = useSettingsStore((s) => s.setTwilioToken)
  const clearTwilioToken = useSettingsStore((s) => s.clearTwilioToken)

  const [saved, setSaved] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      theme,
      notificationsEnabled,
      aiAssistEnabled,
      twilioToken: twilioToken || "",
    },
    mode: "onChange",
  })
  const themeValue = useWatch({ control: form.control, name: "theme" })
  const notificationsValue = useWatch({
    control: form.control,
    name: "notificationsEnabled",
  })
  const aiAssistValue = useWatch({ control: form.control, name: "aiAssistEnabled" })
  const twilioTokenValue = useWatch({ control: form.control, name: "twilioToken" })

  // Keep form in sync if store changes elsewhere.
  useEffect(() => {
    form.reset({
      theme,
      notificationsEnabled,
      aiAssistEnabled,
      twilioToken: twilioToken || "",
    })
  }, [aiAssistEnabled, form, notificationsEnabled, theme, twilioToken])

  const identity = useMemo(() => {
    if (!user) return null
    return {
      name: user.name,
      email: user.email,
      role: user.role,
    }
  }, [user])

  function onSubmit(values: FormValues) {
    setTheme(values.theme)
    setNotificationsEnabled(values.notificationsEnabled)
    setAiAssistEnabled(values.aiAssistEnabled)
    setTwilioToken(values.twilioToken?.trim() ?? "")

    setSaved(true)
    window.setTimeout(() => setSaved(false), 1200)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Settings</h2>
          <p className="text-sm text-muted-foreground">
            Profile, notifications, Twilio, and AI configuration.
          </p>
        </div>
        <Badge variant="secondary">Demo</Badge>
      </div>

      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">Account</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </Button>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {identity ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Name</span>
                    <span className="font-medium">{identity.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Email</span>
                    <span className="font-medium">{identity.email}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Role</span>
                    <span className="font-medium capitalize">{identity.role}</span>
                  </div>
                  <Separator />
                  <div className="text-xs text-muted-foreground">
                    Account editing will be wired to backend later.
                  </div>
                </>
              ) : (
                <div className="text-sm text-muted-foreground">
                  Not signed in.
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label>Theme</Label>
                <RadioGroup
                  value={themeValue}
                  onValueChange={(v) => form.setValue("theme", v as FormValues["theme"], { shouldDirty: true })}
                  className="grid grid-cols-3 gap-2"
                >
                  <label className="flex cursor-pointer items-center gap-2 rounded-lg border bg-muted/20 px-3 py-2 text-sm">
                    <RadioGroupItem value="system" />
                    System
                  </label>
                  <label className="flex cursor-pointer items-center gap-2 rounded-lg border bg-muted/20 px-3 py-2 text-sm">
                    <RadioGroupItem value="light" />
                    Light
                  </label>
                  <label className="flex cursor-pointer items-center gap-2 rounded-lg border bg-muted/20 px-3 py-2 text-sm">
                    <RadioGroupItem value="dark" />
                    Dark
                  </label>
                </RadioGroup>
                <div className="text-xs text-muted-foreground">
                  Theme applies instantly and is saved locally.
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-medium">Notifications</div>
                  <div className="text-xs text-muted-foreground">
                    Enable in-app alerts.
                  </div>
                </div>
                <Switch
                  checked={notificationsValue}
                  onCheckedChange={(v) =>
                    form.setValue("notificationsEnabled", v, { shouldDirty: true })
                  }
                />
              </div>

              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-medium">AI assist</div>
                  <div className="text-xs text-muted-foreground">
                    Show suggestions during calls.
                  </div>
                </div>
                <Switch
                  checked={aiAssistValue}
                  onCheckedChange={(v) =>
                    form.setValue("aiAssistEnabled", v, { shouldDirty: true })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Twilio configuration</CardTitle>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  clearTwilioToken()
                  form.setValue("twilioToken", "", { shouldDirty: true })
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Clear
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-2">
              <Label htmlFor="twilioToken">Access token</Label>
              <Input
                id="twilioToken"
                placeholder="Paste Twilio access token..."
                value={twilioTokenValue ?? ""}
                onChange={(e) =>
                  form.setValue("twilioToken", e.target.value, { shouldDirty: true })
                }
              />
              <div className="text-xs text-muted-foreground">
                Security note: don’t store long-lived tokens in the browser. In
                production, fetch short-lived tokens from backend.
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="submit"
            disabled={!form.formState.isDirty || !form.formState.isValid}
          >
            <Save className="mr-2 h-4 w-4" />
            Save changes
          </Button>
          <div
            className={cn(
              "text-sm text-muted-foreground transition-opacity",
              saved ? "opacity-100" : "opacity-0",
            )}
          >
            Saved.
          </div>
        </div>
      </form>
    </div>
  )
}

