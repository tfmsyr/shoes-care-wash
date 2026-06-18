import axios from 'axios';

export interface ReportRow {
    id: number;
    order_id: string;
    customer: string;
    summary: string;
    total: number;
    status: string;
    type: 'service' | 'product';
}

export type ReportPeriod = 'day' | 'week' | 'month' | 'year';

export interface ReportData {
    overview: {
        summary: {
            total_service_order: number;
            total_product_sale: number;
            total_income: number;
            total_expenses: number;
        };
        income_expense_chart: { name: string; income: number; expense: number }[];
        expense_breakdown: { name: string; value: number; amount: number; color: string }[];
        customer_insight: {
            new_customer: number;
            returning: number;
            avg_order: number;
        };
        top_preferences: {
            service: { name: string; count: number };
            product: { name: string; count: number };
        };
    };
    services: {
        summary: {
            total_service_order: number;
            total_product_sale: number;
            total_income: number;
        };
        performance_data: { name: string; value: number; isHigh?: boolean }[];
        status_data: { name: string; value: number; color: string }[];
        order_trend: { type: string; count: string }[];
    };
    products: {
        summary: {
            total_sales: number;
            net_sales: number;
            product_sales: number;
        };
        performance_data: { name: string; value: number; highlight?: boolean }[];
        best_selling: { name: string; sales: number }[];
        low_performing: { name: string; sales: number }[];
    };
    exports: {
        overview: ReportRow[];
        services: ReportRow[];
        products: ReportRow[];
    };
}

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/v1/app`;

const api = axios.create({
    baseURL: API_URL,
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config: any) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const manualToken = process.env.NEXT_PUBLIC_AUTH_TOKEN;

    if (config.headers) {
        config.headers.Authorization = `Bearer ${
            token && token !== 'undefined' && token !== 'null' ? token : manualToken
        }`;
    }

    return config;
});

export const reportApi = {
    getReport: async (year?: number, period?: ReportPeriod): Promise<ReportData> => {
        const response = await api.get('/report', {
            params: {
                ...(year ? { year } : {}),
                ...(period ? { period } : {}),
            },
        });

        return response.data;
    },
};
