import type { User as SupabaseUser } from "@supabase/supabase-js"

export type User = SupabaseUser // Reexportando para consistência

// Mapeamento do tipo ENUM user_role do SQL
export type UserRole =
  | "admin_municipal"
  | "diretor_escola"
  | "secretario_escola"
  | "professor"
  | "aluno"
  | "responsavel"

// Tabela de Perfis (complementa auth.users)
export interface Profile {
  id: string // UUID, FK para auth.users(id)
  full_name?: string | null
  cpf?: string | null
  role: UserRole
  avatar_url?: string | null
  school_id?: number | null // FK para schools se o usuário for vinculado a uma escola específica
  created_at: string
  updated_at: string
}

export type ProfileCreateInput = Omit<Profile, "id" | "created_at" | "updated_at">
export type ProfileUpdateInput = Partial<Omit<Profile, "id" | "created_at" | "updated_at">>

// Escola
export interface School {
  id?: number // SERIAL PRIMARY KEY
  name: string
  inep_code?: string | null
  address?: string | null
  phone?: string | null
  email?: string | null
  director_profile_id?: string | null // UUID REFERENCES profiles(id)
  created_at?: string
  updated_at?: string
}

export type SchoolCreateInput = Omit<School, "id" | "created_at" | "updated_at">
export type SchoolUpdateInput = Partial<Omit<School, "id" | "created_at" | "updated_at">>

