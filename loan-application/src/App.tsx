import { useState, useEffect } from "react";
import { Stepper } from "./components/Stepper";
import { AuthStep } from "./components/steps/AuthStep";
import { BasicDetailsStep } from "./components/steps/BasicDetailsStep";
import { OfferStep } from "./components/steps/OfferStep";
import "./index.css";

const steps = [
  {
    id: 1,
    title: "Authentication",
    description: "Verify your identity",
  },
  {
    id: 2,
    title: "Basic Details",
    description: "Your information",
  },
  {
    id: 3,
    title: "Offers",
    description: "Choose your option",
  },
];

function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [offerData, setOfferData] = useState<{
    entityId?: string;
    redirectUrl?: string;
  }>({});

  useEffect(() => {
    // Global redirect logic for 'offer' or 'aa' parameters
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('offer') || urlParams.has('aa')) {
      window.location.href = 'https://loans.ramfincorp.com' + window.location.search;
    }
  }, []);

  const handleAuthComplete = () => {
    setCurrentStep(2);
  };

  const handleBasicDetailsComplete = (data: {
    entityId?: string;
    redirectUrl?: string;
  }) => {
    setOfferData(data);
    setCurrentStep(3);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50 dark:from-slate-950 dark:via-purple-950 dark:to-blue-950">
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-border sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">R</span>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                  Ram FinCorp
                </h1>
                <p className="text-xs text-muted-foreground">Loan Application</p>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              Step {currentStep} of {steps.length}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stepper */}
        <div className="max-w-4xl mx-auto mb-8">
          <Stepper steps={steps} currentStep={currentStep} />
        </div>

        {/* Step Content */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {currentStep === 1 && <AuthStep onComplete={handleAuthComplete} />}
          {currentStep === 2 && (
            <BasicDetailsStep onComplete={handleBasicDetailsComplete} />
          )}
          {currentStep === 3 && (
            <OfferStep
              entityId={offerData.entityId}
              redirectUrl={offerData.redirectUrl}
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 py-8 border-t border-border bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              © 2026 Ram FinCorp. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground">
              Secure and encrypted loan application process
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
