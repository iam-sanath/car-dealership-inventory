import type { Page, User, Vehicle, VehicleFilters, VehicleInput } from "./types";

const TOKEN_KEY = "showroom.token";

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

/** One place that talks to the backend: adds the JWT and turns errors into ApiError. */
async function request<T>(path: string, options: { method?: string; body?: unknown } = {}): Promise<T> {
  const token = tokenStore.get();
  const res = await fetch(path, {
    method: options.method ?? "GET",
    headers: {
      ...(options.body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => ({}));

  if (res.status === 401 && token) {
    // The saved token expired or is invalid: sign the user out.
    tokenStore.clear();
    localStorage.removeItem("showroom.user");
    window.location.reload();
  }
  if (!res.ok) throw new ApiError(res.status, data.error ?? "Something went wrong");
  return data as T;
}

export const api = {
  register: (body: { name: string; email: string; password: string }) =>
    request<User>("/api/auth/register", { method: "POST", body }),

  login: (body: { email: string; password: string }) =>
    request<{ token: string; user: User }>("/api/auth/login", { method: "POST", body }),

  listVehicles: (filters: VehicleFilters, page: number, limit: number) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    for (const [key, value] of Object.entries(filters)) {
      if (value.trim() !== "") params.set(key, value.trim());
    }
    return request<Page<Vehicle>>(`/api/vehicles/search?${params.toString()}`);
  },

  createVehicle: (body: VehicleInput) => request<Vehicle>("/api/vehicles", { method: "POST", body }),

  updateVehicle: (id: number, body: VehicleInput) => request<Vehicle>(`/api/vehicles/${id}`, { method: "PUT", body }),

  deleteVehicle: (id: number) => request<void>(`/api/vehicles/${id}`, { method: "DELETE" }),

  purchase: (id: number) => request<Vehicle>(`/api/vehicles/${id}/purchase`, { method: "POST", body: {} }),

  restock: (id: number, quantity: number) =>
    request<Vehicle>(`/api/vehicles/${id}/restock`, { method: "POST", body: { quantity } }),
};