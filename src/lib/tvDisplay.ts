import { z } from 'zod';
export interface TVSlide { id: string; title: string; message: string; imageUrl: string; seconds: number; enabled: boolean }
export interface TVConfig { headline: string; ticker: string; slides: TVSlide[] }
export const defaultTVConfig: TVConfig = { headline: 'Seja bem-vindo!', ticker: 'Obrigado por escolher nosso estabelecimento.', slides: [] };
export function validTVImage(value: string) { if (!value) return true; try { return new URL(value).protocol === 'https:'; } catch { return false; } }
export const tvConfigSchema = z.object({
  headline: z.string().max(120), ticker: z.string().max(300),
  slides: z.array(z.object({ id: z.string().min(1), title: z.string().trim().min(1).max(120), message: z.string().max(500), imageUrl: z.string().max(2048).refine(validTVImage), seconds: z.number().int().min(5).max(300), enabled: z.boolean() })).max(30),
});
