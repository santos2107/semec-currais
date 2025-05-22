"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useStudents } from "@/hooks/useStudents"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Search, Plus, Edit, Trash2, Eye } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useAuthStore } from "@/store/authStore"
import type { QueryParams } from "@/types"

export default function StudentsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuthStore()
  const [searchTerm, setSearchTerm] = useState("")
  const [queryParams, setQueryParams] = useState<QueryParams>({
    pagination: { page: 1, pageSize: 10 },
    sort: [{ field: "created_at", direction: "desc" }],
    filters: [],
  })

  const { useStudentsList, useDeleteStudent } = useStudents()
  const { data: studentsData, isLoading, isError } = useStudentsList(queryParams)
  const deleteStudentMutation = useDeleteStudent()

  const handleSearch = () => {
    const newParams = { ...queryParams }

    // Remover filtros de busca anteriores
    newParams.filters =
      newParams.filters?.filter(
        (f) => f.field !== "full_name" && f.field !== "registration_number" && f.field !== "cpf",
      ) || []

    // Adicionar novo filtro de busca
    if (searchTerm) {
      newParams.filters?.push({ field: "full_name", operator: "ilike", value: searchTerm })
    }

    // Resetar para a primeira página
    if (newParams.pagination) {
      newParams.pagination.page = 1
    }

    setQueryParams(newParams)
  }

  const handlePageChange = (page: number) => {
    setQueryParams((prev) => ({
      ...prev,
      pagination: { ...prev.pagination!, page },
    }))
  }

  const handleDelete = async (id: number, name: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o aluno ${name}?`)) {
      try {
        await deleteStudentMutation.mutateAsync(id)
        toast({
          title: "Aluno excluído",
          description: `O aluno ${name} foi excluído com sucesso.`,
        })
      } catch (error: any) {
        toast({
          title: "Erro ao excluir aluno",
          description: error.message || "Ocorreu um erro ao excluir o aluno.",
          variant: "destructive",
        })
      }
    }
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl font-bold">Alunos</CardTitle>
          <Button onClick={() => router.push("/students/new")}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Aluno
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Buscar por nome, matrícula ou CPF..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch} variant="outline">
              Buscar
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          ) : isError ? (
            <div className="text-center text-red-500 py-8">Erro ao carregar os alunos. Tente novamente mais tarde.</div>
          ) : studentsData?.data.length === 0 ? (
            <div className="text-center text-gray-500 py-8">Nenhum aluno encontrado.</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Matrícula</TableHead>
                      <TableHead>Turma</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {studentsData?.data.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.profiles?.full_name}</TableCell>
                        <TableCell>{student.registration_number}</TableCell>
                        <TableCell>{student.classes?.name || "-"}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              student.status === "ativo"
                                ? "bg-green-100 text-green-800"
                                : student.status === "inativo"
                                  ? "bg-gray-100 text-gray-800"
                                  : student.status === "transferido"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {student.status === "ativo"
                              ? "Ativo"
                              : student.status === "inativo"
                                ? "Inativo"
                                : student.status === "transferido"
                                  ? "Transferido"
                                  : "Formado"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => router.push(`/students/${student.id}`)}
                              title="Ver detalhes"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => router.push(`/students/${student.id}/edit`)}
                              title="Editar"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(student.id!, student.profiles?.full_name || "Aluno")}
                              title="Excluir"
                              disabled={deleteStudentMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {studentsData && studentsData.pagination.pageCount > 1 && (
                <Pagination className="mt-6">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => handlePageChange(Math.max(1, queryParams.pagination!.page - 1))}
                        disabled={queryParams.pagination!.page === 1}
                      />
                    </PaginationItem>

                    {Array.from({ length: studentsData.pagination.pageCount }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          isActive={page === queryParams.pagination!.page}
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() =>
                          handlePageChange(
                            Math.min(studentsData.pagination.pageCount, queryParams.pagination!.page + 1),
                          )
                        }
                        disabled={queryParams.pagination!.page === studentsData.pagination.pageCount}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
