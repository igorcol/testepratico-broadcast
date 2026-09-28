import { useState, type FormEvent } from 'react'
import type { z } from 'zod'

type FieldErrors = Partial<Record<string, string>>

interface UseFormSubmitOptions<TValues> {
  schema: z.ZodType<TValues>
  onSubmit: (values: TValues) => Promise<unknown>
  getErrorMessage: (error: unknown) => string
}

const toFieldErrors = (error: z.ZodError): FieldErrors =>
  error.issues.reduce<FieldErrors>((fieldErrors, issue) => {
    const fieldName = issue.path[0]
    if (typeof fieldName !== 'string' || fieldErrors[fieldName]) return fieldErrors
    return { ...fieldErrors, [fieldName]: issue.message }
  }, {})

export const useFormSubmit = <TValues>({
  schema,
  onSubmit,
  getErrorMessage,
}: UseFormSubmitOptions<TValues>) => {
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isSubmitting) return

    const formValues = Object.fromEntries(new FormData(event.currentTarget))
    const parsed = schema.safeParse(formValues)

    if (!parsed.success) {
      setFieldErrors(toFieldErrors(parsed.error))
      return
    }

    setFieldErrors({})
    setFormError('')
    setIsSubmitting(true)

    try {
      await onSubmit(parsed.data)
    } catch (error) {
      setFormError(getErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  return { handleSubmit, fieldErrors, formError, isSubmitting }
}