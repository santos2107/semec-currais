"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createClient } from "@/lib/supabaseClient"
import type { School, SchoolCreateInput, SchoolUpdateInput } from "@/types"
import { useRouter } from "next/navigation"
import { useState } from "react"

export function useSchools() {
  const supabase = createClient()
  const queryClient = useQueryClient()
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  // Get all schools
  const useSchoolsQuery = () => {
    return useQuery({
      queryKey: ["schools"],
      queryFn: async (): Promise<School[]> => {
        const { data, error } = await supabase.from("schools").select("*").order("name")
        if (error) throw error
        return data || []
      },
    })
  }

  // Get a single school by ID
  const useSchoolQuery = (id: number) => {
    return useQuery({
      queryKey: ["schools", id],
      queryFn: async (): Promise<School | null> => {
        const { data, error } = await supabase.from("schools").select("*").eq("id", id).single()
        if (error) {
          if (error.code === "PGRST116") {
            // PGRST116 is the error code for "no rows returned"
            return null
          }
          throw error
        }
        return data
      },
      enabled: !!id, // Only run the query if we have an ID
    })
  }

  // Create a new school
  const useCreateSchoolMutation = () => {
    return useMutation({
      mutationFn: async (newSchool: SchoolCreateInput): Promise<School> => {
        const now = new Date().toISOString()
        const dataWithTimestamps = {
          ...newSchool,
          created_at: now,
          updated_at: now,
        }

        const { data, error } = await supabase.from("schools").insert([dataWithTimestamps]).select().single()

        if (error) {
          setError(error.message)
          throw error
        }
        return data
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["schools"] })
      },
    })
  }

  // Update an existing school
  const useUpdateSchoolMutation = () => {
    return useMutation({
      mutationFn: async ({ id, data }: { id: number; data: SchoolUpdateInput }): Promise<School> => {
        const dataWithTimestamp = {
          ...data,
          updated_at: new Date().toISOString(),
        }

        const { data: updatedSchool, error } = await supabase
          .from("schools")
          .update(dataWithTimestamp)
          .eq("id", id)
          .select()
          .single()

        if (error) {
          setError(error.message)
          throw error
        }
        return updatedSchool
      },
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ["schools"] })
        queryClient.invalidateQueries({ queryKey: ["schools", variables.id] })
      },
    })
  }

  // Delete a school
  const useDeleteSchoolMutation = () => {
    return useMutation({
      mutationFn: async (id: number): Promise<void> => {
        const { error } = await supabase.from("schools").delete().eq("id", id)

        if (error) {
          setError(error.message)
          throw error
        }
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["schools"] })
      },
    })
  }

  return {
    useSchoolsQuery,
    useSchoolQuery,
    useCreateSchoolMutation,
    useUpdateSchoolMutation,
    useDeleteSchoolMutation,
    error,
    setError,
  }
}
