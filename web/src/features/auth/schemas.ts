import { z } from 'zod'

// Email
const emailField = z
  .string()
  .trim()
  .min(1, 'Informe o e-mail.')
  .pipe(z.email('E-mail inválido.'))

// Login
export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, 'Informe a senha.'),
})

// Registro
export const registerSchema = z
  .object({
    email: emailField,
    password: z.string().min(6, 'A senha precisa ter pelo menos 6 caracteres.'),
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'As senhas não coincidem.',
    path: ['confirmPassword'],
  })