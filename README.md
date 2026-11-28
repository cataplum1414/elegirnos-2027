# Los muchachos se les casan — Jeisson & Ornella

Invitación de boda en español colombiano, diseñada como un estuche de CD de los años noventa. Pulsa **Estamos listos** para ver la escena animada con música. Al final aparece el sobre con sello de lacre. Al abrir el disco se pueden hojear y escuchar los ocho capítulos del cancionero, organizados en lados A y B. La contraportada es un libreto de cuatro páginas (fecha y lugar, asistencia, lo que viene y backstage) con los detalles de la boda y el sencillo de lanzamiento. La portada abre con el tema «Chapinero nos encontró».

## Enlace público

[Ver Los muchachos se les casan](https://cataplum1414.github.io/elegirnos-2027/)

## Ejecutar en local

Sirve el directorio raíz con cualquier servidor estático. Por ejemplo:

```sh
python -m http.server 8000 --bind 127.0.0.1
```

Abre `http://localhost:8000`. El servidor es necesario para cargar los módulos JavaScript desde `src/`.

## Estructura

- `index.html`: estructura y contenido de portada, capítulos, celebración y regalos.
- `favicon.svg`: monograma J&O para la pestaña del navegador.
- `styles.css`: identidad visual, responsive, foco visible y movimiento reducido.
- `back-cover.css`: contraportada paginada (índice, páginas, aviso +18 y backstage).
- `singles.css`: reproductor de una sola canción (portada y contraportada).
- `src/data/chapters.js`: catálogo musical y textos narrativos.
- `src/album.js`: apertura de la funda y navegación accesible por el cancionero.
- `src/deck.js`: animación del CD y controles de reproducción.
- `experience/`: escena animada, sobre, viñetas del cancionero y archivos de audio.
- `src/back-cover.js`: paginación de la contraportada con enlaces directos (`#asistencia`, `#regalos`, `#club-de-fans`).
- `src/singles.js`: reproductores de «Chapinero nos encontró» y «Seis cuadras más allá»; suenan solo al pulsar Reproducir y ceden el turno al cancionero.
- `src/progress.js`: progreso de lectura.
- `src/main.js`: inicialización e interacción de portada.

Con el sonido activo se reproduce la canción de la página abierta. Al terminar una pista, el cancionero pasa a la página siguiente y reproduce su canción. La fecha, el lugar, la hora y la vestimenta siguen pendientes de confirmación. Las fotografías personales y los datos de regalos se incorporarán únicamente cuando estén autorizados y confirmados.

El orden musical y los textos narrativos son una propuesta editorial pendiente de validación por la pareja antes de la publicación definitiva.

La portada y el arte del cancionero se sirven desde `assets/`. La fotografía de Bogotá tiene sus créditos y licencia en la contraportada. Las fuentes Barlow Condensed y Source Serif 4 se sirven desde `assets/fonts/` con sus licencias OFL.
