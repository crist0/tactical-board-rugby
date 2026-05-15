# Project Kanban

## FASE 1: Configuración Inicial del Proyecto - COMPLETED
- [x] 1.1 - Crear proyecto Vue.js 3 con Vite
- [x] 1.2 - Configurar estructura de carpetas y componentes base
- [x] 1.3 - Instalar dependencias necesarias (si aplica)
- [x] 1.4 - Configurar Git e inicializar repositorio
- [x] 1.5 - Crear layout básico de la aplicación (header, paneles, footer)
- [x] 1.6 - Implementar sistema de paneles retráctiles (banquillo y línea de tiempo)

## FASE 2: Canvas de la Cancha de Rugby - COMPLETED
- [x] 2.1 - Crear componente Canvas para la cancha
- [x] 2.2 - Implementar dibujo de líneas reglamentarias de rugby
- [x] 2.3 - Mantener proporción 100x70 (responsive)
- [x] 2.4 - Implementar sistema de Zoom (in/out) con controles
- [x] 2.5 - Implementar pan/drag de la cancha cuando hay zoom
- [x] 2.6 - Agregar indicadores visuales (coordenadas, grid opcional)

## FASE 3: Sistema de Jugadores y Balón - COMPLETED
- [x] 3.1 - Crear componente Jugador (círculo con número)
- [x] 3.2 - Crear componente Balón (óvalo)
- [x] 3.3 - Implementar banquillo con 30 jugadores (15 por equipo) + balón
- [x] 3.4 - Implementar drag & drop desde banquillo a cancha
- [x] 3.5 - Implementar drag & drop dentro de la cancha - COMPLETED
- [x] 3.6 - Implementar devolución al banquillo (doble click y arrastrar)
- [x] 3.7 - Implementar restricción: un jugador por número en cancha
- [x] 3.8 - Implementar botón Reset (devolver todos al banquillo)
- [x] 3.9 - Crear selectores de color para equipos A y B
- [x] 3.10 - Balón siempre inicia en el centro de la cancha

## FASE 4: Sistema de Vinculación Balón-Jugador - COMPLETED
- [x] 4.1 - Implementar detección de proximidad balón-jugador
- [x] 4.2 - Implementar resaltado visual cuando balón está cerca de jugador
- [x] 4.3 - Implementar vinculación automática al soltar balón cerca
- [x] 4.4 - Implementar indicador visual de balón vinculado (línea punteada/ícono)
- [x] 4.5 - Implementar movimiento conjunto balón-jugador cuando están vinculados (Note: Functionally working, but minor visual sync lag/gap on initial link is identified as technical debt)
- [x] 4.6 - Implementar desvinculación al arrastrar balón lejos del jugador

## FASE 5: Sistema de Keyframes - COMPLETED
- [x] 5.1 - Crear estructura de datos para keyframes
- [x] 5.2 - Implementar botón [+ Keyframe] para guardar estado actual
- [x] 5.3 - Guardar posiciones de todos los elementos (30 jugadores + balón)
- [x] 5.4 - Crear componente de línea de tiempo (footer)
- [x] 5.5 - Mostrar keyframes como bloques visuales en línea de tiempo
- [ ] 5.6 - Implementar navegación: click en keyframe para cargar
- [ ] 5.7 - Implementar botones anterior/siguiente keyframe
- [ ] 5.8 - Implementar playhead visual (indicador de posición actual)
- [x] 5.9 - Implementar edición de keyframe existente (via auto-save on drag end)
- [x] 5.10 - Implementar eliminación de keyframe
- [x] 5.11 - Implementar drag & drop para reordenar keyframes
- [x] 5.12 - Implementar scroll horizontal en línea de tiempo

## FASE 6: History Manager (Undo/Redo System)
- [ ] 6.1 - Create `src/stores/historyStore.js`: Implement a Pinia store with `past` and `future` stacks to manage state snapshots.
- [ ] 6.2 - State Serialization Logic: Create a helper to capture a lightweight snapshot of both `playStore` and `playbackStore`.
- [ ] 6.3 - Action Capture Middleware: Implement logic to trigger `saveToHistory()` on critical actions:
    * `onDragEnd` in the field (players/ball).
    * Keyframe creation, deletion, or reordering.
