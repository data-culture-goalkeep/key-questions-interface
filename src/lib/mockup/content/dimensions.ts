// Filter dimensions and the divisions/districts reference data, from the
// design handoff (dummy-data.json + reference-implementation.js `DIV`).

// Options are shown sorted (years ascending); the data arrays below keep their
// own order because per-index lookups (division offsets, table rows) depend on it.
export const ACADEMIC_YEARS = ["2023–24", "2024–25", "2025–26"] as const
export const SUBJECTS = ["English", "Hindi", "Mathematics"] as const
export const GRADES = ["Grade 6", "Grade 7", "Grade 8"] as const
export const GENDERS = ["Girls", "Boys"] as const
export const TEACHER_GENDERS = ["Female", "Male"] as const

export const ALL_DIVISIONS = "All Divisions"
export const ALL_DISTRICTS = "All Districts"
export const ALL_SUBJECTS = "All Subjects"

export interface Division {
  name: string
  districts: number
  schools: number
  students: number
  teachers: number
  schoolLeaders: number
  mshms: number
  /** Per-division rate offset (pp), applied on top of the scenario delta. */
  offset: number
}

// [name, districts, schools, students, teachers, schoolLeaders, mshms]
// offset order from reference: [-3, 1, 3, 5, 4, -1, -4, -2, 2]
export const DIVISIONS: Division[] = [
  { name: "Bhopal", districts: 5, schools: 34, students: 30820, teachers: 55, schoolLeaders: 34, mshms: 29, offset: -3 },
  { name: "Indore", districts: 8, schools: 31, students: 28540, teachers: 52, schoolLeaders: 31, mshms: 26, offset: 1 },
  { name: "Ujjain", districts: 7, schools: 28, students: 24910, teachers: 47, schoolLeaders: 28, mshms: 23, offset: 3 },
  { name: "Jabalpur", districts: 8, schools: 33, students: 29880, teachers: 56, schoolLeaders: 33, mshms: 28, offset: 5 },
  { name: "Gwalior", districts: 8, schools: 47, students: 43841, teachers: 83, schoolLeaders: 47, mshms: 40, offset: 4 },
  { name: "Sagar", districts: 6, schools: 30, students: 26950, teachers: 49, schoolLeaders: 30, mshms: 25, offset: -1 },
  { name: "Rewa", districts: 6, schools: 26, students: 22860, teachers: 43, schoolLeaders: 26, mshms: 21, offset: -4 },
  { name: "Narmadapuram", districts: 3, schools: 24, students: 21180, teachers: 39, schoolLeaders: 24, mshms: 20, offset: -2 },
  { name: "Shahdol", districts: 3, schools: 22, students: 18740, teachers: 36, schoolLeaders: 22, mshms: 18, offset: 2 },
]

export const DISTRICTS = [
  "Betul",
  "Dewas",
  "Dhar",
  "Harda",
  "Mandsaur",
  "Neemuch",
  "Raisen",
  "Ratlam",
  "Sehore",
  "Vidisha",
] as const

export const TOTAL_SCHOOLS = DIVISIONS.reduce((a, d) => a + d.schools, 0)

export const divisionOptions = [
  ALL_DIVISIONS,
  ...DIVISIONS.map((d) => d.name).sort((a, b) => a.localeCompare(b)),
]
export const districtOptions = [
  ALL_DISTRICTS,
  ...[...DISTRICTS].sort((a, b) => a.localeCompare(b)),
]
export const subjectOptions = [
  ALL_SUBJECTS,
  ...[...SUBJECTS].sort((a, b) => a.localeCompare(b)),
]

export function divisionIndex(division: string): number {
  return DIVISIONS.findIndex((d) => d.name === division)
}
