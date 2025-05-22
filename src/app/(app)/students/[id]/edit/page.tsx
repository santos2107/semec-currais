"use client"

import type React from "react"

import { useParams, useRouter } from "next/navigation"
import { useForm, type SubmitHandler, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useState, useEffect } from "react"
import { useStudents } from "@/hooks/useStudents"
import { useAuthStore } from "@/store/authStore"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Upload, ArrowLeft } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

// Zod Schema para o formulário de aluno (mesmo schema da página de criação)
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

export default function EditStudentPage() {
  const params = useParams()
  const router = useRouter()
  const studentId = Number(params.id)
  const { user } = useAuthStore()
  const { useStudent, useUpdateStudent, useUploadStudentPhoto } = useStudents()
  const { data: student, isLoading: isLoadingStudent } = useStudent(studentId)
  const updateStudentMutation = useUpdateStudent()
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
    setValue,
  } = useForm<StudentFormInputs>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      gender: "nao_informado",
      ethnicity: "nao_informada",
      nationality: "Brasileira",
      status: "ativo",
      special_needs: false,
      school_id: user?.school_id || undefined,
    },
  })

  // Atualizar o formulário quando os dados do aluno forem carregados
  useEffect(() => {
    if (student) {
      // Converter os dados do aluno para o formato do formulário
      const formData: Partial<StudentFormInputs> = {
        ...student,
        birth_date: student.birth_date ? new Date(student.birth_date) : undefined,
        school_id: student.school_id,
        class_id: student.class_id || undefined,
      }

      // Preencher o formulário com os dados do aluno
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          setValue(key as any, value)
        }
      })

      // Definir o preview da foto se existir
      if (student.photo_url) {
        setPhotoPreview(student.photo_url)
      }
    }
  }, [student, setValue])

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
      // Atualizar o aluno
      await updateStudentMutation.mutateAsync({
        id: studentId,
        data,
      })

      // Se houver uma nova foto, fazer o upload
      if (photoFile) {
        await uploadPhotoMutation.mutateAsync({
          file: photoFile,
          studentId,
        })
      }

      toast({
        title: "Aluno atualizado com sucesso!",
        description: `Os dados do aluno ${data.full_name} foram atualizados.`,
      })

      // Redirecionar para a página de detalhes do aluno
      router.push(`/students/${studentId}`)
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar aluno",
        description: error.message || "Ocorreu um erro ao atualizar o aluno. Tente novamente.",
        variant: "destructive",
      })
    }
  }

  const isLoading = isLoadingStudent || updateStudentMutation.isPending || uploadPhotoMutation.isPending

  if (isLoadingStudent) {
    return (
      <div className="container mx-auto p-4 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
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
          <CardTitle className="text-2xl font-bold">Editar Aluno</CardTitle>
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
                <span>Alterar Foto</span>
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

                {/* Outros campos de dados pessoais (mesmos da página de criação) */}
                {/* ... */}
              </div>
            </fieldset>

            {/* Outros fieldsets (mesmos da página de criação) */}
            {/* ... */}

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
                  "Salvar Alterações"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
