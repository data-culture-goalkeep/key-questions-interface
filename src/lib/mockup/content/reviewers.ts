// The fixed reviewer list. Groups exist for orientation on the brief screen
// only — every reviewer can see and comment on every view.

export interface ReviewGroup {
  /** 1–4 */
  group: number
  name: string
  members: string[]
  /** Workbook view assignment, shown for orientation only. */
  views: string
}

export const REVIEW_GROUPS: ReviewGroup[] = [
  {
    group: 1,
    name: "Group 1",
    members: ["Kanishka", "Shil", "Ashish"],
    views: "1. Input & Reach · 7. Impact",
  },
  {
    group: 2,
    name: "Group 2",
    members: ["Jay", "Sharmishta", "Surya"],
    views: "6a. Learning (Internal) · 6b. Learning (External)",
  },
  {
    group: 3,
    name: "Group 3",
    members: ["Manju", "Ambika", "Purty"],
    views: "3. PAP Overview · 4. PAP Detail",
  },
  {
    group: 4,
    name: "Group 4",
    members: ["Anisha", "Ramesh", "Shashwat"],
    views: "2. Delivery & Quality · 5. Teacher Practice",
  },
]

export const REVIEWER_NAMES = REVIEW_GROUPS.flatMap((g) => g.members)

export function reviewGroupFor(name: string): number {
  return REVIEW_GROUPS.find((g) => g.members.includes(name))?.group ?? 1
}

/** Deterministic avatar colour, matching the reference (name length % 4). */
export const AVATAR_COLORS = ["#81C2B2", "#EA9D93", "#E9E626", "#B9C6E4"]
export function avatarColor(name: string): string {
  return AVATAR_COLORS[(name || "").length % 4]
}
export function initial(name: string): string {
  return (name || "?").charAt(0).toUpperCase()
}
