"use client"

import { useMemo, useState } from "react"
import { Check, Landmark, Server, Sparkles } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

type BillingCycle = "monthly" | "annual"
type PricingTier = "standard" | "ngo"
type AiProvider = "chatgpt" | "claude"

const INR_PER_USD = 96

const FIXED_SERVICES = [
  {
    id: "vercel",
    name: "Vercel Pro",
    description: "One deploying seat",
    monthlyUsd: 20,
    annualUsd: 240,
    icon: Server,
  },
  {
    id: "supabase",
    name: "Supabase Pro",
    description: "One organisation",
    monthlyUsd: 25,
    annualUsd: 300,
    icon: Landmark,
  },
] as const

const AI_PRICING: Record<
  AiProvider,
  Record<PricingTier, { monthlyUsd: number; annualUsd: number; detail: string }>
> = {
  chatgpt: {
    standard: { monthlyUsd: 20, annualUsd: 240, detail: "Standard: $20/user/month" },
    ngo: { monthlyUsd: 10, annualUsd: 96, detail: "Nonprofit: $10 monthly or $8/month billed annually" },
  },
  claude: {
    standard: { monthlyUsd: 20, annualUsd: 200, detail: "Standard: $20 monthly or $200 annually" },
    ngo: { monthlyUsd: 7.5, annualUsd: 90, detail: "Nonprofit estimate: $7.50/user/month" },
  },
}

function formatInr(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value)
}

function formatUsd(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value)
}

