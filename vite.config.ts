// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

const hostinger = process.env['DEPLOY_TARGET'] === 'hostinger';
const backendUrl = process.env['VITE_API_URL']?.trim().replace(/\/+$/, '');
if (hostinger) {
  if (!backendUrl) throw new Error('Hostinger frontend build requires VITE_API_URL with the backend HTTPS URL.');
  const parsed = new URL(backendUrl);
  if (!['http:', 'https:'].includes(parsed.protocol) || parsed.username || parsed.password || parsed.search || parsed.hash || parsed.pathname !== '/') {
    throw new Error('VITE_API_URL must be a backend origin without credentials, path, query or fragment.');
  }
}
const hostingerNitro = {
  preset: 'node-server',
  routeRules: {
    '/api/**': { proxy: `${backendUrl}/api/**` },
    '/uploads/**': { proxy: `${backendUrl}/uploads/**` },
  },
};

export default defineConfig({
  ...(hostinger ? {
    vite: { define: { 'import.meta.env.VITE_API_MODE': JSON.stringify('same-origin') } },
    nitro: hostingerNitro,
  } : {}),
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
