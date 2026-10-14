
const API_BASE = '/api';

export interface ApiProduct {
  id: number;
  sku: string;
  name: string;
  category: string;
  brand?: string;
  price: number;
  stock: number;
  description?: string;
  attributes?: unknown;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || data.error || `Request failed: ${response.status}`,
    );
  }

  return data as T;
}

export const productsApi = {
  getAll: () => request<ApiProduct[]>('/products'),

  getById: (id: string | number) =>
    request<ApiProduct>(`/products/${id}`),

  create: (product: Record<string, unknown>) =>
    request<ApiProduct>('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    }),

  update: (id: string | number, updates: Record<string, unknown>) =>
    request<ApiProduct>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),

  delete: (id: string | number) =>
    request<{ message: string }>(`/products/${id}`, {
      method: 'DELETE',
    }),
};
