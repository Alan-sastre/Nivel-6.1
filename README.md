# Juego Robi Nivel 6 - Reparación de Drones

## Descripción

Este es un juego educativo interactivo desarrollado con Phaser 3 que simula la reparación de drones mediante la programación de Arduino. Los jugadores deben completar ejercicios de código para hacer funcionar los drones correctamente.

## Características Principales

### 🎮 Escenas del Juego

1. **Escena Principal** - Pantalla de bienvenida con música de fondo
2. **Video 1** - Video introductorio con control de volumen
3. **Escena de Fallos** - Pregunta interactiva sobre robots autónomos
4. **Reparación de Drones** - **ESCENA PRINCIPAL** con 3 ejercicios de programación
5. **Video 2** - Video de transición
6. **Escena de Drones** - Escena de transición
7. **Video 3** - Video de transición
8. **Arduino Game** - Juego de Arduino
9. **Rompecabezas** - Puzzle interactivo
10. **Video 4** - Video final
11. **Escena Final** - Pantalla de conclusión

### 🛠️ Escena de Reparación de Drones

La escena principal incluye:

#### Ejercicios de Programación:

1. **Ejercicio 1: Tiempo de encendido del LED**

   - El jugador debe completar el valor de `delay(_____)`
   - Respuesta correcta: `1000`
   - Pista: "El LED debe estar encendido por 1 segundo (1000 milisegundos)"

2. **Ejercicio 2: Velocidad del motor**

   - El jugador debe completar el valor de `analogWrite(motorPin, ___)`
   - Respuesta correcta: `200`
   - Pista: "La velocidad del motor es de 200 (rango 0-255)"

3. **Ejercicio 3: Sensor de luz**
   - El jugador debe completar la función `_________(ledPin, HIGH)`
   - Respuesta correcta: `digitalWrite`
   - Pista: "Usa la función para escribir en un pin digital"

#### Características de la Interfaz:

- **Editor de código** con sintaxis highlighting
- **Campo de entrada interactivo** con cursor parpadeante
- **Botón de pista** para obtener ayuda
- **Botón de comprobar** para verificar respuestas
- **Indicador de progreso** (1/3, 2/3, 3/3)
- **Animaciones del dron** según el estado del ejercicio
- **Mensajes de feedback** con colores y animaciones

## 🎯 Cómo Jugar

### Controles:

- **Teclado**: Escribe en el campo de entrada
- **Enter**: Comprobar respuesta
- **Botón Pista**: Obtener ayuda
- **Botón Comprobar**: Verificar respuesta

### Flujo del Juego:

1. Lee el código Arduino mostrado en el editor
2. Identifica la línea con espacios en blanco (`_____`)
3. Escribe la respuesta correcta en el campo de entrada
4. Presiona Enter o haz clic en "Comprobar"
5. Si es correcto, avanza al siguiente ejercicio
6. Si es incorrecto, usa la pista para obtener ayuda
7. Completa los 3 ejercicios para terminar

## 🎨 Características Visuales

### Diseño Moderno:

- **Fondo con overlay** para mejor legibilidad
- **Editor de código** con estilo VS Code
- **Botones con efectos hover** y animaciones
- **Mensajes con colores** (verde para éxito, rojo para error, naranja para pistas)
- **Animaciones del dron** según el progreso
- **Efectos de transición** entre ejercicios

### Responsive Design:

- Adaptable a diferentes tamaños de pantalla
- Orientación horizontal recomendada para móviles
- Interfaz optimizada para touch y teclado

## 🚀 Instalación y Ejecución

1. **Requisitos**: Navegador web moderno con soporte para HTML5
2. **Archivos necesarios**: Todos los archivos del proyecto
3. **Ejecución**: Abrir `index.html` en el navegador

## 📁 Estructura de Archivos

```
Nivel 6/
├── index.html              # Archivo principal
├── game.js                 # Configuración del juego
├── assets/                 # Recursos multimedia
│   ├── drones/            # Imágenes de drones
│   ├── scenaPrincipal/    # Fondo y música principal
│   ├── video1/           # Videos del juego
│   └── ...
└── scenas/               # Escenas del juego
    ├── scenaPrincipal.js
    ├── drone_repair.js   # ESCENA PRINCIPAL
    ├── fallos.js
    └── ...
```

## 🎵 Audio y Multimedia

- **Música de fondo** con control de volumen
- **Videos** con controles de reproducción
- **Efectos de sonido** para feedback
- **Gestor de música** para control centralizado

## 🔧 Tecnologías Utilizadas

- **Phaser 3** - Framework de juegos HTML5
- **HTML5 Canvas** - Renderizado gráfico
- **JavaScript ES6+** - Lógica del juego
- **CSS3** - Estilos y animaciones
- **SweetAlert2** - Alertas y notificaciones

## 🎯 Objetivos Educativos

- **Programación Arduino** - Sintaxis y conceptos básicos
- **Lógica de programación** - Secuencias y condiciones
- **Resolución de problemas** - Análisis y corrección de código
- **Interfaz de usuario** - Interacción con sistemas de programación

## 🐛 Solución de Problemas

### Problemas Comunes:

1. **Videos no se reproducen**: Verificar que los archivos de video estén en la carpeta correcta
2. **Imágenes no cargan**: Verificar rutas de archivos en `assets/`
3. **Errores de JavaScript**: Verificar consola del navegador para errores
4. **Problemas de orientación**: Usar modo horizontal en dispositivos móviles

### Compatibilidad:

- **Navegadores soportados**: Chrome, Firefox, Safari, Edge
- **Dispositivos**: PC, tablet, móvil (orientación horizontal)
- **Resolución mínima**: 800x600

## 📝 Notas de Desarrollo

- El juego está optimizado para orientación horizontal
- Los ejercicios están diseñados para ser educativos y accesibles
- La interfaz incluye elementos de accesibilidad
- El código está comentado para facilitar el mantenimiento

---

**Desarrollado con ❤️ para la educación en programación y robótica**
