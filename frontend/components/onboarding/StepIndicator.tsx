interface StepIndicatorProps {
  steps: string[];
  currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {steps.map((step, i) => (
        <div key={i} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                i < currentStep
                  ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md shadow-blue-500/25"
                  : i === currentStep
                  ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white ring-4 ring-blue-100 shadow-md shadow-blue-500/25 scale-110"
                  : "bg-gray-100 text-gray-400 border border-gray-200"
              }`}
            >
              {i < currentStep ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                i + 1
              )}
            </div>
            <span
              className={`mt-1.5 text-xs font-medium transition-colors duration-300 ${
                i < currentStep ? "text-blue-600" : i === currentStep ? "text-blue-700 font-semibold" : "text-gray-400"
              }`}
            >
              {step}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className="w-16 h-0.5 mx-1.5 mb-5 rounded-full overflow-hidden bg-gray-200">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500 ease-out"
                style={{ width: i < currentStep ? '100%' : '0%' }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
