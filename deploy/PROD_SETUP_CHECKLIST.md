# ScoreViewer - Checklist de produccion

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

## 6) Prueba funcional final

- Frontend abre canciones y PDFs correctamente.
- `POST /api/upload`, `PUT/DELETE /api/files/*`:
  - Piden usuario/clave (si activaste Basic Auth).
  - Requieren `X-Admin-Token` correcto.
