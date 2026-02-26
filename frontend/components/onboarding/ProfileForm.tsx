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

  const inputClasses = "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400";
  const labelClasses = "block text-sm font-medium text-gray-700 mb-1.5";
  const errorClasses = "text-red-500 text-xs mt-1.5 flex items-center gap-1";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Section: Personal */}
      <div>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Personal Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="current_age" className={labelClasses}>Current Age</label>
            <input id="current_age" type="number" {...register("current_age")}
              className={inputClasses} placeholder="35" />
            {errors.current_age && <p className={errorClasses}>{errors.current_age.message}</p>}
          </div>
          <div>
            <label htmlFor="retirement_age" className={labelClasses}>Retirement Age</label>
            <input id="retirement_age" type="number" {...register("retirement_age")}
              className={inputClasses} placeholder="65" />
            {errors.retirement_age && <p className={errorClasses}>{errors.retirement_age.message}</p>}
          </div>
        </div>
      </div>

      {/* Section: Income & Expenses */}
      <div>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Income &amp; Expenses</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="annual_income" className={labelClasses}>Annual Income</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
              <input id="annual_income" type="number" {...register("annual_income")}
                className={`${inputClasses} pl-7`} placeholder="120,000" />
            </div>
            {errors.annual_income && <p className={errorClasses}>{errors.annual_income.message}</p>}
          </div>
          <div>
            <label htmlFor="income_growth_rate" className={labelClasses}>Income Growth Rate</label>
            <div className="relative">
              <input id="income_growth_rate" type="number" step="0.01" {...register("income_growth_rate")}
                className={`${inputClasses} pr-12`} placeholder="0.03" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-medium">%/yr</span>
            </div>
          </div>
          <div>
            <label htmlFor="annual_expenses" className={labelClasses}>Annual Expenses</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
              <input id="annual_expenses" type="number" {...register("annual_expenses")}
                className={`${inputClasses} pl-7`} placeholder="80,000" />
            </div>
          </div>
          <div>
            <label htmlFor="current_portfolio_value" className={labelClasses}>Current Portfolio</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
              <input id="current_portfolio_value" type="number" {...register("current_portfolio_value")}
                className={`${inputClasses} pl-7`} placeholder="200,000" />
            </div>
          </div>
        </div>
      </div>

      {/* Section: Investment */}
      <div>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Investment Preferences</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="annual_contribution" className={labelClasses}>Annual Contribution</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
              <input id="annual_contribution" type="number" {...register("annual_contribution")}
                className={`${inputClasses} pl-7`} placeholder="20,000" />
            </div>
          </div>
          <div>
            <label htmlFor="risk_tolerance" className={labelClasses}>Risk Tolerance</label>
            <select id="risk_tolerance" {...register("risk_tolerance")}
              className={inputClasses}>
              <option value="conservative">Conservative</option>
              <option value="moderate">Moderate</option>
              <option value="aggressive">Aggressive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Section: Tax */}
      <div>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Tax Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="filing_status" className={labelClasses}>Filing Status</label>
            <select id="filing_status" {...register("filing_status")}
              className={inputClasses}>
              <option value="single">Single</option>
              <option value="married_filing_jointly">Married Filing Jointly</option>
              <option value="head_of_household">Head of Household</option>
            </select>
          </div>
          <div>
            <label htmlFor="state" className={labelClasses}>State</label>
            <input id="state" type="text" maxLength={2} {...register("state")}
              className={`${inputClasses} uppercase`} placeholder="CA" />
          </div>
        </div>
      </div>

      <Button type="submit" size="lg" className="w-full mt-2">
        Continue to Goals
      </Button>
    </form>
  );
}
