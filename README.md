# sidt-homepage

Landing comercial de SIDT (Ecuador y Perú). Astro con salida estática: una base y dos builds.

```bash
npm ci
npm run dev          # http://localhost:4321 (ec); PAIS=pe npm run dev para Perú
npm run build        # dist/ec y dist/pe
```

- `asesoriasidt.com` y `lsec` sirven `dist/ec`; `ls` sirve `dist/pe`.
- Contenido por país: `src/config/ec.ts` y `src/config/pe.ts`.
- Dirección de diseño: `docs/diseno-landing.md`.
- Deploy (nginx, certbot, DNS, `deploy/desplegar.sh`): `docs/deploy-landing.md`.
- Estructura y reglas para trabajar en el código: `CLAUDE.md`.
