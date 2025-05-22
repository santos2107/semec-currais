"use client"

import type React from "react"

import { useForm, type SubmitHandler, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useStudents } from "@/hooks/useStudents"
import { useAuthStore } from "@/store/authStore"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Upload } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

// Zod Schema para o formulário de aluno
const studentSchema = z.object({
  full_name: z.string().min(3, "Nome completo é obrigatório"),
  social_name: z.string().optional().nullable(),
  birth_date: z.preprocess(
    (arg) => {
      if (typeof arg == "string" || arg instanceof Date) return new Date(arg)
      return null
    },
    z.date({ required_error: "Data de nascimento é obrigatória" }),
  ),
  gender: z.enum(["masculino", "feminino", "outro", "nao_informado"], { required_error: "Gênero é obrigatório" }),
  cpf: z.string().length(11, "CPF deve ter 11 dígitos").optional().nullable(),
  rg: z.string().optional().nullable(),
  rg_issuer: z.string().optional().nullable(),
  nis: z.string().optional().nullable(),
  sus_card: z.string().optional().nullable(),
  nationality: z.string().default("Brasileira"),
  birth_place: z.string().optional().nullable(),
  birth_state: z.string().optional().nullable(),
  ethnicity: z.enum(["branca", "preta", "parda", "amarela", "indigena", "nao_informada"]).default("nao_informada"),
  mother_name: z.string().min(3, "Nome da mãe é obrigatório"),
  father_name: z.string().optional().nullable(),
  guardian_name: z.string().optional().nullable(),
  guardian_phone: z.string().optional().nullable(),
  guardian_email: z.string().email("Email inválido").optional().nullable(),
  address_street: z.string().optional().nullable(),
  address_number: z.string().optional().nullable(),
  address_complement: z.string().optional().nullable(),
  address_neighborhood: z.string().optional().nullable(),
  address_city: z.string().optional().nullable(),
  address_state: z.string().optional().nullable(),
  address_zipcode: z.string().optional().nullable(),
  special_needs: z.boolean().default(false),
  special_needs_description: z.string().optional().nullable(),
  school_id: z.number({ required_error: "Escola é obrigatória" }),
  class_id: z.number().optional().nullable(),
  registration_number: z.string().min(3, "Número de matrícula é obrigatório"),
  status: z.enum(["ativo", "inativo", "transferido", "formado"]).default("ativo"),
  notes: z.string().optional().nullable(),
})

type StudentFormInputs = z.infer<typeof studentSchema>

