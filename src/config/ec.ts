import type { PaisConfig } from './tipos';
import { MENSAJE_WHATSAPP, MENSAJE_WIDGET } from './comun';

const ec: PaisConfig = {
  pais: 'ec',
  razonSocial: 'Tesis S.A.',
  titulo: 'Asesoría en tesis en Ecuador | SIDT',
  descripcion:
    'SIDT brinda asesoría en tesis, normas APA, examen complexivo y trabajos académicos a estudiantes en Ecuador. Cotiza por WhatsApp o con el formulario.',
  dominio: 'asesoriasidt.com',
  idioma: 'es-EC',
  localeOg: 'es_EC',
  nombrePais: 'Ecuador',
  codigoIso: 'EC',
  codigoPais: '+593',
  paisSeleccionado: { codigo: '+593', etiqueta: 'Ecuador' },
  placeholderWhatsapp: '0963875608',
  whatsapp: { numero: '593963875608', mensaje: MENSAJE_WHATSAPP },
  mensajeWidget: MENSAJE_WIDGET,
  // Mismo orden que producción (lsec).
  universidades: [
    { archivo: 'college01', nombre: 'PUCE' },
    { archivo: 'college014', nombre: 'Universidad del Azuay' },
    { archivo: 'college02', nombre: 'UNIR' },
    { archivo: 'college013', nombre: 'UIDE' },
    { archivo: 'college09', nombre: 'Universidad de Guayaquil' },
    { archivo: 'college016', nombre: 'Uniandes' },
    { archivo: 'college05', nombre: 'Universidad Nacional de Chimborazo' },
    { archivo: 'college010', nombre: 'UNEMI' },
    { archivo: 'college07', nombre: 'Universidad Central del Ecuador' },
    { archivo: 'college018', nombre: 'Universidad Israel' },
    { archivo: 'college08', nombre: 'Universidad Politécnica Salesiana' },
    { archivo: 'college017', nombre: 'UDLA' },
    { archivo: 'college011', nombre: 'Universidad Católica de Cuenca' },
    { archivo: 'college012', nombre: 'ESPE' },
  ],
  // La landing de hoy no muestra direcciones; se administran desde el portal.
  sucursales: [],
  redes: [],
};

export default ec;
