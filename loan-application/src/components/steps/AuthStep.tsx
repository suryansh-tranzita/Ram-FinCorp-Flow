import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { apiService } from "@/services/api";

interface AuthStepProps {
    onComplete: (response: any) => void;
    initialMobile?: string;
    initialRequestId?: string;
}

export function AuthStep({ onComplete, initialMobile = "", initialRequestId = "" }: AuthStepProps) {
    const [mobile, setMobile] = useState(initialMobile);
    const [otp, setOtp] = useState("");
    const [requestId, setRequestId] = useState(initialRequestId);
    const [showOtpInput, setShowOtpInput] = useState(!!initialRequestId);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await apiService.loginByMobile(mobile);

            if (response.success && response.data?.request_id) {
                setRequestId(response.data.request_id);
                setShowOtpInput(true);
            } else {
                setError(response.message || "Failed to send OTP");
            }
        } catch (err) {
            setError("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await apiService.verifyOtp(requestId, otp);

            if (response.success) {
                // If the user is already pre-approved, skip nextStep and go directly to offers
                if (response.data?.lead?.leadStatus === "Approved Process") {
                    onComplete(response);
                } else {
                    const nextStepResponse = await apiService.nextStep();
                    onComplete(nextStepResponse);
                }
            } else {
                setError(response.message || "Invalid OTP");
            }
        } catch (err) {
            setError("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-[440px] mx-auto w-full pt-10 px-4">
            <Card className="border border-white/20 shadow-none rounded-none overflow-hidden bg-gradient-to-br from-white/80 via-white/50 to-white/30 backdrop-blur-xl">
                <CardHeader className="pt-12 pb-8 px-8 text-center space-y-4">
                    {/* Logo removed as requested */}
                    <div>
                        <h2 className={`text-3xl font-black tracking-tight ${showOtpInput ? "text-[#276EF4]" : "text-slate-900"}`}>
                            {showOtpInput ? "Verify Identity" : "Get Started"}
                        </h2>
                        <p className="text-slate-500 font-medium mt-2">
                            {showOtpInput
                                ? "Enter the 6-digit code sent to your phone"
                                : "Start your paperless loan journey today"}
                        </p>
                    </div>
                </CardHeader>

                <CardContent className="px-8 pb-12">
                    {!showOtpInput ? (
                        <form onSubmit={handleSendOtp} className="space-y-6">
                            <div className="space-y-3">
                                <Label htmlFor="mobile" className="text-xs font-black uppercase tracking-widest text-slate-400 pl-1">
                                    Mobile Number
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="mobile"
                                        type="tel"
                                        placeholder="9876543210"
                                        value={mobile}
                                        onChange={(e) => setMobile(e.target.value)}
                                        maxLength={10}
                                        className="h-14 px-6 text-lg font-medium text-slate-600 bg-slate-50 border-none rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="text-sm font-bold text-rose-500 bg-rose-50 p-4 rounded-none border border-rose-100">
                                    {error}
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full h-14 text-lg font-black bg-slate-900 hover:bg-slate-800 text-white rounded-none transition-all shadow-none"
                                disabled={loading || !/^\d{10}$/.test(mobile)}
                            >
                                {loading ? (
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                ) : "Send OTP"}
                            </Button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyOtp} className="space-y-6">
                            <div className="space-y-3">
                                <Label htmlFor="otp" className="text-xs font-black uppercase tracking-widest text-slate-400 pl-1">
                                    Verification Code
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="otp"
                                        type="text"
                                        placeholder="000000"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        maxLength={6}
                                        className="h-14 px-4 text-lg font-medium text-slate-600 text-center tracking-widest bg-slate-50 border-none rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="text-sm font-bold text-rose-500 bg-rose-50 p-4 rounded-2xl border border-rose-100">
                                    {error}
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full h-10 text-lg font-black bg-[#276EF4] hover:bg-blue-700 text-white transition-all shadow-xl shadow-blue-500/20"
                                disabled={loading || otp.length !== 6}
                            >
                                {loading ? (
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                ) : "Verify & Continue"}
                            </Button>

                            <button
                                type="button"
                                onClick={() => { setShowOtpInput(false); setOtp(""); }}
                                className="w-full text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest"
                            >
                                Edit Phone Number
                            </button>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
