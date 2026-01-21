import { zodResolver } from "@hookform/resolvers/zod"
import { Lock, Mail } from "lucide-react"
import { useMemo, useState } from "react"
import { useForm, useWatch } from "react-hook-form"
import { Navigate, useLocation, useNavigate } from "react-router-dom"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/stores/authStore"

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Minimum 6 characters"),
  remember: z.boolean(),
})

type FormValues = z.infer<typeof schema>

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const login = useAuthStore((s) => s.login)

  const [serverError, setServerError] = useState<string | null>(null)

  const from = useMemo(() => {
    const state = location.state as { from?: { pathname?: string } } | null
    return state?.from?.pathname || "/"
  }, [location.state])

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "operator@demo.uz",
      password: "password",
      remember: true,
    },
    mode: "onChange",
  })
  const remember = useWatch({ control: form.control, name: "remember" })

  if (isAuthenticated) {
    return <Navigate to={from} replace />
  }

  async function onSubmit(values: FormValues) {
    setServerError(null)
    try {
      await login(values)
      navigate(from, { replace: true })
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed"
      setServerError(message)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
        <div className="relative hidden overflow-hidden border-r bg-muted/30 lg:block">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
          <div className="relative flex h-full flex-col p-10">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-sm font-semibold text-primary-foreground">
                AI
              </div>
              <div className="leading-tight">
                <div className="text-sm font-semibold">AI Call Center</div>
                <div className="text-xs text-muted-foreground">
                  Ministry-scale support, real-time.
                </div>
              </div>
            </div>

            <div className="mt-auto max-w-md">
              <h2 className="text-2xl font-semibold tracking-tight">
                Modern operator console
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Real-time voice and chat, transcripts, AI summaries, and
                analytics—built for high-volume citizen support.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center p-6 lg:p-10">
          <Card className="w-full max-w-md">
            <CardHeader className="space-y-1">
              <CardTitle className="text-xl">Sign in</CardTitle>
              <p className="text-sm text-muted-foreground">
                Use demo credentials or your operator account.
              </p>
            </CardHeader>

            <CardContent>
              <form
                className="space-y-4"
                onSubmit={form.handleSubmit(onSubmit)}
              >
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      placeholder="operator@company.uz"
                      className="pl-9"
                      autoComplete="email"
                      {...form.register("email")}
                    />
                  </div>
                  {form.formState.errors.email?.message ? (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.email.message}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-9"
                      autoComplete="current-password"
                      {...form.register("password")}
                    />
                  </div>
                  {form.formState.errors.password?.message ? (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.password.message}
                    </p>
                  ) : null}
                </div>

                <div className="flex items-center justify-between gap-3">
                  <label className="flex cursor-pointer items-center gap-2 text-sm">
                    <Checkbox
                      checked={remember}
                      onCheckedChange={(v) =>
                        form.setValue("remember", v === true)
                      }
                    />
                    Remember me
                  </label>
                  <Button
                    type="button"
                    variant="link"
                    className="h-auto px-0 text-sm"
                    onClick={() => setServerError("Password reset is not set up in demo.")}
                  >
                    Forgot password?
                  </Button>
                </div>

                {serverError ? (
                  <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {serverError}
                  </div>
                ) : null}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={!form.formState.isValid || form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? "Signing in..." : "Sign in"}
                </Button>

                <div className="text-xs text-muted-foreground">
                  Demo: <span className="font-medium">operator@demo.uz</span> /{" "}
                  <span className="font-medium">password</span>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      <div
        className={cn(
          "fixed bottom-4 left-1/2 -translate-x-1/2 rounded-full border bg-background/70 px-3 py-1 text-xs text-muted-foreground backdrop-blur",
          "shadow-sm",
        )}
      >
        AI Call Center • Demo mode
      </div>
    </div>
  )
}

