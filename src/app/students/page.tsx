"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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

export default function StudentsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { profile } = useAuthStore()
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [students, setStudents] = useState<any[]>([])
  const [totalStudents, setTotalStudents] = useState(0)
  const pageSize = 10

  // Dados de exemplo para demonstração
  const mockStudents = [
    {
      id: 1,
      full_name: "Ana Silva",
      registration_number: "2024001",
      class_name: "5º Ano A",
      status: "ativo",
    },
    {
      id: 2,
      full_name: "Bruno Santos",
      registration_number: "2024002",
      class_name: "5º Ano A",
      status: "ativo",
    },
    {
      id: 3,
      full_name: "Carla Oliveira",
      registration_number: "2024003",
      class_name: "6º Ano B",
      status: "ativo",
    },
    {
      id: 4,
      full_name: "Daniel Lima",
      registration_number: "2024004",
      class_name: "7º Ano A",
      status: "inativo",
    },
    {
      id: 5,
      full_name: "Eduardo Pereira",
      registration_number: "2024005",
      class_name: "8º Ano C",
      status: "transferido",
    },
  ]

  // Simular carregamento de dados
  useState(() => {
    setStudents(mockStudents)
    setTotalStudents(mockStudents.length)
  })

  const handleSearch = () => {
    // Filtrar estudantes pelo termo de busca
    if (searchTerm) {
      const filtered = mockStudents.filter(
        (student) =>
          student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.registration_number.includes(searchTerm),
      )
      setStudents(filtered)
      setTotalStudents(filtered.length)
    } else {
      setStudents(mockStudents)
      setTotalStudents(mockStudents.length)
    }
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleDelete = (id: number, name: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o aluno ${name}?`)) {
      // Simulação de exclusão
      const updatedStudents = students.filter((student) => student.id !== id)
      setStudents(updatedStudents)
      setTotalStudents(updatedStudents.length)

      toast({
        title: "Aluno excluído",
        description: `O aluno ${name} foi excluído com sucesso.`,
      })
    }
  }

  const totalPages = Math.ceil(totalStudents / pageSize)

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "ativo":
        return "bg-green-100 text-green-800"
      case "inativo":
        return "bg-gray-100 text-gray-800"
      case "transferido":
        return "bg-yellow-100 text-yellow-800"
      case "formado":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
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
                placeholder="Buscar por nome ou matrícula..."
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
          ) : students.length === 0 ? (
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
                    {students.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.full_name}</TableCell>
                        <TableCell>{student.registration_number}</TableCell>
                        <TableCell>{student.class_name || "-"}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(
                              student.status,
                            )}`}
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
                              onClick={() => handleDelete(student.id, student.full_name)}
                              title="Excluir"
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

              {totalPages > 1 && (
                <Pagination className="mt-6">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                      />
                    </PaginationItem>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink isActive={page === currentPage} onClick={() => handlePageChange(page)}>
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
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
