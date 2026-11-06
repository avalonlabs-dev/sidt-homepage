# Guía de deploy de las landings

Para quien hace el deploy y el DNS. Nada de esto lo ejecuta el repositorio por su cuenta.

## Cómo queda

La landing es estática: un solo código y dos builds.

| Dominio | Qué sirve | Canónica |
|---|---|---|
| `asesoriasidt.com` | `dist/ec` (Ecuador) | ella misma |
| `www.asesoriasidt.com` | redirige (301) a la raíz | |
| `lsec.asesoriasidt.com` | `dist/ec` (destino de los anuncios de Ecuador) | `https://asesoriasidt.com/` |
| `ls.asesoriasidt.com` | `dist/pe` (Perú) | ella misma |

Hreflang en ambas versiones: `es-EC` a la raíz, `es-PE` a `ls`, `x-default` a la raíz (supuesto: la raíz muestra Ecuador).

En el servidor (`3.134.183.117`, nginx 1.24 en Ubuntu; el portal y la API ya corren en 3031 y 3030):

```
/var/www/sidt-landing/releases/<fecha>/{ec,pe}    cada publicación (se conservan 3)
/var/www/sidt-landing/current -> releases/<fecha> lo que sirve nginx (cambio atómico)
/var/www/sidt-landing/acme                        validación de certbot
```

El navegador pide direcciones, WhatsApp y testimonios a `/public/landing/<pais>`; nginx lo reenvía a la API (`127.0.0.1:3030`) y es lo único de la API que se expone en estos dominios. Si la API no responde, la página usa los datos del build.

## Estado actual del DNS

- `asesoriasidt.com` y `www` ya apuntan al servidor, pero **sin certificado propio**: hoy el HTTPS de la raíz da error de certificado y muestra el portal (server por defecto). Los pasos 1 a 5 lo arreglan.
- `ls` y `lsec` siguen en el hosting hasta que cambies su DNS (paso 7).
- Los nameservers siguen en el hosting (`namecheaphosting`). Los registros se editan donde esté la zona activa.

> **Antes de cancelar el hosting hay que mover la zona DNS completa** a su nuevo proveedor, con **MX, SPF (TXT), DKIM y autodiscover/autoconfig**, además de los registros del portal y la API. Si no, caen el correo, el portal y la API. Cambiar `ls` y `lsec` no depende de esto.

> **Desde el 2026-11-05 la raíz `asesoriasidt.com` es del sitio institucional (`sidt-web`).** Esta landing sirve solo `lsec` (Ecuador) y `ls` (Perú), y su canónica de Ecuador es `lsec`. Si en el servidor la landing todavía sirve la raíz, primero se despliega `sidt-web` (que hace el traspaso) y después esta landing; `./deploy.sh` se detiene si el orden se invierte. Las menciones a la raíz más abajo son históricas.

## Forma rápida: `./deploy.sh`

Requisitos en el servidor: Node 22, nginx, certbot y el repo clonado. Después:

```bash
cd ~/sidt-homepage
./deploy.sh
```

Publica el build, configura nginx y pide los certificados según el DNS. Se puede repetir.

- `asesoriasidt.com` y `www` deben apuntar al servidor, o el script se detiene.
- `lsec` y `ls` se activan solos cuando su DNS apunte aquí. Mientras tanto se omiten y siguen en el hosting.
- `./deploy.sh --rollback` vuelve a la publicación anterior.

Si solo uno de los dos propagó, se activa ese; al repetir `./deploy.sh` entra el otro.

### Cambiar `ls` y `lsec`

1. Con horas de anticipación, baja el TTL de sus registros A a 300 en el Zone Editor del cPanel.
2. Cambia solo esos dos registros A a `3.134.183.117`. No toques los nameservers ni los registros de correo.
3. Espera a que `dig +short ls.asesoriasidt.com` y `dig +short lsec.asesoriasidt.com` devuelvan esa IP.
4. Corre `./deploy.sh` en el servidor. Pide los certificados y activa cada dominio.