export default function NewStudentPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const { useCreateStudent, useUploadStudentPhoto } = useStudents()
  const createStudentMutation = useCreateStudent()
  const uploadPhotoMutation = useUploadStudentPhoto()
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<StudentFormInputs>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      gender: "nao_informado",
      ethnicity: "nao_informada",
      nationality: "Brasileira",
      status: "ativo",
      special_needs: false,
      // Se o usuário for de uma escola específica, pré-selecionar a escola
      school_id: user?.school_id || undefined,
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

  const onSubmit: SubmitHandler<StudentFormInputs> = async (data) => {
    try {
      // Criar o aluno
      const student = await createStudentMutation.mutateAsync(data)

      // Se houver uma foto, fazer o upload
      if (photoFile && student.id) {
        await uploadPhotoMutation.mutateAsync({
          file: photoFile,
          studentId: student.id,
        })
      }

      toast({
        title: "Aluno cadastrado com sucesso!",
        description: `O aluno ${data.full_name} foi cadastrado com sucesso.`,
      })

      reset()
      setPhotoFile(null)
      setPhotoPreview(null)

      // Redirecionar para a página de detalhes do aluno
      router.push(`/students/${student.id}`)
    } catch (error: any) {
      toast({
        title: "Erro ao cadastrar aluno",
        description: error.message || "Ocorreu um erro ao cadastrar o aluno. Tente novamente.",
        variant: "destructive",
      })
    }
  }

  const isLoading = createStudentMutation.isPending || uploadPhotoMutation.isPending

  return (
    <div className="container mx-auto p-4 max-w-5xl">
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
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="full_name">
                    Nome Completo *
                  </label>
                  <input
                    {...register("full_name")}
                    id="full_name"
                    className={`input-base ${errors.full_name ? "input-error" : ""}`}
                  />
                  {errors.full_name && <p className="text-red-500 text-xs italic mt-1">{errors.full_name.message}</p>}
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="social_name">
                    Nome Social
                  </label>
                  <input {...register("social_name")} id="social_name" className="input-base" />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="birth_date">
                    Data de Nascimento *
                  </label>
                  <Controller
                    name="birth_date"
                    control={control}
                    render={({ field }) => (
                      <input
                        type="date"
                        id="birth_date"
                        className={`input-base ${errors.birth_date ? "input-error" : ""}`}
                        onChange={(e) => field.onChange(e.target.valueAsDate)}
                        onBlur={field.onBlur}
                        value={field.value instanceof Date ? field.value.toISOString().split("T")[0] : ""}
                        ref={field.ref}
                      />
                    )}
                  />
                  {errors.birth_date && <p className="text-red-500 text-xs italic mt-1">{errors.birth_date.message}</p>}
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="gender">
                    Gênero *
                  </label>
                  <select
                    {...register("gender")}
                    id="gender"
                    className={`input-base ${errors.gender ? "input-error" : ""}`}
                  >
                    <option value="nao_informado">Não Informado</option>
                    <option value="masculino">Masculino</option>
                    <option value="feminino">Feminino</option>
                    <option value="outro">Outro</option>
                  </select>
                  {errors.gender && <p className="text-red-500 text-xs italic mt-1">{errors.gender.message}</p>}
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="cpf">
                    CPF
                  </label>
                  <input
                    {...register("cpf")}
                    id="cpf"
                    placeholder="00000000000"
                    className={`input-base ${errors.cpf ? "input-error" : ""}`}
                  />
                  {errors.cpf && <p className="text-red-500 text-xs italic mt-1">{errors.cpf.message}</p>}
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="rg">
                    RG
                  </label>
                  <input {...register("rg")} id="rg" className="input-base" />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="rg_issuer">
                    Órgão Emissor
                  </label>
                  <input {...register("rg_issuer")} id="rg_issuer" className="input-base" />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="nationality">
                    Nacionalidade
                  </label>
                  <input {...register("nationality")} id="nationality" className="input-base" />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="ethnicity">
                    Etnia
                  </label>
                  <select {...register("ethnicity")} id="ethnicity" className="input-base">
                    <option value="nao_informada">Não Informada</option>
                    <option value="branca">Branca</option>
                    <option value="preta">Preta</option>
                    <option value="parda">Parda</option>
                    <option value="amarela">Amarela</option>
                    <option value="indigena">Indígena</option>
                  </select>
                </div>
              </div>
            </fieldset>

            {/* Filiação */}
            <fieldset className="border border-gray-300 p-4 rounded-md">
              <legend className="text-lg font-semibold px-2">Filiação</legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="mother_name">
                    Nome da Mãe *
                  </label>
                  <input
                    {...register("mother_name")}
                    id="mother_name"
                    className={`input-base ${errors.mother_name ? "input-error" : ""}`}
                  />
                  {errors.mother_name && (
                    <p className="text-red-500 text-xs italic mt-1">{errors.mother_name.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="father_name">
                    Nome do Pai
                  </label>
                  <input {...register("father_name")} id="father_name" className="input-base" />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="guardian_name">
                    Nome do Responsável
                  </label>
                  <input {...register("guardian_name")} id="guardian_name" className="input-base" />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="guardian_phone">
                    Telefone do Responsável
                  </label>
                  <input {...register("guardian_phone")} id="guardian_phone" className="input-base" />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="guardian_email">
                    Email do Responsável
                  </label>
                  <input
                    {...register("guardian_email")}
                    id="guardian_email"
                    type="email"
                    className={`input-base ${errors.guardian_email ? "input-error" : ""}`}
                  />
                  {errors.guardian_email && (
                    <p className="text-red-500 text-xs italic mt-1">{errors.guardian_email.message}</p>
                  )}
                </div>
              </div>
            </fieldset>

            {/* Endereço */}
            <fieldset className="border border-gray-300 p-4 rounded-md">
              <legend className="text-lg font-semibold px-2">Endereço</legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="address_street">
                    Rua
                  </label>
                  <input {...register("address_street")} id="address_street" className="input-base" />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="address_number">
                    Número
                  </label>
                  <input {...register("address_number")} id="address_number" className="input-base" />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="address_complement">
                    Complemento
                  </label>
                  <input {...register("address_complement")} id="address_complement" className="input-base" />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="address_neighborhood">
                    Bairro
                  </label>
                  <input {...register("address_neighborhood")} id="address_neighborhood" className="input-base" />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="address_city">
                    Cidade
                  </label>
                  <input {...register("address_city")} id="address_city" className="input-base" />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="address_state">
                    Estado
                  </label>
                  <input {...register("address_state")} id="address_state" className="input-base" />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="address_zipcode">
                    CEP
                  </label>
                  <input {...register("address_zipcode")} id="address_zipcode" className="input-base" />
                </div>
              </div>
            </fieldset>

            {/* Necessidades Especiais */}
            <fieldset className="border border-gray-300 p-4 rounded-md">
              <legend className="text-lg font-semibold px-2">Necessidades Especiais</legend>
              <div className="mt-4">
                <div className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    id="special_needs"
                    {...register("special_needs")}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="special_needs" className="ml-2 block text-gray-700">
                    Possui necessidades especiais
                  </label>
                </div>
                {specialNeeds && (
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="special_needs_description">
                      Descrição das necessidades especiais
                    </label>
                    <textarea
                      {...register("special_needs_description")}
                      id="special_needs_description"
                      rows={3}
                      className="input-base"
                    />
                  </div>
                )}
              </div>
            </fieldset>

            {/* Dados Escolares */}
            <fieldset className="border border-gray-300 p-4 rounded-md">
              <legend className="text-lg font-semibold px-2">Dados Escolares</legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="school_id">
                    Escola *
                  </label>
                  <select
                    {...register("school_id", { valueAsNumber: true })}
                    id="school_id"
                    className={`input-base ${errors.school_id ? "input-error" : ""}`}
                    disabled={!!user?.school_id} // Desabilitar se o usuário já estiver vinculado a uma escola
                  >
                    <option value="">Selecione uma escola</option>
                    {/* Aqui você pode adicionar um loop para listar as escolas */}
                    <option value="1">Escola Municipal 1</option>
                    <option value="2">Escola Municipal 2</option>
                  </select>
                  {errors.school_id && <p className="text-red-500 text-xs italic mt-1">{errors.school_id.message}</p>}
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="class_id">
                    Turma
                  </label>
                  <select {...register("class_id", { valueAsNumber: true })} id="class_id" className="input-base">
                    <option value="">Selecione uma turma</option>
                    {/* Aqui você pode adicionar um loop para listar as turmas da escola selecionada */}
                    <option value="1">1º Ano A</option>
                    <option value="2">2º Ano B</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="registration_number">
                    Número de Matrícula *
                  </label>
                  <input
                    {...register("registration_number")}
                    id="registration_number"
                    className={`input-base ${errors.registration_number ? "input-error" : ""}`}
                  />
                  {errors.registration_number && (
                    <p className="text-red-500 text-xs italic mt-1">{errors.registration_number.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="status">
                    Status
                  </label>
                  <select {...register("status")} id="status" className="input-base">
                    <option value="ativo">Ativo</option>
                    <option value="inativo">Inativo</option>
                    <option value="transferido">Transferido</option>
                    <option value="formado">Formado</option>
                  </select>
                </div>
              </div>
            </fieldset>

            {/* Observações */}
            <fieldset className="border border-gray-300 p-4 rounded-md">
              <legend className="text-lg font-semibold px-2">Observações</legend>
              <div className="mt-4">
                <textarea
                  {...register("notes")}
                  id="notes"
                  rows={4}
                  className="input-base"
                  placeholder="Informações adicionais sobre o aluno..."
                />
              </div>
            </fieldset>

            <div className="flex items-center justify-end gap-4 mt-8">
              <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
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
