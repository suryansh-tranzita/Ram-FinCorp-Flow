import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle2, Banknote, Landmark } from "lucide-react";
import { apiService } from "@/services/api";
import type { LoanOffer } from "@/types";

interface OfferStepProps {
    entityId?: string;
    redirectUrl?: string;
    leadStatus?: string;
}

export function OfferStep({ entityId, redirectUrl, leadStatus }: OfferStepProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [offers, setOffers] = useState<LoanOffer[]>([]);
    const [fetchingOffers, setFetchingOffers] = useState(false);


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

        // We jump straight to showing offers
        setLoading(false);
        fetchOffers();
    }, [entityId]);

    const fetchOffers = async () => {
        setFetchingOffers(true);
        setError("");
        try {
            const response = await apiService.getLoanOffers();
            console.log("Full API Response:", response);

            // Extract data array from various possible structures
            let offersData: LoanOffer[] = [];
            let status = "";
            let message = "";

            if (response && typeof response === 'object') {
                status = String(response.status || "");
                message = response.message || "";

                if (Array.isArray(response.data)) {
                    offersData = response.data;
                } else if (Array.isArray(response)) {
                    offersData = response;
                }
            }

            if (offersData.length > 0) {
                setOffers(offersData);
            } else {
                if (status === "1" || message === "Success") {
                    setError("No pre-approved offers found. Please try refreshing or contact support.");
                } else {
                    setError(message || "Currently no offers are available for your profile.");
                }
                setOffers([]);
            }
        } catch (err) {
            console.error("Critical error in fetchOffers:", err);
            setError("Unable to load offers. Please check your internet connection and try again.");
        } finally {
            setFetchingOffers(false);
        }
    };

    // Simplified flow: fetching offers directly now

    // Offers are now rendered directly in the list below
    const handleViewOffers = () => {
        const leadID = apiService.getLeadID();
        const utmSource = 'MMMSMR';

        if (redirectUrl) {
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
                <CardTitle className="text-center text-2xl font-black">
                    {leadStatus === "Approved Process"
                        ? "Congratulations! You're Approved"
                        : "Application Processed"}
                </CardTitle>
                <CardDescription className="text-center text-lg font-medium">
                    {leadStatus === "Approved Process"
                        ? "We've found the following pre-approved loan offers for you."
                        : "Based on your profile, here are the available loan options."}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {error && (
                    <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                        {error}
                    </div>
                )}

                {/* Directly show offers, removing the choice grid */}

                {/* Loan Offers Section */}
                <div className="space-y-4 pt-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <Banknote className="w-5 h-5 text-primary" />
                            Tailored Loan Offers for You
                        </h3>
                        {fetchingOffers && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
                    </div>

                    {offers.length > 0 ? (
                        <div className="grid grid-cols-1 gap-6">
                            {offers.map((offer) => (
                                <div
                                    key={offer.ProductID}
                                    className="relative bg-white border-2 border-primary/5 rounded-2xl p-6 hover:border-primary/20 transition-all hover:shadow-xl cursor-pointer group overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 px-4 py-1.5 bg-green-500 rounded-bl-2xl text-[10px] font-black text-white uppercase tracking-widest shadow-sm">
                                        Approved
                                    </div>

                                    <div className="flex gap-5">
                                        <div className="w-20 h-20 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 overflow-hidden p-2 group-hover:scale-105 transition-transform">
                                            {offer.Image ? (
                                                <img src={offer.Image} alt={offer.Titel} className="w-full h-full object-contain" />
                                            ) : (
                                                <Landmark className="w-8 h-8 text-primary/40" />
                                            )}
                                        </div>

                                        <div className="flex-1 space-y-1">
                                            <h4 className="font-extrabold text-xl text-slate-900 group-hover:text-primary transition-colors">
                                                {offer.Titel}
                                            </h4>
                                            <p className="text-sm text-slate-500 leading-relaxed max-w-[90%]">
                                                {offer.SubTitle}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-6 pt-6 border-t border-slate-50 flex flex-col md:flex-row md:items-end justify-between gap-6">
                                        <div className="flex gap-8">
                                            <div>
                                                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">
                                                    {offer.AmountDetails.Message}
                                                </p>
                                                <p className="text-3xl font-black text-slate-900">
                                                    ₹{offer.AmountDetails.Amount.toLocaleString()}
                                                </p>
                                            </div>
                                            <div className="border-l border-slate-100 pl-8">
                                                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">
                                                    {offer.TenureDetails.Message}
                                                </p>
                                                <p className="text-xl font-bold text-slate-700">
                                                    {offer.TenureDetails.Tenure} Months
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-center md:items-end gap-2">
                                            <div className="text-right hidden md:block">
                                                <p className="text-[10px] text-green-600 font-bold uppercase tracking-tighter">Interest Rate</p>
                                                <p className="text-sm font-bold text-slate-600">{offer.AmountDetails.ROI}% p.a.</p>
                                            </div>
                                            <Button
                                                size="lg"
                                                className="w-full md:w-auto rounded-xl px-10 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 font-bold text-base h-12"
                                                onClick={() => handleViewOffers()}
                                            >
                                                Select Plan
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="mt-5 flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                        <span className="text-[11px] font-bold text-slate-600">
                                            Available for instant disbursement to your bank
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : !fetchingOffers ? (
                        <div className="bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                                <Loader2 className="w-8 h-8 text-primary/20" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-1">No Offers Found</h3>
                            <p className="text-sm text-slate-500 max-w-[250px] mx-auto mb-6">
                                We couldn't find any pre-approved offers right now.
                            </p>
                            <Button
                                variant="outline"
                                className="rounded-full px-8 border-primary/20 hover:bg-primary/5"
                                onClick={fetchOffers}
                            >
                                <Loader2 className={`mr-2 h-4 w-4 ${fetchingOffers ? 'animate-spin' : ''}`} />
                                Try Refreshing
                            </Button>
                        </div>
                    ) : null}
                </div>

                <div className="bg-muted/30 rounded-lg p-4 mt-6">
                    <p className="text-sm text-center text-muted-foreground italic">
                        Select a plan that best fits your requirements to proceed with your application.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
