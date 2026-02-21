import type {
    ApiResponse,
    LoginResponse,
    VerifyOtpResponse,
    PanVerificationResponse,
    BasicDetailsResponse,
    FinboxResponse,
} from '../types';

const BASE_URL = 'https://loans-api.ramfincorp.com';
const UTM_SOURCE = 'MMMSMR';

class ApiService {
    private jwtToken: string = '';
    private leadID: string = '';
    private customerID: string = '';
    private entityId: string = '';

    async loginByMobile(mobile: string): Promise<ApiResponse<LoginResponse>> {
        const response = await fetch(
            `${BASE_URL}/customers/customer-login-byMobile?utm_source=${UTM_SOURCE}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ mobile }),
            }
        );

        const data = await response.json();
        return data;
    }

    async verifyOtp(
        requestId: string,
        otp: string
    ): Promise<ApiResponse<VerifyOtpResponse>> {
        const response = await fetch(
            `${BASE_URL}/customers/verify-otp?utm_source=${UTM_SOURCE}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    request_id: requestId,
                    otp,
                    whatsapp_consent: true,
                    consent: true,
                    bankfetch_consent: true,
                }),
            }
        );

        const data = await response.json();

        if (data.success && data.data) {
            this.jwtToken = data.data.jwtToken;
            this.leadID = data.data.lead?.leadID || '';
            this.customerID = data.data.customer?.customerID || '';
        }

        return data;
    }

    async nextStep(): Promise<ApiResponse> {
        const response = await fetch(`${BASE_URL}/step/next-step`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${this.jwtToken}`,
            },
            body: JSON.stringify({ leadID: this.leadID }),
        });

        return await response.json();
    }

    async panVerification(
        panNumber: string,
        pinCode: string,
        loanPurpose: string
    ): Promise<ApiResponse<PanVerificationResponse>> {
        const response = await fetch(
            `${BASE_URL}/customer_onboarding/pan-verification`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${this.jwtToken}`,
                },
                body: JSON.stringify({
                    panNumber,
                    pinCode,
                    loanPurpose,
                    leadID: this.leadID,
                }),
            }
        );

        return await response.json();
    }

    async panConfirmation(panNumber: string): Promise<ApiResponse> {
        const response = await fetch(
            `${BASE_URL}/customer_onboarding/pan-confirmation`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${this.jwtToken}`,
                },
                body: JSON.stringify({ panNumber }),
            }
        );

        return await response.json();
    }

    async getBasicDetails(): Promise<ApiResponse> {
        const response = await fetch(
            `${BASE_URL}/customer_onboarding/get-basic-details?customerId=${this.customerID}&leadId=${this.leadID}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${this.jwtToken}`,
                },
            }
        );

        return await response.json();
    }

    async submitBasicDetails(
        monthlyIncome: string,
        employmentType: string,
        salaryMode: string,
        salaryDate: string
    ): Promise<ApiResponse<BasicDetailsResponse>> {
        const response = await fetch(
            `${BASE_URL}/customer_onboarding/basic-details`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${this.jwtToken}`,
                },
                body: JSON.stringify({
                    monthlyIncome,
                    employmentType,
                    salaryMode,
                    salaryDate,
                    finboxCallBackUrl: 'https://loans.ramfincorp.com/finbox-status',
                    monthlyIncomeConsent: true,
                    leadID: this.leadID,
                }),
            }
        );

        const data = await response.json();

        // Store entityId if present in response
        if (data.data?.entityId) {
            this.entityId = data.data.entityId;
        }

        return data;
    }

    async finboxBankConnect(): Promise<ApiResponse<FinboxResponse>> {
        const response = await fetch(
            `${BASE_URL}/customer_onboarding/finbox-bank-connect`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${this.jwtToken}`,
                },
                body: JSON.stringify({
                    entityId: this.entityId,
                    leadID: this.leadID,
                }),
            }
        );

        return await response.json();
    }

    getJwtToken(): string {
        return this.jwtToken;
    }

    getLeadID(): string {
        return this.leadID;
    }
}

export const apiService = new ApiService();
