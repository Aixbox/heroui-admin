import { create } from "zustand";
import { api, type User } from "~/lib/api";

interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: async () => {
    await api.logout();
    set({ user: null });
  },
}));
