import { create } from "zustand"
import type { User } from "@supabase/supabase-js"
import { createClient } from "../lib/supabaseClient"

interface AuthState {
  user: User | null
  isLoading: boolean
  setUser: (user: User | null) => void
  setLoading: (isLoading: boolean) => void
  signIn: (email: string, password: string) => Promise<{ error: any | null }>
  signOut: () => Promise<void>
  checkAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => {
  const supabase = createClient()

  return {
    user: null,
    isLoading: true,

    setUser: (user) => set({ user }),
    setLoading: (isLoading) => set({ isLoading }),

    signIn: async (email, password) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (!error && data?.user) {
        set({ user: data.user })
      }

      return { error }
    },

    signOut: async () => {
      await supabase.auth.signOut()
      set({ user: null })
    },

    checkAuth: async () => {
      set({ isLoading: true })

      const { data } = await supabase.auth.getSession()

      if (data?.session?.user) {
        set({ user: data.session.user })
      }

      set({ isLoading: false })
    },
  }
})
