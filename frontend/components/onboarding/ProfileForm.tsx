"use client";
import { useForm, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/shared/Button";
import type { UserProfile } from "@/lib/types";

const schema = z.object({
  current_age: z.coerce.number().min(18).max(80),
  retirement_age: z.coerce.number().min(40).max(100),
  annual_income: z.coerce.number().positive(),
  income_growth_rate: z.coerce.number().min(0).max(0.5),
  annual_expenses: z.coerce.number().positive(),
  current_portfolio_value: z.coerce.number().min(0),
  annual_contribution: z.coerce.number().min(0),
  risk_tolerance: z.enum(["conservative", "moderate", "aggressive"]),
  filing_status: z.enum(["single", "married_filing_jointly", "head_of_household"]),
  state: z.string().min(2).max(2),
}).refine(d => d.retirement_age > d.current_age, {
  message: "Retirement age must be greater than current age",
  path: ["retirement_age"],
});

type FormData = z.infer<typeof schema>;

interface ProfileFormProps {
  defaultValues?: Partial<UserProfile>;
  onNext: (data: Partial<UserProfile>) => void;
}

export function ProfileForm({ defaultValues, onNext }: ProfileFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema) as Resolver<FormData>,
    defaultValues: {
      current_age: defaultValues?.current_age ?? 35,
      retirement_age: defaultValues?.retirement_age ?? 65,
      annual_income: defaultValues?.annual_income ?? 120000,
      income_growth_rate: defaultValues?.income_growth_rate ?? 0.03,
      annual_expenses: defaultValues?.annual_expenses ?? 80000,
      current_portfolio_value: defaultValues?.current_portfolio_value ?? 200000,
      annual_contribution: defaultValues?.annual_contribution ?? 20000,
      risk_tolerance: defaultValues?.risk_tolerance ?? "moderate",
      filing_status: defaultValues?.tax_info?.filing_status ?? "single",
      state: defaultValues?.tax_info?.state ?? "CA",
    },
  });

  const onSubmit = (data: FormData) => {
    onNext({
      current_age: data.current_age,
      retirement_age: data.retirement_age,
      annual_income: data.annual_income,
      income_growth_rate: data.income_growth_rate,
      annual_expenses: data.annual_expenses,
      current_portfolio_value: data.current_portfolio_value,
      annual_contribution: data.annual_contribution,
      risk_tolerance: data.risk_tolerance,
      tax_info: {
        filing_status: data.filing_status,
        state: data.state,
        pre_tax_contribution_rate: 0.15,
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="current_age" className="block text-sm font-medium text-gray-700 mb-1">Current Age</label>
          <input id="current_age" type="number" {...register("current_age")}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          {errors.current_age && <p className="text-red-500 text-xs mt-1">{errors.current_age.message}</p>}
        </div>
        <div>
          <label htmlFor="retirement_age" className="block text-sm font-medium text-gray-700 mb-1">Retirement Age</label>
          <input id="retirement_age" type="number" {...register("retirement_age")}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          {errors.retirement_age && <p className="text-red-500 text-xs mt-1">{errors.retirement_age.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="annual_income" className="block text-sm font-medium text-gray-700 mb-1">Annual Income ($)</label>
          <input id="annual_income" type="number" {...register("annual_income")}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          {errors.annual_income && <p className="text-red-500 text-xs mt-1">{errors.annual_income.message}</p>}
        </div>
        <div>
          <label htmlFor="income_growth_rate" className="block text-sm font-medium text-gray-700 mb-1">Income Growth Rate</label>
          <input id="income_growth_rate" type="number" step="0.01" {...register("income_growth_rate")}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="annual_expenses" className="block text-sm font-medium text-gray-700 mb-1">Annual Expenses ($)</label>
          <input id="annual_expenses" type="number" {...register("annual_expenses")}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label htmlFor="current_portfolio_value" className="block text-sm font-medium text-gray-700 mb-1">Current Portfolio ($)</label>
          <input id="current_portfolio_value" type="number" {...register("current_portfolio_value")}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="annual_contribution" className="block text-sm font-medium text-gray-700 mb-1">Annual Contribution ($)</label>
          <input id="annual_contribution" type="number" {...register("annual_contribution")}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label htmlFor="risk_tolerance" className="block text-sm font-medium text-gray-700 mb-1">Risk Tolerance</label>
          <select id="risk_tolerance" {...register("risk_tolerance")}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="conservative">Conservative</option>
            <option value="moderate">Moderate</option>
            <option value="aggressive">Aggressive</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="filing_status" className="block text-sm font-medium text-gray-700 mb-1">Filing Status</label>
          <select id="filing_status" {...register("filing_status")}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="single">Single</option>
            <option value="married_filing_jointly">Married Filing Jointly</option>
            <option value="head_of_household">Head of Household</option>
          </select>
        </div>
        <div>
          <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">State (2-letter)</label>
          <input id="state" type="text" maxLength={2} {...register("state")}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase" />
        </div>
      </div>

      <Button type="submit" size="lg" className="w-full mt-2">
        Continue to Goals
      </Button>
    </form>
  );
}
