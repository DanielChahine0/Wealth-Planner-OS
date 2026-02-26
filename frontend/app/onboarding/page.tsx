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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Build Your Wealth Plan</h1>
          <p className="text-sm text-gray-500 mt-1">Tell us about yourself to generate your personalized simulation</p>
        </div>

        <StepIndicator steps={STEPS} currentStep={step} />

        <Card>
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
          <div className="mt-4 text-center text-sm text-blue-600 animate-pulse">
            {stageMessages[stage]}
          </div>
        )}
        {error && (
          <div className="mt-4 text-center text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
