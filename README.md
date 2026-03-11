# ScoreViewer

ScoreViewer es una aplicación web hecha con React para **navegar y visualizar partituras y letras de canciones en PDF**.  
Permite filtrar por tipo (partituras / letras), buscar por grupo musical a través de un listado alfabético y visualizar los PDFs directamente en el navegador.

---

## Características

- Listado de canciones agrupadas por **grupo/artista**.
- Filtros rápidos:
  - **Canciones**: solo elementos con partitura.
  - **Letras**: solo elementos con letra.
  - Filtro alfabético por **letra inicial del grupo**.
- Visor integrado de PDF (usa el visor nativo del navegador).
- Layout en dos columnas:
  - Columna izquierda: filtros y listado desplegable.
  - Columna derecha: visor de la canción seleccionada.
- Generación automática del listado de canciones a partir de los PDF.

---

## Requisitos

- **Node.js** ≥ 14
- **npm** ≥ 6

---

## Puesta en marcha

```bash
# Instalar dependencias
npm install

# Arrancar en modo desarrollo
npm start
```

Al ejecutar `npm start` se lanza antes el script `prestart`:

```jsonc
"prestart": "node scripts/generateSongs.js"
```

Este script recorre los PDFs de la carpeta `public/pdfs` y regenera `src/songs.generated.json`, que es el fichero que usa la app para saber qué canciones hay.

La aplicación estará disponible en:

- `http://localhost:3000/`

---

## Scripts disponibles

En `package.json`:

- **`npm start`**  
  Arranca la app en modo desarrollo y regenera `songs.generated.json`.

- **`npm run build`**  
  Genera una versión optimizada para producción en la carpeta `build/`.

- **`npm test`**  
  Ejecuta los tests (Create React App).

---

## Estructura básica del proyecto

```text
ScoreViewer/
  public/
    pdfs/                 # PDFs de partituras y letras
  scripts/
    generateSongs.js      # Genera src/songs.generated.json
  src/
    App.js                # Layout principal (sidebar + visor)
    Constants.js          # Texto de introducción y ruta a PDFs
    songs.generated.json  # Listado generado automáticamente
    components/
      Header.js
      HeaderMenu.js       # Botones Inicio / Canciones / Letras
      Listado.js          # Listado por grupos con filtros
      SongViewer.js       # Visor del PDF seleccionado
      Introduction.js
      Footer.js
    assets/
      css/App.scss        # Estilos principales de la app
      img/                # Logo e imágenes varias
```

---

## Cómo añadir nuevas canciones

1. Copia los **PDF** a la carpeta:

   ```text
   public/pdfs
   ```

   El nombre del archivo sigue la convención:

   ```text
   Grupo - Título - P.pdf   # Partitura ("P")
   Grupo - Título - L.pdf   # Letra ("L")
   ```

   Ejemplos:

   - `ACDC - Back In Black - P.pdf`
   - `ACDC - Back In Black - L.pdf`

2. Ejecuta la app (o regenera el listado a mano):

   ```bash
   npm start
   # o bien
   node scripts/generateSongs.js
   ```

3. El script actualizará `src/songs.generated.json` y la nueva canción aparecerá automáticamente en el listado, agrupada por **nombre de grupo**.

---

## Despliegue

Puedes desplegar la app en cualquier hosting estático (Netlify, GitHub Pages, Vercel, etc.) usando el `build` de Create React App:

```bash
npm run build
```

La carpeta `build/` contiene la versión lista para producción.

---

## Licencia

Pendiente de definir.