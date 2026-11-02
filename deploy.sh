#!/usr/bin/env bash
# Despliegue de la landing "de una". Corre EN EL SERVIDOR, desde la carpeta del repo:
#
#   ./deploy.sh
#
# Se puede repetir sin riesgo. Publica el build y deja nginx y HTTPS según el DNS:
#   - asesoriasidt.com y www: obligatorios, deben apuntar a este servidor.
#   - lsec y ls: se activan solos cuando su DNS apunta aquí. Mientras no, se omiten.
#
# Opcional:
#   CERTBOT_EMAIL=correo@dominio ./deploy.sh   correo para avisos de vencimiento
#   ./deploy.sh --rollback                     vuelve a la publicación anterior
#
# Si nginx rechaza la configuración nueva, se restaura la anterior y el portal sigue igual.
set -euo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RAIZ="${RAIZ_DESTINO:-/var/www/sidt-landing}"
ACME="$RAIZ/acme"
CACHE=/var/cache/nginx/landing
SITIO=/etc/nginx/sites-available/sidt-landing.conf
ENLACE=/etc/nginx/sites-enabled/sidt-landing.conf
COMUN=/etc/nginx/snippets/sidt-landing-comun.conf
PLANTILLA="$REPO/deploy/nginx-sidt-landing.conf"
CERTS=/etc/letsencrypt/live

info()   { printf '\033[1;34m==>\033[0m %s\n' "$*"; }
ok()     { printf '\033[1;32m OK\033[0m %s\n' "$*"; }
aviso()  { printf '\033[1;33m ! \033[0m %s\n' "$*"; }
fallo()  { printf '\033[1;31mERROR:\033[0m %s\n' "$*" >&2; exit 1; }

if [ "${1:-}" = --rollback ]; then
  exec "$REPO/deploy/desplegar.sh" --rollback
fi
[ $# -eq 0 ] || fallo "Opción desconocida: $1 (usa --rollback o ninguna)"

# ---------- Requisitos ----------
for comando in git node npm nginx certbot curl getent sudo; do
  command -v "$comando" >/dev/null || fallo "Falta $comando. Instálalo y repite (certbot: sudo apt install -y certbot)."
done

IP="${IP_SERVIDOR:-$(curl -fsS -m 10 https://checkip.amazonaws.com | tr -d '[:space:]')}"
[ -n "$IP" ] || fallo "No se pudo averiguar la IP pública de este servidor. Defínela con IP_SERVIDOR=..."
info "IP de este servidor: $IP"

apunta_aqui() { getent ahostsv4 "$1" | awk '{print $1}' | grep -qx "$IP"; }
tiene_cert()  { sudo test -s "$CERTS/$1/fullchain.pem"; }

for dominio in asesoriasidt.com www.asesoriasidt.com; do
  apunta_aqui "$dominio" || fallo "$dominio no apunta a $IP. Corrige el DNS y repite."
done
ok "asesoriasidt.com y www apuntan aquí"

# ---------- Publicar ----------
info "Preparando carpetas"
sudo mkdir -p "$RAIZ/releases" "$ACME" "$CACHE"
sudo chown -R "$(id -un):" "$RAIZ"

"$REPO/deploy/desplegar.sh"

# ---------- nginx ----------
# 1: solo HTTP · 2: + HTTPS de la raíz · 3: + HTTPS de lsec y ls
instalar_nginx() {
  local etapa="$1" tmp copia
  tmp="$(mktemp)"
  case "$etapa" in
    1) sed '/^#@@ HTTPS-/,$d' "$PLANTILLA" > "$tmp" ;;
    2) sed '/^#@@ HTTPS-LS/,$d' "$PLANTILLA" > "$tmp" ;;
    3) cp "$PLANTILLA" "$tmp" ;;
  esac

  copia=""
  if sudo test -f "$SITIO"; then
    copia="$(mktemp)"
    sudo cp "$SITIO" "$copia"
  fi

  sudo mkdir -p "$(dirname "$COMUN")"
  sudo cp "$REPO/deploy/nginx-sidt-landing-comun.conf" "$COMUN"
  sudo cp "$tmp" "$SITIO"
  sudo ln -sfn "$SITIO" "$ENLACE"
  rm -f "$tmp"

  if ! sudo nginx -t; then
    if [ -n "$copia" ]; then sudo cp "$copia" "$SITIO"; else sudo rm -f "$SITIO" "$ENLACE"; fi
    rm -f "$copia"
    fallo "nginx rechazó la configuración (etapa $etapa). Se restauró la anterior."
  fi
  rm -f "${copia:-/nonexistent}"
  sudo systemctl reload nginx
  ok "nginx actualizado (etapa $etapa)"
}

pedir_cert() {
  local nombre="$1"; shift
  local args=(certonly --webroot -w "$ACME" --non-interactive --agree-tos --keep-until-expiring
    --cert-name "$nombre" --deploy-hook "systemctl reload nginx")
  if [ -n "${CERTBOT_EMAIL:-}" ]; then
    args+=(--email "$CERTBOT_EMAIL")
  else
    args+=(--register-unsafely-without-email)
  fi
  for dominio in "$@"; do args+=(-d "$dominio"); done
  sudo certbot "${args[@]}"
}

etapa=2
if tiene_cert asesoriasidt.com; then
  ok "La raíz ya tiene certificado"
else
  info "Pidiendo certificado para asesoriasidt.com y www"
  instalar_nginx 1
  pedir_cert asesoriasidt.com asesoriasidt.com www.asesoriasidt.com
  ok "Certificado de la raíz emitido"
fi

pendientes=()
for dominio in lsec.asesoriasidt.com ls.asesoriasidt.com; do
  if tiene_cert "$dominio"; then
    continue
  elif apunta_aqui "$dominio"; then
    info "Pidiendo certificado para $dominio"
    # El reto llega por el puerto 80, que ya responde en cualquier etapa.
    instalar_nginx 2
    pedir_cert "$dominio" "$dominio"
  else
    pendientes+=("$dominio")
  fi
done
[ ${#pendientes[@]} -eq 0 ] && etapa=3
instalar_nginx "$etapa"

# ---------- Comprobar ----------
comprobar() {
  local url="$1" esperado="$2" codigo
  codigo="$(curl -s -o /dev/null -m 15 -w '%{http_code}' "$url" || true)"
  if [ "$codigo" = "$esperado" ]; then ok "$url → $codigo"; else aviso "$url → $codigo (se esperaba $esperado)"; fi
}

info "Comprobando"
comprobar https://asesoriasidt.com/ 200
comprobar https://www.asesoriasidt.com/ 301
comprobar https://asesoriasidt.com/robots.txt 200
comprobar https://asesoriasidt.com/public/landing/ec 200
if [ "$etapa" = 3 ]; then
  comprobar https://lsec.asesoriasidt.com/ 200
  comprobar https://ls.asesoriasidt.com/ 200
  comprobar https://ls.asesoriasidt.com/public/landing/pe 200
fi

echo
ok "Landing publicada en https://asesoriasidt.com"
for dominio in ${pendientes[@]+"${pendientes[@]}"}; do
  aviso "$dominio sigue en el hosting. Cuando su registro A apunte a $IP, repite ./deploy.sh"
done
echo "   Si /public/landing da error, falta desplegar la API o correr sus migraciones."
echo "   Testimonios, una sola vez, desde la carpeta de sidt-api:"
echo "     npm run landing:testimonios:prod -- $REPO/public/media"
