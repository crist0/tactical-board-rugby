# RESUMEN EXTENSO DEL PROYECTO
## Tactical Board Animado para Rugby - Vue.js 3

---

## 📋 INFORMACIÓN GENERAL

**Nombre del Proyecto:** Tactical Board Rugby (nombre tentativo)

**Objetivo:** Aplicación web interactiva para crear, editar y animar jugadas de rugby mediante un sistema de keyframes, permitiendo visualizar estrategias de equipo de forma dinámica.

**Stack Tecnológico:**
- Frontend: Vue.js 3
- Almacenamiento: LocalStorage (JSON)
- Control de versiones: Git (commit por cada fase completada)
- Migración futura: IndexedDB (cuando sea necesario por volumen de datos)

**Arquitectura de Stores (Pinia):**
- **playStore:** Estado maestro de todos los elementos tácticos (30 jugadores + balón). Fuente de verdad para posiciones (`x`, `y`), ubicación (`field`/`bench`) y estado de vinculación (`linkedTo`).
- **playbackStore:** Dueño del estado de las jugadas. Gestiona un array de `keyframes` (snapshots inmutables que capturan posiciones de jugadores y balón) y el índice activo (`currentKeyframeIndex`). Provee acciones para crear, duplicar, insertar, eliminar y navegar entre keyframes. Se integra con `playStore.updateItemPosition` mediante auto-save.
- **uiStore:** Estado de la interfaz (visibilidad de paneles, zoom, pan, grid).

---

## 🎨 ELEMENTOS VISUALES

### Cancha de Rugby
- **Proporción fija:** 100m x 70m (mantiene proporción real siempre)
- **Zoom:** In/Out funcional para mejor visualización
- **Líneas reglamentarias completas:**
  - Líneas de touch (laterales)
  - Líneas de goal (fondo)
  - Línea de medio campo (50m)
  - Líneas de 22 metros (ambos lados)
  - Líneas de 10 metros (ambos lados)
  - Líneas de 5 metros (paralelas al touch)
  - Líneas discontinuas de 15 metros (lineouts)
  - Zonas de in-goal
  - Postes de goal en H

### Jugadores
- **Cantidad:** 15 por equipo (30 total)
- **Representación visual:** Círculos con número del 1-15
- **Colores:**
  - Por defecto: Equipo A (Azul), Equipo B (Rojo)
  - Personalizables por el usuario mediante color pickers
- **Números:** Blanco con borde/contorno negro (máximo contraste en cualquier color)
- **Restricción:** Cada número (1-15) solo puede estar UNA vez en la cancha por equipo
- **Posición inicial:** En el banquillo (panel lateral derecho)

### Balón
- **Forma:** Ovalada simple (elipse)
- **Tamaño:** Un tercio del tamaño de los jugadores
- **Posición inicial:** Centro de la cancha
- **Color:** Marrón tradicional (por defecto, configurable)

---

## 🖱️ INTERACCIONES Y CONTROLES

### Movimiento de Elementos
- **Drag & Drop:** Método principal para mover jugadores y balón
- **Desde banquillo → cancha:** Arrastrar jugador al campo
- **Dentro de la cancha:** Arrastrar para reposicionar
- **Devolución al banquillo:** 
  - Doble click en el jugador
  - Arrastrar de vuelta al panel del banquillo
- **Botón Reset:** Devuelve todos los elementos al banquillo

### Vinculación Balón-Jugador
- **Sistema híbrido con detección de proximidad:**
  - Arrastrar balón cerca de un jugador → jugador se resalta
  - Soltar balón cerca → se pega automáticamente
  - Balón pegado muestra indicador visual (línea punteada o ícono de cadena)
  - Desvincular: arrastrar balón más allá de cierta distancia del jugador
- **Comportamiento:** Cuando el balón está pegado, se mueve junto con el jugador

---

## 🎬 SISTEMA DE KEYFRAMES

### Funcionamiento
1. Usuario coloca elementos en la cancha
2. Click en **[+ Keyframe]** → Guarda posiciones actuales de todos los elementos (30 jugadores + balón + anotaciones)
3. Usuario reposiciona elementos
4. Click en **[+ Keyframe]** → Crea segundo fotograma
5. Repetir proceso para crear secuencia completa

### Gestión de Keyframes
- **Visualización:** Línea de tiempo horizontal (footer) con bloques rectangulares
- **Navegación:**
  - Click directo en keyframe para cargar sus posiciones
  - Botones anterior/siguiente
  - Playhead (indicador de posición actual)
- **Edición completa:**
  - ✏️ Modificar keyframe existente
  - 🗑️ Eliminar keyframe
  - Drag & drop para reordenar keyframes en la línea de tiempo
- **Scroll horizontal:** Si hay muchos keyframes

---

## ▶️ SISTEMA DE ANIMACIÓN Y REPRODUCCIÓN

### Controles de Reproducción
- **⏮** Ir al primer keyframe
- **⏪** Keyframe anterior
- **▶️/⏸** Play/Pause
- **⏹** Stop (vuelve al inicio)
- **⏩** Keyframe siguiente
- **⏭** Ir al último keyframe
- **🔁** Loop/repetir automáticamente

### Opciones de Reproducción
- **Velocidad ajustable:** 0.5s, 1s, 1.5s, 2s, 3s (tiempo de transición entre keyframes)
- **Desde actual o desde inicio:** Puede reproducir desde keyframe actual hasta el final o desde el principio
- **Frame por frame:** Avanzar/retroceder manualmente

---

## 🎨 HERRAMIENTAS DE ANOTACIÓN

### Herramientas Disponibles
1. **➡️ Flechas personalizadas**
   - Color personalizable
   - Grosor ajustable
   
