import type { PaisConfig } from './tipos';
import { MENSAJE_WHATSAPP, MENSAJE_WIDGET } from './comun';

const pe: PaisConfig = {
  pais: 'pe',
  razonSocial: 'Tesis S.A.C',
  titulo: 'Asesoría en tesis en Perú | SIDT',
  descripcion:
    'SIDT brinda asesoría en tesis, normas APA y trabajos académicos a estudiantes en Perú. Cotiza por WhatsApp o con el formulario.',
  dominio: 'ls.asesoriasidt.com',
  idioma: 'es-PE',
  localeOg: 'es_PE',
  nombrePais: 'Perú',
  codigoIso: 'PE',
  codigoPais: '+51',
  paisSeleccionado: { codigo: '+51', etiqueta: 'Perú' },
  placeholderWhatsapp: '987654321',
  whatsapp: { numero: '51986424624', mensaje: MENSAJE_WHATSAPP },
  mensajeWidget: MENSAJE_WIDGET,
  // Mismo orden que producción (ls); se quita la repetición del primero.
  universidades: [
    { archivo: 'college023', nombre: 'Universidad Nacional Federico Villarreal' },
    { archivo: 'college022', nombre: 'SENATI' },
    { archivo: 'college021', nombre: 'Universidad Inca Garcilaso de la Vega' },
    { archivo: 'college020', nombre: 'Universidad Nacional del Callao' },
    { archivo: 'college0199', nombre: 'Universidad Nacional Mayor de San Marcos' },
    { archivo: 'college0188', nombre: 'Universidad Alas Peruanas' },
    { archivo: 'college0166', nombre: 'Universidad Católica de Santa María' },
    { archivo: 'college0177', nombre: 'Universidad de San Martín de Porres' },
    { archivo: 'college0155', nombre: 'Universidad Católica San Pablo' },
    { archivo: 'college0144', nombre: 'Universidad Continental' },
    { archivo: 'college011', nombre: 'Universidad Tecnológica del Perú' },
    { archivo: 'college0133', nombre: 'Universidad César Vallejo' },
    { archivo: 'college0122', nombre: 'Universidad Nacional de San Agustín de Arequipa' },
  ],
  sucursales: [],
  redes: [],
};

export default pe;