- [ ] 6.4 - Configuration & Limits: Set a default history limit of 20 actions (configurable).
- [ ] 6.5 - Undo/Redo Operations: Implement core logic to pop states from stacks and overwrite current stores (Option B strategy).
- [ ] 6.6 - UI Implementation: Add Undo/Redo buttons to `AppHeader.vue` and implement global keyboard shortcuts (`Ctrl+Z`, `Ctrl+Y` / `Ctrl+Shift+Z`).

## FASE 7: Sistema de Animación y Reproducción
- [ ] 7.1 - Implementar interpolación de posiciones entre keyframes
- [ ] 7.2 - Crear controles de reproducción (play/pause/stop)
- [ ] 7.3 - Implementar botones de navegación (primer/último frame)
- [ ] 7.4 - Implementar loop/repetición automática
- [ ] 7.5 - Crear selector de velocidad (0.5s, 1s, 1.5s, 2s, 3s)
- [ ] 7.6 - Implementar reproducción desde keyframe actual
- [ ] 7.7 - Implementar reproducción desde inicio
- [ ] 7.8 - Implementar navegación frame por frame manual
- [ ] 7.9 - Sincronizar playhead con reproducción

## FASE 8: Herramientas de Anotación
- [ ] 8.1 - Crear panel de herramientas en sidebar izquierdo
- [ ] 8.2 - Implementar herramienta Flecha personalizada
- [ ] 8.3 - Implementar herramienta Línea libre
- [ ] 8.4 - Implementar herramienta Texto/Etiqueta
- [ ] 8.5 - Implementar herramienta Marcadores/Conos
- [ ] 8.6 - Crear panel de configuración dinámica por herramienta
- [ ] 8.7 - Implementar configuración: color personalizable
- [ ] 8.8 - Implementar configuración: grosor ajustable
- [ ] 8.9 - Implementar configuración: estilo de línea (sólido/punteado)
- [ ] 8.10 - Implementar configuración: tamaño de fuente (texto)
- [ ] 8.11 - Implementar configuración: tipos de marcadores
- [ ] 8.12 - Guardar anotaciones en keyframes
- [ ] 8.13 - Editar/eliminar anotaciones existentes
- [ ] 8.14 - Las anotaciones permanecen estáticas (no se animan)

## FASE 9: Trayectorias de Movimiento
- [ ] 9.1 - Crear toggle para mostrar/ocultar trayectorias
- [ ] 9.2 - Calcular trayectorias entre keyframes consecutivos
- [ ] 9.3 - Dibujar líneas discontinuas con flechas direccionales
- [ ] 9.4 - Aplicar color según elemento (jugador o balón)
- [ ] 9.5 - Implementar grosor mediano de línea
- [ ] 9.6 - Actualizar trayectorias cuando se modifican keyframes

## FASE 10: Gestión de Jugadas (LocalStorage)
- [ ] 10.1 - Crear estructura de datos JSON para jugadas
- [ ] 10.2 - Implementar guardado en LocalStorage
- [ ] 10.3 - Implementar carga desde LocalStorage
- [ ] 10.4 - Crear dropdown de jugadas guardadas
- [ ] 10.5 - Implementar función "Nueva Jugada"
- [ ] 10.6 - Implementar función "Guardar Jugada" (con nombre)
- [ ] 10.7 - Implementar función "Cargar Jugada"
- [ ] 10.8 - Implementar función "Exportar" (descargar JSON)
- [ ] 10.9 - Implementar función "Importar" (subir JSON)
- [ ] 10.10 - Validación de datos importados
- [ ] 10.11 - Manejo de errores y edge cases

## FASE 11: Pulido y Optimización
- [ ] 11.1 - Implementar feedback visual en todas las interacciones
- [ ] 11.2 - Agregar transiciones/animaciones suaves en UI
- [ ] 11.3 - Optimizar rendimiento del canvas
- [ ] 11.4 - Implementar estados de carga (loading states)
- [ ] 11.5 - Agregar mensajes de confirmación (eliminar, reset, etc.)
- [ ] 11.6 - Implementar atajos de teclado útiles
- [ ] 11.7 - Validaciones de formularios y campos
- [ ] 11.8 - Responsive final (mobile, tablet, desktop)
- [ ] 11.9 - Testing manual de flujos completos
- [ ] 11.10 - Documentación básica (README)