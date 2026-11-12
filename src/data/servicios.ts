/** Selects dependientes categoría -> servicio específico (se conserva de form-services.js). */
export const serviceOptions: Record<string, { value: string; label: string }[]> = {
  titulacion: [
    { value: 'titulacion_definicion_tema', label: 'Asesoría para definir tu tema' },
    { value: 'titulacion_anteproyectos', label: 'Orientación para tu anteproyecto' },
    { value: 'titulacion_tesis_teoricas', label: 'Tutoría para tesis teóricas' },
    { value: 'titulacion_tesis_practicas', label: 'Tutoría para tesis prácticas' },
    // Nunca «Capítulos» solo: siempre con el encuadre «que tú redactas» (Google Ads, 2026-11-09).
    { value: 'titulacion_capitulos_tesis', label: 'Retroalimentación sobre los capítulos que tú redactas' },
    { value: 'titulacion_monografia', label: 'Orientación para monografías' },
    { value: 'titulacion_proyectos', label: 'Asesoría para proyectos de investigación' },
    { value: 'titulacion_simulaciones_disenos', label: 'Asesoría en simulaciones y diseños' },
    { value: 'titulacion_revisiones', label: 'Revisión y corrección de estilo de tus avances' },
  ],
  examen_complexivo: [
    { value: 'examen_ensayos', label: 'Tutoría para estructurar tu ensayo' },
    { value: 'examen_proyecto_integrador', label: 'Orientación para tu proyecto integrador' },
    { value: 'examen_proyecto', label: 'Proyecto' },
  ],
  // «Trabajos académicos» (entregas de materias) se retiró por la política de Google Ads (2026-11-09).
  // Los textos de la landing describen asesoría sobre lo que redacta el estudiante, nunca trabajos entregados.
};

/** Datos de cada categoría (las claves son las de `serviceOptions`). `pista` va en el selector y `frase` en el panel. */
export const categoriasServicio: { clave: keyof typeof serviceOptions; nombre: string; icono: string; pista: string; frase: string }[] = [
  {
    clave: 'titulacion',
    nombre: 'Titulación',
    icono: 'graduation-cap',
    pista: 'Del tema a tu sustentación, con guía experta',
    frase: 'Clases y retroalimentación en cada etapa de tu trabajo de titulación, que desarrollas tú con nuestra guía: desde definir el tema hasta preparar tu sustentación.',
  },
  {
    clave: 'examen_complexivo',
    nombre: 'Examen complexivo',
    icono: 'exam',
    pista: 'Preparación y tutoría para tu examen',
    frase: 'Preparación y tutoría para tu examen complexivo: practicamos contigo y revisamos los avances que tú elaboras.',
  },
];

/** Presentación de cada servicio, por `value`. `apoyo` solo en las categorías cortas: compone sus fichas grandes. */
export const detalleServicio: Record<string, { icono: string; apoyo?: string }> = {
  titulacion_definicion_tema: { icono: 'lightbulb' },
  titulacion_anteproyectos: { icono: 'clipboard-text' },
  titulacion_tesis_teoricas: { icono: 'books' },
  titulacion_tesis_practicas: { icono: 'flask' },
  titulacion_capitulos_tesis: { icono: 'book-open-text' },
  titulacion_monografia: { icono: 'article' },
  titulacion_proyectos: { icono: 'kanban' },
  titulacion_simulaciones_disenos: { icono: 'cube' },
  titulacion_revisiones: { icono: 'seal-check' },
  examen_ensayos: { icono: 'pen-nib', apoyo: 'Ordena tus ideas y sustenta tu postura con fuentes.' },
  examen_proyecto_integrador: { icono: 'puzzle-piece', apoyo: 'Aplica en un solo trabajo lo aprendido en la carrera.' },
  examen_proyecto: { icono: 'presentation-chart', apoyo: 'Guía desde el planteamiento hasta tu sustentación.' },
};
