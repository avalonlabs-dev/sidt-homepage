/** Selects dependientes categoría -> servicio específico (se conserva de form-services.js). */
export const serviceOptions: Record<string, { value: string; label: string }[]> = {
  titulacion: [
    { value: 'titulacion_definicion_tema', label: 'Definición del tema' },
    { value: 'titulacion_anteproyectos', label: 'Anteproyectos' },
    { value: 'titulacion_tesis_teoricas', label: 'Tesis teóricas' },
    { value: 'titulacion_tesis_practicas', label: 'Tesis prácticas' },
    { value: 'titulacion_capitulos_tesis', label: 'Capítulos de las tesis' },
    { value: 'titulacion_monografia', label: 'Monografía' },
    { value: 'titulacion_proyectos', label: 'Proyectos' },
    { value: 'titulacion_simulaciones_disenos', label: 'Simulaciones/Diseños' },
    { value: 'titulacion_revisiones', label: 'Revisiones' },
  ],
  examen_complexivo: [
    { value: 'examen_ensayos', label: 'Ensayos' },
    { value: 'examen_proyecto_integrador', label: 'Proyecto Integrador' },
    { value: 'examen_proyecto', label: 'Proyecto' },
  ],
  academico: [
    { value: 'academico_ensayos', label: 'Ensayos' },
    { value: 'academico_proyecto_integrador', label: 'Proyecto Integrador' },
    { value: 'academico_informe', label: 'Informes' },
  ],
};

/** Datos de cada categoría (las claves son las de `serviceOptions`). `pista` va en el selector y `frase` en el panel. */
export const categoriasServicio: { clave: keyof typeof serviceOptions; nombre: string; icono: string; pista: string; frase: string }[] = [
  {
    clave: 'titulacion',
    nombre: 'Titulación',
    icono: 'graduation-cap',
    pista: 'Del tema a la revisión final',
    frase: 'Te acompañamos en cada parte de tu trabajo de titulación, desde definir el tema hasta las revisiones.',
  },
  {
    clave: 'examen_complexivo',
    nombre: 'Examen complexivo',
    icono: 'exam',
    pista: 'Ensayos y proyectos del examen',
    frase: 'Asesoría en los trabajos que te piden para tu examen complexivo.',
  },
  {
    clave: 'academico',
    nombre: 'Trabajos académicos',
    icono: 'notebook',
    pista: 'Entregas de tus materias',
    frase: 'Apoyo con las entregas de tus materias durante toda la carrera.',
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
  examen_proyecto: { icono: 'presentation-chart', apoyo: 'Guía desde el planteamiento hasta el documento final.' },
  academico_ensayos: { icono: 'feather', apoyo: 'Argumentos claros, con citas y referencias en orden.' },
  academico_proyecto_integrador: { icono: 'stack', apoyo: 'Organiza en una entrega el contenido de varias materias.' },
  academico_informe: { icono: 'chart-line-up', apoyo: 'Presenta resultados y análisis con claridad.' },
};
