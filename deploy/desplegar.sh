#!/usr/bin/env bash
# Despliega la landing de SIDT en ESTE servidor (corre en el servidor, no en tu Mac).
#
#   deploy/desplegar.sh                publica: pull, build, release nueva y enlace `current`
#   deploy/desplegar.sh --solo-build   hace pull, npm ci y build, y se detiene (no publica)
#   deploy/desplegar.sh --rollback     vuelve a la release anterior
#
# Estructura en el servidor:
#   /var/www/sidt-landing/releases/<fecha>/{ec,pe}    cada publicación (se conservan 3)
#   /var/www/sidt-landing/current -> releases/<fecha> lo que sirve nginx (cambio atómico)
#
# Si algo falla antes del cambio, `current` no se toca. Si falla después (recarga de nginx),
# se restaura el enlace anterior.
#
# Variables (para pruebas; en producción no hace falta definirlas):
#   RAIZ_DESTINO     carpeta destino (por defecto /var/www/sidt-landing)
#   NGINX_PROBAR     comando que valida nginx   (por defecto: sudo nginx -t)
#   NGINX_RECARGAR   comando que recarga nginx  (por defecto: sudo systemctl reload nginx)
#   OMITIR_PULL=1    no ejecuta git pull (solo pruebas)
set -euo pipefail

RAIZ_DESTINO="${RAIZ_DESTINO:-/var/www/sidt-landing}"
NGINX_PROBAR="${NGINX_PROBAR:-sudo nginx -t}"
NGINX_RECARGAR="${NGINX_RECARGAR:-sudo systemctl reload nginx}"
CONSERVAR=3
NODE_MINIMO=22
REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RELEASES="$RAIZ_DESTINO/releases"
ACTUAL="$RAIZ_DESTINO/current"

info() { printf '\033[1;34m==>\033[0m %s\n' "$*"; }
ok()   { printf '\033[1;32m OK\033[0m %s\n' "$*"; }
fallo() { printf '\033[1;31mERROR:\033[0m %s\n' "$*" >&2; exit 1; }

MODO=publicar
case "${1:-}" in
  "") ;;
  --solo-build) MODO=build ;;
  --rollback) MODO=rollback ;;
  -h|--help) sed -n '2,13p' "${BASH_SOURCE[0]}"; exit 0 ;;
  *) fallo "Opción desconocida: $1 (usa --solo-build, --rollback o ninguna)" ;;
esac

# Apunta `current` a una release de forma atómica (enlace temporal + mv -T).
apuntar() {
  local destino="$1" tmp="$RAIZ_DESTINO/.current.$$"
  ln -sfn "$destino" "$tmp"
  mv -Tf "$tmp" "$ACTUAL" 2>/dev/null || { ln -sfn "$destino" "$ACTUAL"; rm -f "$tmp"; }
}

release_actual() { [ -L "$ACTUAL" ] && basename "$(readlink "$ACTUAL")" || true; }

validar_y_recargar() {
  info "Validando nginx"
  $NGINX_PROBAR || return 1
  info "Recargando nginx"
  $NGINX_RECARGAR || return 1
}

if [ "$MODO" = rollback ]; then
  [ -d "$RELEASES" ] || fallo "No existe $RELEASES: todavía no hay publicaciones."
  actual="$(release_actual)"
  [ -n "$actual" ] || fallo "No existe el enlace $ACTUAL."
  anterior="$(ls -1 "$RELEASES" | sort | awk -v a="$actual" '$0 < a' | tail -n 1)"
  [ -n "$anterior" ] || fallo "No hay una release anterior a $actual."
  info "Volviendo de $actual a $anterior"
  $NGINX_PROBAR || fallo "nginx -t falló; no se tocó current."
  apuntar "$RELEASES/$anterior"
  if ! $NGINX_RECARGAR; then
    apuntar "$RELEASES/$actual"
    fallo "La recarga de nginx falló; se restauró $actual."
  fi
  ok "Rollback hecho: current -> $anterior"
  exit 0
fi

# ---------- Requisitos ----------
command -v node >/dev/null || fallo "No se encontró node. Instala Node $NODE_MINIMO o superior."
version="$(node -p 'process.versions.node.split(".")[0]')"
[ "$version" -ge "$NODE_MINIMO" ] || fallo "Se necesita Node $NODE_MINIMO o superior (hay $(node -v))."
command -v npm >/dev/null || fallo "No se encontró npm."
command -v git >/dev/null || fallo "No se encontró git."
ok "Node $(node -v)"

cd "$REPO"
if [ "${OMITIR_PULL:-0}" = 1 ]; then
  info "OMITIR_PULL=1: no se hace git pull"
else
  info "Actualizando el código (git pull --ff-only)"
  git pull --ff-only || fallo "git pull --ff-only falló: hay cambios locales o la rama divergió. No se publicó nada."
fi

info "Instalando dependencias (npm ci)"
npm ci
info "Compilando (npm run build)"
npm run build

for pais in ec pe; do
  [ -f "dist/$pais/index.html" ] && [ -f "dist/$pais/gracias.html" ] || fallo "El build no generó dist/$pais/index.html y gracias.html. No se publicó nada."
done
ok "Build listo: dist/ec y dist/pe"

if [ "$MODO" = build ]; then
  ok "--solo-build: se detiene aquí; no se copió nada ni se tocó current."
  exit 0
fi

# ---------- Publicar ----------
fecha="$(date +%Y%m%d-%H%M%S)"
nueva="$RELEASES/$fecha"
mkdir -p "$RELEASES" || fallo "No se pudo crear $RELEASES (¿permisos? ver docs/deploy-landing.md, paso 2)."
[ ! -e "$nueva" ] || fallo "Ya existe $nueva."

# Si algo falla mientras se copia, se borra la release a medias; current sigue intacto.
trap 'rc=$?; if [ $rc -ne 0 ] && [ -d "$nueva" ] && [ "$(release_actual)" != "$fecha" ]; then rm -rf "$nueva"; fi' EXIT

info "Copiando a $nueva"
mkdir -p "$nueva"
cp -a dist/ec "$nueva/ec"
cp -a dist/pe "$nueva/pe"
chmod -R a+rX "$nueva"

previa="$(release_actual)"
info "Validando nginx antes de cambiar el enlace"
$NGINX_PROBAR || fallo "nginx -t falló; current no se tocó."

info "Cambiando current -> $fecha"
apuntar "$nueva"
if ! $NGINX_RECARGAR; then
  [ -n "$previa" ] && apuntar "$RELEASES/$previa"
  rm -rf "$nueva"
  fallo "La recarga de nginx falló; se restauró ${previa:-el estado anterior}."
fi
ok "Publicado: current -> $fecha"

# ---------- Limpieza: se conservan las $CONSERVAR más recientes ----------
actual="$(release_actual)"
ls -1 "$RELEASES" | sort -r | tail -n +$((CONSERVAR + 1)) | while read -r vieja; do
  [ "$vieja" = "$actual" ] && continue
  info "Borrando release antigua $vieja"
  rm -rf "${RELEASES:?}/$vieja"
done
ok "Listo. Releases conservadas: $(ls -1 "$RELEASES" | wc -l | tr -d ' ')"
