"use client"

import { useState } from "react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/lib/supabaseClient"
import { useAuthStore } from "@/store/authStore"
import type { School } from "@/types"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SchoolIcon, Search, Plus, Edit, Trash2, Mail, Phone, MapPin, User } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function SchoolsPage() {
  const { profile } = useAuthStore()
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()
  const supabase = createClient()

  const {
    data: schools,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["schools"],
    queryFn: async () => {
      const { data, error } = await supabase.from("schools").select("*")
      if (error) throw error
      return data as School[]
    },
  })

  const handleDeleteSchool = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir esta escola?")) return

    try {
      const { error } = await supabase.from("schools").delete().eq("id", id)

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

      refetch()
    } catch (error: any) {
      toast({
        title: "Erro ao excluir escola",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const filteredSchools = schools?.filter(
    (school) =>
      school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      school.inep_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      school.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      school.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const canManageSchools = profile?.role === "admin_municipal"

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Escolas</h1>
          <p className="text-gray-500 mt-1">Gerencie as escolas do município</p>
        </div>

        {canManageSchools && (
          <Button asChild>
            <Link href="/schools/new">
              <Plus className="h-4 w-4 mr-2" />
              Nova Escola
            </Link>
          </Button>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Buscar escolas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="h-32 bg-gray-200 animate-pulse" />
              <CardHeader>
                <div className="h-6 bg-gray-200 animate-pulse rounded w-3/4" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 animate-pulse rounded" />
                  <div className="h-4 bg-gray-200 animate-pulse rounded" />
                  <div className="h-4 bg-gray-200 animate-pulse rounded w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">
          Erro ao carregar escolas: {(error as Error).message}
        </div>
      ) : filteredSchools && filteredSchools.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredSchools.map((school) => (
            <Card key={school.id} className="overflow-hidden">
              <div className="h-32 bg-blue-50 flex items-center justify-center">
                <SchoolIcon className="h-16 w-16 text-blue-200" />
              </div>
              <CardHeader>
                <CardTitle>{school.name}</CardTitle>
                {school.inep_code && <p className="text-sm text-gray-500">Código INEP: {school.inep_code}</p>}
              </CardHeader>
              <CardContent className="space-y-2">
                {school.address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                    <span className="text-sm text-gray-600">{school.address}</span>
                  </div>
                )}

                {school.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{school.email}</span>
                  </div>
                )}

                {school.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{school.phone}</span>
                  </div>
                )}

                {school.director_profile_id && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Diretor: {school.director_profile_id}</span>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-4">
                <Button variant="outline" asChild>
                  <Link href={`/schools/${school.id}`}>Ver Detalhes</Link>
                </Button>

                {canManageSchools && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" asChild>
                      <Link href={`/schools/${school.id}/edit`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDeleteSchool(school.id!)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <SchoolIcon className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhuma escola encontrada</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm
              ? `Não encontramos escolas correspondentes a "${searchTerm}"`
              : "Não há escolas cadastradas no sistema ainda"}
          </p>
          {canManageSchools && (
            <Button asChild>
              <Link href="/schools/new">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Escola
              </Link>
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
