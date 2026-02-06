import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { z } from "zod"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Filtra nome: somente letras (com acentos) e espaços
export function formatNameOnly(value: string): string {
  return value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '');
}

// Schema de validação para contato no booking
export const guestContactSchema = z.object({
  clientName: z
    .string()
    .trim()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres")
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, "Nome deve conter apenas letras"),
  clientPhone: z
    .string()
    .trim()
    .min(13, "Telefone inválido")
    .max(14, "Telefone inválido")
    .regex(/^\(\d{2}\)\d{4,5}-\d{4}$/, "Formato: (XX)XXXX-XXXX"),
  clientEmail: z
    .string()
    .trim()
    .email("Email inválido")
    .max(255, "Email muito longo"),
});

// Máscara de telefone brasileiro (00)0000-0000
export function formatPhoneBR(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 10);
  
  if (digits.length <= 2) {
    return digits.length ? `(${digits}` : '';
  }
  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)})${digits.slice(2)}`;
  }
  return `(${digits.slice(0, 2)})${digits.slice(2, 6)}-${digits.slice(6)}`;
}

// Remove máscara do telefone
export function cleanPhone(value: string): string {
  return value.replace(/\D/g, '');
}
