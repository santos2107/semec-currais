"use client"

import { useParams, useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/lib/supabaseClient"
import type { School } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  SchoolIcon,
  Mail,
  Phone,
  MapPin,
  User,
  Users,
  BookOpen,
  GraduationCap,
  ArrowLeft,
  Edit,
  Trash2,
} from "lucide-react"
import { useAuthStore } from "@/store/authStore"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"

export default function SchoolDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { profile } = useAuthStore()
  const { toast } = useToast()
  const schoolId = Number(params.id)
  const supabase = createClient()

  const {
    data: school,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["schools", schoolId],
    queryFn: async () => {
      const { data, error } = await supabase.from("schools").select("*").eq("id", schoolId).single()

      if (error) throw error
      return data as School
    },
  })

  const { data: studentsCount } = useQuery({
    queryKey: ["schools", schoolId, "students-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("students")
        .select("*", { count: "exact", head: true })
        .eq("school_id", schoolId)

      if (error) throw error
      return count || 0
    },
  })

  const { data: teachersCount } = useQuery({
    queryKey: ["schools", schoolId, "teachers-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("teachers")
        .select("*", { count: "exact", head: true })
        .eq("school_id", schoolId)

      if (error) throw error
      return count || 0
    },
  })

  const { data: classesCount } = useQuery({
    queryKey: ["schools", schoolId, "classes-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("classes")
        .select("*", { count: "exact", head: true })
        .eq("school_id", schoolId)

      if (error) throw error
      return count || 0
    },
  })

  const handleDeleteSchool = async () => {
    if (!confirm("Tem certeza que deseja excluir esta escola? Esta ação não pode ser desfeita.")) return

    try {
      const { error } = await supabase.from("schools").delete().eq("id", schoolId)

      if (error) {
        toast({
          title: "Erro ao excluir escola",
          description: error.message,
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Escola excluída com sucesso",
        variant: "default",
      })

      router.push("/schools")
    } catch (error: any) {
      toast({
        title: "Erro ao excluir escola",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const canManageSchools = profile?.role === "admin_municipal"

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="h-8 bg-gray-200 animate-pulse rounded w-1/3" />
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <div className="h-6 bg-gray-200 animate-pulse rounded w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 animate-pulse rounded" />
                  <div className="h-4 bg-gray-200 animate-pulse rounded" />
                  <div className="h-4 bg-gray-200 animate-pulse rounded w-1/2" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <div className="h-6 bg-gray-200 animate-pulse rounded w-3/4" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 animate-pulse rounded" />
                  <div className="h-4 bg-gray-200 animate-pulse rounded" />
                  <div className="h-4 bg-gray-200 animate-pulse rounded" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>

        <div className="bg-red-50 text-red-700 p-4 rounded-lg">
          Erro ao carregar detalhes da escola: {(error as Error).message}
        </div>
      </div>
    )
  }

  if (!school) {
    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>

        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <SchoolIcon className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">Escola não encontrada</h3>
          <p className="text-gray-500 mb-4">A escola que você está procurando não existe ou foi removida</p>
          <Button asChild>
            <Link href="/schools">Ver todas as escolas</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold text-gray-800">{school.name}</h1>
        </div>

        {canManageSchools && (
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href={`/schools/${school.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Link>
            </Button>
            <Button
              variant="outline"
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
              onClick={handleDeleteSchool}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Tabs defaultValue="info">
            <TabsList className="mb-4">
              <TabsTrigger value="info">Informações</TabsTrigger>
              <TabsTrigger value="students">Alunos</TabsTrigger>
              <TabsTrigger value="teachers">Professores</TabsTrigger>
              <TabsTrigger value="classes">Turmas</TabsTrigger>
            </TabsList>

            <TabsContent value="info">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Informações da Escola</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {school.inep_code && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Código INEP</h4>
                      <p>{school.inep_code}</p>
                    </div>
                  )}

                  {school.address && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Endereço</h4>
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                        <span>{school.address}</span>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    {school.email && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Email</h4>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span>{school.email}</span>
                        </div>
                      </div>
                    )}

                    {school.phone && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Telefone</h4>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span>{school.phone}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {school.director_profile_id && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Diretor(a)</h4>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span>{school.director_profile_id}</span>
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Data de Cadastro</h4>
                    <p>{new Date(school.created_at!).toLocaleDateString("pt-BR")}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Última Atualização</h4>
                    <p>{new Date(school.updated_at!).toLocaleDateString("pt-BR")}</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="students">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Alunos</CardTitle>
                    <Button asChild>
                      <Link href={`/students?school=${school.id}`}>Ver Todos</Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">Lista de alunos será exibida aqui</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="teachers">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Professores</CardTitle>
                    <Button asChild>
                      <Link href={`/teachers?school=${school.id}`}>Ver Todos</Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <GraduationCap className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">Lista de professores será exibida aqui</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="classes">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Turmas</CardTitle>
                    <Button asChild>
                      <Link href={`/classes?school=${school.id}`}>Ver Todas</Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <BookOpen className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">Lista de turmas será exibida aqui</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Estatísticas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <Users className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="font-medium">Alunos</span>
                </div>
                <span className="text-xl font-bold">{studentsCount || 0}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="bg-green-100 p-2 rounded-full">
                    <GraduationCap className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="font-medium">Professores</span>
                </div>
                <span className="text-xl font-bold">{teachersCount || 0}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="bg-purple-100 p-2 rounded-full">
                    <BookOpen className="h-4 w-4 text-purple-600" />
                  </div>
                  <span className="font-medium">Turmas</span>
                </div>
                <span className="text-xl font-bold">{classesCount || 0}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" asChild>
                <Link href={`/students/new?school=${school.id}`}>
                  <Users className="h-4 w-4 mr-2" />
                  Adicionar Aluno
                </Link>
              </Button>

              <Button className="w-full justify-start" asChild>
                <Link href={`/teachers/new?school=${school.id}`}>
                  <GraduationCap className="h-4 w-4 mr-2" />
                  Adicionar Professor
                </Link>
              </Button>

              <Button className="w-full justify-start" asChild>
                <Link href={`/classes/new?school=${school.id}`}>
                  <BookOpen className="h-4 w-4 mr-2" />
                  Adicionar Turma
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
