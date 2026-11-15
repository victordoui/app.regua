import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { readFileSync } from "node:fs";
import { componentTagger } from "lovable-tagger";

const salesLandingRoute: Plugin = {
  name: "sales-landing-route",
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      if (!req.url) return next();
      const requestUrl = new URL(req.url, "http://localhost");
      if (requestUrl.pathname === "/vendas") {
        res.statusCode = 302;
        res.setHeader("Location", `/vendas/${requestUrl.search}`);
        res.end();
        return;
      }
      if (requestUrl.pathname === "/vendas/") {
        res.statusCode = 200;
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.end(readFileSync(path.resolve(__dirname, "public/vendas/index.html")));
        return;
      }
      next();
    });
  },
  configurePreviewServer(server) {
    server.middlewares.use((req, res, next) => {
      if (req.url && new URL(req.url, "http://localhost").pathname === "/vendas") {
        const query = new URL(req.url, "http://localhost").search;
        res.statusCode = 302;
        res.setHeader("Location", `/vendas/${query}`);
        res.end();
        return;
      }
      next();
    });
  },
};


// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const testLoginPassword = mode === "development" ? env.VITE_TEST_LOGIN_PASSWORD?.trim() ?? "" : "";
  const testLoginsEnabled = mode === "development"
    && env.VITE_ENABLE_TEST_LOGIN === "true"
    && Boolean(testLoginPassword);

  return {
    define: {
      __VIZZU_TEST_LOGIN_ENABLED__: JSON.stringify(testLoginsEnabled),
      __VIZZU_TEST_LOGIN_PASSWORD__: JSON.stringify(testLoginPassword),
    },
    server: {
      host: "::",
      port: 8080,
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            'vendor-ui': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-tabs', '@radix-ui/react-popover', '@radix-ui/react-select'],
            'vendor-charts': ['recharts'],
            'vendor-query': ['@tanstack/react-query'],
            'vendor-forms': ['react-hook-form', '@hookform/resolvers', 'zod'],
            'vendor-utils': ['date-fns', 'clsx', 'tailwind-merge', 'framer-motion'],
          },
        },
      },
    },
    plugins: [
      react(),
      salesLandingRoute,
      mode === 'development' && componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        // Todos os ícones legados são resolvidos pelo registro Phosphor central.
        "lucide-react": path.resolve(__dirname, "./src/components/ui/icons.tsx"),
      },
    },
  };
});
