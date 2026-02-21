import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Building2, ExternalLink, CheckCircle2 } from "lucide-react";
import { apiService } from "@/services/api";

interface OfferStepProps {
    entityId?: string;
    redirectUrl?: string;
}

export function OfferStep({ entityId, redirectUrl }: OfferStepProps) {
    const [loading, setLoading] = useState(true);
    const [finboxUrl, setFinboxUrl] = useState("");
    const [error, setError] = useState("");
    const [lastResponse, setLastResponse] = useState<any>(null);


    useEffect(() => {
        // Check URL parameters for offer or aa
        const urlParams = new URLSearchParams(window.location.search);
        const hasOffer = urlParams.has('offer');
        const hasAA = urlParams.has('aa');

        if (hasOffer || hasAA) {
            // Redirect to RamFinCorp URL with preserved parameters
            window.location.href = 'https://loans.ramfincorp.com' + window.location.search;
            return;
        }

        // If we have entityId, call finbox-bank-connect
        if (entityId) {
            callFinboxBankConnect();
        } else {
            setLoading(false);

        }
    }, [entityId]);

    const callFinboxBankConnect = async () => {
        try {
            const response = await apiService.finboxBankConnect();
            setLastResponse(response);

            if (response.success && response.data?.url) {
                setFinboxUrl(response.data.url);

            } else if (response.data?.redirectUrl) {
                setFinboxUrl(response.data.redirectUrl);

            } else {
                setError(response.message || "Failed to get bank connect URL");

            }
        } catch (err) {
            setError("An error occurred. Please try again.");

        } finally {
            setLoading(false);
        }
    };

    const handleAccountAggregator = () => {
        const leadID = apiService.getLeadID();
        const utmSource = 'MMMSMR';

        if (finboxUrl) {
            window.location.href = finboxUrl;
        } else {
            // Fallback to RamFinCorp with leadID, leadId and AA parameter
            window.location.href = `https://loans.ramfincorp.com?leadID=${leadID}&leadId=${leadID}&utm_source=${utmSource}&aa=true`;
        }
    };

    const handleViewOffers = () => {
        const leadID = apiService.getLeadID();
        const utmSource = 'MMMSMR';

        if (redirectUrl) {
            // Ensure redirectUrl has leadID/leadId if it's a RamFinCorp URL
            try {
                const url = new URL(redirectUrl);
                if (url.hostname.includes('ramfincorp.com')) {
                    url.searchParams.set('leadID', leadID);
                    url.searchParams.set('leadId', leadID);
                    url.searchParams.set('utm_source', utmSource);
                    window.location.href = url.toString();
                } else {
                    window.location.href = redirectUrl;
                }
            } catch (e) {
                window.location.href = redirectUrl;
            }
        } else {
            // Fallback to RamFinCorp with leadID, leadId and offer parameter
            window.location.href = `https://loans.ramfincorp.com?leadID=${leadID}&leadId=${leadID}&utm_source=${utmSource}&offer=true`;
        }
    };

    if (loading) {
        return (
            <Card className="w-full max-w-md mx-auto shadow-xl border-2">
                <CardContent className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                    <p className="text-lg font-medium">Processing your application...</p>
                    <p className="text-sm text-muted-foreground mt-2">Please wait</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full max-w-2xl mx-auto shadow-xl border-2">
            <CardHeader className="space-y-3">
                <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-center text-2xl">
                    Application Submitted Successfully!
                </CardTitle>
                <CardDescription className="text-center">
                    Choose how you'd like to proceed
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {error && (
                    <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Account Aggregator Option */}
                    <div className="border-2 border-primary/20 rounded-lg p-6 hover:border-primary/40 transition-all hover:shadow-lg group">
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Building2 className="w-8 h-8 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-2">Account Aggregator</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Connect your bank account securely to get instant loan approval
                                </p>
                            </div>
                            <Button
                                onClick={handleAccountAggregator}
                                className="w-full group-hover:shadow-lg transition-shadow"
                                size="lg"
                            >
                                Connect Bank
                                <ExternalLink className="ml-2 w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    {/* View Offers Option */}
                    <div className="border-2 border-primary/20 rounded-lg p-6 hover:border-primary/40 transition-all hover:shadow-lg group">
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                <CheckCircle2 className="w-8 h-8 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-2">View Offers</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Check available loan offers based on your profile
                                </p>
                            </div>
                            <Button
                                onClick={handleViewOffers}
                                variant="outline"
                                className="w-full group-hover:shadow-lg transition-shadow"
                                size="lg"
                            >
                                View Offers
                                <ExternalLink className="ml-2 w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="bg-muted/50 rounded-lg p-4 mt-6">
                    <p className="text-sm text-center text-muted-foreground">
                        <strong>Note:</strong> Connecting your bank account helps us verify your income
                        and provide faster loan approval.
                    </p>
                </div>

                {lastResponse && (
                    <div className="mt-8 pt-6 border-t border-dashed animate-in fade-in zoom-in duration-300">
                        <div className="bg-primary/5 rounded-xl border border-primary/10 overflow-hidden">
                            <div className="bg-primary/10 px-4 py-2 border-b border-primary/10 flex items-center justify-between">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                                    Connection Details
                                </span>
                                <div className="flex items-center gap-1.5">
                                    <div className={`w-2 h-2 rounded-full ${lastResponse.success ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                                    <span className="text-[10px] font-medium text-muted-foreground">
                                        {lastResponse.success ? 'Secure' : 'Connection Error'}
                                    </span>
                                </div>
                            </div>

                            <div className="p-4 space-y-4">
                                {lastResponse.data?.url ? (
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                                <ExternalLink className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-muted-foreground uppercase font-semibold">Bank Connect URL</p>
                                                <p className="text-xs font-medium text-blue-600 truncate max-w-[300px]">{lastResponse.data.url}</p>
                                            </div>
                                        </div>
                                        <div className="bg-green-50 p-3 rounded-lg border border-green-100 flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                                            <p className="text-[11px] text-green-700 font-medium">Link ready for secure bank verification</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${lastResponse.success ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'}`}>
                                            {lastResponse.success ? <CheckCircle2 className="w-4 h-4" /> : <Loader2 className="w-4 h-4" />}
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-muted-foreground uppercase font-semibold">System Message</p>
                                            <p className="text-sm font-medium">{lastResponse.message || (lastResponse.success ? 'Ready for next step' : 'Unable to retrieve link')}</p>
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
