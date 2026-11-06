import { defineConfig } from 'astro/config';

// Una base, dos builds: PAIS=ec|pe (por defecto ec). La salida va a dist/<pais>.
const pais = (process.env.PAIS || 'ec').toLowerCase();
if (!['ec', 'pe'].includes(pais)) {
  throw new Error(`PAIS inválido: "${pais}". Usa ec o pe.`);
}
// Dominio canónico de cada build (lsec sirve el mismo dist/ec y declara la raíz como canónica).
const dominios = { ec: 'lsec.asesoriasidt.com', pe: 'ls.asesoriasidt.com' };

export default defineConfig({
  output: 'static',
  outDir: `./dist/${pais}`,
  site: `https://${dominios[pais]}`,
  // /gracias.html (no /gracias/index.html): las URL de producción no cambian.
  // Todo el CSS en línea: una petición menos antes de pintar.
  build: { format: 'file', inlineStylesheets: 'always' },
  trailingSlash: 'ignore',
  server: { port: 4321 },
  devToolbar: { enabled: false },
  vite: {
    server: {
      // En desarrollo, el contenido administrable sale de la API local.
      proxy: {
        '/public/landing': {
          target: process.env.API_URL || 'http://localhost:3030',
          changeOrigin: true,
        },
      },
    },
  },
});
