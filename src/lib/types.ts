export type Priority = "high" | "medium" | "low"

export type PrioritizationMethodology = "ordering" | "selection_n" | "points"

export const PRIORITIZATION_METHODOLOGIES: {
  value: PrioritizationMethodology
  label: string
  available: boolean
}[] = [
  { value: "ordering", label: "Ordering", available: true },
  { value: "selection_n", label: "Selection from N", available: false },
  { value: "points", label: "Points", available: false },
]

// Indicator levels are configured per project (a project can drop levels
// like Reach, or split Outcomes into 4A/4B) — see kq_navigator.indicator_levels.
export interface IndicatorLevel {
  id: string
  project_id: string
  key: string
  label: string
  number_label: string
  sequence: number
}

export const PRIORITIES: { value: Priority; label: string }[] = [
  { value: "high", label: "1. High" },
  { value: "medium", label: "2. Medium" },
  { value: "low", label: "3. Low" },
]

export type DataAvailabilityStatus =
  | "fully_available"
  | "partially_available"
  | "not_available"

export const DATA_AVAILABILITY_STATUSES: {
  value: DataAvailabilityStatus
  label: string
}[] = [
  { value: "fully_available", label: "1. Fully Available" },
  { value: "partially_available", label: "2. Partially Available" },
  { value: "not_available", label: "3. Not Available" },
]

export function dataAvailabilityLabel(value: DataAvailabilityStatus) {
  return (
    DATA_AVAILABILITY_STATUSES.find((s) => s.value === value)?.label ?? value
  )
}

export function indicatorLevelLabel(
  levels: IndicatorLevel[],
  indicatorLevelId: string
) {
  const level = levels.find((l) => l.id === indicatorLevelId)
  return level ? `${level.number_label}. ${level.label}` : indicatorLevelId
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

export type ProjectMode = "review" | "prioritization"

export interface Project {
  id: string
  slug: string
  name: string
  client_name: string
  status: "active" | "archived"
  logo_url: string | null
  prioritization_methodology: PrioritizationMethodology
  mode: ProjectMode
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
  indicator_level_id: string
  indicator_definition: string
  action_text: string
  primary_user: string
  data_availability_status: DataAvailabilityStatus
  data_availability_note: string
  priority: Priority
  reason_for_priority: string
  sequence: number
  is_locked: boolean
  // Only present when the query joins them (review/page.tsx) — Manage
  // mode's query doesn't need them, so treat as absent there.
  key_question_comments?: KeyQuestionComment[]
  key_question_client_reviews?: KeyQuestionClientReview[]
}
