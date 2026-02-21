import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface Step {
    id: number;
    title: string;
    description: string;
}

interface StepperProps {
    steps: Step[];
    currentStep: number;
}

export function Stepper({ steps, currentStep }: StepperProps) {
    return (
        <div className="w-full py-8">
            <div className="flex items-center justify-between relative">
                {/* Progress Line */}
                <div className="absolute top-5 left-0 right-0 h-0.5 bg-border -z-10">
                    <div
                        className="h-full bg-primary transition-all duration-500 ease-in-out"
                        style={{
                            width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
                        }}
                    />
                </div>

                {/* Steps */}
                {steps.map((step, index) => {
                    const stepNumber = index + 1;
                    const isCompleted = currentStep > stepNumber;
                    const isCurrent = currentStep === stepNumber;

                    return (
                        <div
                            key={step.id}
                            className="flex flex-col items-center relative flex-1"
                        >
                            {/* Circle */}
                            <div
                                className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 bg-background",
                                    isCompleted && "bg-primary border-primary",
                                    isCurrent && "border-primary shadow-lg shadow-primary/20",
                                    !isCompleted && !isCurrent && "border-border"
                                )}
                            >
                                {isCompleted ? (
                                    <Check className="w-5 h-5 text-primary-foreground" />
                                ) : (
                                    <span
                                        className={cn(
                                            "text-sm font-semibold",
                                            isCurrent && "text-primary",
                                            !isCurrent && "text-muted-foreground"
                                        )}
                                    >
                                        {stepNumber}
                                    </span>
                                )}
                            </div>

                            {/* Label */}
                            <div className="mt-3 text-center max-w-[120px]">
                                <p
                                    className={cn(
                                        "text-sm font-medium transition-colors",
                                        isCurrent && "text-primary",
                                        isCompleted && "text-foreground",
                                        !isCompleted && !isCurrent && "text-muted-foreground"
                                    )}
                                >
                                    {step.title}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1 hidden sm:block">
                                    {step.description}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
