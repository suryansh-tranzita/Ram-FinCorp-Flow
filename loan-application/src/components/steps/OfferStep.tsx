import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { apiService } from "@/services/api";
import type { LoanOffer } from "@/types";

interface OfferStepProps {
    entityId?: string;
    leadStatus?: string;
}

export function OfferStep({ entityId, leadStatus }: OfferStepProps) {
    const [loading, setLoading] = useState(false);
    const [offers, setOffers] = useState<LoanOffer[]>([]);
    const [fetchingOffers, setFetchingOffers] = useState(false);
    const [isUpgradable, setIsUpgradable] = useState(false);
    const [selectingOffer, setSelectingOffer] = useState<number | null>(null);
    const [connectingFinbox, setConnectingFinbox] = useState(false);


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
        try {
            const response = await apiService.getLoanOffers();
            console.log("Full API Response:", response);

            // Extract data array from various possible structures
            let offersData: LoanOffer[] = [];
            let status = "";
            let message = "";
            let upgradable = false;

            if (response && typeof response === 'object') {
                status = String(response.status || "");
                message = response.message || "";
                upgradable = !!response.isLoanAmountUpgradable;

                if (Array.isArray(response.data)) {
                    offersData = response.data;
                } else if (Array.isArray(response)) {
                    offersData = response;
                }
            }

            setIsUpgradable(upgradable);

            if (offersData.length > 0) {
                setOffers(offersData);
            } else {
                // If it's a known "no record" case, don't show a red error box
                // Just clear offers and let the empty state UI handle it
                if (status === "0" || message === "No approval record found") {
                    console.log("No approval record found");
                } else if (status === "1" || message === "Success") {
                    console.log("Success with empty data");
                } else {
                    console.warn(message || "Currently no offers are available.");
                }
                setOffers([]);
            }
        } catch (err) {
            console.error("Critical error in fetchOffers:", err);
        } finally {
            setFetchingOffers(false);
        }
    };

    const handleOfferSelect = async (offer: LoanOffer) => {
        setSelectingOffer(offer.ProductID);
        try {
            const response = await apiService.getApprovalDetails(
                offer.ProductID.toString(),
                offer.AmountDetails.Amount,
                offer.TenureDetails.Tenure
            );

            if (response.success && response.data?.redirectUrl) {
                window.location.href = response.data.redirectUrl;
            } else if (response.message) {
                console.warn("Offer selection warning:", response.message);
            } else {
                console.error("Unable to proceed with this offer.");
            }
        } catch (err) {
            console.error("Error selecting offer:", err);
        } finally {
            setSelectingOffer(null);
        }
    };

    const handleFinboxConnect = async () => {
        setConnectingFinbox(true);
        try {
            const response = await apiService.finboxBankConnect();
            if (response.success && (response.data?.url || response.data?.redirectUrl)) {
                window.location.href = (response.data.url || response.data.redirectUrl) as string;
            } else {
                console.error(response.message || "Unable to initiate verification.");
            }
        } catch (err) {
            console.error("Error connecting to Finbox:", err);
        } finally {
            setConnectingFinbox(false);
        }
    };


    if (loading) {
        return (
            <Card className="w-full max-w-md mx-auto shadow-xl border-2">
                <CardContent className="flex flex-col items-center justify-center py-12">
                    <div className="relative mb-6">
                        <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping scale-150" />
                        <img
                            src="https://framerusercontent.com/images/eoFn6ZAhFTjiRuWZQ7B34zClMM.png?scale-down-to=512"
                            alt="Samridhya Logo"
                            className="h-12 w-auto object-contain relative z-10 animate-pulse"
                        />
                    </div>
                    <p className="text-lg font-medium">Processing your application...</p>
                    <p className="text-sm text-muted-foreground mt-2">Please wait</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full max-w-4xl mx-auto shadow-none border-white/20 rounded-none bg-gradient-to-br from-white/80 via-white/50 to-white/30 backdrop-blur-xl">
            <CardHeader className="space-y-3">

                <div className="flex justify-center mb-4">
                    <img
                        src="https://framerusercontent.com/images/eoFn6ZAhFTjiRuWZQ7B34zClMM.png?scale-down-to=512"
                        alt="Samridhya Logo"
                        className="h-8 w-auto object-contain"
                    />
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
                {/* Error messages are now handled via console or subtle empty states */}

                {/* Loan Offers Section */}
                <div className="space-y-4 pt-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            Loan Offers for You
                        </h3>
                        {fetchingOffers && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
                    </div>

                    {offers.length > 0 ? (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                                {offers.map((offer) => (
                                    <div
                                        key={offer.ProductID}
                                        onClick={() => !selectingOffer && handleOfferSelect(offer)}
                                        className={`relative bg-white border rounded-xl p-6 overflow-hidden ${selectingOffer === offer.ProductID
                                            ? "border-primary ring-1 ring-primary/10"
                                            : "border-slate-100 cursor-pointer"
                                            } ${selectingOffer && selectingOffer !== offer.ProductID ? "opacity-50 grayscale select-none" : ""}`}
                                    >
                                        {selectingOffer === offer.ProductID && (
                                            <div className="absolute top-0 right-0 px-4 py-1.5 bg-primary/10 rounded-bl-xl text-[10px] font-bold text-primary flex items-center gap-1">
                                                <Loader2 className="w-3 h-3 animate-spin" />
                                                Processing
                                            </div>
                                        )}

                                        <div className="flex items-center gap-5">
                                            <div className="w-16 h-16 rounded-xl bg-slate-50 border border-slate-50 flex items-center justify-center shrink-0 overflow-hidden p-2">
                                                {offer.Image ? (
                                                    <img src={offer.Image} alt={offer.Titel} className="w-full h-full object-contain" />
                                                ) : (
                                                    <div className="bg-primary/10 w-full h-full rounded-lg" />
                                                )}
                                            </div>

                                            <div className="flex-1">
                                                <h4 className="font-bold text-lg text-slate-900">
                                                    {offer.Titel}
                                                </h4>
                                                <p className="text-sm text-slate-500">
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
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {isUpgradable && (
                                <div className="flex justify-center pt-4">
                                    <Button
                                        variant="outline"
                                        className="rounded-full px-8 py-6 border-2 border-primary text-primary font-bold hover:bg-primary hover:text-white transition-all shadow-md"
                                        onClick={handleFinboxConnect}
                                        disabled={connectingFinbox}
                                    >
                                        {connectingFinbox ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Connecting...
                                            </>
                                        ) : "Get Loan Amount Upgrade"}
                                    </Button>
                                </div>
                            )}
                        </div>
                    ) : !fetchingOffers ? (
                        <div className="bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                                <Loader2 className="w-8 h-8 text-primary/20" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-1">No Offers Found</h3>
                            <p className="text-sm text-slate-500 max-w-[250px] mx-auto mb-6">
                                We couldn't find any pre-approved offers right now.
                                Verify your details to get an offer.
                            </p>
                            <Button
                                className="rounded-full px-10 py-6 bg-primary font-bold text-lg shadow-lg hover:scale-105 transition-transform"
                                onClick={handleFinboxConnect}
                                disabled={connectingFinbox}
                            >
                                {connectingFinbox ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Please wait...
                                    </>
                                ) : "Verify to Get Offer"}
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
