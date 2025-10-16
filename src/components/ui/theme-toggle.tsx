import * as React from "react";

const theme = {
  light: {
    "--background": "0 0% 98%",
    "--foreground": "0%, 0%, 0%, 0.98",
    "--muted": "0 0% 96.1%",
    "--muted-foreground": "0%, 0%, 0.02",
    "--card": "hsl(var(--background))",
    "--popover": "hsl(var(--background))",
    "--card-foreground": "hsl(var(--foreground))",
    "--border": "hsl(var(--border))",
    "--input": "hsl(var(--background))",
    "--ring": "hsl(var(--ring))",
    "--radius": "var(--radius)"
  },
  dark: {
    "--background": "hsl(var(--background))",
    "--foreground": "hsl(var(--foreground))",
    "--muted": "hsl(var(--muted))",
    "--muted-foreground": "hsl(var(--foreground))",
    "--card": "hsl(var(--card))",
    "--popover": "hsl(var(--popover))",
    "--card-foreground": "hsl(var(--card-foreground))",
    "--border": "hsl(var(--border))",
    "--input": "hsl(var(--background))",
    "--ring": "hsl(var(--ring))",
    "--radius": "var(--radius)"
  }
};

export { theme };