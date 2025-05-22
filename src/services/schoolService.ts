import { createClient } from "@/lib/supabaseClient"
import { createServerClient } from "@/lib/supabaseServer"
import type { School, SchoolCreateInput, SchoolUpdateInput } from "@/types"

// Client-side functions
export const useSchoolService = () => {
  const supabase = createClient()

  const getSchools = async (): Promise<School[]> => {
    const { data, error } = await supabase.from("schools").select("*").order("name")
    if (error) throw error
    return data || []
  }

  const getSchoolById = async (id: number): Promise<School | null> => {
    const { data, error } = await supabase.from("schools").select("*").eq("id", id).single()
    if (error) {
      if (error.code === "PGRST116") {
        // PGRST116 is the error code for "no rows returned"
        return null
      }
      throw error
    }
    return data
  }

  const createSchool = async (schoolData: SchoolCreateInput): Promise<School> => {
    const now = new Date().toISOString()
    const dataWithTimestamps = {
      ...schoolData,
      created_at: now,
      updated_at: now,
    }

    const { data, error } = await supabase.from("schools").insert([dataWithTimestamps]).select().single()

    if (error) {
      console.error("Erro ao criar escola:", error)
      throw error
    }
    return data
  }

  const updateSchool = async (id: number, schoolData: SchoolUpdateInput): Promise<School> => {
    const dataWithTimestamp = {
      ...schoolData,
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase.from("schools").update(dataWithTimestamp).eq("id", id).select().single()

    if (error) {
      console.error("Erro ao atualizar escola:", error)
      throw error
    }
    return data
  }

  const deleteSchool = async (id: number): Promise<void> => {
    const { error } = await supabase.from("schools").delete().eq("id", id)

    if (error) {
      console.error("Erro ao excluir escola:", error)
      throw error
    }
  }

  const getSchoolTeachers = async (schoolId: number): Promise<any[]> => {
    const { data, error } = await supabase.from("teachers").select("*").eq("school_id", schoolId).order("name")
    if (error) throw error
    return data || []
  }

  const getSchoolStudents = async (schoolId: number): Promise<any[]> => {
    const { data, error } = await supabase.from("students").select("*").eq("school_id", schoolId).order("name")
    if (error) throw error
    return data || []
  }

  const getSchoolClasses = async (schoolId: number): Promise<any[]> => {
    const { data, error } = await supabase.from("classes").select("*").eq("school_id", schoolId).order("name")
    if (error) throw error
    return data || []
  }

  return {
    getSchools,
    getSchoolById,
    createSchool,
    updateSchool,
    deleteSchool,
    getSchoolTeachers,
    getSchoolStudents,
    getSchoolClasses,
  }
}

// Server-side functions
export const getSchools = async (): Promise<School[]> => {
  const supabase = createServerClient()
  const { data, error } = await supabase.from("schools").select("*").order("name")
  if (error) throw error
  return data || []
}

export const getSchoolById = async (id: number): Promise<School | null> => {
  const supabase = createServerClient()
  const { data, error } = await supabase.from("schools").select("*").eq("id", id).single()
  if (error) {
    if (error.code === "PGRST116") {
      // PGRST116 is the error code for "no rows returned"
      return null
    }
    throw error
  }
  return data
}

export const getSchoolsWithDirectors = async (): Promise<any[]> => {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from("schools")
    .select(
      `
      *,
      director:profiles!director_profile_id (
        id,
        full_name,
        email
      )
    `,
    )
    .order("name")
  if (error) throw error
  return data || []
}

export const getSchoolWithDetails = async (id: number): Promise<any | null> => {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from("schools")
    .select(
      `
      *,
      director:profiles!director_profile_id (
        id,
        full_name,
        email
      ),
      teachers:teachers (
        id,
        name,
        email,
        specialization
      ),
      classes:classes (
        id,
        name,
        grade,
        year,
        teacher_id
      ),
      students:students (
        id,
        name,
        registration_number,
        status
      )
    `,
    )
    .eq("id", id)
    .single()

  if (error) {
    if (error.code === "PGRST116") {
      return null
    }
    throw error
  }
  return data
}
