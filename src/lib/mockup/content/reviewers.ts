// Reviewers are a flat list — pick a preset name or type your own on the
// brief screen. No groups, no auth.

export const PRESET_REVIEWERS = [
  "Ambika",
  "Anisha",
  "Ashish",
  "Bhumika",
  "Jay",
  "Kanishka",
  "Manju",
  "Purty",
  "Ramesh",
  "Sharmishta",
  "Shashwat",
  "Shil",
  "Simran",
  "Surya",
  "Swapneel",
]

/** Kept as an alias — used by the feedback-log reviewer filter and the seed. */
export const REVIEWER_NAMES = PRESET_REVIEWERS

/** Deterministic avatar colour, matching the reference (name length % 4). */
export const AVATAR_COLORS = ["#81C2B2", "#EA9D93", "#E9E626", "#B9C6E4"]
export function avatarColor(name: string): string {
  return AVATAR_COLORS[(name || "").length % 4]
}
export function initial(name: string): string {
  return (name || "?").charAt(0).toUpperCase()
}
