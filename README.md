# ELEGIRNOS — Ornella & Jeisson

Invitación web estática en español colombiano, concebida como un álbum de ocho capítulos. Esta primera iteración prioriza la portada, la navegación narrativa y el acceso directo a la información del evento.

## Ejecutar en local

Sirve el directorio raíz con cualquier servidor estático. Por ejemplo:

```sh
python -m http.server 8000
```

Abre `http://localhost:8000`. El servidor es necesario para cargar los módulos JavaScript desde `src/`.

## Estructura

- `index.html`: estructura y contenido de portada, capítulos, celebración y regalos.
- `styles.css`: identidad visual, responsive, foco visible y movimiento reducido.
- `src/data/chapters.js`: catálogo musical y textos narrativos.
- `src/album.js`: generación y navegación accesible de capítulos.
- `src/progress.js`: progreso de lectura.
- `src/main.js`: inicialización e interacción de portada.

La fecha, el lugar, la hora y la vestimenta siguen pendientes de confirmación. Los enlaces musicales abren búsquedas voluntarias en Spotify; no se reproduce audio automáticamente. Las fotografías personales y los datos de regalos se incorporarán únicamente cuando estén autorizados y confirmados.

El orden musical y los textos narrativos son una propuesta editorial pendiente de validación por la pareja antes de la publicación definitiva.
