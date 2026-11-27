# Los muchachos se les casan — Jeisson & Ornella

Invitación de boda en español colombiano, diseñada como un estuche de CD de los años noventa. La edición privada abre con una escena animada. Al abrir el estuche se pueden hojear los ocho capítulos del cancionero, organizados en lados A y B. Al darle vuelta aparecen los detalles de la boda en la contraportada.

## Enlace público

[Ver Los muchachos se les casan](https://cataplum1414.github.io/elegirnos-2027/)

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
- `src/album.js`: apertura de la funda y navegación accesible por el cancionero.
- `src/deck.js`: animación del CD y controles de las pistas en la edición privada.
- `src/progress.js`: progreso de lectura.
- `src/main.js`: inicialización e interacción de portada.

La edición pública enlaza a búsquedas musicales en Spotify. En la edición privada, al activar el sonido se reproduce la canción de la página abierta. Al terminar una pista, el cancionero pasa a la página siguiente y reproduce su canción. La fecha, el lugar, la hora y la vestimenta siguen pendientes de confirmación. Las fotografías personales y los datos de regalos se incorporarán únicamente cuando estén autorizados y confirmados.

El orden musical y los textos narrativos son una propuesta editorial pendiente de validación por la pareja antes de la publicación definitiva.

La portada y el arte del cancionero se sirven desde `assets/`. La fotografía de Bogotá tiene sus créditos y licencia en la contraportada. Las fuentes Barlow Condensed y Source Serif 4 se sirven desde `assets/fonts/` con sus licencias OFL.