function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  label,
}: {
  value: T
  onChange: (value: T) => void
  options: ReadonlyArray<{ value: T; label: string }>
  label: string
}) {
  return (
    <div className="grid gap-2">
      <span className="text-sm font-medium">{label}</span>
      <div className="inline-flex w-fit rounded-lg bg-muted p-1" role="group" aria-label={label}>
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={value === option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              value === option.value
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export function CostCalculator() {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("annual")
  const [pricingTier, setPricingTier] = useState<PricingTier>("ngo")
  const [enabledServices, setEnabledServices] = useState({
    vercel: false,
    supabase: true,
    ai: true,
  })
  const [aiProvider, setAiProvider] = useState<AiProvider>("claude")

  const periodLabel = billingCycle === "annual" ? "year" : "month"
  const services = useMemo(() => {
    const fixed = FIXED_SERVICES.map((service) => ({
      ...service,
      enabled: enabledServices[service.id],
      costUsd: billingCycle === "annual" ? service.annualUsd : service.monthlyUsd,
    }))
    const aiPrice = AI_PRICING[aiProvider][pricingTier]

    return [
      ...fixed,
      {
        id: "ai",
        name: aiProvider === "claude" ? "Claude" : "ChatGPT",
        description: aiPrice.detail,
        icon: Sparkles,
        enabled: enabledServices.ai,
        costUsd: billingCycle === "annual" ? aiPrice.annualUsd : aiPrice.monthlyUsd,
      },
    ]
  }, [aiProvider, billingCycle, enabledServices, pricingTier])

  const totalUsd = services.reduce((total, service) => total + (service.enabled ? service.costUsd : 0), 0)
  const monthlyEquivalentUsd = billingCycle === "annual" ? totalUsd / 12 : totalUsd

  function setServiceEnabled(service: "vercel" | "supabase" | "ai", checked: boolean) {
    setEnabledServices((current) => ({ ...current, [service]: checked }))
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="max-w-2xl">
        <Badge variant="secondary">Goalkeep Kickstarter projects</Badge>
        <h1 className="mt-4 font-display text-3xl text-foreground sm:text-4xl">Cost calculator</h1>
        <p className="mt-3 text-base leading-7 text-muted-foreground">
          Build a simple estimate for the technology stack your project needs.
        </p>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Estimate settings</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6 sm:grid-cols-2">
              <SegmentedControl
                label="Payment frequency"
                value={billingCycle}
                onChange={setBillingCycle}
                options={[
                  { value: "monthly", label: "Monthly" },
                  { value: "annual", label: "Annual" },
                ]}
              />
              <SegmentedControl
                label="Pricing"
                value={pricingTier}
                onChange={setPricingTier}
                options={[
                  { value: "standard", label: "Standard" },
                  { value: "ngo", label: "NGO" },
                ]}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Stack components</CardTitle>
            </CardHeader>
            <CardContent className="grid divide-y divide-border">
              {FIXED_SERVICES.map((service) => {
                const Icon = service.icon
                const enabled = enabledServices[service.id]
                const cost = billingCycle === "annual" ? service.annualUsd : service.monthlyUsd
                return (
                  <label key={service.id} className="flex cursor-pointer items-center gap-4 py-5 first:pt-0">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-gk-blue-deep">
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium">{service.name}</span>
                      <span className="block text-sm text-muted-foreground">{service.description}</span>
                    </span>
                    <span className="hidden text-right text-sm text-muted-foreground sm:block">
                      {formatUsd(cost)}/{periodLabel}
                    </span>
                    <Switch
                      checked={enabled}
                      onCheckedChange={(checked) => setServiceEnabled(service.id, checked)}
                      aria-label={`Include ${service.name}`}
                    />
                  </label>
                )
              })}

              <div className="py-5 last:pb-0">
                <div className="flex items-center gap-4">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-gk-blue-deep">
                    <Sparkles className="size-5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium">AI client seat</span>
                    <span className="block text-sm text-muted-foreground">One user for incremental client changes</span>
                  </span>
                  <Switch
                    checked={enabledServices.ai}
                    onCheckedChange={(checked) => setServiceEnabled("ai", checked)}
                    aria-label="Include an AI client seat"
                  />
                </div>
                <div className={cn("mt-4 grid gap-2 sm:grid-cols-2", !enabledServices.ai && "opacity-50")}>
                  {(["claude", "chatgpt"] as const).map((provider) => {
                    const selected = aiProvider === provider
                    const price = AI_PRICING[provider][pricingTier]
                    const providerCost = billingCycle === "annual" ? price.annualUsd : price.monthlyUsd
                    return (
                      <button
                        key={provider}
                        type="button"
                        disabled={!enabledServices.ai}
                        aria-pressed={selected}
                        onClick={() => setAiProvider(provider)}
                        className={cn(
                          "flex items-center justify-between rounded-lg border p-3 text-left transition-colors disabled:cursor-not-allowed",
                          selected ? "border-gk-blue-deep bg-gk-blue-deep/5" : "border-border hover:bg-muted/50"
                        )}
                      >
                        <span className="flex items-center gap-2 font-medium">
                          <span className={cn("flex size-5 items-center justify-center rounded-full border", selected && "border-gk-blue-deep bg-gk-blue-deep text-white")}>
                            {selected && <Check className="size-3" aria-hidden="true" />}
                          </span>
                          {provider === "claude" ? "Claude" : "ChatGPT"}
                        </span>
                        <span className="text-sm text-muted-foreground">{formatUsd(providerCost)}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="lg:sticky lg:top-6">
          <CardHeader className="border-b">
            <CardTitle>Your estimate</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total per {periodLabel}</p>
            <p className="mt-1 font-display text-4xl text-foreground">{formatInr(totalUsd * INR_PER_USD)}</p>
            <p className="mt-1 text-sm text-muted-foreground">{formatUsd(totalUsd)} USD</p>

            {billingCycle === "annual" && (
              <p className="mt-4 rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
                Equivalent to {formatInr(monthlyEquivalentUsd * INR_PER_USD)}/month
              </p>
            )}

            <div className="mt-6 grid gap-3 border-t pt-5 text-sm">
              {services.map((service) => (
                <div key={service.id} className="flex items-start justify-between gap-4">
                  <span className={cn("text-muted-foreground", !service.enabled && "line-through opacity-60")}>
                    {service.name}
                  </span>
                  <span className="shrink-0 font-medium">
                    {service.enabled ? formatInr(service.costUsd * INR_PER_USD) : "Not included"}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <p className="mt-8 max-w-3xl text-sm leading-6 text-muted-foreground">
        Estimates use ₹96 per USD and one seat or organisation for each included service. Vercel and Supabase annual prices are calculated as 12 monthly payments; AI pricing follows the supplied standard and nonprofit assumptions.
      </p>
    </main>
  )
}