Entre el cambio de DNS y el paso 4, esos dominios pueden mostrar error de certificado: hazlo en un horario de poco tráfico.

Los pasos 1 a 5 son lo mismo, a mano.

## 1. Preparar el servidor (una sola vez)

```bash
node -v        # 22 o superior; si no, instálalo antes (el script lo comprueba)
git clone <URL-del-repo> ~/sidt-homepage && cd ~/sidt-homepage && git checkout main   # la rama que publiques

sudo mkdir -p /var/www/sidt-landing/releases /var/www/sidt-landing/acme
sudo chown -R "$USER": /var/www/sidt-landing           # el script escribe aquí sin sudo
sudo mkdir -p /var/cache/nginx/landing
sudo apt install -y certbot                              # si no está
```

El script usa `sudo` solo para `nginx -t` y `systemctl reload nginx`; tu usuario debe poder ejecutarlos.

## 2. Primera publicación

```bash
cd ~/sidt-homepage
deploy/desplegar.sh --solo-build   # opcional: pull, npm ci y build, sin publicar
deploy/desplegar.sh                # pull, build, copia a releases/<fecha>, current, nginx -t, reload
```

Hace, en orden: comprueba Node 22+, `git pull --ff-only`, `npm ci`, `npm run build`, copia `dist/ec` y `dist/pe` a `releases/<fecha>`, valida nginx, cambia `current` de forma atómica, recarga nginx y deja solo las 3 últimas releases. Si algo falla antes del cambio, `current` no se toca; si falla la recarga, restaura el enlace anterior.

## 3. nginx, etapa 1 (solo HTTP) y certificado de la raíz

nginx no arranca con un `server` 443 sin su certificado, así que el archivo se instala por etapas (las separan las líneas `#@@ HTTPS-...`).

```bash
sudo cp deploy/nginx-sidt-landing-comun.conf /etc/nginx/snippets/sidt-landing-comun.conf
sed '/^#@@ HTTPS-/,$d' deploy/nginx-sidt-landing.conf | sudo tee /etc/nginx/sites-available/sidt-landing.conf >/dev/null
sudo ln -sf /etc/nginx/sites-available/sidt-landing.conf /etc/nginx/sites-enabled/sidt-landing.conf
sudo nginx -t && sudo systemctl reload nginx

# Certificado para la raíz y www (los dos deben resolver a este servidor)
sudo certbot certonly --webroot -w /var/www/sidt-landing/acme \
  -d asesoriasidt.com -d www.asesoriasidt.com \
  --deploy-hook "systemctl reload nginx"
```

Si certbot falla: revisa que `dig +short asesoriasidt.com www.asesoriasidt.com` devuelva `3.134.183.117` y que no haya un registro AAAA hacia el hosting.

## 4. nginx, etapa 2 (HTTPS de la raíz y www)

```bash
sed '/^#@@ HTTPS-LS/,$d' deploy/nginx-sidt-landing.conf | sudo tee /etc/nginx/sites-available/sidt-landing.conf >/dev/null
sudo nginx -t && sudo systemctl reload nginx
sudo certbot renew --dry-run
```

Si el servidor ya tenía un `server` para el portal o la API, no los mezcles: son nombres distintos. La raíz ya no redirige a `lsec`: sirve la landing de Ecuador.

## 5. Verificar la raíz

```bash
curl -sI https://asesoriasidt.com/ | head -1                              # 200, sin error de certificado
curl -sI https://www.asesoriasidt.com/ | grep -i '^location'              # https://asesoriasidt.com/
curl -s  https://asesoriasidt.com/ | grep -o '<link rel="canonical"[^>]*>'
curl -s  https://asesoriasidt.com/robots.txt | tail -2                    # Sitemap: https://asesoriasidt.com/sitemap.xml
curl -sI https://asesoriasidt.com/sitemap.xml | head -1                   # 200
curl -sI https://asesoriasidt.com/llms.txt | head -1                      # 200
curl -sI https://asesoriasidt.com/gracias.html | head -1                  # 200 (lleva noindex)
curl -s  https://asesoriasidt.com/public/landing/ec | head -c 300         # JSON (cuando la API lo tenga publicado)
curl -sI https://asesoriasidt.com/auth/login | head -1                    # 404: la API no se expone
curl -sI -H 'Range: bytes=0-99' https://asesoriasidt.com/media/video/about01.mp4 | head -1   # 206
```

