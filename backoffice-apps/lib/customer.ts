import axios from 'axios';

// 1. Base URL & Interface
const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/v1/app`;

export interface Customer {
    id: string;
    name: string;
    phone?: string;
    email?: string;
    address?: string;
    company_id?: string;
}

// 2. Axios Instance Setup
const api = axios.create({
    baseURL: API_URL,
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
    },
});

// Interceptor Token
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

// Helper Company ID
const getSafeCompanyId = () => {
    if (typeof window === 'undefined') return '1';
    try {
        const profileStr = localStorage.getItem('user_profile');
        if (profileStr) {
            const profile = JSON.parse(profileStr);
            return profile.company_id || '1';
        }
        return '1';
    } catch {
        return '1';
    }
};

// 3. Export Customer API Object (Pusat Kendali Data)
export const customerApi = {
    /** Ambil SEMUA Customer */
    getAll: async (): Promise<Customer[]> => {
        try {
            const response = await api.get(`/customers`);
            return response.data?.data || [];
        } catch (error: any) {
            console.error('Gagal ambil list customer:', error.response?.data || error.message);
            return [];
        }
    },

    /** Ambil SATU Customer */
    getById: async (id: string): Promise<Customer | null> => {
        try {
            const response = await api.get(`/customers/${id}`);
            return response.data?.data || null;
        } catch (error: any) {
            console.error(`Gagal ambil customer ID ${id}:`, error.response?.data || error.message);
            return null;
        }
    },

    /** Tambah Customer Baru */
    create: async (data: any): Promise<boolean> => {
        try {
            const payload = { company_id: getSafeCompanyId(), ...data };
            const response = await api.post('/customers', payload);
            return response.status === 200 || response.status === 201;
        } catch (error: any) {
            console.error('Gagal create customer:', error.response?.data?.errors || error.message);
            return false;
        }
    },

    /** Update Customer */
    update: async (id: string, data: any): Promise<boolean> => {
        try {
            const payload = { company_id: getSafeCompanyId(), ...data };
            const response = await api.post(`/customers/${id}`, payload);
            return response.status === 200 || response.status === 201 || response.status === 204;
        } catch (error: any) {
            console.error('Gagal update customer:', error.response?.data?.errors || error.message);
            return false;
        }
    },

    /** Hapus Customer */
    delete: async (id: string): Promise<boolean> => {
        try {
            const response = await api.delete(`/customers/${id}`);
            return response.status === 200 || response.status === 204;
        } catch (error: any) {
            console.error('Gagal hapus customer:', error.response?.data || error.message);
            return false;
        }
    },
};

// Untuk menjaga kompatibilitas jika ada kode lama yang pakai fungsi mandiri
export const getCustomers = customerApi.getAll;
export const getCustomerById = customerApi.getById;
export const createCustomer = customerApi.create;
export const updateCustomer = customerApi.update;
export const deleteCustomer = customerApi.delete;
