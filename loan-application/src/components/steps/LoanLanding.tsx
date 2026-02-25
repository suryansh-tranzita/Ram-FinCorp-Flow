import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    ArrowRight,
    CheckCircle2,
    Loader2
} from "lucide-react";
import { apiService } from "@/services/api";

interface LoanLandingProps {
    onOtpSent: (mobile: string, requestId: string) => void;
}

export function LoanLanding({ onOtpSent }: LoanLandingProps) {
    const [mobile, setMobile] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!/^\d{10}$/.test(mobile)) {
            setError("Please enter a valid 10-digit mobile number");
            return;
        }

        setLoading(true);

        try {
            const response = await apiService.loginByMobile(mobile);

            if (response.success && response.data?.request_id) {
                onOtpSent(mobile, response.data.request_id);
            } else {
                setError(response.message || "Failed to send OTP");
            }
        } catch (err) {
            setError("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full h-full flex items-center justify-center">
            <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-16 items-center w-full max-w-6xl px-4 lg:px-8">
                {/* Left Side: Loan Details */}
                <div className="space-y-8 lg:pr-8 animate-in slide-in-from-left duration-700">
                    <div className="space-y-4">
                        <img
                            src="/logo.png"
                            alt="Ram Fincorp Logo"
                            className="h-8 w-auto mb-6 object-contain"
                        />
                        <h1 className="text-2xl lg:text-5xl font-black text-[#276EF4] tracking-tight whitespace-nowrap">
                            Personal Loan
                        </h1>
                        <p className="text-base lg:text-lg text-slate-500 font-medium leading-relaxed max-w-xl">
                            Personal loans can be availed for a variety of purposes in our lives.
                            Be it for education, medical needs, or spending quality time with family.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-x-8 gap-y-6 pt-2">
                        {[
                            { label: "Loan amount", value: "Upto ₹10,00,000" },
                            { label: "Tenure", value: "96 Months" },
                            { label: "Loan interest", value: "Starting 9.99% p.a." },
                            { label: "Process", value: "100% Paperless" }
                        ].map((item, i) => (
                            <div key={i} className="space-y-1">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.label}</p>
                                <p className="text-base font-bold text-slate-900">{item.value}</p>
                            </div>
                        ))}
                    </div>

                    <div className="pt-4 flex flex-wrap gap-6">
                        <div className="flex items-center gap-2.5 text-xs text-slate-600 font-semibold">
                            <CheckCircle2 className="w-4 h-4 text-[#276EF4]" />
                            <span>Min income ₹25,000/month</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-xs text-slate-600 font-semibold">
                            <CheckCircle2 className="w-4 h-4 text-[#276EF4]" />
                            <span>PAN & Aadhaar Required</span>
                        </div>
                    </div>
                </div>

                {/* Right Side: Apply Form */}
                <div className="hidden lg:block lg:pl-12 lg:border-l lg:border-white/10 animate-in slide-in-from-right duration-700">
                    <div className="w-full max-w-[380px] bg-white/40 backdrop-blur-md p-6 rounded-3xl border border-white/20">
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold text-blue-500">Apply Now</h2>
                        </div>

                        <form onSubmit={handleSendOtp} className="space-y-6">
                            <div className="space-y-2.5">
                                <Label htmlFor="mobile" className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1 pb-2">
                                    Mobile Number
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="mobile"
                                        type="tel"
                                        placeholder="Enter Mobile Number"
                                        value={mobile}
                                        onChange={(e) => setMobile(e.target.value)}
                                        maxLength={10}
                                        className="h-14 px-6 text-lg bg-slate-50 border-none rounded-xl focus-visible:ring-0 focus-visible:ring-offset-0 transition-all font-medium text-slate-600"
                                        required
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="text-[10px] font-bold text-rose-500 bg-rose-50 p-4 rounded-xl border border-rose-100">
                                    {error}
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full h-14 text-base font-bold bg-[#276EF4] hover:bg-[#1a5adb] text-white rounded-xl shadow-xl shadow-[#276EF4]/10 transition-all group"
                                disabled={loading}
                            >
                                {loading ? (
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                ) : (
                                    <div className="flex items-center justify-center gap-2">
                                        View Offer
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                )}
                            </Button>

                            <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest opacity-60">
                                Secure • Digital • Private
                            </p>
                        </form>
                    </div>
                </div>

                {/* Mobile version of the form (visible only on small screens) */}
                <div className="lg:hidden mt-8 w-full animate-in fade-in duration-700">
                    <div className="bg-white/40 backdrop-blur-md p-6 rounded-[24px] border border-white/20">
                        <h2 className="text-xl font-bold text-slate-900 mb-4">Apply Now</h2>
                        <form onSubmit={handleSendOtp} className="space-y-4">
                            <div className="relative">
                                <Input
                                    type="tel"
                                    placeholder="Enter Mobile Number"
                                    value={mobile}
                                    onChange={(e) => setMobile(e.target.value)}
                                    maxLength={10}
                                    className="h-12 px-6 bg-white border-none rounded-lg focus-visible:ring-0 focus-visible:ring-offset-0"
                                    required
                                />
                            </div>
                            <Button
                                type="submit"
                                className="w-full h-12 bg-[#276EF4] text-white font-bold rounded-lg"
                                disabled={loading}
                            >
                                {loading ? <Loader2 className="animate-spin" /> : "View Offer"}
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
