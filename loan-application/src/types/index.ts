export interface AuthFormData {
    mobile: string;
    otp: string;
}

export interface BasicDetailsFormData {
    panNumber: string;
    pinCode: string;
    loanPurpose: string;
    monthlyIncome: string;
    employmentType: string;
    salaryMode: string;
    salaryDate: string;
}

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
}

export interface LoginResponse {
    request_id: string;
}

export interface VerifyOtpResponse {
    jwtToken: string;
    accessToken: string;
    customer: {
        mobile: string;
        customerID: string;
        name: string;
    };
    lead: {
        customer_type: string;
        leadID: string;
        leadStatus: string;
        leadType: string;
        productId: string;
    };
}

export interface PanVerificationResponse {
    client_id: string;
    pan_number: string;
    full_name: string;
    masked_aadhaar: string;
}

export interface BasicDetailsResponse {
    entityId?: string;
    redirectUrl?: string;
}

export interface FinboxResponse {
    url?: string;
    redirectUrl?: string;
}
