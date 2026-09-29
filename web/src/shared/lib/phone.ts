
// Normalização e formatação de número de telefone

const BRAZIL_COUNTRY_CODE = '55'
const E164_PATTERN = /^\+[1-9]\d{7,14}$/
const BRAZIL_E164_LENGTHS = [13, 14]
const BRAZIL_PHONE_PATTERN = /^\+55(\d{2})(\d{4,5})(\d{4})$/

export const toDigits = (value: string) => value.replace(/\D/g, '')

// Aceita o número do jeito que o usuário digitar e devolve no padrão E.164 ou null se for inválido
export const normalizePhone = (input: string): string | null => {
  const digits = toDigits(input)
  const hasCountryCode =
    input.trim().startsWith('+') || (digits.startsWith(BRAZIL_COUNTRY_CODE) && digits.length >= 12)
  const phone = hasCountryCode ? `+${digits}` : `+${BRAZIL_COUNTRY_CODE}${digits}`

  if (!E164_PATTERN.test(phone)) return null

  if (phone.startsWith(`+${BRAZIL_COUNTRY_CODE}`) && !BRAZIL_E164_LENGTHS.includes(phone.length)) {
    return null
  }

  return phone
}

export const formatPhone = (phone: string): string => {
  const match = BRAZIL_PHONE_PATTERN.exec(phone)
  if (!match) return phone

  const [, areaCode, prefix, suffix] = match
  return `+55 (${areaCode}) ${prefix}-${suffix}`
}