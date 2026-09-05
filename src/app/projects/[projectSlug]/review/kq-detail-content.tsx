"use client"

import * as React from "react"
import { CheckCircle2, Lock } from "lucide-react"
import ReactMarkdown from "react-markdown"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { ProjectData } from "@/lib/project-data"
import {
  dataAvailabilityLabel,
  type CommentType,
  type KeyQuestion,
  type KeyQuestionComment,
} from "@/lib/types"
import { useProjectData } from "../project-data-provider"
import { addComment, setCommentResolved, toggleVerified } from "./actions"

// Applies `updater` to the one matching key question within `data`, for
// the optimistic patches below — every action here only ever touches the
// single KQ this component renders.
function patchKq(
  data: ProjectData,
  kqId: string,
  updater: (kq: KeyQuestion) => KeyQuestion
): ProjectData {
  return {
    ...data,
    keyQuestions: data.keyQuestions.map((k) => (k.id === kqId ? updater(k) : k)),
  }
}

// The field list, comments thread, and comment/verify action bar for one
// key question — shared between the List view's inline expanded card and
// the Map view's detail panel, so the two surfaces can't drift apart.
export function KqDetailContent({
  projectId,
  kq,
  role,
  userId,
}: {
  projectId: string
  kq: KeyQuestion
  role: "facilitator" | "client"
  userId: string
}) {
  const { data: projectData, mutate } = useProjectData()
  const [pending, startTransition] = React.useTransition()
  const [commentText, setCommentText] = React.useState("")
  const [commentType, setCommentType] = React.useState<CommentType>("general")
  const [actionError, setActionError] = React.useState<string | null>(null)

  // Applies `patch` immediately (via the shared provider's optimistic
  // overlay), then runs `action`; mutate() always resyncs with refresh()
  // afterward, so a failed action's optimistic guess gets reverted too.
  function runAction(
    patch: (data: ProjectData) => ProjectData,
    action: () => Promise<void>
  ) {
    setActionError(null)
    startTransition(async () => {
      try {
        await mutate(patch, action)
      } catch {
        setActionError(
          "That didn't go through — this key question may have just been locked. Refresh and try again."
        )
      }
    })
  }

  const comments = [...(kq.key_question_comments ?? [])].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  )
  const isVerified = (kq.key_question_client_reviews ?? []).some(
    (r) => r.user_id === userId
  )

  function submitComment(e: React.FormEvent) {
    e.preventDefault()
    if (!commentText.trim()) return
    const text = commentText.trim()
    const optimisticComment: KeyQuestionComment = {
      id: crypto.randomUUID(),
      key_question_id: kq.id,
      author_id: userId,
      author_email: projectData?.userEmail ?? "",
      comment_text: text,
      comment_type: commentType,
      status: "open",
      created_at: new Date().toISOString(),
    }
    setCommentText("")
    runAction(
      (data) =>
        patchKq(data, kq.id, (k) => ({
          ...k,
          key_question_comments: [
            ...(k.key_question_comments ?? []),
            optimisticComment,
          ],
        })),
      () => addComment(projectId, kq.id, text, commentType)
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <dt className="text-xs font-medium text-muted-foreground">
            Short Name
          </dt>
          <dd className="text-sm whitespace-pre-line">
            {kq.short_name || "—"}
          </dd>
        </div>
        <div className="flex flex-col gap-1">
          <dt className="text-xs font-medium text-muted-foreground">
            Indicator Definition
          </dt>
          <dd className="prose prose-sm dark:prose-invert max-w-none text-sm">
            {kq.indicator_definition ? (
              <ReactMarkdown>{kq.indicator_definition}</ReactMarkdown>
            ) : (
              "—"
            )}
          </dd>
        </div>
        <div className="flex flex-col gap-1">
          <dt className="text-xs font-medium text-muted-foreground">
            Action
          </dt>
          <dd className="text-sm whitespace-pre-line">
            {kq.action_text || "—"}
          </dd>
        </div>
        <div className="flex flex-col gap-1">
          <dt className="text-xs font-medium text-muted-foreground">
            Primary User
          </dt>
          <dd className="text-sm whitespace-pre-line">
            {kq.primary_user || "—"}
          </dd>
        </div>
        <div className="flex flex-col gap-1">
          <dt className="text-xs font-medium text-muted-foreground">
            Data Availability
          </dt>
          <dd className="text-sm whitespace-pre-line">
            {dataAvailabilityLabel(kq.data_availability_status)}
            {kq.data_availability_status !== "fully_available" &&
              kq.data_availability_note && (
                <span className="block text-muted-foreground">
                  {kq.data_availability_note}
                </span>
              )}
          </dd>
        </div>
        <div className="flex flex-col gap-1 sm:col-span-2">
          <dt className="text-xs font-medium text-muted-foreground">
            Reason for Priority
          </dt>
          <dd className="text-sm whitespace-pre-line">
            {kq.reason_for_priority || "—"}
          </dd>
        </div>
      </dl>

      {comments.length > 0 && (
        <>
          <Separator />
          <div className="flex flex-col gap-3">
            <h4 className="font-heading text-sm font-medium">Comments</h4>
            {comments.map((c) => (
              <div key={c.id} className="flex flex-col gap-0.5 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">
                    {c.author_email || "Unknown"}
                  </span>
                  <Badge variant="outline" className="text-[10px]">
                    {c.comment_type === "definition_suggestion"
                      ? "definition suggestion"
                      : "general"}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(c.created_at).toLocaleDateString()}
                  </span>
                  <Badge
                    variant={c.status === "open" ? "destructive" : "outline"}
                    className="text-[10px]"
                  >
                    {c.status}
                  </Badge>
                  {role === "facilitator" && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="xs"
                      disabled={pending}
                      onClick={() =>
                        runAction(
                          (data) =>
                            patchKq(data, kq.id, (k) => ({
                              ...k,
                              key_question_comments: (
                                k.key_question_comments ?? []
                              ).map((cm) =>
                                cm.id === c.id
                                  ? {
                                      ...cm,
                                      status:
                                        c.status === "open" ? "resolved" : "open",
                                    }
                                  : cm
                              ),
                            })),
                          () =>
                            setCommentResolved(
                              projectId,
                              c.id,
                              c.status === "open"
                            )
                        )
                      }
                    >
                      Mark {c.status === "open" ? "resolved" : "open"}
                    </Button>
                  )}
                </div>
                <p className="text-muted-foreground">{c.comment_text}</p>
              </div>
            ))}
          </div>
        </>
      )}

      <Separator />

      {actionError && <p className="text-xs text-destructive">{actionError}</p>}

      {kq.is_locked && role === "client" ? (
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Lock className="size-3.5" />
          This key question is locked — facilitation is complete and no
          further comments or verification are accepted.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {kq.is_locked && (
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Lock className="size-3.5" />
              Locked — clients can no longer comment or verify, but you can
              as a facilitator.
            </p>
          )}
          <form onSubmit={submitComment} className="flex flex-col gap-2">
            <Textarea
              placeholder="Suggest a tighter definition, or leave a general comment…"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Select
                value={commentType}
                onValueChange={(v) => setCommentType(v as CommentType)}
              >
                <SelectTrigger className="w-56">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General comment</SelectItem>
                  <SelectItem value="definition_suggestion">
                    Definition suggestion
                  </SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2">
                <Button
                  type="submit"
                  variant="outline"
                  size="sm"
                  disabled={pending || !commentText.trim()}
                >
                  Add comment
                </Button>
                {role === "client" && (
                  <Button
                    type="button"
                    variant={isVerified ? "secondary" : "default"}
                    size="sm"
                    disabled={pending}
                    onClick={() => {
                      // Precomputed outside the patch closure — React's
                      // useOptimistic updater must stay pure (it can be
                      // invoked more than once for the same dispatch, e.g.
                      // under Strict Mode's double-invocation), so it can't
                      // call crypto.randomUUID()/new Date() itself.
                      const optimisticReview = {
                        id: crypto.randomUUID(),
                        key_question_id: kq.id,
                        user_id: userId,
                        user_email: projectData?.userEmail ?? "",
                        verified_at: new Date().toISOString(),
                      }
                      runAction(
                        (data) =>
                          patchKq(data, kq.id, (k) => ({
                            ...k,
                            key_question_client_reviews: isVerified
                              ? (k.key_question_client_reviews ?? []).filter(
                                  (r) => r.user_id !== userId
                                )
                              : [
                                  ...(k.key_question_client_reviews ?? []),
                                  optimisticReview,
                                ],
                          })),
                        () => toggleVerified(projectId, kq.id, isVerified)
                      )
                    }}
                    className="gap-1.5"
                  >
                    <CheckCircle2 className="size-3.5" />
                    {isVerified ? "Verified" : "I've read & verified this"}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
