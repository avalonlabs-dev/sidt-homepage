#!/usr/bin/env bash
# Despliegue de la landing "de una". Corre EN EL SERVIDOR, desde la carpeta del repo:
#
#   ./deploy.sh
#
# Se puede repetir sin riesgo. Publica el build y deja nginx y HTTPS según el DNS:
#   - asesoriasidt.com y www: obligatorios, deben apuntar a este servidor.
#   - lsec y ls: cada uno se activa solo cuando su DNS apunta aquí. Mientras no, se omite.
#     Si solo uno propagó, se activa ese; al repetir entra el otro.
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
for comando in git node npm nginx certbot curl getent openssl sudo; do
  command -v "$comando" >/dev/null || fallo "Falta $comando. Instálalo y repite (certbot: sudo apt install -y certbot)."
done

IP="${IP_SERVIDOR:-$(curl -fsS -m 10 https://checkip.amazonaws.com | tr -d '[:space:]')}"
[ -n "$IP" ] || fallo "No se pudo averiguar la IP pública de este servidor. Defínela con IP_SERVIDOR=..."
info "IP de este servidor: $IP"

apunta_aqui() { getent ahostsv4 "$1" | awk '{print $1}' | grep -qx "$IP"; }
# Vigente por al menos 7 días: uno vencido cuenta como que no existe.
tiene_cert()  { sudo openssl x509 -checkend 604800 -noout -in "$CERTS/$1/fullchain.pem" >/dev/null 2>&1; }

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
# Bloque HTTPS de un sitio dentro de la plantilla.
seccion() {
  awk -v m="#@@ HTTPS-$1 " 'index($0, "#@@ HTTPS-") == 1 { p = (index($0, m) == 1) } p' "$PLANTILLA"
}

# Instala la base HTTP más el HTTPS de los sitios indicados (RAIZ, LSEC, LS).
instalar_nginx() {
  local tmp copia sitio
  tmp="$(mktemp)"
  sed '/^#@@ HTTPS-/,$d' "$PLANTILLA" > "$tmp"
  for sitio in "$@"; do seccion "$sitio" >> "$tmp"; done

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
    fallo "nginx rechazó la configuración. Se restauró la anterior."
  fi
  rm -f "${copia:-/nonexistent}"
  sudo systemctl reload nginx
  ok "nginx actualizado (HTTPS: ${*:-ninguno})"
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

if tiene_cert asesoriasidt.com; then
  ok "La raíz ya tiene certificado vigente"
else
  info "Pidiendo certificado para asesoriasidt.com y www"
  instalar_nginx
  pedir_cert asesoriasidt.com asesoriasidt.com www.asesoriasidt.com
  ok "Certificado de la raíz emitido"
fi

activos=(RAIZ)
pendientes=()
activar() {
  local sitio="$1" dominio="$2"
  if tiene_cert "$dominio"; then
    activos+=("$sitio")
  elif ! apunta_aqui "$dominio"; then
    pendientes+=("$dominio")
  else
    info "Pidiendo certificado para $dominio"
    instalar_nginx "${activos[@]}"
    if pedir_cert "$dominio" "$dominio"; then
      activos+=("$sitio")
    else
      aviso "Falló el certificado de $dominio; puede que el DNS aún no propague."
      pendientes+=("$dominio")
    fi
  fi
}
activar LSEC lsec.asesoriasidt.com
activar LS ls.asesoriasidt.com
instalar_nginx "${activos[@]}"

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
for sitio in "${activos[@]}"; do
  case "$sitio" in
    LSEC) comprobar https://lsec.asesoriasidt.com/ 200
          comprobar https://lsec.asesoriasidt.com/public/landing/ec 200 ;;
    LS)   comprobar https://ls.asesoriasidt.com/ 200
          comprobar https://ls.asesoriasidt.com/public/landing/pe 200 ;;
  esac
done

echo
ok "Landing publicada en https://asesoriasidt.com"
for dominio in ${pendientes[@]+"${pendientes[@]}"}; do
  aviso "$dominio aún no está activo aquí. Cuando su registro A apunte a $IP, repite ./deploy.sh"
done
echo "   Si /public/landing da error, falta desplegar la API o correr sus migraciones."
echo "   Testimonios, una sola vez, desde la carpeta de sidt-api:"
echo "     npm run landing:testimonios:prod -- $REPO/public/media"
