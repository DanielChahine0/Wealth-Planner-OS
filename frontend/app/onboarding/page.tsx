"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { StepIndicator } from "@/components/onboarding/StepIndicator";
import { ProfileForm } from "@/components/onboarding/ProfileForm";
import { GoalsForm } from "@/components/onboarding/GoalsForm";
import { AssetAllocationForm } from "@/components/onboarding/AssetAllocationForm";
import { LifeEventsForm } from "@/components/onboarding/LifeEventsForm";
import { Card } from "@/components/shared/Card";
import { useSimulation } from "@/hooks/useSimulation";
import type { UserProfile, FinancialGoal, LifeEvent } from "@/lib/types";

const STEPS = ["Profile", "Goals", "Allocation", "Life Events"];

const DEFAULT_ALLOCATION = {
  us_equity: 0.6,
  intl_equity: 0.2,
  bonds: 0.15,
  real_estate: 0.05,
  cash: 0.0,
};

export default function OnboardingPage() {
  const router = useRouter();
  const { run, stage, error } = useSimulation();
  const [step, setStep] = useState(0);
  const [profileData, setProfileData] = useState<Partial<UserProfile>>({});
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [allocation, setAllocation] = useState(DEFAULT_ALLOCATION);

  const handleProfileNext = (data: Partial<UserProfile>) => {
    setProfileData(data);
    setStep(1);
  };

  const handleGoalsNext = (g: FinancialGoal[]) => {
    setGoals(g);
    setStep(2);
  };

  const handleAllocationNext = (alloc: typeof DEFAULT_ALLOCATION) => {
    setAllocation(alloc);
    setStep(3);
  };

  const handleSubmit = async (events: LifeEvent[]) => {
    const profile: UserProfile = {
      current_age: profileData.current_age ?? 35,
      retirement_age: profileData.retirement_age ?? 65,
      annual_income: profileData.annual_income ?? 120000,
      income_growth_rate: profileData.income_growth_rate ?? 0.03,
      annual_expenses: profileData.annual_expenses ?? 80000,
      current_portfolio_value: profileData.current_portfolio_value ?? 200000,
      annual_contribution: profileData.annual_contribution ?? 20000,
      asset_allocation: allocation,
      risk_tolerance: profileData.risk_tolerance ?? "moderate",
      goals,
      life_events: events,
      tax_info: profileData.tax_info ?? {
        filing_status: "single",
        state: "CA",
        pre_tax_contribution_rate: 0.15,
      },
    };

    await run(profile);
    router.push("/dashboard");
  };

  const isLoading = stage === "simulating" || stage === "analyzing" || stage === "recommending";

  const stageMessages: Record<string, string> = {
    simulating: "Running 10,000 Monte Carlo simulations...",
    analyzing: "Analyzing risk and fragility...",
    recommending: "Generating AI recommendations...",
  };

  return (
    <div className="min-h-screen bg-obsidian flex items-center justify-center p-4 sm:p-6">
      {/* Subtle geometric grid */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(200,162,84,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(200,162,84,0.025) 1px, transparent 1px)`,
          backgroundSize: "80px 80px",
        }}
      />

      <div className="relative z-10 w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="text-gold text-xs">◆</span>
            <span className="font-serif text-parchment text-lg tracking-widest">
              WEALTHPLANNER<span className="text-gold">OS</span>
            </span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-parchment mb-2">
            Build Your Wealth Plan
          </h1>
          <p className="text-sm text-mist max-w-sm mx-auto">
            Tell us about yourself to generate your personalized simulation
          </p>
        </div>

        <StepIndicator steps={STEPS} currentStep={step} />

        <Card className="shadow-2xl shadow-black/40">
          {step === 0 && (
            <ProfileForm defaultValues={profileData} onNext={handleProfileNext} />
          )}
          {step === 1 && (
            <GoalsForm
              defaultGoals={goals}
              onNext={handleGoalsNext}
              onBack={() => setStep(0)}
            />
          )}
          {step === 2 && (
            <AssetAllocationForm
              defaultValues={allocation}
              onNext={handleAllocationNext}
              onBack={() => setStep(1)}
            />
          )}
          {step === 3 && (
            <LifeEventsForm
              onSubmit={handleSubmit}
              onBack={() => setStep(2)}
              isLoading={isLoading}
            />
          )}
        </Card>

        {isLoading && (
          <div className="mt-5 text-center">
            <div className="inline-flex items-center gap-3 bg-surface border border-gold/20 px-5 py-3">
              <svg className="animate-spin h-4 w-4 text-gold" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span className="text-sm font-medium text-gold tracking-wide">
                {stageMessages[stage]}
              </span>
            </div>
          </div>
        )}
        {error && (
          <div className="mt-5 flex items-start gap-3 text-sm text-crimson bg-crimson-bg border border-crimson/20 p-4">
            <svg className="w-5 h-5 text-crimson flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
}
