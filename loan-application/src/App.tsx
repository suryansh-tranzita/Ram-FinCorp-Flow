import { useState, useEffect } from "react";
import { Stepper } from "./components/Stepper";
import { AuthStep } from "./components/steps/AuthStep";
import { BasicDetailsStep } from "./components/steps/BasicDetailsStep";
import { OfferStep } from "./components/steps/OfferStep";
import { LoanLanding } from "./components/steps/LoanLanding";
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
  const [currentStep, setCurrentStep] = useState(0);
  const [authData, setAuthData] = useState({ mobile: "", requestId: "" });
  const [offerData, setOfferData] = useState<{
    entityId?: string;
    leadStatus?: string;
  }>({});

  useEffect(() => {
    // Global redirect logic for 'offer' or 'aa' parameters
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('offer') || urlParams.has('aa')) {
      window.location.href = 'https://loans.ramfincorp.com' + window.location.search;
    }
  }, []);

  const handleFlowStep = (response: any) => {
    // Check both possible locations for current_route based on latest API example
    const currentRoute = response.data?.current_route || response.data?.step?.current_route;

    // Store relevant data from response
    setOfferData({
      entityId: response.data?.entityId,
      leadStatus: response.data?.lead?.leadStatus
    });

    // Priority 1: Check if lead is already approved
    if (response.data?.lead?.leadStatus === "Approved Process") {
      setCurrentStep(3);
      return;
    }

    // Priority 2: Follow the current_route from API
    if (currentRoute === "pan verfit" || currentRoute === "basic detail") {
      setCurrentStep(2);
    } else if (currentRoute === "/finbox" || currentRoute === "finbox") {
      setCurrentStep(3);
    } else {
      // Default to Basic Details if unknown
      setCurrentStep(2);
    }
  };

  const handleAuthComplete = (response: any) => {
    handleFlowStep(response);
  };

  const handleBasicDetailsComplete = () => {
    setCurrentStep(3);
  };

  return (
    <div className="h-screen flex flex-col bg-[#F2F7FF] overflow-hidden text-slate-900 relative">
      {/* Decorative Gradient Background */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_0%_0%,_#BEDAFF_0%,_transparent_70%),radial-gradient(circle_at_100%_100%,_#B4D1FF_0%,_transparent_70%),radial-gradient(circle_at_50%_50%,_#E1EFFF_0%,_transparent_100%)] opacity-90" />
      {/* Header */}
      <header className="bg-white/40 backdrop-blur-md border-b border-white/10 flex-shrink-0 relative z-10">
        <div className="container mx-auto px-6 py-4">
          <img
            src="https://framerusercontent.com/images/eoFn6ZAhFTjiRuWZQ7B34zClMM.png?scale-down-to=512"
            alt="Samridhya Logo"
            className="h-8 w-auto object-contain"
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="container mx-auto px-6 flex-1 flex flex-col items-center justify-center">
          {/* Stepper (Only for steps after landing) */}
          {currentStep > 0 && currentStep < 3 && (
            <div className="w-full max-w-4xl mx-auto mb-8 flex-shrink-0">
              <Stepper steps={steps} currentStep={currentStep} />
            </div>
          )}

          {/* Step Content */}
          <div className="w-full h-full flex items-center justify-center animate-in fade-in duration-500">
            {currentStep === 0 && (
              <LoanLanding
                onOtpSent={(mobile, requestId) => {
                  setAuthData({ mobile, requestId });
                  setCurrentStep(1);
                }}
              />
            )}
            {currentStep === 1 && (
              <AuthStep
                onComplete={handleAuthComplete}
                initialMobile={authData.mobile}
                initialRequestId={authData.requestId}
              />
            )}
            {currentStep === 2 && (
              <BasicDetailsStep onComplete={handleBasicDetailsComplete} />
            )}
            {currentStep === 3 && (
              <div className="overflow-auto w-full h-full flex items-start justify-center py-8">
                <OfferStep
                  entityId={offerData.entityId}
                  leadStatus={offerData.leadStatus}
                />
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-white/10 bg-white/40 backdrop-blur-md flex-shrink-0 relative z-10">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <img
            src="https://framerusercontent.com/images/eoFn6ZAhFTjiRuWZQ7B34zClMM.png?scale-down-to=512"
            alt="Samridhya Logo"
            className="h-5 w-auto object-contain opacity-40"
          />
          <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">
            © {new Date().getFullYear()} Samridhya • Secure & Encrypted
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
