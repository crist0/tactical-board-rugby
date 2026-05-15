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
- [ ] 3.9 - Crear selectores de color para equipos A y B
- [ ] 3.10 - Balón siempre inicia en el centro de la cancha

## FASE 4: Sistema de Vinculación Balón-Jugador - COMPLETED
- [x] 4.1 - Implementar detección de proximidad balón-jugador
- [x] 4.2 - Implementar resaltado visual cuando balón está cerca de jugador
- [x] 4.3 - Implementar vinculación automática al soltar balón cerca
- [x] 4.4 - Implementar indicador visual de balón vinculado (línea punteada/ícono)
- [ ] 4.5 - Implementar movimiento conjunto balón-jugador cuando están vinculados
- [ ] 4.6 - Implementar desvinculación al arrastrar balón lejos del jugador

## FASE 5: Sistema de Keyframes
- [ ] 5.1 - Crear estructura de datos para keyframes
- [ ] 5.2 - Implementar botón [+ Keyframe] para guardar estado actual
- [ ] 5.3 - Guardar posiciones de todos los elementos (30 jugadores + balón)
- [ ] 5.4 - Crear componente de línea de tiempo (footer)
- [ ] 5.5 - Mostrar keyframes como bloques visuales en línea de tiempo
- [ ] 5.6 - Implementar navegación: click en keyframe para cargar
- [ ] 5.7 - Implementar botones anterior/siguiente keyframe
- [ ] 5.8 - Implementar playhead visual (indicador de posición actual)
- [ ] 5.9 - Implementar edición de keyframe existente
- [ ] 5.10 - Implementar eliminación de keyframe
- [ ] 5.11 - Implementar drag & drop para reordenar keyframes
- [ ] 5.12 - Implementar scroll horizontal en línea de tiempo

## FASE 6: Sistema de Animación y Reproducción
- [ ] 6.1 - Implementar interpolación de posiciones entre keyframes
- [ ] 6.2 - Crear controles de reproducción (play/pause/stop)
- [ ] 6.3 - Implementar botones de navegación (primer/último frame)
- [ ] 6.4 - Implementar loop/repetición automática
- [ ] 6.5 - Crear selector de velocidad (0.5s, 1s, 1.5s, 2s, 3s)
- [ ] 6.6 - Implementar reproducción desde keyframe actual
- [ ] 6.7 - Implementar reproducción desde inicio
- [ ] 6.8 - Implementar navegación frame por frame manual
- [ ] 6.9 - Sincronizar playhead con reproducción

## FASE 7: Herramientas de Anotación
- [ ] 7.1 - Crear panel de herramientas en sidebar izquierdo
- [ ] 7.2 - Implementar herramienta Flecha personalizada
- [ ] 7.3 - Implementar herramienta Línea libre
- [ ] 7.4 - Implementar herramienta Texto/Etiqueta
- [ ] 7.5 - Implementar herramienta Marcadores/Conos
- [ ] 7.6 - Crear panel de configuración dinámica por herramienta
- [ ] 7.7 - Implementar configuración: color personalizable
- [ ] 7.8 - Implementar configuración: grosor ajustable
- [ ] 7.9 - Implementar configuración: estilo de línea (sólido/punteado)
- [ ] 7.10 - Implementar configuración: tamaño de fuente (texto)
- [ ] 7.11 - Implementar configuración: tipos de marcadores
- [ ] 7.12 - Guardar anotaciones en keyframes
- [ ] 7.13 - Editar/eliminar anotaciones existentes
- [ ] 7.14 - Las anotaciones permanecen estáticas (no se animan)

## FASE 8: Trayectorias de Movimiento
- [ ] 8.1 - Crear toggle para mostrar/ocultar trayectorias
- [ ] 8.2 - Calcular trayectorias entre keyframes consecutivos
- [ ] 8.3 - Dibujar líneas discontinuas con flechas direccionales
- [ ] 8.4 - Aplicar color según elemento (jugador o balón)
- [ ] 8.5 - Implementar grosor mediano de línea
- [ ] 8.6 - Actualizar trayectorias cuando se modifican keyframes

## FASE 9: Gestión de Jugadas (LocalStorage)
- [ ] 9.1 - Crear estructura de datos JSON para jugadas
- [ ] 9.2 - Implementar guardado en LocalStorage
- [ ] 9.3 - Implementar carga desde LocalStorage
- [ ] 9.4 - Crear dropdown de jugadas guardadas
- [ ] 9.5 - Implementar función "Nueva Jugada"
- [ ] 9.6 - Implementar función "Guardar Jugada" (con nombre)
- [ ] 9.7 - Implementar función "Cargar Jugada"
- [ ] 9.8 - Implementar función "Exportar" (descargar JSON)
- [ ] 9.9 - Implementar función "Importar" (subir JSON)
- [ ] 9.10 - Validación de datos importados
- [ ] 9.11 - Manejo de errores y edge cases

## FASE 10: Pulido y Optimización
- [ ] 10.1 - Implementar feedback visual en todas las interacciones
- [ ] 10.2 - Agregar transiciones/animaciones suaves en UI
- [ ] 10.3 - Optimizar rendimiento del canvas
- [ ] 10.4 - Implementar estados de carga (loading states)
- [ ] 10.5 - Agregar mensajes de confirmación (eliminar, reset, etc.)
- [ ] 10.6 - Implementar atajos de teclado útiles
- [ ] 10.7 - Validaciones de formularios y campos
- [ ] 10.8 - Responsive final (mobile, tablet, desktop)
- [ ] 10.9 - Testing manual de flujos completos
- [ ] 10.10 - Documentación básica (README)
