"use client"

import { useEffect, useState } from "react"
import { useAuthStore } from "@/store/authStore"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { School, Users, GraduationCap, BookOpen, Calendar, BarChart3, Activity, Clock } from "lucide-react"
import { createClient } from "@/lib/supabaseClient"

export default function DashboardPage() {
  const { user, profile } = useAuthStore()
  const [stats, setStats] = useState({
    schools: 0,
    students: 0,
    teachers: 0,
    classes: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true)
        const supabase = createClient()

        // Fetch stats based on user role
        if (profile?.role === "admin_municipal") {
          // Admin can see all stats
          const [schoolsRes, studentsRes, teachersRes, classesRes] = await Promise.all([
            supabase.from("schools").select("id", { count: "exact" }),
            supabase.from("students").select("id", { count: "exact" }),
            supabase.from("teachers").select("id", { count: "exact" }),
            supabase.from("classes").select("id", { count: "exact" }),
          ])

          setStats({
            schools: schoolsRes.count || 0,
            students: studentsRes.count || 0,
            teachers: teachersRes.count || 0,
            classes: classesRes.count || 0,
          })
        } else if (profile?.role === "diretor_escola" && profile?.school_id) {
          // School director can only see stats for their school
          const [studentsRes, teachersRes, classesRes] = await Promise.all([
            supabase.from("students").select("id", { count: "exact" }).eq("school_id", profile.school_id),
            supabase.from("teachers").select("id", { count: "exact" }).eq("school_id", profile.school_id),
            supabase.from("classes").select("id", { count: "exact" }).eq("school_id", profile.school_id),
          ])

          setStats({
            schools: 1, // Director only manages one school
            students: studentsRes.count || 0,
            teachers: teachersRes.count || 0,
            classes: classesRes.count || 0,
          })
        }
      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setLoading(false)
      }
    }

    if (profile) {
      fetchStats()
    }
  }, [profile])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium">Ano Letivo: 2024</div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Escolas</CardTitle>
            <School className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div> : stats.schools}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {profile?.role === "admin_municipal" ? "Total de escolas no município" : "Sua escola"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Alunos</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div> : stats.students}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {profile?.role === "admin_municipal" ? "Total de alunos no município" : "Alunos na sua escola"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Professores</CardTitle>
            <GraduationCap className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div> : stats.teachers}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {profile?.role === "admin_municipal" ? "Total de professores no município" : "Professores na sua escola"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Turmas</CardTitle>
            <BookOpen className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div> : stats.classes}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {profile?.role === "admin_municipal" ? "Total de turmas no município" : "Turmas na sua escola"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg font-medium">
              <Activity className="h-5 w-5 text-blue-600 mr-2" />
              Atividades Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <div className="h-9 w-9 rounded-full bg-gray-200 animate-pulse"></div>
                    <div className="space-y-1 flex-1">
                      <div className="h-4 w-full bg-gray-200 animate-pulse rounded"></div>
                      <div className="h-3 w-1/2 bg-gray-200 animate-pulse rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-green-100 p-2 rounded-full">
                    <Users className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Novo aluno matriculado</p>
                    <p className="text-xs text-gray-500">Maria Silva foi matriculada na turma 5º Ano A</p>
                    <p className="text-xs text-gray-400 mt-1">Hoje, 10:45</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <GraduationCap className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Professor adicionado</p>
                    <p className="text-xs text-gray-500">João Santos foi registrado como professor de Matemática</p>
                    <p className="text-xs text-gray-400 mt-1">Ontem, 15:30</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-purple-100 p-2 rounded-full">
                    <BookOpen className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Nova turma criada</p>
                    <p className="text-xs text-gray-500">Turma 3º Ano B foi criada na Escola Municipal Central</p>
                    <p className="text-xs text-gray-400 mt-1">2 dias atrás</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-orange-100 p-2 rounded-full">
                    <BarChart3 className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Notas registradas</p>
                    <p className="text-xs text-gray-500">Notas do 1º bimestre foram registradas para o 4º Ano A</p>
                    <p className="text-xs text-gray-400 mt-1">3 dias atrás</p>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-gray-100">
              <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">Ver todas as atividades</button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg font-medium">
              <Calendar className="h-5 w-5 text-blue-600 mr-2" />
              Próximos Eventos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <div className="h-12 w-12 rounded bg-gray-200 animate-pulse"></div>
                    <div className="space-y-1 flex-1">
                      <div className="h-4 w-full bg-gray-200 animate-pulse rounded"></div>
                      <div className="h-3 w-1/2 bg-gray-200 animate-pulse rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex flex-col items-center justify-center min-w-[3rem] h-12 bg-red-50 text-red-600 rounded">
                    <span className="text-xs font-semibold">JUN</span>
                    <span className="text-lg font-bold">15</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Reunião de Pais e Mestres</p>
                    <div className="flex items-center text-xs text-gray-500 mt-1">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>14:00 - 17:00</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Escola Municipal Central</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex flex-col items-center justify-center min-w-[3rem] h-12 bg-blue-50 text-blue-600 rounded">
                    <span className="text-xs font-semibold">JUN</span>
                    <span className="text-lg font-bold">22</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Feira de Ciências</p>
                    <div className="flex items-center text-xs text-gray-500 mt-1">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>08:00 - 12:00</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Todas as escolas</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex flex-col items-center justify-center min-w-[3rem] h-12 bg-green-50 text-green-600 rounded">
                    <span className="text-xs font-semibold">JUL</span>
                    <span className="text-lg font-bold">05</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Formação de Professores</p>
                    <div className="flex items-center text-xs text-gray-500 mt-1">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>09:00 - 16:00</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Secretaria de Educação</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex flex-col items-center justify-center min-w-[3rem] h-12 bg-purple-50 text-purple-600 rounded">
                    <span className="text-xs font-semibold">JUL</span>
                    <span className="text-lg font-bold">15</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Início das Férias Escolares</p>
                    <div className="flex items-center text-xs text-gray-500 mt-1">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>Dia todo</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Todas as escolas</p>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-gray-100">
              <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">Ver calendário completo</button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">Acesso Rápido</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <button className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <Users className="h-6 w-6 text-blue-600 mb-2" />
              <span className="text-sm font-medium">Alunos</span>
            </button>

            <button className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <GraduationCap className="h-6 w-6 text-green-600 mb-2" />
              <span className="text-sm font-medium">Professores</span>
            </button>

            <button className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <BookOpen className="h-6 w-6 text-purple-600 mb-2" />
              <span className="text-sm font-medium">Turmas</span>
            </button>

            <button className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <BarChart3 className="h-6 w-6 text-orange-600 mb-2" />
              <span className="text-sm font-medium">Relatórios</span>
            </button>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-medium">Estatísticas de Frequência</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[180px] flex items-center justify-center">
              {loading ? (
                <div className="w-full h-full bg-gray-100 animate-pulse rounded-lg"></div>
              ) : (
                <div className="text-center text-gray-500">
                  <BarChart3 className="h-12 w-12 mx-auto text-gray-300 mb-2" />
                  <p>Dados de frequência serão exibidos aqui</p>
                  <button className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium">
                    Configurar relatório
                  </button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
