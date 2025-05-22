import { create } from "zustand"
import type { User } from "@supabase/supabase-js"
import { createClient } from "../lib/supabaseClient"

interface Profile {
  id: string
  full_name?: string | null
  role?: string
  school_id?: number | null
}

interface AuthState {
  user: User | null
  profile: Profile | null
  isLoading: boolean
  error: string | null
  setUser: (user: User | null) => void
  setProfile: (profile: Profile | null) => void
  setLoading: (isLoading: boolean) => void
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  checkAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => {
  const supabase = createClient()

  return {
    user: null,
    profile: null,
    isLoading: true,
    error: null,

    setUser: (user) => set({ user }),
    setProfile: (profile) => set({ profile }),
    setLoading: (isLoading) => set({ isLoading }),

    signIn: async (email: string, password: string) => {
      try {
        set({ isLoading: true, error: null })
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) throw error

        set({ user: data.user, isLoading: false })

        // Fetch user profile
        if (data.user) {
          const { data: profileData } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

          if (profileData) {
            set({ profile: profileData })
          }
        }
      } catch (error: any) {
        set({ error: error.message, isLoading: false })
      }
    },

    signOut: async () => {
      try {
        set({ isLoading: true, error: null })
        const supabase = createClient()
        await supabase.auth.signOut()
        set({ user: null, profile: null, isLoading: false })
      } catch (error: any) {
        set({ error: error.message, isLoading: false })
      }
    },

    checkAuth: async () => {
      try {
        set({ isLoading: true, error: null })
        const supabase = createClient()
        const { data: sessionData } = await supabase.auth.getSession()

        if (sessionData?.session?.user) {
          set({ user: sessionData.session.user })

          // Fetch user profile
          const { data: profileData } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", sessionData.session.user.id)
            .single()

          if (profileData) {
            set({ profile: profileData })
          }
        } else {
          set({ user: null, profile: null })
        }

        set({ isLoading: false })
      } catch (error: any) {
        set({ error: error.message, isLoading: false, user: null, profile: null })
      }
    },
  }
})
