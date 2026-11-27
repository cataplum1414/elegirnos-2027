# ELEGIRNOS — Jeisson & Ornella

Invitación web estática en español colombiano, concebida como un disco de dos lados con un libreto de ocho capítulos.

## Enlace público

[Ver la invitación ELEGIRNOS](https://cataplum1414.github.io/elegirnos-2027/)

## Ejecutar en local

Sirve el directorio raíz con cualquier servidor estático. Por ejemplo:

```sh
python -m http.server 8000 --bind 127.0.0.1
```

Abre `http://localhost:8000`. El servidor es necesario para cargar los módulos JavaScript desde `src/`.

Si la copia contiene material de revisión, ejecuta `node private-preview/serve.mjs` y abre `http://127.0.0.1:8867/?previa`. Ese servidor permite navegar por el audio y escucha únicamente en la dirección local. `private-preview/` queda fuera del repositorio.

## Estructura

- `index.html`: estructura y contenido de portada, capítulos, celebración y regalos.
- `favicon.svg`: monograma J&O para la pestaña del navegador.
- `styles.css`: identidad visual, responsive, foco visible y movimiento reducido.
- `src/data/chapters.js`: catálogo musical y textos narrativos.
- `src/album.js`: generación y navegación accesible de capítulos.
- `src/deck.js`: estado del tocadiscos y controles para las pistas disponibles en la vista local.
- `src/progress.js`: progreso de lectura.
- `src/main.js`: inicialización e interacción de portada.

La fecha, el lugar, la hora y la vestimenta siguen pendientes de confirmación. Los enlaces musicales abren búsquedas voluntarias en Spotify; no se reproduce audio automáticamente. Las fotografías personales y los datos de regalos se incorporarán únicamente cuando estén autorizados y confirmados.

El orden musical y los textos narrativos son una propuesta editorial pendiente de validación por la pareja antes de la publicación definitiva.

Las dos fotografías tienen sus créditos y licencias en el pie de página. Las fuentes Barlow Condensed y Source Serif 4 se sirven desde `assets/fonts/` con sus licencias OFL.
