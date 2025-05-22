"use client"

import { useState } from "react"
import { useForm, type SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter } from "next/navigation"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createSchool } from "@/services/schoolService"
import type { School } from "@/types"
import { ArrowLeftIcon } from "@heroicons/react/24/outline"
import { useAuthStore } from "@/store/authStore"

const schoolSchema = z.object({
  name: z.string().min(3, "Nome da escola é obrigatório (mínimo 3 caracteres)"),
  inep_code: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email("Email inválido").optional().nullable(),
})

type SchoolFormInputs = Omit<School, "id" | "created_at" | "updated_at" | "director_profile_id">

export default function NewSchoolPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<SchoolFormInputs>({
    resolver: zodResolver(schoolSchema),
    defaultValues: {
      name: "",
      inep_code: "",
      address: "",
      phone: "",
      email: "",
    },
  })

  const mutation = useMutation({
    mutationFn: createSchool,
    onSuccess: (data) => {
      console.log("Escola criada:", data)
      queryClient.invalidateQueries({ queryKey: ["schools"] })
      setShowSuccessMessage(true)
      reset()

      // Redirecionar após um breve delay para mostrar a mensagem de sucesso
      setTimeout(() => {
        router.push("/schools")
      }, 2000)
    },
    onError: (error: any) => {
      console.error("Erro ao criar escola:", error)
    },
  })

  const onSubmit: SubmitHandler<SchoolFormInputs> = (data) => {
    mutation.mutate(data)
  }

  return (
    <div>
      <div className="mb-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-primary-600"
        >
          <ArrowLeftIcon className="mr-1 h-4 w-4" />
          Voltar para lista de escolas
        </button>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Nova Escola</h1>
      </div>

      {showSuccessMessage && (
        <div className="mb-6 rounded-md bg-green-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-green-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">Escola criada com sucesso! Redirecionando...</p>
            </div>
          </div>
        </div>
      )}

      {mutation.isError && (
        <div className="mb-6 rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">
                {(mutation.error as any)?.message ||
                  "Ocorreu um erro ao criar a escola. Verifique se você tem permissão (admin municipal)."}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-lg bg-white shadow">
        <form onSubmit={handleSubmit(onSubmit)} className="divide-y divide-gray-200">
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Nome da Escola <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    id="name"
                    {...register("name")}
                    autoComplete="organization"
                    className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${
                      errors.name ? "border-red-300" : ""
                    }`}
                    aria-invalid={errors.name ? "true" : "false"}
                    aria-describedby={errors.name ? "name-error" : undefined}
                  />
                </div>
                {errors.name && (
                  <p className="mt-2 text-sm text-red-600" id="name-error">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="inep_code" className="block text-sm font-medium text-gray-700">
                  Código INEP
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    id="inep_code"
                    {...register("inep_code")}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  />
                </div>
              </div>

              <div className="sm:col-span-6">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                  Endereço
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    id="address"
                    {...register("address")}
                    autoComplete="street-address"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Telefone
                </label>
                <div className="mt-1">
                  <input
                    type="tel"
                    id="phone"
                    {...register("phone")}
                    autoComplete="tel"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <div className="mt-1">
                  <input
                    type="email"
                    id="email"
                    {...register("email")}
                    autoComplete="email"
                    className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${
                      errors.email ? "border-red-300" : ""
                    }`}
                    aria-invalid={errors.email ? "true" : "false"}
                    aria-describedby={errors.email ? "email-error" : undefined}
                  />
                </div>
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600" id="email-error">
                    {errors.email.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="px-4 py-3 text-right sm:px-6">
            <button
              type="button"
              onClick={() => router.back()}
              className="mr-3 inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || mutation.isPending || showSuccessMessage}
              className="inline-flex justify-center rounded-md border border-transparent bg-primary-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {mutation.isPending ? "Salvando..." : "Salvar Escola"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
