import axios from 'axios';

// 1. Definisikan Interface sesuai dengan Migration Laravel
export interface ProductOrderItem {
  id?: number;
  product_id: number;
  qty: number;
  price: number;
  subtotal: number;
  product?: {
    id: number;
    name: string;
    price: number;
    image_url?: string;
    photo?: string;
  };
}

export interface ProductOrder {
  id?: number;
  order_number: string;
  status: 'received' | 'processing' | 'completed' | 'cancelled';
  customer_name: string;
  whatsapp_number: string;
  subtotal: number;
  discount_amount: number;
  total_amount: number;
  notes?: string;
  items: ProductOrderItem[]; // Ini relasi hasMany di Laravel
  created_at?: string;
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

export const productOrderApi = {
  getAll: async (): Promise<ProductOrder[]> => {
    const response = await api.get('/product-orders');
    return response.data.data;
  },

  getById: async (id: string | number): Promise<ProductOrder> => {
    const response = await api.get(`/product-orders/${id}`);
    return response.data.data;
  },

  create: async (orderData: Partial<ProductOrder>): Promise<ProductOrder> => {
    const response = await api.post('/product-orders', orderData);
    return response.data.data;
  },

  update: async (id: string | number, orderData: Partial<ProductOrder>): Promise<ProductOrder> => {
    const response = await api.post(`/product-orders/${id}`, orderData);
    return response.data.data;
  },

  updateStatus: async (id: number, status: string): Promise<ProductOrder> => {
    const response = await api.post(`/product-orders/${id}`, { status });
    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/product-orders/${id}`);
  },
};
