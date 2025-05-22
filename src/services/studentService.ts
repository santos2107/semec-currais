import { createClient } from "../lib/supabaseClient"
import type { Student, StudentCreateInput, StudentUpdateInput, PaginatedResponse, QueryParams } from "../types"

// Função para criar um novo aluno
export async function createStudent(studentData: StudentCreateInput): Promise<Student> {
  const supabase = createClient()

  // Primeiro, criar um perfil para o aluno
  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .insert([
      {
        full_name: studentData.full_name,
        role: "aluno",
        school_id: studentData.school_id,
      },
    ])
    .select()
    .single()

  if (profileError) throw profileError

  // Depois, criar o registro do aluno com o profile_id
  const { data, error } = await supabase
    .from("students")
    .insert([
      {
        ...studentData,
        profile_id: profileData.id,
        status: studentData.status || "ativo",
      },
    ])
    .select()
    .single()

  if (error) {
    // Se houver erro, excluir o perfil criado para evitar perfis órfãos
    await supabase.from("profiles").delete().eq("id", profileData.id)
    throw error
  }

  return data
}

// Função para buscar um aluno pelo ID
export async function getStudentById(id: number): Promise<Student> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("students")
    .select(`
      *,
      profiles:profile_id (*),
      schools:school_id (*),
      classes:class_id (*)
    `)
    .eq("id", id)
    .single()

  if (error) throw error
  return data
}

// Função para atualizar um aluno
export async function updateStudent(id: number, studentData: StudentUpdateInput): Promise<Student> {
  const supabase = createClient()

  const { data, error } = await supabase.from("students").update(studentData).eq("id", id).select().single()

  if (error) throw error
  return data
}

// Função para excluir um aluno
export async function deleteStudent(id: number): Promise<void> {
  const supabase = createClient()

  // Primeiro, obter o profile_id do aluno
  const { data: student, error: fetchError } = await supabase
    .from("students")
    .select("profile_id")
    .eq("id", id)
    .single()

  if (fetchError) throw fetchError

  // Excluir o aluno
  const { error: deleteError } = await supabase.from("students").delete().eq("id", id)

  if (deleteError) throw deleteError

  // Excluir o perfil associado
  if (student.profile_id) {
    const { error: profileError } = await supabase.from("profiles").delete().eq("id", student.profile_id)

    if (profileError) throw profileError
  }
}

// Função para listar alunos com paginação, ordenação e filtros
export async function getStudents(params?: QueryParams): Promise<PaginatedResponse<Student>> {
  const supabase = createClient()

  let query = supabase.from("students").select(
    `
      *,
      profiles:profile_id (id, full_name, avatar_url),
      schools:school_id (id, name),
      classes:class_id (id, name, grade)
    `,
    { count: "exact" },
  )

  // Aplicar filtros
  if (params?.filters) {
    params.filters.forEach((filter) => {
      if (filter.operator === "eq") {
        query = query.eq(filter.field, filter.value)
      } else if (filter.operator === "ilike") {
        query = query.ilike(filter.field, `%${filter.value}%`)
      }
      // Adicionar outros operadores conforme necessário
    })
  }

  // Aplicar ordenação
  if (params?.sort && params.sort.length > 0) {
    params.sort.forEach((sort) => {
      query = query.order(sort.field, { ascending: sort.direction === "asc" })
    })
  } else {
    // Ordenação padrão
    query = query.order("created_at", { ascending: false })
  }

  // Aplicar paginação
  if (params?.pagination) {
    const { page, pageSize } = params.pagination
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1
    query = query.range(from, to)
  }

  const { data, error, count } = await query

  if (error) throw error

  return {
    data: data || [],
    pagination: {
      total: count || 0,
      page: params?.pagination?.page || 1,
      pageSize: params?.pagination?.pageSize || 10,
      pageCount: Math.ceil((count || 0) / (params?.pagination?.pageSize || 10)),
    },
  }
}

// Função para fazer upload da foto do aluno
export async function uploadStudentPhoto(file: File, studentId: number): Promise<string> {
  const supabase = createClient()

  // Gerar um nome único para o arquivo
  const fileExt = file.name.split(".").pop()
  const fileName = `${studentId}_${Math.random().toString(36).substring(2)}.${fileExt}`
  const filePath = `students/${fileName}`

  // Fazer o upload do arquivo
  const { error: uploadError } = await supabase.storage.from("photos").upload(filePath, file)

  if (uploadError) throw uploadError

  // Obter a URL pública do arquivo
  const { data } = supabase.storage.from("photos").getPublicUrl(filePath)

  // Atualizar o campo photo_url do aluno
  const { error: updateError } = await supabase
    .from("students")
    .update({ photo_url: data.publicUrl })
    .eq("id", studentId)

  if (updateError) throw updateError

  return data.publicUrl
}
