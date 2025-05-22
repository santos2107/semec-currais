"use client"

import { useEffect, useState } from "react"
import { useAuthStore } from "@/store/auth-store"
import { useRouter } from "next/navigation"
import Navigation from "@/components/navigation"
import { MagnifyingGlassIcon, PlusIcon } from "@heroicons/react/24/outline"
import { useQuery } from "@tanstack/react-query"

type Student = {
  id: string
  name: string
  registration: string
  grade: string
  class: string
  status: "active" | "inactive" | "transferred"
}

export default function StudentsPage() {
  const { user, isLoading, checkAuth } = useAuthStore()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  // This would normally fetch from Supabase
  const { data: students, isLoading: isLoadingStudents } = useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      // In a real app, this would be a Supabase query
      // const { data, error } = await supabase.from('students').select('*')
      // if (error) throw error
      // return data

      // Mock data for demonstration
      return [
        { id: "1", name: "Ana Silva", registration: "2023001", grade: "5º Ano", class: "A", status: "active" },
        { id: "2", name: "Bruno Santos", registration: "2023002", grade: "5º Ano", class: "A", status: "active" },
        { id: "3", name: "Carla Oliveira", registration: "2023003", grade: "5º Ano", class: "B", status: "active" },
        { id: "4", name: "Daniel Lima", registration: "2023004", grade: "6º Ano", class: "A", status: "active" },
        { id: "5", name: "Eduardo Pereira", registration: "2023005", grade: "6º Ano", class: "B", status: "active" },
        { id: "6", name: "Fernanda Costa", registration: "2023006", grade: "7º Ano", class: "A", status: "active" },
        { id: "7", name: "Gabriel Martins", registration: "2023007", grade: "7º Ano", class: "B", status: "inactive" },
        { id: "8", name: "Helena Souza", registration: "2023008", grade: "8º Ano", class: "A", status: "active" },
        { id: "9", name: "Igor Alves", registration: "2023009", grade: "8º Ano", class: "B", status: "transferred" },
        { id: "10", name: "Julia Ferreira", registration: "2023010", grade: "9º Ano", class: "A", status: "active" },
      ] as Student[]
    },
  })

  const filteredStudents = students?.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.registration.includes(searchTerm) ||
      student.grade.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.class.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Carregando...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation />
      <main className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Alunos</h1>
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Novo Aluno
            </button>
          </div>

          <div className="mt-6">
            <div className="relative flex items-center">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                type="text"
                name="search"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Buscar alunos..."
              />
            </div>
          </div>

          <div className="mt-6 flex flex-col">
            <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Nome
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Matrícula
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Ano/Série
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Turma
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Status
                        </th>
                        <th scope="col" className="relative px-6 py-3">
                          <span className="sr-only">Editar</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {isLoadingStudents ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-4 text-center">
                            Carregando...
                          </td>
                        </tr>
                      ) : filteredStudents?.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-4 text-center">
                            Nenhum aluno encontrado
                          </td>
                        </tr>
                      ) : (
                        filteredStudents?.map((student) => (
                          <tr key={student.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{student.name}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">{student.registration}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">{student.grade}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">{student.class}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  student.status === "active"
                                    ? "bg-green-100 text-green-800"
                                    : student.status === "inactive"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {student.status === "active"
                                  ? "Ativo"
                                  : student.status === "inactive"
                                    ? "Inativo"
                                    : "Transferido"}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <a href="#" className="text-primary-600 hover:text-primary-900">
                                Editar
                              </a>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
