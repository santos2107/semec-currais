"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import type { School } from "@/types"

const schoolSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  inep_code: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  email: z.string().email("Email inválido").nullable().optional(),
  director_profile_id: z.string().nullable().optional(),
})

type SchoolFormData = z.infer<typeof schoolSchema>

interface SchoolFormProps {
  initialData?: School
  onSubmit: (data: SchoolFormData) => void
  isSubmitting: boolean
  directors?: { id: string; full_name: string }[]
}

export default function SchoolForm({ initialData, onSubmit, isSubmitting, directors = [] }: SchoolFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SchoolFormData>({
    resolver: zodResolver(schoolSchema),
    defaultValues: initialData || {
      name: "",
      inep_code: "",
      address: "",
      phone: "",
      email: "",
      director_profile_id: "",
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Informações da Escola</h3>
            <p className="mt-1 text-sm text-gray-500">
              Preencha as informações básicas da escola. Apenas o nome é obrigatório.
            </p>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2">
            <div className="grid grid-cols-6 gap-6">
              <div className="col-span-6 sm:col-span-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Nome da Escola*
                </label>
                <input
                  type="text"
                  id="name"
                  {...register("name")}
                  className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
              </div>

              <div className="col-span-6 sm:col-span-2">
                <label htmlFor="inep_code" className="block text-sm font-medium text-gray-700">
                  Código INEP
                </label>
                <input
                  type="text"
                  id="inep_code"
                  {...register("inep_code")}
                  className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
                {errors.inep_code && <p className="mt-1 text-sm text-red-600">{errors.inep_code.message}</p>}
              </div>

              <div className="col-span-6">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                  Endereço
                </label>
                <input
                  type="text"
                  id="address"
                  {...register("address")}
                  className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
                {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>}
              </div>

              <div className="col-span-6 sm:col-span-3">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Telefone
                </label>
                <input
                  type="text"
                  id="phone"
                  {...register("phone")}
                  className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
                {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>}
              </div>

              <div className="col-span-6 sm:col-span-3">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  {...register("email")}
                  className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
              </div>

              <div className="col-span-6 sm:col-span-3">
                <label htmlFor="director_profile_id" className="block text-sm font-medium text-gray-700">
                  Diretor(a)
                </label>
                <select
                  id="director_profile_id"
                  {...register("director_profile_id")}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                >
                  <option value="">Selecione um diretor</option>
                  {directors.map((director) => (
                    <option key={director.id} value={director.id}>
                      {director.full_name}
                    </option>
                  ))}
                </select>
                {errors.director_profile_id && (
                  <p className="mt-1 text-sm text-red-600">{errors.director_profile_id.message}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
        >
          {isSubmitting ? "Salvando..." : initialData ? "Atualizar" : "Salvar"}
        </button>
      </div>
    </form>
  )
}
