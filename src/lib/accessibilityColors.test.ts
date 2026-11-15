import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const stylesheet = readFileSync('src/index.css', 'utf8');

function readTheme(selector: ':root' | '.dark') {
  const escaped = selector.replace('.', '\\.');
  const block = stylesheet.match(new RegExp(`${escaped}\\s*\\{([^}]+)\\}`))?.[1];
  if (!block) throw new Error(`Tema CSS não encontrado: ${selector}`);

  return Object.fromEntries(
    [...block.matchAll(/--([a-z-]+):\s*([^;]+);/g)].map(([, name, value]) => [name, value.trim()]),
  );
}

function toRgb(hsl: string): [number, number, number] {
  const match = hsl.match(/^([\d.]+)\s+([\d.]+)%\s+([\d.]+)%$/);
  if (!match) throw new Error(`Token HSL inválido: ${hsl}`);

  const hue = Number(match[1]);
  const saturation = Number(match[2]) / 100;
  const lightness = Number(match[3]) / 100;
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const intermediate = chroma * (1 - Math.abs((hue / 60) % 2 - 1));
  const offset = lightness - chroma / 2;
  const channels = hue < 60 ? [chroma, intermediate, 0]
    : hue < 120 ? [intermediate, chroma, 0]
      : hue < 180 ? [0, chroma, intermediate]
        : hue < 240 ? [0, intermediate, chroma]
          : hue < 300 ? [intermediate, 0, chroma]
            : [chroma, 0, intermediate];

  return channels.map((channel) => Math.round((channel + offset) * 255)) as [number, number, number];
}

function luminance([red, green, blue]: [number, number, number]) {
  const linear = (channel: number) => {
    const normalized = channel / 255;
    return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
  };

  return 0.2126 * linear(red) + 0.7152 * linear(green) + 0.0722 * linear(blue);
}

function contrastRatio(first: string, second: string) {
  const values = [luminance(toRgb(first)), luminance(toRgb(second))].sort((a, b) => b - a);
  return (values[0] + 0.05) / (values[1] + 0.05);
}

describe('contraste dos tokens de interface', () => {
  const light = readTheme(':root');
  const dark = readTheme('.dark');

  it.each([
    ['texto de botão primário claro', light['primary-foreground'], light.primary],
    ['texto de botão secundário claro', light['secondary-foreground'], light.secondary],
    ['texto principal claro', light.foreground, light.background],
    ['texto auxiliar claro', light['muted-foreground'], light.background],
    ['texto de botão primário escuro', dark['primary-foreground'], dark.primary],
    ['texto de botão secundário escuro', dark['secondary-foreground'], dark.secondary],
    ['texto principal escuro', dark.foreground, dark.background],
    ['texto auxiliar escuro', dark['muted-foreground'], dark.background],
  ])('%s atinge contraste mínimo 4,5:1', (_label, foreground, background) => {
    expect(contrastRatio(foreground, background)).toBeGreaterThanOrEqual(4.5);
  });
});
