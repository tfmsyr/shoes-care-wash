import axios from 'axios';

export interface DashboardListItem {
    id: number;
    customer_name: string;
    items_summary: string;
    status: string;
}

export interface DashboardData {
    user: {
        id: number;
        name: string;
        email: string;
    };
    stats: {
        revenue: number;
        active_orders: number;
        new_orders: number;
        low_stock: number;
    };
    revenue_total: number;
    period_total: number;
    breakdown: {
        services: number;
        products: number;
    };
    recent_services: DashboardListItem[];
    recent_products: DashboardListItem[];
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

export const dashboardService = {
    getDashboardData: async (period: 'today' | 'week' | 'month' = 'today'): Promise<DashboardData> => {
        const response = await api.get(`/dashboard`, {
            params: { period },
        });

        return response.data;
    },
};
