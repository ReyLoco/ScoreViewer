# ScoreViewer - Checklist de produccion

## 0) Preparar secretos y permisos para GitHub Actions

- Secrets esperados por `.github/workflows/deploy-prod.yml`:
  - `REACT_APP_SW_SONGS_API_URL`
  - `REACT_APP_SW_API_BASE_URL`
  - `REACT_APP_SW_PDF_BASE_URL`
  - `SSH_SW_HOST`
  - `SSH_SW_PORT`
  - `SSH_SW_USER`
  - `SSH_KEY_SW`
  - `DEPLOY_PATH_SW`
  - `DEPLOY_API_PATH_SW`
- Valores habituales:
  - `DEPLOY_PATH_SW=/var/www/scoreviewer`
  - `DEPLOY_API_PATH_SW=/var/www/scoreviewer-api`
- El usuario SSH de despliegue debe poder:
  - escribir en `/var/www/scoreviewer`
  - escribir en `/var/www/scoreviewer-api`
  - ejecutar `sudo systemctl restart scoreviewer-api` sin password
  - ejecutar `sudo systemctl is-active scoreviewer-api` sin password

Ejemplo de `sudoers` para el usuario `deploy`:

```bash
sudo visudo -f /etc/sudoers.d/scoreviewer-deploy
```

```text
deploy ALL=NOPASSWD: /bin/systemctl restart scoreviewer-api, /bin/systemctl is-active scoreviewer-api
```

## 1) Copiar codigo al servidor

- Copia `server/` y `scripts/` a `/var/www/scoreviewer-api/`.
- Instala dependencias:

```bash
cd /var/www/scoreviewer-api/server
npm ci
```

## 2) Crear servicio systemd

- Copia `deploy/scoreviewer-api.service.example` como:
  `/etc/systemd/system/scoreviewer-api.service`
- Edita `ADMIN_TOKEN` con un valor largo y unico.
- Arranca y habilita:

```bash
sudo systemctl daemon-reload
sudo systemctl enable scoreviewer-api
sudo systemctl restart scoreviewer-api
sudo systemctl status scoreviewer-api
```

- Verifica salud:

```bash
curl http://127.0.0.1:4000/api/health
```

## 3) Configurar Nginx

- Copia `deploy/nginx-scoreviewer.conf.example` a:
  `/etc/nginx/sites-available/scoreviewer`
- Enlaza y prueba:

```bash
sudo ln -s /etc/nginx/sites-available/scoreviewer /etc/nginx/sites-enabled/scoreviewer
sudo nginx -t
sudo systemctl reload nginx
```

## 4) Proteger rutas admin con Basic Auth (opcional pero recomendado)

```bash
sudo apt-get update
sudo apt-get install -y apache2-utils
sudo htpasswd -c /etc/nginx/.htpasswd-scoreviewer-admin admin
sudo nginx -t
sudo systemctl reload nginx
```

## 5) Activar HTTPS

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d scoreviewer.luismasso.es -d api.luismasso.es
```

### Recarga automatica de Nginx tras renovar certificado

Para evitar que Nginx siga sirviendo un certificado antiguo despues de una renovacion,
crea un hook de deploy de Certbot:

```bash
sudo mkdir -p /etc/letsencrypt/renewal-hooks/deploy
sudo nano /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh
```

Contenido:

```bash
#!/bin/sh
set -e
systemctl reload nginx
```

Permisos:

```bash
sudo chmod +x /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh
```

Verificacion:

```bash
sudo certbot renew --dry-run
```

Si el hook esta bien, tras una renovacion real o simulada Nginx recargara el certificado automaticamente.

## 6) Prueba funcional final

- Frontend abre canciones y PDFs correctamente.
- `POST /api/upload`, `PUT/DELETE /api/files/*`:
  - Piden usuario/clave (si activaste Basic Auth).
  - Requieren `X-Admin-Token` correcto.
- Un `push` a `main` ejecuta el workflow y:
  - actualiza `/var/www/scoreviewer`
  - actualiza `/var/www/scoreviewer-api/{server,scripts,deploy}`
  - ejecuta `npm ci --omit=dev` en backend
  - reinicia `scoreviewer-api`
