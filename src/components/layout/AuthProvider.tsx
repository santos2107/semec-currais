"use client"

import type React from "react"

import { useEffect } from "react"
import { useAuthStore } from "@/store/authStore"
import { createClient } from "@/lib/supabaseClient"

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { setUser, setLoading } = useAuthStore()

  useEffect(() => {
    setLoading(true)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Verificação inicial da sessão
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [supabase, setUser, setLoading])

  return <>{children}</>
}
