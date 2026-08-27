import { create } from "zustand";
import { mockApi, type User } from "~/lib/mock-api";

interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: async () => {
    await mockApi.logout();
    set({ user: null });
  },
}));
