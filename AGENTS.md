## ScoreViewer – Notas para agentes

### 1. Características actuales del proyecto

- **Frontend React (Create React App)**  
  - Código en `src/`.  
  - Lista de canciones originalmente generada en `src/songs.generated.json` a partir de los PDFs de `public/pdfs` usando `scripts/generateSongs.js`.  
  - Ahora el listado se obtiene dinámicamente desde una **API Node** mediante `GET /api/songs`.  
  - La URL de la API se configura en `src/Constants.js`:
    - `SONGS_API_URL` (por defecto `http://localhost:4000/api/songs`)
    - `API_BASE_URL` (por defecto `http://localhost:4000`)
    - `PDF_BASE_URL` (por defecto `${API_BASE_URL}/pdfs/`)

- **Generación de canciones (lógica compartida)**  
  - El módulo `scripts/songsGenerator.js` contiene la lógica para leer PDFs y generar el array de canciones.  
  - Soporta lectura **recursiva** (subcarpetas) y devuelve rutas relativas normalizadas con `/` (útil para Linux/Windows).  
  - `scripts/generateSongs.js` sigue existiendo para generar el JSON estático en desarrollo/build, pero ahora reutiliza `songsGenerator.js`.

- **Backend API (Node/Express)**  
  - Código en `server/index.js` con `server/package.json`.  
  - Dependencias principales: `express`, `multer`, `cors`.  
  - Usa la misma lógica de `songsGenerator.js` para obtener el listado desde la carpeta de PDFs (`PDF_DIR`).  
  - Endpoints principales:
    - `GET /api/health` → Comprobación rápida de estado.
    - `GET /api/songs` → Devuelve el listado completo de canciones generado a partir de los PDFs.
    - `POST /api/upload` → Sube un PDF nuevo (`multipart/form-data`, campo `file`, opcionalmente `group`, `title`, `type`). Renombra el archivo al formato `Grupo - Título - P/L.pdf` y recalcula el listado.
    - `PUT /api/files/:fileName` → Renombra un PDF existente usando `newGroup`, `newTitle`, `newType` (en el body). Devuelve el nuevo nombre y el listado actualizado.
    - `DELETE /api/files/:fileName` → Elimina un PDF y devuelve el listado actualizado.
  - Sirve PDFs desde el propio backend en `GET /pdfs/<archivo>` (para no depender de `public/pdfs` en el build estático).
  - Carpeta de PDFs configurable con `PDF_DIR` (por defecto `public/pdfs` en el repo).

- **Despliegue previsto**  
  - Frontend desplegable mediante Netlify o un workflow de GitHub Actions que construya el `build/` y lo copie al servidor Linux.  
  - Backend a ejecutar en el servidor Linux (Clouding, sin interfaz gráfica), escuchando en el puerto 4000 o el que se configure.  
  - Se usa **rclone** en el servidor para sincronizar una carpeta de Google Drive (fuente de verdad) hacia el servidor.

- **Panel Admin en la app**  
  - Existe un panel `Admin` en el frontend para subir/renombrar/borrar PDFs usando la API.
  - Nota: el `PUT` (rename) actualmente renombra y coloca el archivo en la **raíz** de `PDF_DIR` (pendiente soportar “mantener subcarpeta”).

- **Estado de datos en el repo local**
  - En `public/pdfs` se han dejado **solo 10 PDFs** para pruebas locales (se eliminaron el resto).

- **Estado del servidor (Clouding)**
  - Ubuntu 20.04 actualizado (repos estándar), disco ampliado a 20GB.
  - Node instalado (v20.x).
  - Ruta de datos en el servidor: `/srv/scoreviewer/partituras` con subcarpetas:
    - `/srv/scoreviewer/partituras/General`
    - `/srv/scoreviewer/partituras/Propias`
  - rclone configurado (remote `gdrive`) y sincronización completada.
  - Cron (root) semanal:
    - Sábado 22:00 → sync General
    - Sábado 23:00 → sync Propias
    - Log: `/var/log/rclone-scoreviewer.log`

### 2. Próximos pasos recomendados

1. **Desplegar backend en el servidor Linux**
   - Copiar el repo (o solo `server/` + `scripts/`) al servidor (p. ej. `/var/www/scoreviewer`).
   - Instalar dependencias en `server/` con `npm install`.
   - Ejecutar el backend como servicio (`pm2` o `systemd`) con:
     - `PDF_DIR=/srv/scoreviewer/partituras`
     - `PORT=4000` (o el que se configure)
     - `ALLOWED_ORIGIN=<dominio_frontend>` para CORS en producción.

2. **Configurar Nginx (reverse proxy)**
   - Exponer públicamente:
     - `/api/*` → backend Node
     - `/pdfs/*` → backend Node (PDFs)
   - Configurar HTTPS (Let’s Encrypt) si hay dominio.

3. **Configurar frontend para producción**
   - En build (Netlify o GitHub Actions) definir:
     - `REACT_APP_SONGS_API_URL=https://<dominio_api>/api/songs`
     - `REACT_APP_API_BASE_URL=https://<dominio_api>`
     - (si se quiere) `REACT_APP_PDF_BASE_URL=https://<dominio_api>/pdfs/`

4. **Mejoras en AdminPanel / endpoints (pendiente)**
   - Soportar renombrado manteniendo subcarpeta (`General/` vs `Propias/`) (añadir parámetro `folder` o deducir del path).
   - Proteger endpoints de administración (token simple / allowlist / basic auth).

5. **Configurar un workflow de despliegue desde GitHub (si se desea sustituir Netlify)**
   - Crear `.github/workflows/deploy.yml` que:
     - Haga `npm install` y `npm run build` del frontend.  
     - Copie el contenido de `build/` al directorio público del servidor mediante `rsync` o `scp`.  
     - Opcionalmente sincronice/actualice `server/` y reinicie el servicio del backend.

6. **Seguridad básica y hardening**
   - Restringir `CORS` en `server/index.js` solo a los orígenes reales de producción.  
   - Revisar que los endpoints de upload/update/delete estén protegidos (autenticación simple, token, IP allowlist, etc.) antes de exponerlos públicamente.  
   - Validar bien los nombres de archivo y parámetros para evitar problemas de path traversal o inyección.

