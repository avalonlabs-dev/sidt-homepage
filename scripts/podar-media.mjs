// Cada build publica solo los medios de su país.
import { rm } from 'node:fs/promises';

const pais = process.argv[2];
const otro = { ec: 'pe', pe: 'ec' }[pais];
if (!otro) throw new Error(`País desconocido: ${pais}`);

await rm(`dist/${pais}/media/universidades/${otro}`, { recursive: true, force: true });
await rm(`dist/${pais}/media/testimonios/${otro}`, { recursive: true, force: true });
await rm(`dist/${pais}/media/manifest.json`, { force: true });
