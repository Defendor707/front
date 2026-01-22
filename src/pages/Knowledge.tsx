import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Plus, Edit, Trash2, Search, Save, X } from "lucide-react"
import { useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { USE_REAL_API, FORCE_REAL_API } from "@/lib/apiConfig"
import {
  getAllQAs,
  createQA,
  updateQA,
  deleteQA,
  getAllTopics,
  createTopic,
  deleteTopic,
} from "@/services/voipApi"
import type { QA, Topic } from "@/services/voipApi"

export function KnowledgePage() {
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState("")
  const [editingQA, setEditingQA] = useState<QA | null>(null)
  const [newQATitle, setNewQATitle] = useState("")
  const [newQAAnswer, setNewQAAnswer] = useState("")
  const [newTopicName, setNewTopicName] = useState("")
  const [showAddQA, setShowAddQA] = useState(false)
  const [showAddTopic, setShowAddTopic] = useState(false)

  // QA va Topic queries
  // Real API mavjud bo'lsa, API'dan olamiz, aks holda bo'sh array qaytaramiz
  const qasQuery = useQuery({
    queryKey: ["qas", searchQuery],
    queryFn: () => getAllQAs(searchQuery || undefined),
    enabled: USE_REAL_API || FORCE_REAL_API,
    retry: 1,
  })

  const topicsQuery = useQuery({
    queryKey: ["topics"],
    queryFn: getAllTopics,
    enabled: USE_REAL_API || FORCE_REAL_API,
    retry: 1,
  })

  // QA mutations
  const createQAMutation = useMutation({
    mutationFn: () => createQA(newQATitle, newQAAnswer),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["qas"] })
      setNewQATitle("")
      setNewQAAnswer("")
      setShowAddQA(false)
    },
  })

  const updateQAMutation = useMutation({
    mutationFn: (data: { id: number; title?: string; answer?: string }) =>
      updateQA(data.id, { title: data.title, answer: data.answer }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["qas"] })
      setEditingQA(null)
    },
  })

  const deleteQAMutation = useMutation({
    mutationFn: deleteQA,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["qas"] })
    },
  })

  // Topic mutations
  const createTopicMutation = useMutation({
    mutationFn: createTopic,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["topics"] })
      setNewTopicName("")
      setShowAddTopic(false)
    },
  })

  const deleteTopicMutation = useMutation({
    mutationFn: deleteTopic,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["topics"] })
    },
  })

  const filteredQAs = (qasQuery.data || []).filter((qa: QA) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      qa.title.toLowerCase().includes(query) ||
      qa.answer.toLowerCase().includes(query)
    )
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Ma'lumotlar Boshqaruvi</h2>
          <p className="text-sm text-muted-foreground">
            AI'ga context berish uchun ma'lumotlar qo'shing. Bu ma'lumotlar AI javoblarida ishlatiladi.
          </p>
        </div>
        {!(USE_REAL_API || FORCE_REAL_API) && (
          <Badge variant="secondary">Demo</Badge>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Ma'lumotlarni qidirish..."
          className="pl-9"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* QA Management */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Savol-Javob (Q&A)</CardTitle>
            <Button
              type="button"
              size="sm"
              onClick={() => {
                setShowAddQA(true)
                setNewQATitle("")
                setNewQAAnswer("")
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Qo'shish
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add New QA Form */}
            {showAddQA && (
              <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
                <div className="space-y-2">
                  <Label>Savol</Label>
                  <Input
                    placeholder="Savol yozing..."
                    value={newQATitle}
                    onChange={(e) => setNewQATitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Javob</Label>
                  <Textarea
                    placeholder="Javob yozing..."
                    value={newQAAnswer}
                    onChange={(e) => setNewQAAnswer(e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      if (newQATitle && newQAAnswer) {
                        createQAMutation.mutate()
                      }
                    }}
                    disabled={!newQATitle || !newQAAnswer || createQAMutation.isPending}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Saqlash
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setShowAddQA(false)
                      setNewQATitle("")
                      setNewQAAnswer("")
                    }}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Bekor qilish
                  </Button>
                </div>
              </div>
            )}

            {/* QA List */}
            {!(USE_REAL_API || FORCE_REAL_API) ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                Real API'ga ulanib, ma'lumotlar qo'shing. <br />
                <span className="text-xs">Real API'ni faollashtirish uchun: VITE_FORCE_REAL_API=true</span>
              </div>
            ) : qasQuery.isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : qasQuery.isError ? (
              <div className="text-center py-8 text-sm text-destructive">
                Xatolik yuz berdi. Backend API'ni tekshiring.
              </div>
            ) : filteredQAs && filteredQAs.length > 0 ? (
              <div className="space-y-3">
                {filteredQAs.map((qa: QA) => (
                  <div
                    key={qa.id}
                    className="rounded-lg border bg-card p-4 space-y-2"
                  >
                    {editingQA?.id === qa.id && editingQA ? (
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label>Savol</Label>
                          <Input
                            value={editingQA.title}
                            onChange={(e) =>
                              setEditingQA({ ...editingQA, title: e.target.value })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Javob</Label>
                          <Textarea
                            value={editingQA.answer || ""}
                            onChange={(e) =>
                              setEditingQA({ ...editingQA, answer: e.target.value })
                            }
                            rows={3}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => {
                              if (editingQA) {
                                updateQAMutation.mutate({
                                  id: editingQA.id,
                                  title: editingQA.title,
                                  answer: editingQA.answer,
                                })
                              }
                            }}
                            disabled={updateQAMutation.isPending}
                          >
                            <Save className="mr-2 h-4 w-4" />
                            Saqlash
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingQA(null)}
                          >
                            Bekor qilish
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 space-y-1">
                            <h4 className="font-medium text-sm">{qa.title}</h4>
                            <p className="text-sm text-muted-foreground">{qa.answer}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(qa.createdAt).toLocaleDateString("uz-UZ")}
                            </p>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditingQA(qa)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                if (confirm("Bu ma'lumotni o'chirmoqchimisiz?")) {
                                  deleteQAMutation.mutate(qa.id)
                                }
                              }}
                              disabled={deleteQAMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-sm text-muted-foreground">
                {searchQuery ? "Hech narsa topilmadi" : "Hozircha ma'lumotlar yo'q"}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Topic Management */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Mavzular (Topics)</CardTitle>
            <Button
              type="button"
              size="sm"
              onClick={() => {
                setShowAddTopic(true)
                setNewTopicName("")
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Qo'shish
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add New Topic Form */}
            {showAddTopic && (
              <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
                <div className="space-y-2">
                  <Label>Mavzu nomi</Label>
                  <Input
                    placeholder="Mavzu nomini yozing..."
                    value={newTopicName}
                    onChange={(e) => setNewTopicName(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      if (newTopicName) {
                        createTopicMutation.mutate(newTopicName)
                      }
                    }}
                    disabled={!newTopicName || createTopicMutation.isPending}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Saqlash
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setShowAddTopic(false)
                      setNewTopicName("")
                    }}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Bekor qilish
                  </Button>
                </div>
              </div>
            )}

            {/* Topics List */}
            {!(USE_REAL_API || FORCE_REAL_API) ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                Real API'ga ulanib, mavzular qo'shing. <br />
                <span className="text-xs">Real API'ni faollashtirish uchun: VITE_FORCE_REAL_API=true</span>
              </div>
            ) : topicsQuery.isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : topicsQuery.isError ? (
              <div className="text-center py-8 text-sm text-destructive">
                Xatolik yuz berdi. Backend API'ni tekshiring.
              </div>
            ) : topicsQuery.data && topicsQuery.data.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {(topicsQuery.data || []).map((topic: Topic) => (
                  <Badge
                    key={topic.id}
                    variant="secondary"
                    className="flex items-center gap-2 px-3 py-1.5 text-sm"
                  >
                    <span>{topic.name}</span>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-4 w-4 p-0 hover:bg-destructive/20"
                      onClick={() => {
                        if (confirm(`"${topic.name}" mavzusini o'chirmoqchimisiz?`)) {
                          deleteTopicMutation.mutate(topic.id)
                        }
                      }}
                      disabled={deleteTopicMutation.isPending}
                    >
                      <X className="h-3 w-3 text-destructive" />
                    </Button>
                  </Badge>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-sm text-muted-foreground">
                Hozircha mavzular yo'q
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Info Card */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="space-y-2">
            <h4 className="font-medium text-sm">ℹ️ Ma'lumot</h4>
            <p className="text-sm text-muted-foreground">
              Bu sahifada qo'shilgan ma'lumotlar AI'ga context sifatida yuboriladi. 
              AI foydalanuvchilarga javob berishda bu ma'lumotlardan foydalanadi.
              Qo'shilgan Q&A'lar va mavzular avtomatik ravishda AI'ning bilim bazasiga qo'shiladi.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
