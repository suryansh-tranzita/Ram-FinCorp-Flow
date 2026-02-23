import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Phone, Lock } from "lucide-react";
import { apiService } from "@/services/api";

interface AuthStepProps {
    onComplete: (leadStatus?: string) => void;
}

export function AuthStep({ onComplete }: AuthStepProps) {
    const [mobile, setMobile] = useState("");
    const [otp, setOtp] = useState("");
    const [requestId, setRequestId] = useState("");
    const [showOtpInput, setShowOtpInput] = useState(false);
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
                onComplete(response.data?.lead?.leadStatus);
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
        <Card className="w-full max-w-md mx-auto shadow-xl border-2">
            <CardHeader className="space-y-3">
                <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                    {showOtpInput ? (
                        <Lock className="w-8 h-8 text-primary" />
                    ) : (
                        <Phone className="w-8 h-8 text-primary" />
                    )}
                </div>
                <CardTitle className="text-center text-2xl">
                    {showOtpInput ? "Verify OTP" : "Welcome Back"}
                </CardTitle>
                <CardDescription className="text-center">
                    {showOtpInput
                        ? `Enter the OTP sent to ${mobile}`
                        : "Enter your mobile number to get started"}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {!showOtpInput ? (
                    <form onSubmit={handleSendOtp} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="mobile">Mobile Number</Label>
                            <Input
                                id="mobile"
                                type="tel"
                                placeholder="Enter 10-digit mobile number"
                                value={mobile}
                                onChange={(e) => setMobile(e.target.value)}
                                maxLength={10}
                                pattern="[0-9]{10}"
                                required
                                className="text-lg"
                            />
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
                                    Sending OTP...
                                </>
                            ) : (
                                "Send OTP"
                            )}
                        </Button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOtp} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="otp">One Time Password</Label>
                            <Input
                                id="otp"
                                type="text"
                                placeholder="Enter 6-digit OTP"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                maxLength={6}
                                pattern="[0-9]{6}"
                                required
                                className="text-lg text-center tracking-widest"
                            />
                        </div>

                        {error && (
                            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Button type="submit" className="w-full" size="lg" disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Verifying...
                                    </>
                                ) : (
                                    "Verify OTP"
                                )}
                            </Button>

                            <Button
                                type="button"
                                variant="ghost"
                                className="w-full"
                                onClick={() => {
                                    setShowOtpInput(false);
                                    setOtp("");
                                    setError("");
                                }}
                            >
                                Change Mobile Number
                            </Button>
                        </div>
                    </form>
                )}

            </CardContent>
        </Card>
    );
}
