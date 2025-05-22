"use client"

import { useParams, useRouter } from "next/navigation"
import { useStudents } from "@/hooks/useStudents"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Edit, ArrowLeft, User, Book, Calendar, FileText } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export default function StudentDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const studentId = Number(params.id)

  const { useStudent } = useStudents()
  const { data: student, isLoading, isError } = useStudent(studentId)

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (isError || !student) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-500 py-8">
              Erro ao carregar os dados do aluno. Tente novamente mais tarde.
            </div>
            <div className="flex justify-center mt-4">
              <Button onClick={() => router.back()}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
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

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "-"
    try {
      return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR })
    } catch (error) {
      return dateString
    }
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 flex items-center justify-between">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <Button onClick={() => router.push(`/students/${studentId}/edit`)}>
          <Edit className="mr-2 h-4 w-4" />
          Editar Aluno
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="md:col-span-1">
          <CardContent className="pt-6 flex flex-col items-center">
            <Avatar className="h-32 w-32 mb-4">
              <AvatarImage src={student.photo_url || ""} alt={student.profiles?.full_name || "Aluno"} />
              <AvatarFallback className="text-4xl">{student.profiles?.full_name?.charAt(0) || "A"}</AvatarFallback>
            </Avatar>
            <h2 className="text-2xl font-bold text-center mb-2">{student.profiles?.full_name}</h2>
            {student.social_name && <p className="text-gray-500 mb-2">Nome social: {student.social_name}</p>}
            <Badge className={`${getStatusColor(student.status)} mb-4`}>
              {student.status === "ativo"
                ? "Ativo"
                : student.status === "inativo"
                  ? "Inativo"
                  : student.status === "transferido"
                    ? "Transferido"
                    : "Formado"}
            </Badge>
            <div className="w-full">
              <div className="flex justify-between py-2 border-b">
                <span className="font-semibold">Matrícula:</span>
                <span>{student.registration_number}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="font-semibold">Escola:</span>
                <span>{student.schools?.name || "-"}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="font-semibold">Turma:</span>
                <span>{student.classes?.name || "-"}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="font-semibold">Data de Nascimento:</span>
                <span>{formatDate(student.birth_date)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="font-semibold">Gênero:</span>
                <span>
                  {student.gender === "masculino"
                    ? "Masculino"
                    : student.gender === "feminino"
                      ? "Feminino"
                      : student.gender === "outro"
                        ? "Outro"
                        : "Não informado"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardContent className="pt-6">
            <Tabs defaultValue="personal">
              <TabsList className="mb-4">
                <TabsTrigger value="personal">
                  <User className="mr-2 h-4 w-4" />
                  Dados Pessoais
                </TabsTrigger>
                <TabsTrigger value="academic">
                  <Book className="mr-2 h-4 w-4" />
                  Dados Escolares
                </TabsTrigger>
                <TabsTrigger value="attendance">
                  <Calendar className="mr-2 h-4 w-4" />
                  Frequência
                </TabsTrigger>
                <TabsTrigger value="documents">
                  <FileText className="mr-2 h-4 w-4" />
                  Documentos
                </TabsTrigger>
              </TabsList>

              <TabsContent value="personal">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Informações Pessoais</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">CPF:</span>
                        <span>{student.cpf || "-"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">RG:</span>
                        <span>{student.rg || "-"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Órgão Emissor:</span>
                        <span>{student.rg_issuer || "-"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Nacionalidade:</span>
                        <span>{student.nationality || "Brasileira"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Etnia:</span>
                        <span>
                          {student.ethnicity === "branca"
                            ? "Branca"
                            : student.ethnicity === "preta"
                              ? "Preta"
                              : student.ethnicity === "parda"
                                ? "Parda"
                                : student.ethnicity === "amarela"
                                  ? "Amarela"
                                  : student.ethnicity === "indigena"
                                    ? "Indígena"
                                    : "Não informada"}
                        </span>
                      </div>
                    </div>

                    <h3 className="text-lg font-semibold pt-4">Filiação</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">Nome da Mãe:</span>
                        <span>{student.mother_name || "-"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Nome do Pai:</span>
                        <span>{student.father_name || "-"}</span>
                      </div>
                    </div>

                    <h3 className="text-lg font-semibold pt-4">Responsável</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">Nome:</span>
                        <span>{student.guardian_name || "-"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Telefone:</span>
                        <span>{student.guardian_phone || "-"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Email:</span>
                        <span>{student.guardian_email || "-"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Endereço</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">Rua:</span>
                        <span>{student.address_street || "-"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Número:</span>
                        <span>{student.address_number || "-"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Complemento:</span>
                        <span>{student.address_complement || "-"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Bairro:</span>
                        <span>{student.address_neighborhood || "-"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Cidade:</span>
                        <span>{student.address_city || "-"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Estado:</span>
                        <span>{student.address_state || "-"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">CEP:</span>
                        <span>{student.address_zipcode || "-"}</span>
                      </div>
                    </div>

                    <h3 className="text-lg font-semibold pt-4">Necessidades Especiais</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">Possui:</span>
                        <span>{student.special_needs ? "Sim" : "Não"}</span>
                      </div>
                      {student.special_needs && (
                        <div>
                          <span className="font-medium">Descrição:</span>
                          <p className="mt-1">{student.special_needs_description || "-"}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {student.notes && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold">Observações</h3>
                    <p className="mt-1">{student.notes}</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="academic">
                <div className="text-center text-gray-500 py-8">Dados escolares serão implementados em breve.</div>
              </TabsContent>

              <TabsContent value="attendance">
                <div className="text-center text-gray-500 py-8">Registro de frequência será implementado em breve.</div>
              </TabsContent>

              <TabsContent value="documents">
                <div className="text-center text-gray-500 py-8">Documentos do aluno serão implementados em breve.</div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