2. **─ Líneas libres**
   - Color personalizable
   - Grosor ajustable
   - Estilo seleccionable (sólido/punteado)

3. **T Texto/Etiquetas**
   - Tamaño de fuente ajustable
   - Color personalizable
   - Posicionables en cualquier lugar de la cancha

4. **📍 Marcadores/Conos**
   - Diferentes tipos de marcadores
   - Colores personalizables

### Comportamiento de Anotaciones
- **Estáticas por keyframe:** No se animan entre fotogramas
- **Aparición/Desaparición:** Pueden existir solo en keyframes específicos
- **Guardado:** Se almacenan junto con las posiciones de cada keyframe

---

## 🛤️ TRAYECTORIAS DE MOVIMIENTO

### Características
- **Toggle on/off:** Checkbox en header para mostrar/ocultar
- **Visualización:**
  - Líneas discontinuas con flechas direccionales
  - Grosor mediano
  - Mismo color que cada elemento (jugador usa su color, balón usa el suyo)
- **Muestra:** El recorrido de cada elemento entre keyframes consecutivos

---

## 💾 GESTIÓN DE JUGADAS

### Estructura de Datos
- **Formato:** Un archivo JSON único con todas las jugadas
- **Almacenamiento:** LocalStorage del navegador
- **Estructura del JSON:**
```json
{
  "jugadas": [
    {
      "id": "uuid-generado",
      "nombre": "Ataque por derecha",
      "fechaCreacion": "2026-02-13T10:30:00",
      "equipoA": {
        "color": "#0000FF"
      },
      "equipoB": {
        "color": "#FF0000"
      },
      "keyframes": [
        {
          "id": 1,
          "jugadores": [...],
          "balon": {...},
          "anotaciones": [...]
        }
      ]
    }
  ]
}
```

### Funcionalidades
- **Nombrar jugadas:** Usuario asigna nombre descriptivo
- **Lista de jugadas:** Dropdown en header con todas las jugadas guardadas
- **Operaciones:**
  - **Nueva:** Crear jugada desde cero
  - **Guardar:** Actualizar jugada actual
  - **Cargar:** Seleccionar de la lista para editar
  - **Exportar:** Descargar archivo JSON completo
  - **Importar:** Subir archivo JSON desde disco

---

## 🖥️ LAYOUT DE LA INTERFAZ

### Header (Barra Superior)
**Izquierda:**
- Dropdown: Jugadas guardadas
- [Nueva] [Guardar] [Exportar] [Importar]

**Centro:**
- [+ Keyframe]
- [☑ Trayectorias]

**Derecha:**
- Controles de reproducción: [⏮][⏪][▶️][⏹][⏩][⏭][🔁]
- Selector velocidad: [1s ▼]

---

### Panel Izquierdo (Herramientas)
**Ancho fijo: ~150-180px**

- 🎨 Herramientas de anotación
  - ➡️ Flecha
  - ─ Línea
  - T Texto
  - 📍 Marcador
- Panel de configuración dinámica (según herramienta seleccionada)
- Controles de zoom (inferior):
  - [-] [100%] [+]

---

### Centro (Cancha Principal)
- Canvas responsive
- Mantiene proporción 100x70
- Máximo espacio disponible
- Área de drag & drop

---

### Panel Derecho (Banquillo - Retráctil)
**Ancho: ~200-220px | Botón [◀ Ocultar]**

**Equipo A (Superior):**
- Selector color [🔵]
- Jugadores 1-15 (círculos arrastrables)

**Equipo B (Inferior):**
- Selector color [🔴]
- Jugadores 1-15 (círculos arrastrables)

**Comportamiento:**
- Retráctil con animación suave
- [▶ Mostrar] cuando está oculto

---

### Footer (Línea de Tiempo - Retráctil)
**Altura: ~120-150px | Botón [▼ Ocultar]**

- Keyframes en bloques rectangulares
- Scroll horizontal
- Playhead visual
- Drag & drop para reordenar
- Opciones: [✏️ Editar] [🗑️ Eliminar]

---

## 🎯 FLUJO DE TRABAJO ESPERADO

1. Usuario crea nueva jugada (o carga existente)
2. Selecciona colores de equipos (opcional)
3. Arrastra jugadores desde banquillo → cancha
4. Balón ya está en centro (puede moverse)
5. Opcionalmente: agrega anotaciones (flechas, líneas, texto, marcadores)
6. Click [+ Keyframe] → Guarda estado inicial
7. Reposiciona elementos para siguiente fase
8. Click [+ Keyframe] → Segundo fotograma
9. Repite pasos 7-8 hasta completar jugada
10. Activa [☑ Trayectorias] para visualizar movimientos
11. Click [▶️] para reproducir animación
12. Ajusta velocidad si es necesario
13. Edita keyframes individuales si requiere cambios
14. Guarda jugada con nombre descriptivo
15. Exporta JSON para backup o compartir

---

## 📱 CONSIDERACIONES RESPONSIVE

### Desktop (>1200px)
- Layout completo como descrito
- Todos los paneles visibles

### Tablet (768-1200px)
- Paneles laterales más estrechos
- Banquillo retráctil por defecto

### Mobile (<768px)
- Banquillo como drawer/modal
- Línea de tiempo retráctil por defecto
- Herramientas como toolbar flotante
- Cancha ocupa pantalla completa
- Controles adaptados a touch

---

## 🔮 MIGRACIÓN FUTURA (Post-MVP)

- **IndexedDB:** Cuando el volumen de jugadas crezca significativamente
- **Imágenes personalizadas:** Permitir reemplazar círculos con íconos/sprites de jugadores
- **Backend/Base de datos:** Para sincronización multi-dispositivo
- **Compartir jugadas:** Sistema de colaboración entre usuarios
- **Exportación a video:** Generar MP4/GIF de la animación


