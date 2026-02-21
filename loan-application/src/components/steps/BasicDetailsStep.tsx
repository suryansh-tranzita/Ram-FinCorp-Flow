import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, FileText, MapPin, Briefcase, DollarSign, CheckCircle2 } from "lucide-react";
import { apiService } from "@/services/api";

interface BasicDetailsStepProps {
    onComplete: (data: { entityId?: string; redirectUrl?: string }) => void;
}

export function BasicDetailsStep({ onComplete }: BasicDetailsStepProps) {
    const [formData, setFormData] = useState({
        panNumber: "",
        pinCode: "",
        loanPurpose: "Other",
        monthlyIncome: "",
        employmentType: "Salaried",
        salaryMode: "Bank Transfer",
        salaryDate: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [lastResponse, setLastResponse] = useState<any>(null);
    const [step, setStep] = useState<"pan" | "details">("pan");

    const handlePanSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            // PAN Verification
            const panResponse = await apiService.panVerification(
                formData.panNumber,
                formData.pinCode,
                formData.loanPurpose
            );
            setLastResponse(panResponse);

            if (!panResponse.success) {
                setError(panResponse.message || "PAN verification failed");
                setLoading(false);
                return;
            }

            // PAN Confirmation
            const confirmResponse = await apiService.panConfirmation(formData.panNumber);
            setLastResponse(confirmResponse);

            if (!confirmResponse.success) {
                setError(confirmResponse.message || "PAN confirmation failed");
                setLoading(false);
                return;
            }

            // Next Step
            const nextStepResponse = await apiService.nextStep();
            setLastResponse(nextStepResponse);

            setStep("details");
        } catch (err) {
            setError("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleDetailsSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            // Submit Basic Details
            const response = await apiService.submitBasicDetails(
                formData.monthlyIncome,
                formData.employmentType,
                formData.salaryMode,
                formData.salaryDate
            );
            setLastResponse(response);

            if (response.success) {
                onComplete({
                    entityId: response.data?.entityId,
                    redirectUrl: response.data?.redirectUrl,
                });
            } else {
                setError(response.message || "Failed to submit details");
            }
        } catch (err) {
            setError("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    return (
        <Card className="w-full max-w-2xl mx-auto shadow-xl border-2">
            <CardHeader className="space-y-3">
                <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                    {step === "pan" ? (
                        <FileText className="w-8 h-8 text-primary" />
                    ) : (
                        <Briefcase className="w-8 h-8 text-primary" />
                    )}
                </div>
                <CardTitle className="text-center text-2xl">
                    {step === "pan" ? "PAN & Location Details" : "Employment Details"}
                </CardTitle>
                <CardDescription className="text-center">
                    {step === "pan"
                        ? "Please provide your PAN and location information"
                        : "Tell us about your employment and income"}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {step === "pan" ? (
                    <form onSubmit={handlePanSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="panNumber" className="flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                PAN Number
                            </Label>
                            <Input
                                id="panNumber"
                                name="panNumber"
                                type="text"
                                placeholder="ABCDE1234F"
                                value={formData.panNumber}
                                onChange={handleChange}
                                maxLength={10}
                                pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}"
                                required
                                className="uppercase"
                            />
                            <p className="text-xs text-muted-foreground">
                                Enter your 10-character PAN number
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="pinCode" className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                PIN Code
                            </Label>
                            <Input
                                id="pinCode"
                                name="pinCode"
                                type="text"
                                placeholder="226010"
                                value={formData.pinCode}
                                onChange={handleChange}
                                maxLength={6}
                                pattern="[0-9]{6}"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="loanPurpose">Loan Purpose</Label>
                            <select
                                id="loanPurpose"
                                name="loanPurpose"
                                value={formData.loanPurpose}
                                onChange={handleChange}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                required
                            >
                                <option value="Other">Other</option>
                                <option value="Personal">Personal</option>
                                <option value="Business">Business</option>
                                <option value="Education">Education</option>
                                <option value="Medical">Medical</option>
                            </select>
                        </div>

                        {error && (
                            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                                {error}
                            </div>
                        )}

                        <Button type="submit" className="w-full" size="lg" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Verifying...
                                </>
                            ) : (
                                "Continue"
                            )}
                        </Button>
                    </form>
                ) : (
                    <form onSubmit={handleDetailsSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="monthlyIncome" className="flex items-center gap-2">
                                    <DollarSign className="w-4 h-4" />
                                    Monthly Income (₹)
                                </Label>
                                <Input
                                    id="monthlyIncome"
                                    name="monthlyIncome"
                                    type="number"
                                    placeholder="22000"
                                    value={formData.monthlyIncome}
                                    onChange={handleChange}
                                    min="1"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="employmentType">Employment Type</Label>
                                <select
                                    id="employmentType"
                                    name="employmentType"
                                    value={formData.employmentType}
                                    onChange={handleChange}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    required
                                >
                                    <option value="Salaried">Salaried</option>
                                    <option value="Self-Employed">Self-Employed</option>
                                    <option value="Business">Business</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="salaryMode">Salary Mode</Label>
                                <select
                                    id="salaryMode"
                                    name="salaryMode"
                                    value={formData.salaryMode}
                                    onChange={handleChange}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    required
                                >
                                    <option value="Bank Transfer">Bank Transfer</option>
                                    <option value="Cash">Cash</option>
                                    <option value="Cheque">Cheque</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="salaryDate">Salary Date</Label>
                                <Input
                                    id="salaryDate"
                                    name="salaryDate"
                                    type="number"
                                    placeholder="31"
                                    value={formData.salaryDate}
                                    onChange={handleChange}
                                    min="1"
                                    max="31"
                                    required
                                />
                                <p className="text-xs text-muted-foreground">
                                    Day of the month (1-31)
                                </p>
                            </div>
                        </div>

                        {error && (
                            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                                {error}
                            </div>
                        )}

                        <div className="flex gap-4">
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full"
                                onClick={() => setStep("pan")}
                            >
                                Back
                            </Button>
                            <Button type="submit" className="w-full" size="lg" disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    "Submit Details"
                                )}
                            </Button>
                        </div>
                    </form>
                )}

                {lastResponse && (
                    <div className="mt-8 pt-6 border-t border-dashed animate-in fade-in zoom-in duration-300">
                        <div className="bg-primary/5 rounded-xl border border-primary/10 overflow-hidden">
                            <div className="bg-primary/10 px-4 py-2 border-b border-primary/10 flex items-center justify-between">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                                    Verification Details
                                </span>
                                <div className="flex items-center gap-1.5">
                                    <div className={`w-2 h-2 rounded-full ${lastResponse.success ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                                    <span className="text-[10px] font-medium text-muted-foreground">
                                        {lastResponse.success ? 'System Active' : 'Action Required'}
                                    </span>
                                </div>
                            </div>

                            <div className="p-4 space-y-4">
                                {lastResponse.data?.full_name && (
                                    <div className="flex items-center justify-between group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                                <CheckCircle2 className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-muted-foreground uppercase font-semibold">Verified Name</p>
                                                <p className="text-sm font-bold text-slate-800">{lastResponse.data.full_name}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {lastResponse.data?.pan_number && (
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                                <FileText className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-muted-foreground uppercase font-semibold">PAN Identity</p>
                                                <p className="text-sm font-bold text-slate-800 uppercase tracking-widest">{lastResponse.data.pan_number}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {lastResponse.data?.entityId && (
                                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex items-center justify-between">
                                        <div>
                                            <p className="text-[10px] text-muted-foreground uppercase font-semibold">Entity Reference</p>
                                            <p className="text-xs font-mono text-slate-600">{lastResponse.data.entityId}</p>
                                        </div>
                                        <div className="w-6 h-6 rounded bg-slate-200 flex items-center justify-center">
                                            <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                        </div>
                                    </div>
                                )}

                                {!lastResponse.data?.full_name && !lastResponse.data?.entityId && (
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${lastResponse.success ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                            {lastResponse.success ? <CheckCircle2 className="w-4 h-4" /> : <Loader2 className="w-4 h-4" />}
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-muted-foreground uppercase font-semibold">Status</p>
                                            <p className="text-sm font-medium">{lastResponse.message || (lastResponse.success ? 'Step completed successfully' : 'Something went wrong')}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
