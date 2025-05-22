"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Loader2, Upload } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

// Esquema de validação
const studentSchema = z.object({
  full_name: z.string().min(3, "Nome completo é obrigatório"),
  social_name: z.string().optional(),
  birth_date: z.string().min(1, "Data de nascimento é obrigatória"),
  gender: z.enum(["masculino", "feminino", "outro", "nao_informado"]),
  cpf: z.string().optional(),
  rg: z.string().optional(),
  mother_name: z.string().min(3, "Nome da mãe é obrigatório"),
  father_name: z.string().optional(),
  guardian_name: z.string().optional(),
  guardian_phone: z.string().optional(),
  guardian_email: z.string().email("Email inválido").optional().or(z.literal("")),
  address_street: z.string().optional(),
  address_number: z.string().optional(),
  address_neighborhood: z.string().optional(),
  address_city: z.string().optional(),
  address_state: z.string().optional(),
  address_zipcode: z.string().optional(),
  special_needs: z.boolean().default(false),
  special_needs_description: z.string().optional(),
  school_id: z.string().min(1, "Escola é obrigatória"),
  class_id: z.string().optional(),
  registration_number: z.string().min(3, "Número de matrícula é obrigatório"),
  status: z.enum(["ativo", "inativo", "transferido", "formado"]),
  notes: z.string().optional(),
})

type StudentFormValues = z.infer<typeof studentSchema>

