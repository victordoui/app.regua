// vite.config.ts
import { defineConfig } from "file:///C:/Users/MARSHAL/dyad-apps/regua-barber-inicial-01/node_modules/.pnpm/vite@5.4.20_@types+node@22.18.10_terser@5.44.0/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/MARSHAL/dyad-apps/regua-barber-inicial-01/node_modules/.pnpm/@vitejs+plugin-react-swc@3._19f1cd5594f0ad066bdac13963a5ef2c/node_modules/@vitejs/plugin-react-swc/index.js";
import path from "path";
import { componentTagger } from "file:///C:/Users/MARSHAL/dyad-apps/regua-barber-inicial-01/node_modules/.pnpm/lovable-tagger@1.1.11_vite@_28495e62cdcd9e878039fb8ad7ae1c68/node_modules/lovable-tagger/dist/index.js";
import { VitePWA } from "file:///C:/Users/MARSHAL/dyad-apps/regua-barber-inicial-01/node_modules/.pnpm/vite-plugin-pwa@1.1.0_vite@_6d492e8ef474f396a453a5203375699e/node_modules/vite-plugin-pwa/dist/index.js";
var __vite_injected_original_dirname = "C:\\Users\\MARSHAL\\dyad-apps\\regua-barber-inicial-01";
var vite_config_default = defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080
  },
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "robots.txt", "placeholder.svg"],
      manifest: {
        name: "Na R\xE9gua",
        short_name: "Na R\xE9gua",
        description: "Sistema de gest\xE3o de barbearias (MVP SaaS).",
        theme_color: "#0ea5e9",
        background_color: "#0f172a",
        display: "standalone",
        start_url: "/",
        scope: "/",
        lang: "pt-BR",
        icons: [
          { src: "/favicon.ico", sizes: "64x64 32x32 24x24 16x16", type: "image/x-icon" },
          { src: "/placeholder.svg", sizes: "192x192", type: "image/svg+xml", purpose: "any" },
          { src: "/placeholder.svg", sizes: "512x512", type: "image/svg+xml", purpose: "any" }
        ]
      }
    }),
    mode === "development" && componentTagger()
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxNQVJTSEFMXFxcXGR5YWQtYXBwc1xcXFxyZWd1YS1iYXJiZXItaW5pY2lhbC0wMVwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcTUFSU0hBTFxcXFxkeWFkLWFwcHNcXFxccmVndWEtYmFyYmVyLWluaWNpYWwtMDFcXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL01BUlNIQUwvZHlhZC1hcHBzL3JlZ3VhLWJhcmJlci1pbmljaWFsLTAxL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcbmltcG9ydCByZWFjdCBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3Qtc3djXCI7XG5pbXBvcnQgcGF0aCBmcm9tIFwicGF0aFwiO1xuaW1wb3J0IHsgY29tcG9uZW50VGFnZ2VyIH0gZnJvbSBcImxvdmFibGUtdGFnZ2VyXCI7XG5pbXBvcnQgeyBWaXRlUFdBIH0gZnJvbSAndml0ZS1wbHVnaW4tcHdhJztcblxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoeyBtb2RlIH0pID0+ICh7XG4gIHNlcnZlcjoge1xuICAgIGhvc3Q6IFwiOjpcIixcbiAgICBwb3J0OiA4MDgwLFxuICB9LFxuICBwbHVnaW5zOiBbXG4gICAgcmVhY3QoKSxcbiAgICBWaXRlUFdBKHtcbiAgICAgIHJlZ2lzdGVyVHlwZTogJ2F1dG9VcGRhdGUnLFxuICAgICAgaW5jbHVkZUFzc2V0czogWydmYXZpY29uLmljbycsICdyb2JvdHMudHh0JywgJ3BsYWNlaG9sZGVyLnN2ZyddLFxuICAgICAgbWFuaWZlc3Q6IHtcbiAgICAgICAgbmFtZTogJ05hIFJcdTAwRTlndWEnLFxuICAgICAgICBzaG9ydF9uYW1lOiAnTmEgUlx1MDBFOWd1YScsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnU2lzdGVtYSBkZSBnZXN0XHUwMEUzbyBkZSBiYXJiZWFyaWFzIChNVlAgU2FhUykuJyxcbiAgICAgICAgdGhlbWVfY29sb3I6ICcjMGVhNWU5JyxcbiAgICAgICAgYmFja2dyb3VuZF9jb2xvcjogJyMwZjE3MmEnLFxuICAgICAgICBkaXNwbGF5OiAnc3RhbmRhbG9uZScsXG4gICAgICAgIHN0YXJ0X3VybDogJy8nLFxuICAgICAgICBzY29wZTogJy8nLFxuICAgICAgICBsYW5nOiAncHQtQlInLFxuICAgICAgICBpY29uczogW1xuICAgICAgICAgIHsgc3JjOiAnL2Zhdmljb24uaWNvJywgc2l6ZXM6ICc2NHg2NCAzMngzMiAyNHgyNCAxNngxNicsIHR5cGU6ICdpbWFnZS94LWljb24nIH0sXG4gICAgICAgICAgeyBzcmM6ICcvcGxhY2Vob2xkZXIuc3ZnJywgc2l6ZXM6ICcxOTJ4MTkyJywgdHlwZTogJ2ltYWdlL3N2Zyt4bWwnLCBwdXJwb3NlOiAnYW55JyB9LFxuICAgICAgICAgIHsgc3JjOiAnL3BsYWNlaG9sZGVyLnN2ZycsIHNpemVzOiAnNTEyeDUxMicsIHR5cGU6ICdpbWFnZS9zdmcreG1sJywgcHVycG9zZTogJ2FueScgfVxuICAgICAgICBdXG4gICAgICB9XG4gICAgfSksXG4gICAgbW9kZSA9PT0gJ2RldmVsb3BtZW50JyAmJlxuICAgIGNvbXBvbmVudFRhZ2dlcigpLFxuICBdLmZpbHRlcihCb29sZWFuKSxcbiAgcmVzb2x2ZToge1xuICAgIGFsaWFzOiB7XG4gICAgICBcIkBcIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuL3NyY1wiKSxcbiAgICB9LFxuICB9LFxufSkpO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFrVixTQUFTLG9CQUFvQjtBQUMvVyxPQUFPLFdBQVc7QUFDbEIsT0FBTyxVQUFVO0FBQ2pCLFNBQVMsdUJBQXVCO0FBQ2hDLFNBQVMsZUFBZTtBQUp4QixJQUFNLG1DQUFtQztBQU96QyxJQUFPLHNCQUFRLGFBQWEsQ0FBQyxFQUFFLEtBQUssT0FBTztBQUFBLEVBQ3pDLFFBQVE7QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLE1BQU07QUFBQSxFQUNSO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxNQUFNO0FBQUEsSUFDTixRQUFRO0FBQUEsTUFDTixjQUFjO0FBQUEsTUFDZCxlQUFlLENBQUMsZUFBZSxjQUFjLGlCQUFpQjtBQUFBLE1BQzlELFVBQVU7QUFBQSxRQUNSLE1BQU07QUFBQSxRQUNOLFlBQVk7QUFBQSxRQUNaLGFBQWE7QUFBQSxRQUNiLGFBQWE7QUFBQSxRQUNiLGtCQUFrQjtBQUFBLFFBQ2xCLFNBQVM7QUFBQSxRQUNULFdBQVc7QUFBQSxRQUNYLE9BQU87QUFBQSxRQUNQLE1BQU07QUFBQSxRQUNOLE9BQU87QUFBQSxVQUNMLEVBQUUsS0FBSyxnQkFBZ0IsT0FBTywyQkFBMkIsTUFBTSxlQUFlO0FBQUEsVUFDOUUsRUFBRSxLQUFLLG9CQUFvQixPQUFPLFdBQVcsTUFBTSxpQkFBaUIsU0FBUyxNQUFNO0FBQUEsVUFDbkYsRUFBRSxLQUFLLG9CQUFvQixPQUFPLFdBQVcsTUFBTSxpQkFBaUIsU0FBUyxNQUFNO0FBQUEsUUFDckY7QUFBQSxNQUNGO0FBQUEsSUFDRixDQUFDO0FBQUEsSUFDRCxTQUFTLGlCQUNULGdCQUFnQjtBQUFBLEVBQ2xCLEVBQUUsT0FBTyxPQUFPO0FBQUEsRUFDaEIsU0FBUztBQUFBLElBQ1AsT0FBTztBQUFBLE1BQ0wsS0FBSyxLQUFLLFFBQVEsa0NBQVcsT0FBTztBQUFBLElBQ3RDO0FBQUEsRUFDRjtBQUNGLEVBQUU7IiwKICAibmFtZXMiOiBbXQp9Cg==
