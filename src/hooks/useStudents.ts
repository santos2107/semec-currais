import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  createStudent,
  getStudentById,
  updateStudent,
  deleteStudent,
  getStudents,
  uploadStudentPhoto,
} from "../services/studentService"
import type { StudentCreateInput, StudentUpdateInput, QueryParams } from "../types"

export function useStudents() {
  const queryClient = useQueryClient()

  // Query para listar alunos
  const useStudentsList = (params?: QueryParams) => {
    return useQuery({
      queryKey: ["students", params],
      queryFn: () => getStudents(params),
    })
  }

  // Query para obter um aluno específico
  const useStudent = (id: number) => {
    return useQuery({
      queryKey: ["students", id],
      queryFn: () => getStudentById(id),
      enabled: !!id,
    })
  }

  // Mutation para criar um aluno
  const useCreateStudent = () => {
    return useMutation({
      mutationFn: (data: StudentCreateInput) => createStudent(data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["students"] })
      },
    })
  }

  // Mutation para atualizar um aluno
  const useUpdateStudent = () => {
    return useMutation({
      mutationFn: ({ id, data }: { id: number; data: StudentUpdateInput }) => updateStudent(id, data),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ["students"] })
        queryClient.invalidateQueries({ queryKey: ["students", variables.id] })
      },
    })
  }

  // Mutation para excluir um aluno
  const useDeleteStudent = () => {
    return useMutation({
      mutationFn: (id: number) => deleteStudent(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["students"] })
      },
    })
  }

  // Mutation para fazer upload da foto do aluno
  const useUploadStudentPhoto = () => {
    return useMutation({
      mutationFn: ({ file, studentId }: { file: File; studentId: number }) => uploadStudentPhoto(file, studentId),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ["students", variables.studentId] })
      },
    })
  }

  return {
    useStudentsList,
    useStudent,
    useCreateStudent,
    useUpdateStudent,
    useDeleteStudent,
    useUploadStudentPhoto,
  }
}
