"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Edit, ArrowLeft, User, Book, Calendar, FileText } from "lucide-react"

// Dados de exemplo para demonstração
const mockStudent = {
  id: 1,
  full_name: "Ana Silva",
  social_name: "",
  birth_date: "2010-05-15",
  gender: "feminino",
  cpf: "12345678900",
  rg: "1234567",
  rg_issuer: "SSP",
  mother_name: "Maria Silva",
  father_name: "José Silva",
  guardian_name: "Maria Silva",
  guardian_phone: "(86) 99999-9999",
  guardian_email: "maria.silva@example.com",
  address_street: "Rua das Flores",
  address_number: "123",
  address_neighborhood: "Centro",
  address_city: "Currais",
  address_state: "PI",
  address_zipcode: "64905-000",
  special_needs: false,
  special_needs_description: "",
  school_id: 1,
  school_name: "Escola Municipal 1",
  class_id: 2,
  class_name: "5º Ano A",
  registration_number: "2024001",
  status: "ativo",
  notes: "Aluna dedicada e participativa.",
  photo_url: "",
}

export default function StudentDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const studentId = params.id
  const [student, setStudent] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulação de carregamento de dados
    const loadStudent = async () => {
      setIsLoading(true)
      try {
        // Simular uma chamada à API
        await new Promise((resolve) => setTimeout(resolve, 1000))
        setStudent(mockStudent)
      } catch (error) {
        console.error("Erro ao carregar dados do aluno:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadStudent()
  }, [studentId])

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!student) {
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-"
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("pt-BR")
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
              <AvatarImage src={student.photo_url || ""} alt={student.full_name} />
              <AvatarFallback className="text-4xl">{student.full_name.charAt(0)}</AvatarFallback>
            </Avatar>
            <h2 className="text-2xl font-bold text-center mb-2">{student.full_name}</h2>
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
                <span>{student.school_name}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="font-semibold">Turma:</span>
                <span>{student.class_name}</span>
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
