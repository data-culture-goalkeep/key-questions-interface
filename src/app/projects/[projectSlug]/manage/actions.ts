"use server"

import { revalidatePath } from "next/cache"

import { createClient } from "@/lib/supabase/server"
import type { DataAvailabilityStatus, Priority } from "@/lib/types"

async function requireFacilitatorClient() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user?.email?.toLowerCase().endsWith("@goalkeep.net")) {
    throw new Error("Only facilitators can make changes here.")
  }
  return supabase
}

// projectId here is the real database id (resolved server-side from the
// slug before it reaches these actions) — but the URL itself is keyed by
// slug, so revalidatePath needs the route's dynamic-segment *pattern*
// (which revalidates every matching URL) rather than a literal path built
// from the id.
function revalidate() {
  revalidatePath("/projects/[projectSlug]/manage", "page")
}

// --- Areas of enquiry -------------------------------------------------

export async function createArea(projectId: string, name: string) {
  const supabase = await requireFacilitatorClient()
  const { count } = await supabase
    .from("areas_of_enquiry")
    .select("id", { count: "exact", head: true })
    .eq("project_id", projectId)

  const { error } = await supabase
    .from("areas_of_enquiry")
    .insert({ project_id: projectId, name, sequence: count ?? 0 })
  if (error) throw error
  revalidate()
}

export async function renameArea(
  projectId: string,
  areaId: string,
  name: string
) {
  const supabase = await requireFacilitatorClient()
  const { error } = await supabase
    .from("areas_of_enquiry")
    .update({ name })
    .eq("id", areaId)
  if (error) throw error
  revalidate()
}

export async function deleteArea(projectId: string, areaId: string) {
  const supabase = await requireFacilitatorClient()
  const { error } = await supabase
    .from("areas_of_enquiry")
    .delete()
    .eq("id", areaId)
  if (error) throw error
  revalidate()
}

export async function moveArea(
  projectId: string,
  areaId: string,
  direction: "up" | "down"
) {
  const supabase = await requireFacilitatorClient()
  const { data: areas, error } = await supabase
    .from("areas_of_enquiry")
    .select("id, sequence")
    .eq("project_id", projectId)
    .order("sequence")
  if (error) throw error

  const index = areas.findIndex((a) => a.id === areaId)
  const swapWith = direction === "up" ? index - 1 : index + 1
  if (index === -1 || swapWith < 0 || swapWith >= areas.length) return

  const a = areas[index]
  const b = areas[swapWith]
  await Promise.all([
    supabase
      .from("areas_of_enquiry")
      .update({ sequence: b.sequence })
      .eq("id", a.id),
    supabase
      .from("areas_of_enquiry")
      .update({ sequence: a.sequence })
      .eq("id", b.id),
  ])
  revalidate()
}

// --- Key questions ------------------------------------------------------

export interface KeyQuestionInput {
  areaOfEnquiryId: string
  kqNumber: string
  questionText: string
  shortName: string
  indicatorLevelId: string
  indicatorDefinition: string
  actionText: string
  primaryUser: string
  dataAvailabilityStatus: DataAvailabilityStatus
  dataAvailabilityNote: string
  priority: Priority
  reasonForPriority: string
}

export async function createKeyQuestion(
  projectId: string,
  input: KeyQuestionInput
) {
  const supabase = await requireFacilitatorClient()
  const { count } = await supabase
    .from("key_questions")
    .select("id", { count: "exact", head: true })
    .eq("area_of_enquiry_id", input.areaOfEnquiryId)

  const { error } = await supabase.from("key_questions").insert({
    project_id: projectId,
    area_of_enquiry_id: input.areaOfEnquiryId,
    kq_number: input.kqNumber,
    question_text: input.questionText,
    short_name: input.shortName,
    indicator_level_id: input.indicatorLevelId,
    indicator_definition: input.indicatorDefinition,
    action_text: input.actionText,
    primary_user: input.primaryUser,
    data_availability_status: input.dataAvailabilityStatus,
    data_availability_note: input.dataAvailabilityNote,
    priority: input.priority,
    reason_for_priority: input.reasonForPriority,
    sequence: count ?? 0,
  })
  if (error) throw error
  revalidate()
}

export async function updateKeyQuestion(
  projectId: string,
  kqId: string,
  input: KeyQuestionInput
) {
  const supabase = await requireFacilitatorClient()
  const { error } = await supabase
    .from("key_questions")
    .update({
      area_of_enquiry_id: input.areaOfEnquiryId,
      kq_number: input.kqNumber,
      question_text: input.questionText,
      short_name: input.shortName,
      indicator_level_id: input.indicatorLevelId,
      indicator_definition: input.indicatorDefinition,
      action_text: input.actionText,
      primary_user: input.primaryUser,
      data_availability_status: input.dataAvailabilityStatus,
      data_availability_note: input.dataAvailabilityNote,
      priority: input.priority,
      reason_for_priority: input.reasonForPriority,
    })
    .eq("id", kqId)
  if (error) throw error
  revalidate()
}

export async function deleteKeyQuestion(projectId: string, kqId: string) {
  const supabase = await requireFacilitatorClient()
  const { error } = await supabase
    .from("key_questions")
    .delete()
    .eq("id", kqId)
  if (error) throw error
  revalidate()
}

export async function setKeyQuestionLocked(
  projectId: string,
  kqId: string,
  isLocked: boolean
) {
  const supabase = await requireFacilitatorClient()
  const { error } = await supabase
    .from("key_questions")
    .update({ is_locked: isLocked })
    .eq("id", kqId)
  if (error) throw error
  revalidate()
}

export async function moveKeyQuestion(
  projectId: string,
  areaOfEnquiryId: string,
  kqId: string,
  direction: "up" | "down"
) {
  const supabase = await requireFacilitatorClient()
  const { data: kqs, error } = await supabase
    .from("key_questions")
    .select("id, sequence")
    .eq("area_of_enquiry_id", areaOfEnquiryId)
    .order("sequence")
  if (error) throw error

  const index = kqs.findIndex((k) => k.id === kqId)
  const swapWith = direction === "up" ? index - 1 : index + 1
  if (index === -1 || swapWith < 0 || swapWith >= kqs.length) return

  const a = kqs[index]
  const b = kqs[swapWith]
  await Promise.all([
    supabase.from("key_questions").update({ sequence: b.sequence }).eq("id", a.id),
    supabase.from("key_questions").update({ sequence: a.sequence }).eq("id", b.id),
  ])
  revalidate()
}
