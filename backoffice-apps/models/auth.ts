import { createModel } from "@rematch/core";
import type { RootModel } from ".";

type User = {
  id: number;
  name: string;
  phone: string;
  role: { id: number; name: string };
};

type AuthState = {
  user: User | null;
  token: string | null;
  pendingUser: User | null; // 🔥 tambahan
};

export const auth = createModel<RootModel>()({
  state: {
    user: null,
    token: null,
    pendingUser: null,
  } as AuthState,

  reducers: {
    setAuth(state, payload: { user: User; token: string }) {
      localStorage.setItem("auth", JSON.stringify(payload));
      return { ...state, ...payload, pendingUser: null }; // clear pending setelah login sukses
    },
    setPendingUser(state, payload: User) {
      return { ...state, pendingUser: payload };
    },
    clearPendingUser(state) {
      return { ...state, pendingUser: null };
    },
    loadAuth(state) {
      const saved = localStorage.getItem("auth");
      if (saved) {
        return { ...state, ...JSON.parse(saved) };
      }
      return state;
    },
    logout() {
      localStorage.removeItem("auth");
      return { user: null, token: null, pendingUser: null };
    },
  },

  effects: (dispatch) => ({
    async register(payload: {
      name: string;
      businessName: string;
      businessAddress: string;
      phone: string;
      password: string;
    }) {
      const res = await fetch("http://localhost:8000/v1/app/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: payload.name,
          business_name: payload.businessName,
          business_address: payload.businessAddress,
          phone: payload.phone,
          password: payload.password,
        }),
      });

      if (!res.ok) throw new Error("Register failed");
      const data = await res.json();

      // 👉 simpan ke pendingUser dulu (misal untuk OTP)
      dispatch.auth.setPendingUser(data.data);
    },

    async verifyOtp(payload: { otp: string }, state) {
      const res = await fetch("http://localhost:8000/v1/app/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("OTP verification failed");
      const data = await res.json();

      // setelah OTP sukses → jadikan user resmi
      if (state.auth.pendingUser) {
        dispatch.auth.setAuth({
          user: state.auth.pendingUser,
          token: data.data.token,
        });
      }
    },

    async login(payload: { phone: string; password: string }) {
      const res = await fetch("http://localhost:8000/v1/app/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Login failed");
      const data = await res.json();

      dispatch.auth.setAuth({
        user: data.data.user,
        token: data.data.token,
      });
    },
  }),
});
