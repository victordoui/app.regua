import { describe, expect, it } from 'vitest';
import { defaultTVConfig, tvConfigSchema, validTVImage } from './tvDisplay';

describe('Programação da TV', () => {
  const slide = { id: '1', title: 'Aviso', message: 'Bem-vindo', imageUrl: '', seconds: 15, enabled: true };
  it('aceita boas-vindas sem anúncios', () => expect(tvConfigSchema.parse(defaultTVConfig).slides).toEqual([]));
  it('aceita inserções válidas', () => expect(tvConfigSchema.parse({ ...defaultTVConfig, slides: [slide] }).slides).toHaveLength(1));
  it.each([0, 4, 301, 5.5, NaN])('rejeita duração %s', seconds => expect(tvConfigSchema.safeParse({ ...defaultTVConfig, slides: [{ ...slide, seconds }] }).success).toBe(false));
  it('limita a quantidade de anúncios', () => expect(tvConfigSchema.safeParse({ ...defaultTVConfig, slides: Array(31).fill(slide) }).success).toBe(false));
  it.each(['javascript:alert(1)', 'http://example.com/a.png', 'inválida'])('rejeita imagem %s', url => expect(validTVImage(url)).toBe(false));
  it('aceita imagem HTTPS e imagem opcional', () => { expect(validTVImage('https://example.com/a.png')).toBe(true); expect(validTVImage('')).toBe(true); });
});