- Envía un formulario de prueba: debe llegar a `sidtasesoria.tesis@gmail.com` y redirigir a `/gracias.html` **del mismo dominio** (el `_next` se ajusta al dominio donde está la persona).
- En Google Ads comprueba que la conversión de `/gracias.html` se registra (mismo id en ambos países).
- En Search Console agrega la propiedad `asesoriasidt.com` y envía `https://asesoriasidt.com/sitemap.xml`.

## 6. Orden de publicación entre piezas

1. Migración `1753000000000-CreateLandingWeb` en `sidt-api`. Sin ella, guardar cualquier perfil falla, porque el portal ya envía `sistema.sitio_web`.
2. API. Incluye `trust proxy` en `main.ts`, necesario para que el límite de peticiones cuente por cliente.
3. Portal.
4. Landing (pasos 2 a 5; `ls` y `lsec` en el paso 7).

Si la base es nueva, la migración no encuentra empresas y `landing_configs` queda vacía: la landing usa los datos del build y el portal no muestra países. La precarga corre solo sobre empresas existentes.

## 7. `ls` y `lsec` (cuando cambies su DNS)

1. Crea registros **A** hacia `3.134.183.117` para `ls.asesoriasidt.com` y `lsec.asesoriasidt.com` (donde esté la zona activa) y espera a que resuelvan: `dig +short ls.asesoriasidt.com lsec.asesoriasidt.com`.
2. Certificados y etapa 3 (archivo completo):

```bash
sudo certbot certonly --webroot -w /var/www/sidt-landing/acme -d ls.asesoriasidt.com --deploy-hook "systemctl reload nginx"
sudo certbot certonly --webroot -w /var/www/sidt-landing/acme -d lsec.asesoriasidt.com --deploy-hook "systemctl reload nginx"
sudo cp deploy/nginx-sidt-landing.conf /etc/nginx/sites-available/sidt-landing.conf
sudo nginx -t && sudo systemctl reload nginx
```

3. Verifica:

```bash
curl -s https://lsec.asesoriasidt.com/ | grep -o '<link rel="canonical"[^>]*>'   # https://asesoriasidt.com/
curl -s https://ls.asesoriasidt.com/   | grep -o '<link rel="canonical"[^>]*>'   # https://ls.asesoriasidt.com/
curl -sI https://ls.asesoriasidt.com/gracias.html | head -1                      # 200
```

Los anuncios de Ecuador siguen llegando a `lsec` (mismo build que la raíz); los de Perú, a `ls`.

## 8. Publicar cambios y volver atrás

```bash
cd ~/sidt-homepage && deploy/desplegar.sh      # nueva release con lo último de la rama
deploy/desplegar.sh --rollback                 # vuelve a la release anterior (current y recarga)
ls -l /var/www/sidt-landing/current            # cuál está activa
```

- WhatsApp, direcciones y testimonios se administran desde el portal (permiso `sistema.sitio_web`) y se reflejan en un máximo de 10 minutos: 5 en nginx y 5 en el navegador.
- Textos, diseño o código: se publica con `desplegar.sh`. Datos por defecto de cada país (razón social, número, mensaje, universidades, título y descripción): `src/config/ec.ts` y `src/config/pe.ts`.
- El video (`media/video/about01.mp4`, unos 7 MB) solo se descarga cuando alguien pulsa "Ver video".

## Retirar un testimonio con urgencia

Ocultarlo o borrarlo en el portal no lo saca de inmediato: la imagen queda en caché hasta 24 horas en el navegador y en nginx. Además de borrarlo, limpia la caché de nginx:

```bash
sudo rm -rf /var/cache/nginx/landing/* && sudo systemctl reload nginx
```

Un cambio de contenido puede tardar hasta 10 minutos en verse: 5 en nginx y 5 en el navegador.
