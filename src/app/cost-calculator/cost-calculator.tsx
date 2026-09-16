"use client"

import { useMemo, useState } from "react"
import { Check, ExternalLink, Landmark, Server, Sparkles } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

type BillingCycle = "monthly" | "annual"
type PricingTier = "standard" | "ngo"
type AiProvider = "chatgpt" | "claude"
type ServicePlan = "free" | "pro"

const FIXED_SERVICES = [
  {
    id: "vercel",
    name: "Vercel",
    description: "One deploying seat",
    prices: {
      free: { monthlyUsd: 0, annualUsd: 0 },
      pro: { monthlyUsd: 20, annualUsd: 240 },
    },
    icon: Server,
  },
  {
    id: "supabase",
    name: "Supabase",
    description: "One organisation",
    prices: {
      free: { monthlyUsd: 0, annualUsd: 0 },
      pro: { monthlyUsd: 25, annualUsd: 300 },
    },
    icon: Landmark,
  },
] as const

const AI_PRICING: Record<
  AiProvider,
  Record<PricingTier, { monthlyUsd: number; annualUsd: number; detail: string }>
> = {
  chatgpt: {
    standard: { monthlyUsd: 50, annualUsd: 480, detail: "2 Business Standard seats (required minimum)" },
    ngo: { monthlyUsd: 20, annualUsd: 192, detail: "2 nonprofit Business Standard seats (required minimum)" },
  },
  claude: {
    standard: { monthlyUsd: 20, annualUsd: 200, detail: "Standard: $20 monthly or $200 annually" },
    ngo: { monthlyUsd: 15, annualUsd: 180, detail: "2 nonprofit Team seats at $7.50/user/month (required minimum)" },
  },
}

