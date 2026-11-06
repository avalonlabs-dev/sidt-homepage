#!/usr/bin/env bash
# Despliegue de la landing "de una". Corre EN EL SERVIDOR, desde la carpeta del repo:
#
#   ./deploy.sh
#
# Se puede repetir sin riesgo. Publica el build y deja nginx y HTTPS según el DNS:
#   - La raíz asesoriasidt.com NO es de la landing: la sirve el sitio institucional (sidt-web).
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

apunta_aqui lsec.asesoriasidt.com || apunta_aqui ls.asesoriasidt.com \
  || fallo "Ni lsec ni ls apuntan a $IP. Corrige el DNS y repite."

# La raíz pasó al sitio institucional. Si esta landing todavía la sirve y sidt-web no está instalado,
# publicar esta versión dejaría la raíz sin servicio: primero se despliega sidt-web.
# "Sirve la raíz" = la configuración habilitada de sidt-web tiene un server HTTPS (listen 443) con
# server_name asesoriasidt.com. Si solo tiene pe, o el enlace falta, no la sirve.
sidt_web_sirve_raiz() {
  sudo cat /etc/nginx/sites-enabled/sidt-web.conf 2>/dev/null | awk '
    /^server \{/ { buf = $0 "\n"; dentro = 1; next }
    dentro {
      buf = buf $0 "\n"
      if ($0 ~ /^\}/) {
        dentro = 0
        if (buf ~ /listen[ \t]+(\[::\]:)?443[ \t;]/ && buf ~ /server_name[^;]*[ \t]asesoriasidt\.com[ \t;]/) { ok = 1; exit }
        buf = ""
      }
    }
    END { exit !ok }'
}
if sudo grep -qE 'server_name[[:space:]]+asesoriasidt\.com;' "$SITIO" 2>/dev/null && ! sidt_web_sirve_raiz; then
  fallo "La landing aún sirve asesoriasidt.com y sidt-web no sirve la raíz (falta su server HTTPS de asesoriasidt.com en sites-enabled/sidt-web.conf; ¿solo tiene pe?). Despliega primero sidt-web (./deploy.sh en su repo)."
fi

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

activos=()
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
for sitio in "${activos[@]}"; do
  case "$sitio" in
    LSEC) comprobar https://lsec.asesoriasidt.com/ 200
          comprobar https://lsec.asesoriasidt.com/robots.txt 200
          comprobar https://lsec.asesoriasidt.com/public/landing/ec 200 ;;
    LS)   comprobar https://ls.asesoriasidt.com/ 200
          comprobar https://ls.asesoriasidt.com/public/landing/pe 200 ;;
  esac
done

echo
ok "Landing publicada: ${activos[*]:-ningún dominio activo}"
for dominio in ${pendientes[@]+"${pendientes[@]}"}; do
  aviso "$dominio aún no está activo aquí. Cuando su registro A apunte a $IP, repite ./deploy.sh"
done
echo "   Si /public/landing da error, falta desplegar la API o correr sus migraciones."
echo "   Testimonios, una sola vez, desde la carpeta de sidt-api:"
echo "     npm run landing:testimonios:prod -- $REPO/public/media"
