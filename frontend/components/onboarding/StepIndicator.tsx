interface StepIndicatorProps {
  steps: string[];
  currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-0 mb-6">
      {steps.map((step, i) => (
        <div key={i} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 flex items-center justify-center text-xs font-mono transition-all duration-300 border ${
                i < currentStep
                  ? "border-gold bg-gold text-obsidian"
                  : i === currentStep
                  ? "border-gold text-gold scale-110"
                  : "border-rim text-dust"
              }`}
            >
              {i < currentStep ? (
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                String(i + 1).padStart(2, "0")
              )}
            </div>
            <span
              className={`mt-1.5 text-xs tracking-wide transition-colors duration-300 ${
                i < currentStep
                  ? "text-gold"
                  : i === currentStep
                  ? "text-parchment font-medium"
                  : "text-dust"
              }`}
            >
              {step}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className="w-14 h-px mx-1.5 mb-5 bg-rim overflow-hidden">
              <div
                className="h-full bg-gold transition-all duration-500 ease-out"
                style={{ width: i < currentStep ? "100%" : "0%" }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
