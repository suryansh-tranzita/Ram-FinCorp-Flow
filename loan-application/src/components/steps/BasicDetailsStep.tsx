import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { apiService } from "@/services/api";

interface BasicDetailsStepProps {
    onComplete: () => void;
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
    const [step, setStep] = useState<"pan" | "details">("pan");

    const handlePanSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const panResponse = await apiService.panVerification(
                formData.panNumber,
                formData.pinCode,
                formData.loanPurpose
            );

            if (!panResponse.success) {
                setError(panResponse.message || "PAN verification failed");
                setLoading(false);
                return;
            }

            const confirmResponse = await apiService.panConfirmation(formData.panNumber);

            if (!confirmResponse.success) {
                setError(confirmResponse.message || "PAN confirmation failed");
                setLoading(false);
                return;
            }

            const nextStepResponse = await apiService.nextStep();
            const currentRoute = nextStepResponse.data?.current_route || nextStepResponse.data?.step?.current_route;

            if (currentRoute === "basic detail") {
                setStep("details");
            } else if (currentRoute === "/finbox" || currentRoute === "finbox") {
                onComplete();
            } else {
                setStep("details");
            }
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
            const response = await apiService.submitBasicDetails(
                formData.monthlyIncome,
                formData.employmentType,
                formData.salaryMode,
                formData.salaryDate
            );

            if (response.success) {
                await apiService.nextStep();
                onComplete();
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
        <div className="max-w-2xl mx-auto w-full pt-10 pb-20 px-4">
            <Card className="border border-white/20 shadow-none rounded-none overflow-hidden bg-gradient-to-br from-white/80 via-white/50 to-white/30 backdrop-blur-xl">
                <CardHeader className="pt-12 pb-6 px-10 text-center">
                    {/* Logo removed as requested */}
                    <CardTitle className={`text-3xl font-black tracking-tight ${step === "pan" ? "text-[#276EF4]" : "text-slate-900"}`}>
                        {step === "pan" ? "Verify PAN" : "Profile Details"}
                    </CardTitle>
                    <p className="text-slate-500 font-medium mt-2">
                        {step === "pan"
                            ? "Complete your verification to view custom loan offers"
                            : "Help us understand your requirements better"}
                    </p>
                </CardHeader>

                <CardContent className="px-10 pb-12">
                    {step === "pan" ? (
                        <form onSubmit={handlePanSubmit} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <Label htmlFor="panNumber" className="text-xs font-black uppercase tracking-widest text-slate-400 pl-1">
                                        PAN Number
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="panNumber"
                                            name="panNumber"
                                            type="text"
                                            placeholder="ABCDE1234F"
                                            value={formData.panNumber}
                                            onChange={handleChange}
                                            maxLength={10}
                                            className="h-14 px-6 text-lg font-medium text-slate-600 bg-slate-50 border-none rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 transition-all uppercase"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Label htmlFor="pinCode" className="text-xs font-black uppercase tracking-widest text-slate-400 pl-1">
                                        PIN Code
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="pinCode"
                                            name="pinCode"
                                            type="text"
                                            placeholder="226010"
                                            value={formData.pinCode}
                                            onChange={handleChange}
                                            maxLength={6}
                                            className="h-14 px-6 text-lg font-medium text-slate-600 bg-slate-50 border-none rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 transition-all"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="loanPurpose" className="text-xs font-black uppercase tracking-widest text-slate-400 pl-1">
                                    Loan Purpose
                                </Label>
                                <select
                                    id="loanPurpose"
                                    name="loanPurpose"
                                    value={formData.loanPurpose}
                                    onChange={handleChange}
                                    className="flex h-14 w-full rounded-none border-none bg-slate-50 px-6 py-2 text-lg font-medium text-slate-600 outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                                    required
                                >
                                    <option value="Other">Other Purpose</option>
                                    <option value="Personal">Personal Use</option>
                                    <option value="Business">Business Growth</option>
                                    <option value="Education">Education</option>
                                    <option value="Medical">Medical Bills</option>
                                </select>
                            </div>

                            {error && (
                                <div className="text-sm font-bold text-rose-500 bg-rose-50 p-4 rounded-none border border-rose-100">
                                    {error}
                                </div>
                            )}

                            <Button type="submit" className="w-full h-14 text-lg font-black bg-slate-900 hover:bg-slate-800 text-white rounded-none transition-all shadow-none" disabled={loading}>
                                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Verify & Continue"}
                            </Button>
                        </form>
                    ) : (
                        <form onSubmit={handleDetailsSubmit} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <Label htmlFor="monthlyIncome" className="text-xs font-black uppercase tracking-widest text-slate-400 pl-1">
                                        Monthly Income
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="monthlyIncome"
                                            name="monthlyIncome"
                                            type="number"
                                            placeholder="45000"
                                            value={formData.monthlyIncome}
                                            onChange={handleChange}
                                            className="h-14 px-6 text-lg font-medium text-slate-600 bg-slate-50 border-none rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 transition-all"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Label htmlFor="employmentType" className="text-xs font-black uppercase tracking-widest text-slate-400 pl-1">
                                        Employment
                                    </Label>
                                    <div className="relative">
                                        <select
                                            id="employmentType"
                                            name="employmentType"
                                            value={formData.employmentType}
                                            onChange={handleChange}
                                            className="flex h-14 w-full rounded-none border-none outline-none appearance-none bg-slate-50 px-6 py-2 text-lg font-medium text-slate-600 focus:ring-0 focus-visible:ring-0"
                                            required
                                        >
                                            <option value="Salaried">Salaried</option>
                                            <option value="Self-Employed">Self-Employed</option>
                                            <option value="Business">Business Growth</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Label htmlFor="salaryMode" className="text-xs font-black uppercase tracking-widest text-slate-400 pl-1">
                                        Salary Mode
                                    </Label>
                                    <select
                                        id="salaryMode"
                                        name="salaryMode"
                                        value={formData.salaryMode}
                                        onChange={handleChange}
                                        className="h-14 w-full rounded-none border-none bg-slate-50 px-6 py-2 text-lg font-medium text-slate-600 focus:ring-0 focus-visible:ring-0 outline-none"
                                        required
                                    >
                                        <option value="Bank Transfer">Bank Transfer</option>
                                        <option value="Cash">Cash Payment</option>
                                        <option value="Cheque">Cheque</option>
                                    </select>
                                </div>

                                <div className="space-y-3">
                                    <Label htmlFor="salaryDate" className="text-xs font-black uppercase tracking-widest text-slate-400 pl-1">
                                        Salary Day
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="salaryDate"
                                            name="salaryDate"
                                            type="number"
                                            placeholder="05"
                                            value={formData.salaryDate}
                                            onChange={handleChange}
                                            min="1"
                                            max="31"
                                            className="h-14 px-6 text-lg font-medium text-slate-600 bg-slate-50 border-none rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 transition-all font-mono"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <div className="text-sm font-bold text-rose-500 bg-rose-50 p-4 rounded-none border border-rose-100">
                                    {error}
                                </div>
                            )}

                            <div className="flex flex-col sm:flex-row gap-4">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="w-full h-14 text-sm font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors"
                                    onClick={() => setStep("pan")}
                                >
                                    Back
                                </Button>
                                <Button type="submit" className="w-full h-14 text-lg font-black bg-primary hover:bg-blue-700 text-white rounded-none transition-all shadow-none" disabled={loading}>
                                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Complete Profile"}
                                </Button>
                            </div>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
