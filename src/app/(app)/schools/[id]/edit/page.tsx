"use client"

import { useRouter } from "next/navigation"
import { useSchools } from "@/hooks/useSchools"
import SchoolForm from "@/components/forms/SchoolForm"
import type { SchoolUpdateInput } from "@/types"

export default function EditSchoolPage({ params }: { params: { id: string } }) {
  const schoolId = Number.parseInt(params.id)
  const router = useRouter()
  const { useSchoolQuery, useUpdateSchoolMutation } = useSchools()
  const { data: school, isLoading, error } = useSchoolQuery(schoolId)
  const updateSchoolMutation = useUpdateSchoolMutation()

  const handleSubmit = async (data: SchoolUpdateInput) => {
    try {
      await updateSchoolMutation.mutateAsync({ id: schoolId, data })
      router.push("/schools")
    } catch (error) {
      console.error("Error updating school:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error || !school) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-red-500"
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
            <p className="text-sm text-red-700">Escola não encontrada ou erro ao carregar dados.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Editar Escola</h1>
      <SchoolForm initialData={school} onSubmit={handleSubmit} isSubmitting={updateSchoolMutation.isPending} />
    </div>
  )
}
