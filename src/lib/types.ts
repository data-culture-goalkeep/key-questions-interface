export type IndicatorType =
  | "reach"
  | "input"
  | "output"
  | "intermediate_outcome"
  | "impact"

export type Priority = "high" | "medium" | "low"

export const INDICATOR_LEVELS: { value: IndicatorType; label: string }[] = [
  { value: "reach", label: "Reach" },
  { value: "input", label: "Input" },
  { value: "output", label: "Output" },
  { value: "intermediate_outcome", label: "Intermediate Outcome" },
  { value: "impact", label: "Impact" },
]

export const PRIORITIES: { value: Priority; label: string }[] = [
  { value: "high", label: "1. High" },
  { value: "medium", label: "2. Medium" },
  { value: "low", label: "3. Low" },
]

export function indicatorLabel(value: IndicatorType) {
  return INDICATOR_LEVELS.find((l) => l.value === value)?.label ?? value
}

export function priorityLabel(value: Priority) {
  return PRIORITIES.find((p) => p.value === value)?.label ?? value
}

export const PRIORITY_BADGE_VARIANT: Record<
  Priority,
  "destructive" | "secondary" | "outline"
> = {
  high: "destructive",
  medium: "secondary",
  low: "outline",
}

export interface Project {
  id: string
  name: string
  client_name: string
  status: "active" | "archived"
}

export interface AreaOfEnquiry {
  id: string
  project_id: string
  name: string
  sequence: number
}

export type CommentType = "definition_suggestion" | "general"
export type CommentStatus = "open" | "resolved"
export type RelationshipType = "informs" | "depends_on" | "related_to"

export interface KeyQuestionComment {
  id: string
  key_question_id: string
  author_id: string
  author_email: string
  comment_text: string
  comment_type: CommentType
  status: CommentStatus
  created_at: string
}

export interface KeyQuestionClientReview {
  id: string
  key_question_id: string
  user_id: string
  user_email: string
  verified_at: string
}

export interface KeyQuestionLink {
  id: string
  key_question_id_a: string
  key_question_id_b: string
  relationship_type: RelationshipType
}

export interface KeyQuestion {
  id: string
  project_id: string
  area_of_enquiry_id: string
  kq_number: string
  question_text: string
  indicator_type: IndicatorType
  indicator_definition: string
  action_text: string
  primary_user: string
  data_availability: string
  priority: Priority
  reason_for_priority: string
  sequence: number
  is_locked: boolean
  // Only present when the query joins them (review/page.tsx) — Manage
  // mode's query doesn't need them, so treat as absent there.
  key_question_comments?: KeyQuestionComment[]
  key_question_client_reviews?: KeyQuestionClientReview[]
}