export default function NewStudentPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      gender: "nao_informado",
      status: "ativo",
      special_needs: false,
    },
  })

  const specialNeeds = watch("special_needs")

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setPhotoFile(file)

      // Criar preview da imagem
      const reader = new FileReader()
      reader.onload = (event) => {
        setPhotoPreview(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const onSubmit = async (data: StudentFormValues) => {
    setIsSubmitting(true)
    try {
      // Simulação de envio de dados
      console.log("Dados do aluno:", data)
      console.log("Foto:", photoFile)

      // Aguardar um pouco para simular o envio
      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast({
        title: "Aluno cadastrado com sucesso!",
        description: `O aluno ${data.full_name} foi cadastrado com sucesso.`,
      })

      // Redirecionar para a lista de alunos
      router.push("/students")
    } catch (error) {
      console.error("Erro ao cadastrar aluno:", error)
      toast({
        title: "Erro ao cadastrar aluno",
        description: "Ocorreu um erro ao cadastrar o aluno. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <div className="mb-6">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Cadastrar Novo Aluno</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Foto do Aluno */}
            <div className="flex flex-col items-center mb-6">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 mb-2">
                {photoPreview ? (
                  <img src={photoPreview || "/placeholder.svg"} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">Sem foto</div>
                )}
              </div>
              <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md inline-flex items-center">
                <Upload className="mr-2 h-4 w-4" />
                <span>Selecionar Foto</span>
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
              </label>
            </div>

            {/* Dados Pessoais */}
            <fieldset className="border border-gray-300 p-4 rounded-md">
              <legend className="text-lg font-semibold px-2">Dados Pessoais</legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div>
                  <Label htmlFor="full_name" className="block text-sm font-medium mb-1">
                    Nome Completo *
                  </Label>
                  <Input
                    id="full_name"
                    {...register("full_name")}
                    className={errors.full_name ? "border-red-500" : ""}
                  />
                  {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name.message}</p>}
                </div>

                <div>
                  <Label htmlFor="social_name" className="block text-sm font-medium mb-1">
                    Nome Social
                  </Label>
                  <Input id="social_name" {...register("social_name")} />
                </div>

                <div>
                  <Label htmlFor="birth_date" className="block text-sm font-medium mb-1">
                    Data de Nascimento *
                  </Label>
                  <Input
                    id="birth_date"
                    type="date"
                    {...register("birth_date")}
                    className={errors.birth_date ? "border-red-500" : ""}
                  />
                  {errors.birth_date && <p className="text-red-500 text-xs mt-1">{errors.birth_date.message}</p>}
                </div>

                <div>
                  <Label htmlFor="gender" className="block text-sm font-medium mb-1">
                    Gênero *
                  </Label>
                  <Controller
                    name="gender"
                    control={control}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                        disabled={isSubmitting}
                      >
                        <SelectTrigger className={errors.gender ? "border-red-500" : ""}>
                          <SelectValue placeholder="Selecione o gênero" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="nao_informado">Não Informado</SelectItem>
                          <SelectItem value="masculino">Masculino</SelectItem>
                          <SelectItem value="feminino">Feminino</SelectItem>
                          <SelectItem value="outro">Outro</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender.message}</p>}
                </div>

                <div>
                  <Label htmlFor="cpf" className="block text-sm font-medium mb-1">
                    CPF
                  </Label>
                  <Input id="cpf" {...register("cpf")} placeholder="000.000.000-00" />
                </div>

                <div>
                  <Label htmlFor="rg" className="block text-sm font-medium mb-1">
                    RG
                  </Label>
                  <Input id="rg" {...register("rg")} />
                </div>
              </div>
            </fieldset>

            {/* Filiação */}
            <fieldset className="border border-gray-300 p-4 rounded-md">
              <legend className="text-lg font-semibold px-2">Filiação</legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div>
                  <Label htmlFor="mother_name" className="block text-sm font-medium mb-1">
                    Nome da Mãe *
                  </Label>
                  <Input
                    id="mother_name"
                    {...register("mother_name")}
                    className={errors.mother_name ? "border-red-500" : ""}
                  />
                  {errors.mother_name && <p className="text-red-500 text-xs mt-1">{errors.mother_name.message}</p>}
                </div>

                <div>
                  <Label htmlFor="father_name" className="block text-sm font-medium mb-1">
                    Nome do Pai
                  </Label>
                  <Input id="father_name" {...register("father_name")} />
                </div>

                <div>
                  <Label htmlFor="guardian_name" className="block text-sm font-medium mb-1">
                    Nome do Responsável
                  </Label>
                  <Input id="guardian_name" {...register("guardian_name")} />
                </div>

                <div>
                  <Label htmlFor="guardian_phone" className="block text-sm font-medium mb-1">
                    Telefone do Responsável
                  </Label>
                  <Input id="guardian_phone" {...register("guardian_phone")} />
                </div>

                <div>
                  <Label htmlFor="guardian_email" className="block text-sm font-medium mb-1">
                    Email do Responsável
                  </Label>
                  <Input
                    id="guardian_email"
                    type="email"
                    {...register("guardian_email")}
                    className={errors.guardian_email ? "border-red-500" : ""}
                  />
                  {errors.guardian_email && (
                    <p className="text-red-500 text-xs mt-1">{errors.guardian_email.message}</p>
                  )}
                </div>
              </div>
            </fieldset>

            {/* Endereço */}
            <fieldset className="border border-gray-300 p-4 rounded-md">
              <legend className="text-lg font-semibold px-2">Endereço</legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div>
                  <Label htmlFor="address_street" className="block text-sm font-medium mb-1">
                    Rua
                  </Label>
                  <Input id="address_street" {...register("address_street")} />
                </div>

                <div>
                  <Label htmlFor="address_number" className="block text-sm font-medium mb-1">
                    Número
                  </Label>
                  <Input id="address_number" {...register("address_number")} />
                </div>

                <div>
                  <Label htmlFor="address_neighborhood" className="block text-sm font-medium mb-1">
                    Bairro
                  </Label>
                  <Input id="address_neighborhood" {...register("address_neighborhood")} />
                </div>

                <div>
                  <Label htmlFor="address_city" className="block text-sm font-medium mb-1">
                    Cidade
                  </Label>
                  <Input id="address_city" {...register("address_city")} />
                </div>

                <div>
                  <Label htmlFor="address_state" className="block text-sm font-medium mb-1">
                    Estado
                  </Label>
                  <Input id="address_state" {...register("address_state")} />
                </div>

                <div>
                  <Label htmlFor="address_zipcode" className="block text-sm font-medium mb-1">
                    CEP
                  </Label>
                  <Input id="address_zipcode" {...register("address_zipcode")} placeholder="00000-000" />
                </div>
              </div>
            </fieldset>

            {/* Necessidades Especiais */}
            <fieldset className="border border-gray-300 p-4 rounded-md">
              <legend className="text-lg font-semibold px-2">Necessidades Especiais</legend>
              <div className="mt-4">
                <div className="flex items-center space-x-2">
                  <Controller
                    name="special_needs"
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        id="special_needs"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isSubmitting}
                      />
                    )}
                  />
                  <Label htmlFor="special_needs">Possui necessidades especiais</Label>
                </div>

                {specialNeeds && (
                  <div className="mt-4">
                    <Label htmlFor="special_needs_description" className="block text-sm font-medium mb-1">
                      Descrição das necessidades especiais
                    </Label>
                    <Textarea id="special_needs_description" {...register("special_needs_description")} rows={3} />
                  </div>
                )}
              </div>
            </fieldset>

            {/* Dados Escolares */}
            <fieldset className="border border-gray-300 p-4 rounded-md">
              <legend className="text-lg font-semibold px-2">Dados Escolares</legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div>
                  <Label htmlFor="school_id" className="block text-sm font-medium mb-1">
                    Escola *
                  </Label>
                  <Controller
                    name="school_id"
                    control={control}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                        disabled={isSubmitting}
                      >
                        <SelectTrigger className={errors.school_id ? "border-red-500" : ""}>
                          <SelectValue placeholder="Selecione a escola" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Escola Municipal 1</SelectItem>
                          <SelectItem value="2">Escola Municipal 2</SelectItem>
                          <SelectItem value="3">Escola Municipal 3</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.school_id && <p className="text-red-500 text-xs mt-1">{errors.school_id.message}</p>}
                </div>

                <div>
                  <Label htmlFor="class_id" className="block text-sm font-medium mb-1">
                    Turma
                  </Label>
                  <Controller
                    name="class_id"
                    control={control}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                        disabled={isSubmitting}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a turma" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1º Ano A</SelectItem>
                          <SelectItem value="2">2º Ano B</SelectItem>
                          <SelectItem value="3">3º Ano A</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div>
                  <Label htmlFor="registration_number" className="block text-sm font-medium mb-1">
                    Número de Matrícula *
                  </Label>
                  <Input
                    id="registration_number"
                    {...register("registration_number")}
                    className={errors.registration_number ? "border-red-500" : ""}
                  />
                  {errors.registration_number && (
                    <p className="text-red-500 text-xs mt-1">{errors.registration_number.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="status" className="block text-sm font-medium mb-1">
                    Status
                  </Label>
                  <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                        disabled={isSubmitting}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ativo">Ativo</SelectItem>
                          <SelectItem value="inativo">Inativo</SelectItem>
                          <SelectItem value="transferido">Transferido</SelectItem>
                          <SelectItem value="formado">Formado</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>
            </fieldset>

            {/* Observações */}
            <fieldset className="border border-gray-300 p-4 rounded-md">
              <legend className="text-lg font-semibold px-2">Observações</legend>
              <div className="mt-4">
                <Textarea
                  id="notes"
                  {...register("notes")}
                  rows={4}
                  placeholder="Informações adicionais sobre o aluno..."
                />
              </div>
            </fieldset>

            <div className="flex items-center justify-end gap-4 mt-8">
              <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar Aluno"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
