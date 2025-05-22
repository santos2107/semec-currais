"use client"

import { useEffect } from "react"
import { useAuthStore } from "@/store/auth-store"
import { useRouter } from "next/navigation"
import Navigation from "@/components/navigation"
import {
  AcademicCapIcon,
  UserGroupIcon,
  CalendarIcon,
  BookOpenIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline"

const stats = [
  { name: "Total de Alunos", stat: "1,200", icon: UserGroupIcon },
  { name: "Total de Professores", stat: "58", icon: AcademicCapIcon },
  { name: "Turmas Ativas", stat: "42", icon: BookOpenIcon },
  { name: "Eventos do Mês", stat: "8", icon: CalendarIcon },
  { name: "Frequência Média", stat: "92%", icon: ClipboardDocumentListIcon },
]

export default function Dashboard() {
  const { user, isLoading, checkAuth } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

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
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>

          <div className="mt-6">
            <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
              {stats.map((item) => (
                <div
                  key={item.name}
                  className="relative bg-white pt-5 px-4 pb-6 sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden"
                >
                  <dt>
                    <div className="absolute bg-primary-500 rounded-md p-3">
                      <item.icon className="h-6 w-6 text-white" aria-hidden="true" />
                    </div>
                    <p className="ml-16 text-sm font-medium text-gray-500 truncate">{item.name}</p>
                  </dt>
                  <dd className="ml-16 pb-2 flex items-baseline">
                    <p className="text-2xl font-semibold text-gray-900">{item.stat}</p>
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Próximos Eventos</h2>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <CalendarIcon className="h-5 w-5 text-primary-500" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">Reunião de Pais e Mestres</p>
                    <p className="text-sm text-gray-500">15 de Junho, 2023 - 18:00</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <CalendarIcon className="h-5 w-5 text-primary-500" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">Feira de Ciências</p>
                    <p className="text-sm text-gray-500">22 de Junho, 2023 - 09:00</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <CalendarIcon className="h-5 w-5 text-primary-500" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">Conselho de Classe</p>
                    <p className="text-sm text-gray-500">30 de Junho, 2023 - 14:00</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Atividades Recentes</h2>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <UserGroupIcon className="h-5 w-5 text-primary-500" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">Novo aluno matriculado</p>
                    <p className="text-sm text-gray-500">João Silva - 5º Ano A</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <ClipboardDocumentListIcon className="h-5 w-5 text-primary-500" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">Notas do 2º Bimestre lançadas</p>
                    <p className="text-sm text-gray-500">Matemática - 7º Ano B</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <AcademicCapIcon className="h-5 w-5 text-primary-500" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">Novo professor contratado</p>
                    <p className="text-sm text-gray-500">Maria Oliveira - Ciências</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