// Professor
export interface Teacher {
  id?: number // SERIAL PRIMARY KEY
  profile_id: string // UUID REFERENCES profiles(id)
  registration_number?: string | null
  specialization?: string | null
  education_level?: string | null
  school_id: number // FK para schools(id)
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export type TeacherCreateInput = Omit<Teacher, "id" | "created_at" | "updated_at">
export type TeacherUpdateInput = Partial<Omit<Teacher, "id" | "created_at" | "updated_at">>

// Aluno
export interface Student {
  id?: number // SERIAL PRIMARY KEY
  profile_id: string // UUID REFERENCES profiles(id)
  registration_number: string
  birth_date?: string | null
  gender?: "masculino" | "feminino" | "outro" | null
  address?: string | null
  guardian_name?: string | null
  guardian_phone?: string | null
  guardian_email?: string | null
  guardian_profile_id?: string | null // UUID REFERENCES profiles(id) - se o responsável tiver acesso ao sistema
  school_id: number // FK para schools(id)
  class_id?: number | null // FK para classes(id)
  status: "ativo" | "inativo" | "transferido" | "formado"
  created_at?: string
  updated_at?: string
}

export type StudentCreateInput = Omit<Student, "id" | "created_at" | "updated_at">
export type StudentUpdateInput = Partial<Omit<Student, "id" | "created_at" | "updated_at">>

// Turma
export interface Class {
  id?: number // SERIAL PRIMARY KEY
  name: string
  grade: string // Ex: "1º Ano", "2º Ano", etc.
  level: "infantil" | "fundamental_i" | "fundamental_ii" | "medio" | "eja"
  year: number // Ano letivo
  school_id: number // FK para schools(id)
  teacher_id?: number | null // FK para teachers(id) - professor responsável
  room?: string | null // Sala de aula
  period: "matutino" | "vespertino" | "noturno" | "integral"
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export type ClassCreateInput = Omit<Class, "id" | "created_at" | "updated_at">
export type ClassUpdateInput = Partial<Omit<Class, "id" | "created_at" | "updated_at">>

// Disciplina
export interface Subject {
  id?: number // SERIAL PRIMARY KEY
  name: string
  code?: string | null
  description?: string | null
  created_at?: string
  updated_at?: string
}

export type SubjectCreateInput = Omit<Subject, "id" | "created_at" | "updated_at">
export type SubjectUpdateInput = Partial<Omit<Subject, "id" | "created_at" | "updated_at">>

// Atribuição de Disciplina (relaciona professor, turma e disciplina)
export interface SubjectAssignment {
  id?: number // SERIAL PRIMARY KEY
  teacher_id: number // FK para teachers(id)
  class_id: number // FK para classes(id)
  subject_id: number // FK para subjects(id)
  year: number // Ano letivo
  created_at?: string
  updated_at?: string
}

export type SubjectAssignmentCreateInput = Omit<SubjectAssignment, "id" | "created_at" | "updated_at">
export type SubjectAssignmentUpdateInput = Partial<Omit<SubjectAssignment, "id" | "created_at" | "updated_at">>

// Período Letivo
export interface AcademicTerm {
  id?: number // SERIAL PRIMARY KEY
  name: string // Ex: "1º Bimestre", "2º Bimestre", etc.
  start_date: string
  end_date: string
  year: number // Ano letivo
  type: "bimestre" | "trimestre" | "semestre" | "ano"
  created_at?: string
  updated_at?: string
}

export type AcademicTermCreateInput = Omit<AcademicTerm, "id" | "created_at" | "updated_at">
export type AcademicTermUpdateInput = Partial<Omit<AcademicTerm, "id" | "created_at" | "updated_at">>

// Nota
export interface Grade {
  id?: number // SERIAL PRIMARY KEY
  student_id: number // FK para students(id)
  subject_assignment_id: number // FK para subject_assignments(id)
  academic_term_id: number // FK para academic_terms(id)
  value: number
  comments?: string | null
  created_at?: string
  updated_at?: string
}

export type GradeCreateInput = Omit<Grade, "id" | "created_at" | "updated_at">
export type GradeUpdateInput = Partial<Omit<Grade, "id" | "created_at" | "updated_at">>

// Frequência
export interface Attendance {
  id?: number // SERIAL PRIMARY KEY
  student_id: number // FK para students(id)
  class_id: number // FK para classes(id)
  subject_id?: number | null // FK para subjects(id), opcional se a frequência for por dia e não por disciplina
  date: string
  status: "presente" | "ausente" | "justificado"
  justification?: string | null
  created_at?: string
  updated_at?: string
}

export type AttendanceCreateInput = Omit<Attendance, "id" | "created_at" | "updated_at">
export type AttendanceUpdateInput = Partial<Omit<Attendance, "id" | "created_at" | "updated_at">>

// Evento Escolar
export interface SchoolEvent {
  id?: number // SERIAL PRIMARY KEY
  title: string
  description?: string | null
  start_date: string
  end_date?: string | null
  all_day: boolean
  location?: string | null
  school_id?: number | null // FK para schools(id), null se for um evento para todas as escolas
  class_id?: number | null // FK para classes(id), null se for um evento para toda a escola
  created_by: string // UUID REFERENCES profiles(id)
  created_at?: string
  updated_at?: string
}

export type SchoolEventCreateInput = Omit<SchoolEvent, "id" | "created_at" | "updated_at">
export type SchoolEventUpdateInput = Partial<Omit<SchoolEvent, "id" | "created_at" | "updated_at">>

// Comunicado
export interface Announcement {
  id?: number // SERIAL PRIMARY KEY
  title: string
  content: string
  published_at: string
  expires_at?: string | null
  is_important: boolean
  school_id?: number | null // FK para schools(id), null se for um comunicado para todas as escolas
  class_id?: number | null // FK para classes(id), null se for um comunicado para toda a escola
  created_by: string // UUID REFERENCES profiles(id)
  created_at?: string
  updated_at?: string
}

export type AnnouncementCreateInput = Omit<Announcement, "id" | "created_at" | "updated_at">
export type AnnouncementUpdateInput = Partial<Omit<Announcement, "id" | "created_at" | "updated_at">>

// Tipo de Documento
export interface DocumentType {
  id?: number // SERIAL PRIMARY KEY
  name: string
  description?: string | null
  created_at?: string
  updated_at?: string
}

export type DocumentTypeCreateInput = Omit<DocumentType, "id" | "created_at" | "updated_at">
export type DocumentTypeUpdateInput = Partial<Omit<DocumentType, "id" | "created_at" | "updated_at">>

// Documento
export interface Document {
  id?: number // SERIAL PRIMARY KEY
  title: string
  description?: string | null
  file_url: string
  file_name: string
  file_type: string
  file_size: number
  document_type_id: number // FK para document_types(id)
  student_id?: number | null // FK para students(id), se for um documento de aluno
  teacher_id?: number | null // FK para teachers(id), se for um documento de professor
  school_id?: number | null // FK para schools(id), se for um documento de escola
  uploaded_by: string // UUID REFERENCES profiles(id)
  created_at?: string
  updated_at?: string
}

export type DocumentCreateInput = Omit<Document, "id" | "created_at" | "updated_at">
export type DocumentUpdateInput = Partial<Omit<Document, "id" | "created_at" | "updated_at">>

// Configurações do Sistema
export interface SystemSettings {
  id?: number // SERIAL PRIMARY KEY
  current_academic_year: number
  school_start_date: string
  school_end_date: string
  allow_teacher_grade_edit: boolean
  allow_teacher_attendance_edit: boolean
  created_at?: string
  updated_at?: string
}

export type SystemSettingsCreateInput = Omit<SystemSettings, "id" | "created_at" | "updated_at">
export type SystemSettingsUpdateInput = Partial<Omit<SystemSettings, "id" | "created_at" | "updated_at">>

// Tipos para paginação e filtros
export interface PaginationParams {
  page: number
  pageSize: number
}

export interface SortParams {
  field: string
  direction: "asc" | "desc"
}

export interface FilterParams {
  field: string
  operator: "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "like" | "ilike" | "in" | "is"
  value: any
}

export interface QueryParams {
  pagination?: PaginationParams
  sort?: SortParams[]
  filters?: FilterParams[]
}

// Tipos para respostas paginadas
export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    total: number
    page: number
    pageSize: number
    pageCount: number
  }
}
