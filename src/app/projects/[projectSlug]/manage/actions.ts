"use server"

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

// --- Areas of enquiry -------------------------------------------------

export async function createArea(
  projectId: string,
  name: string,
  areaNumber: string
) {
  const supabase = await requireFacilitatorClient()
  const { count } = await supabase
    .from("areas_of_enquiry")
    .select("id", { count: "exact", head: true })
    .eq("project_id", projectId)

  const { error } = await supabase.from("areas_of_enquiry").insert({
    project_id: projectId,
    name,
    area_number: areaNumber,
    sequence: count ?? 0,
  })
  if (error) throw error
}

export async function renameArea(
  projectId: string,
  areaId: string,
  name: string,
  areaNumber: string
) {
  const supabase = await requireFacilitatorClient()
  const { error } = await supabase
    .from("areas_of_enquiry")
    .update({ name, area_number: areaNumber })
    .eq("id", areaId)
  if (error) throw error
}

export async function deleteArea(projectId: string, areaId: string) {
  const supabase = await requireFacilitatorClient()
  const { error } = await supabase
    .from("areas_of_enquiry")
    .delete()
    .eq("id", areaId)
  if (error) throw error
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
  // Other key_questions.id values this one depends on — synced into
  // key_question_links as relationship_type "depends_on". Direction isn't
  // stored (the Map view infers upstream/downstream purely from each KQ's
  // indicator level position), so it doesn't matter which KQ's form
  // created the link.
  dependsOnKqIds: string[]
}

// Inserts one key_question_links row per id in dependsOnKqIds, with this
// KQ as key_question_id_a — used for a freshly created KQ, which has no
// existing links to diff against.
async function insertDependsOnLinks(
  supabase: Awaited<ReturnType<typeof requireFacilitatorClient>>,
  kqId: string,
  dependsOnKqIds: string[]
) {
  if (dependsOnKqIds.length === 0) return
  const { error } = await supabase.from("key_question_links").insert(
    dependsOnKqIds.map((otherId) => ({
      key_question_id_a: kqId,
      key_question_id_b: otherId,
      relationship_type: "depends_on" as const,
    }))
  )
  if (error) throw error
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

  const { data, error } = await supabase
    .from("key_questions")
    .insert({
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
    .select("id")
    .single()
  if (error) throw error

  await insertDependsOnLinks(supabase, data.id, input.dependsOnKqIds)
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

  // Re-queried server-side (not trusting client-passed prior state) to
  // avoid a race with a concurrent edit landing between page load and this
  // save.
  const { data: existingLinks, error: linksError } = await supabase
    .from("key_question_links")
    .select("id, key_question_id_a, key_question_id_b")
    .eq("relationship_type", "depends_on")
    .or(`key_question_id_a.eq.${kqId},key_question_id_b.eq.${kqId}`)
  if (linksError) throw linksError

  const currentDependsOn = new Map(
    (existingLinks ?? []).map((l) => [
      l.key_question_id_a === kqId ? l.key_question_id_b : l.key_question_id_a,
      l.id,
    ])
  )
  const nextDependsOn = new Set(input.dependsOnKqIds)

  const toRemove = [...currentDependsOn.entries()]
    .filter(([otherId]) => !nextDependsOn.has(otherId))
    .map(([, linkId]) => linkId)
  const toAdd = input.dependsOnKqIds.filter((id) => !currentDependsOn.has(id))

  await Promise.all([
    toRemove.length > 0
      ? supabase.from("key_question_links").delete().in("id", toRemove)
      : Promise.resolve(),
    insertDependsOnLinks(supabase, kqId, toAdd),
  ])
}

export async function deleteKeyQuestion(projectId: string, kqId: string) {
  const supabase = await requireFacilitatorClient()
  const { error } = await supabase
    .from("key_questions")
    .delete()
    .eq("id", kqId)
  if (error) throw error
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
}
