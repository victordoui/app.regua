import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Palette, Check } from "lucide-react";

interface ColorPalette {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  description: string;
}

const COLOR_PALETTES: ColorPalette[] = [
  {
    id: "classic",
    name: "Clássico",
    primary: "#1a1a2e",
    secondary: "#16213e",
    description: "Elegante e sofisticado",
  },
  {
    id: "modern",
    name: "Moderno",
    primary: "#0ea5e9",
    secondary: "#06b6d4",
    description: "Limpo e contemporâneo",
  },
  {
    id: "vintage",
    name: "Vintage",
    primary: "#78350f",
    secondary: "#92400e",
    description: "Rústico e tradicional",
  },
  {
    id: "dark",
    name: "Dark Mode",
    primary: "#18181b",
    secondary: "#27272a",
    description: "Escuro e minimalista",
  },
  {
    id: "nature",
    name: "Natural",
    primary: "#166534",
    secondary: "#15803d",
    description: "Verde e orgânico",
  },
  {
    id: "royal",
    name: "Realeza",
    primary: "#7c3aed",
    secondary: "#8b5cf6",
    description: "Luxuoso e marcante",
  },
  {
    id: "warm",
    name: "Aconchegante",
    primary: "#ea580c",
    secondary: "#f97316",
    description: "Quente e acolhedor",
  },
  {
    id: "ocean",
    name: "Oceano",
    primary: "#0369a1",
    secondary: "#0284c7",
    description: "Calmo e refrescante",
  },
  {
    id: "gold",
    name: "Dourado",
    primary: "#b45309",
    secondary: "#d97706",
    description: "Premium e exclusivo",
  },
  {
    id: "minimal",
    name: "Minimalista",
    primary: "#404040",
    secondary: "#525252",
    description: "Simples e direto",
  },
];

interface ColorPaletteSelectorProps {
  currentPrimary: string;
  currentSecondary: string;
  onSelect: (primary: string, secondary: string) => void;
}

export const ColorPaletteSelector = ({
  currentPrimary,
  currentSecondary,
  onSelect,
}: ColorPaletteSelectorProps) => {
  const isSelected = (palette: ColorPalette) => {
    return (
      palette.primary.toLowerCase() === currentPrimary.toLowerCase() &&
      palette.secondary.toLowerCase() === currentSecondary.toLowerCase()
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5 text-primary" />
          Paletas de Cores
        </CardTitle>
        <CardDescription>
          Escolha uma paleta pronta ou personalize suas próprias cores abaixo
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {COLOR_PALETTES.map((palette) => {
            const selected = isSelected(palette);
            return (
              <Button
                key={palette.id}
                variant="outline"
                className={`h-auto p-3 flex flex-col items-center gap-2 relative transition-all ${
                  selected ? "ring-2 ring-primary ring-offset-2" : "hover:border-primary/50"
                }`}
                onClick={() => onSelect(palette.primary, palette.secondary)}
              >
                {selected && (
                  <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full p-1">
                    <Check className="h-3 w-3" />
                  </div>
                )}
                <div className="flex gap-1">
                  <div
                    className="w-6 h-6 rounded-full border shadow-sm"
                    style={{ backgroundColor: palette.primary }}
                  />
                  <div
                    className="w-6 h-6 rounded-full border shadow-sm"
                    style={{ backgroundColor: palette.secondary }}
                  />
                </div>
                <div className="text-center">
                  <p className="text-xs font-medium">{palette.name}</p>
                  <p className="text-[10px] text-muted-foreground">{palette.description}</p>
                </div>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