const NONPROFIT_RESOURCES = {
  claude: "https://claude.com/solutions/nonprofits#pricing",
  chatgpt: "https://help.openai.com/en/articles/9359041-openai-for-nonprofits#what-is-openai-for-nonprofits",
} as const

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
  const [servicePlans, setServicePlans] = useState<Record<"vercel" | "supabase", ServicePlan>>({
    vercel: "free",
    supabase: "pro",
  })
  const [enabledServices, setEnabledServices] = useState({
    ai: true,
  })
  const [aiProvider, setAiProvider] = useState<AiProvider>("claude")
  const [exchangeRate, setExchangeRate] = useState(96)

  const periodLabel = billingCycle === "annual" ? "year" : "month"
  const services = useMemo(() => {
    const fixed = FIXED_SERVICES.map((service) => ({
      ...service,
      plan: servicePlans[service.id],
      enabled: true,
      costUsd:
        billingCycle === "annual"
          ? service.prices[servicePlans[service.id]].annualUsd
          : service.prices[servicePlans[service.id]].monthlyUsd,
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
  }, [aiProvider, billingCycle, enabledServices, pricingTier, servicePlans])

  const totalUsd = services.reduce((total, service) => total + (service.enabled ? service.costUsd : 0), 0)
  const monthlyEquivalentUsd = billingCycle === "annual" ? totalUsd / 12 : totalUsd

  function setServiceEnabled(service: "ai", checked: boolean) {
    setEnabledServices((current) => ({ ...current, [service]: checked }))
  }

  function setServicePlan(service: "vercel" | "supabase", plan: ServicePlan) {
    setServicePlans((current) => ({ ...current, [service]: plan }))
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
                const plan = servicePlans[service.id]
                const cost = billingCycle === "annual" ? service.prices[plan].annualUsd : service.prices[plan].monthlyUsd
                return (
                  <div key={service.id} className="flex flex-col gap-4 py-5 first:pt-0 sm:flex-row sm:items-center">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-gk-blue-deep">
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium">{service.name}</span>
                      <span className="block text-sm text-muted-foreground">{service.description}</span>
                    </span>
                    <div className="flex items-center justify-between gap-4 sm:ml-auto">
                      <span className="text-right text-sm text-muted-foreground">{formatUsd(cost)}/{periodLabel}</span>
                      <SegmentedControl
                        label={`${service.name} plan`}
                        value={plan}
                        onChange={(nextPlan) => setServicePlan(service.id, nextPlan)}
                        options={[
                          { value: "free", label: "Free" },
                          { value: "pro", label: "Pro" },
                        ]}
                      />
                    </div>
                  </div>
                )
              })}

              <div className="py-5 last:pb-0">
                <div className="flex items-center gap-4">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-gk-blue-deep">
                    <Sparkles className="size-5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium">AI client seat</span>
                    <span className="block text-sm text-muted-foreground">AI access for incremental client changes</span>
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
                {enabledServices.ai && pricingTier === "ngo" && (
                  <div className="mt-4 rounded-lg border border-gk-blue-deep/20 bg-gk-blue-deep/5 p-3 text-sm leading-6 text-muted-foreground">
                    {aiProvider === "claude" ? (
                      <>
                        Claude nonprofit pricing is available through a Team account, so this estimate includes the required two seats. {" "}
                        <a
                          href={NONPROFIT_RESOURCES.claude}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 font-medium text-gk-blue-deep underline underline-offset-2"
                        >
                          Check Claude eligibility and pricing <ExternalLink className="size-3" aria-hidden="true" />
                        </a>
                      </>
                    ) : (
                      <>
                        ChatGPT Business Standard requires two paid seats, so this estimate includes both. {" "}
                        <a
                          href={NONPROFIT_RESOURCES.chatgpt}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 font-medium text-gk-blue-deep underline underline-offset-2"
                        >
                          Check OpenAI nonprofit eligibility <ExternalLink className="size-3" aria-hidden="true" />
                        </a>
                      </>
                    )}
                  </div>
                )}
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
            <p className="mt-1 font-display text-4xl text-foreground">{formatInr(totalUsd * exchangeRate)}</p>
            <p className="mt-1 text-sm text-muted-foreground">{formatUsd(totalUsd)} USD</p>

            {billingCycle === "annual" && (
              <p className="mt-4 rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
                Equivalent to {formatInr(monthlyEquivalentUsd * exchangeRate)}/month
              </p>
            )}

            <div className="mt-6 grid gap-3 border-t pt-5 text-sm">
              {services.map((service) => (
                <div key={service.id} className="flex items-start justify-between gap-4">
                  <span className={cn("text-muted-foreground", !service.enabled && "line-through opacity-60")}>
                    {"plan" in service ? `${service.name} ${service.plan === "pro" ? "Pro" : "Free"}` : service.name}
                  </span>
                  <span className="shrink-0 font-medium">
                    {service.enabled ? formatInr(service.costUsd * exchangeRate) : "Not included"}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 flex max-w-3xl flex-col gap-4 border-t pt-6 sm:flex-row sm:items-end sm:justify-between">
        <p className="max-w-xl text-sm leading-6 text-muted-foreground">
          Vercel and Supabase annual prices are calculated as 12 monthly payments. Check eligibility and plan details before making a purchasing decision.
        </p>
        <label className="grid w-full max-w-48 gap-1.5 text-sm font-medium">
          1 USD equals (₹)
          <Input
            type="number"
            min="0.01"
            step="0.01"
            value={exchangeRate}
            onChange={(event) => setExchangeRate(Math.max(0, Number(event.target.value)))}
            aria-label="Indian rupees per United States dollar"
          />
        </label>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
        <span className="text-muted-foreground">Nonprofit pricing resources:</span>
        <a
          href={NONPROFIT_RESOURCES.claude}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 font-medium text-gk-blue-deep underline underline-offset-2"
        >
          Claude for Nonprofits <ExternalLink className="size-3" aria-hidden="true" />
        </a>
        <a
          href={NONPROFIT_RESOURCES.chatgpt}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 font-medium text-gk-blue-deep underline underline-offset-2"
        >
          OpenAI for Nonprofits <ExternalLink className="size-3" aria-hidden="true" />
        </a>
      </div>
    </main>
  )
}
