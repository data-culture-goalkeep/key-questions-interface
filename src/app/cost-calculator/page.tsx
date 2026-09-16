import type { Metadata } from "next"

import { CostCalculator } from "./cost-calculator"

export const metadata: Metadata = {
  title: "Goalkeep cost calculator",
  description: "Estimate the cost of a Goalkeep Kickstarter technology stack.",
}

export default function CostCalculatorPage() {
  return <CostCalculator />
}
