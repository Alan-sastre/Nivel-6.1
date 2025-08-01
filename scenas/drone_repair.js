// Definir la clase y exportarla como variable global
class DroneRepairScene extends Phaser.Scene {
  constructor() {
    super({ key: "DroneRepairScene" });
    this.exercises = [
      {
        title: "Ejercicio 1: Tiempo de encendido del LED",
        code: [
          "// Programa para encender un LED",
          "void setup() {",
          "  pinMode(13, OUTPUT);",
          "}",
          "",
          "void loop() {",
          "  digitalWrite(13, HIGH);",
          "  delay(_____);",
          "  digitalWrite(13, LOW);",
          "  delay(1000);",
          "}",
        ],
        missingLine: 8,
        correctValue: "1000",
        hint: "El LED debe estar encendido por 1 segundo (1000 milisegundos)",
        droneState: "off",
        successMessage: "¡Correcto! El LED ahora parpadea cada 1 segundo.",
      },
      {
        title: "Ejercicio 2: Velocidad del motor",
        code: [
          "// Control de motor",
          "int motorPin = 9;",
          "void setup() {",
          "  pinMode(motorPin, OUTPUT);",
          "}",
          "",
          "void loop() {",
          "  analogWrite(motorPin, 200);",
          "  delay(_____);",
          "  analogWrite(motorPin, 0);",
          "  delay(1000);",
          "}",
        ],
        missingLine: 9,
        correctValue: "2000",
        hint: "El motor debe estar encendido por 2 segundos (2000 milisegundos)",
        droneState: "slow",
        successMessage:
          "¡Correcto! El motor ahora gira a la velocidad correcta.",
      },
    ];
  }

  preload() {
    this.load.image("Taller", "assets/drones/1.jpg");
    this.load.image("drone_off", "assets/drones/1.png");
    this.load.image("drone_slow", "assets/drones/1.png");
    this.load.image("drone_working", "assets/drones/1.png");
    this.load.image("drone_red", "assets/drones/1.png");
    this.load.image("drone_green", "assets/drones/1.png");
    
    // Intentar cargar solo el formato SVG de partículas
    this.load.image("particle", "assets/particle.svg");
    
    // Manejador de error para crear partícula por defecto si no se encuentra el archivo
    this.load.once('loaderror', (fileObj) => {
      if (fileObj.key === 'particle') {
        console.log('Error al cargar la imagen de partículas SVG, creando partícula por defecto');
        this.createDefaultParticle();
      }
    });
    
    // Verificar si la imagen se cargó correctamente
    this.load.once('complete', () => {
      if (!this.textures.exists('particle')) {
        console.log('La imagen de partículas no se cargó, creando partícula por defecto');
        this.createDefaultParticle();
      } else {
        console.log('Imagen SVG de partículas cargada correctamente');
      }
    });
  }
  
  // Crear una partícula por defecto si no se encuentra el archivo
  createDefaultParticle() {
    // Crear un canvas para la partícula
    const size = 32;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    // Dibujar un círculo blanco con degradado
    const gradient = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.5, 'rgba(200, 200, 255, 0.5)');
    gradient.addColorStop(1, 'rgba(100, 100, 255, 0)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(size/2, size/2, size/2, 0, Math.PI * 2);
    ctx.fill();
    
    // Crear textura a partir del canvas
    const texture = this.textures.createCanvas('particle', size, size);
    texture.draw(0, 0, canvas);
    texture.refresh();
    
    console.log('Partícula por defecto creada correctamente');
  }

  create() {
    // Configuración básica
    this.updateDimensions();
    this.cameras.main.setRoundPixels(true);

    // Detectar si es móvil
    this.isMobile =
      this.gameWidth < 768 ||
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|Tablet|Touch|Windows Phone/i.test(
        navigator.userAgent
      ) ||
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0;

    // Detectar plataforma para optimizaciones específicas
    this.isAndroid = navigator.userAgent.match(/Android/i) ? true : false;
    this.isIOS = navigator.userAgent.match(/iPhone|iPad|iPod/i) ? true : false;

    // Agregar listener para cambios de orientación
    this.setupOrientationListener();

    // Habilitar input para toda la escena
    this.input.setDefaultCursor("pointer");

    // Fondo con overlay muy sutil
    this.add
      .image(0, 0, "Taller")
      .setOrigin(0, 0)
      .setDisplaySize(this.gameWidth, this.gameHeight);

    // Overlay muy sutil
    this.add
      .graphics()
      .fillStyle(0x000000, 0.15)
      .fillRect(0, 0, this.gameWidth, this.gameHeight);

    // Dron más grande - empieza rojo (ajustado para móviles)
    const droneX = this.isMobile ? 80 : 120;
    const droneScale = this.isMobile ? 0.5 : 0.6; // Dron más grande

    this.drone = this.add
      .image(droneX, this.gameHeight / 2, "drone_red")
      .setScale(droneScale)
      .setDepth(10);

    // Aplicar tinte rojo al dron
    this.drone.setTint(0xff0000);

    // Efecto sutil en el dron
    this.tweens.add({
      targets: this.drone,
      y: this.drone.y - 20,
      duration: 4000,
      repeat: -1,
      yoyo: true,
      ease: "Sine.easeInOut",
    });

    // Interfaz minimalista
    this.setupMinimalUI();
    this.createCodeEditor();
    this.createMinimalButtons();

    // Cargar primer ejercicio
    this.loadExercise(0);

    // Configurar entrada de teclado (solo para desktop)
    if (!this.isMobile) {
      this.setupKeyboard();
    }

    // En móviles, verificar orientación y mostrar opciones o mensaje
    if (this.isMobile) {
      // Verificar si estamos en modo horizontal o vertical
      if (window.innerWidth > window.innerHeight) {
        // En horizontal, mostrar opciones después de un breve retraso
        this.time.delayedCall(1000, () => {
          this.createMobileInput();
        });
      } else {
        // En vertical, mostrar mensaje para girar el dispositivo
        this.time.delayedCall(500, () => {
          this.showRotateMessage();
        });
      }
    }
  }

  updateDimensions() {
    this.gameWidth = this.cameras.main.width;
    this.gameHeight = this.cameras.main.height;
  }

  setupOrientationListener() {
    // Listener para cambios de orientación
    const handleOrientationChange = () => {
      // Esperar un poco para que la orientación se complete
      setTimeout(() => {
        this.handleOrientationChange();
      }, 100);
    };

    // Agregar listeners para diferentes eventos de orientación
    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleOrientationChange);
    
    // Guardar referencia para poder removerlos después
    this.orientationChangeHandler = handleOrientationChange;
  }

  handleOrientationChange() {
    console.log('Orientación cambiada, recalculando posiciones...');
    
    // Actualizar dimensiones
    this.updateDimensions();
    
    // Recalcular posiciones de elementos
    this.repositionElements();
    
    // Si estamos en modo horizontal en móvil, mostrar mensaje para girar
    if (this.isMobile && window.innerWidth > window.innerHeight) {
      // Mostrar mensaje para girar el dispositivo
      this.showRotateMessage();
    } else {
      // Ocultar mensaje si existe
      this.hideRotateMessage();
      
      // Recrear las opciones de entrada móvil si estamos en el ejercicio
      if (this.isMobile && this.currentExercise) {
        // Eliminar opciones anteriores
        if (this.mobileInputContainer) {
          this.mobileInputContainer.destroy();
          this.mobileInputContainer = null;
        }
        
        // Limpiar botones HTML anteriores
        const existingButtons = document.querySelectorAll(".mobile-option-button");
        existingButtons.forEach((btn) => btn.remove());
        
        // Recrear opciones después de un breve retraso
        this.time.delayedCall(500, () => {
          this.createMobileInput();
        });
      }
    }
  }

  repositionElements() {
    // Reposicionar el editor de código
    if (this.editorBg) {
      // Recalcular posiciones del editor
      if (this.isMobile) {
        this.editorX = this.gameWidth * 0.45;
        this.editorY = 60;
        this.editorWidth = this.gameWidth * 0.5;
        this.editorHeight = this.gameHeight * 0.65;
      } else {
        this.editorX = this.gameWidth * 0.55;
        this.editorY = 70;
        this.editorWidth = this.gameWidth * 0.4;
        this.editorHeight = this.gameHeight * 0.6;
      }

      // Actualizar fondo del editor
      this.editorBg.clear()
        .fillStyle(0x1e1e1e, 0.95)
        .fillRoundedRect(
          this.editorX,
          this.editorY,
          this.editorWidth,
          this.editorHeight,
          8
        )
        .lineStyle(1, 0x3c3c3c, 1)
        .strokeRoundedRect(
          this.editorX,
          this.editorY,
          this.editorWidth,
          this.editorHeight,
          8
        );

      // Reposicionar contenedores
      if (this.lineNumbersContainer) {
        this.lineNumbersContainer.x = this.editorX + 15;
        this.lineNumbersContainer.y = this.editorY + 20;
      }
      
      if (this.codeContainer) {
        this.codeContainer.x = this.editorX + 60;
        this.codeContainer.y = this.editorY + 20;
      }
    }

    // Reposicionar botones
    this.repositionButtons();
    
    // Reposicionar título y progreso
    if (this.progressText) {
      this.progressText.x = this.gameWidth - 50;
    }
    
    // Reposicionar título del ejercicio
    if (this.exerciseTitle) {
      this.exerciseTitle.x = this.gameWidth / 2;
    }
    
    // Reposicionar opciones móviles si están visibles
    if (this.mobileInputContainer) {
      this.mobileInputContainer.x = this.gameWidth * 0.25;
      this.mobileInputContainer.y = this.gameHeight * 0.75;
      
      // También actualizar botones HTML si existen
      const htmlButtons = document.querySelectorAll('.mobile-option-button');
      htmlButtons.forEach((button, index) => {
        button.style.left = `${this.gameWidth * 0.25 + (index - 1.5) * 70 - 30}px`;
        button.style.top = `${this.gameHeight * 0.75 + 10 - 20}px`;
      });
    }
    
    // Actualizar input display si existe
    if (this.inputBg) {
      this.updateInputDisplay();
    }
    
    // Reposicionar el dron
    if (this.drone) {
      const droneX = this.isMobile ? 80 : 120;
      // Solo actualizar X, mantener Y actual para no interrumpir animaciones
      if (!this.tweens.isTweening(this.drone)) {
        this.drone.x = droneX;
      }
    }
  }

  repositionButtons() {
    if (!this.hintButton || !this.checkButton) return;
    
    // Recalcular posiciones de botones
    const buttonWidth = this.isMobile ? 140 : 160;
    const buttonHeight = this.isMobile ? 50 : 45;
    const buttonSpacing = this.isMobile ? 15 : 20;
    const buttonY = this.editorY + this.editorHeight + 20;
    const editorCenterX = this.editorX + this.editorWidth / 2;
    const hintButtonX = editorCenterX - buttonWidth - buttonSpacing / 2;
    const checkButtonX = editorCenterX + buttonSpacing / 2;

    // Reposicionar botón de pista
    this.hintButton.x = hintButtonX + buttonWidth / 2;
    this.hintButton.y = buttonY + buttonHeight / 2;
    
    if (this.hintButtonText) {
      this.hintButtonText.x = hintButtonX + buttonWidth / 2;
      this.hintButtonText.y = buttonY + buttonHeight / 2;
    }

    // Reposicionar botón de comprobar
    this.checkButton.x = checkButtonX + buttonWidth / 2;
    this.checkButton.y = buttonY + buttonHeight / 2;
    
    if (this.checkButtonText) {
      this.checkButtonText.x = checkButtonX + buttonWidth / 2;
      this.checkButtonText.y = buttonY + buttonHeight / 2;
    }
    
    console.log('Botones reposicionados:', {
      hintButton: { x: this.hintButton.x, y: this.hintButton.y },
      checkButton: { x: this.checkButton.x, y: this.checkButton.y },
      gameWidth: this.gameWidth,
      gameHeight: this.gameHeight
    });
  }

  setupMinimalUI() {
    // Título simple y elegante - más pequeño
    this.add
      .text(this.gameWidth / 2, 25, "Reparación de Drones", {
        fontFamily: "Arial",
        fontSize: "28px",
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setDepth(6);

    // Progreso discreto - más pequeño
    this.progressText = this.add
      .text(this.gameWidth - 50, 20, "1/2", {
        fontFamily: "Arial",
        fontSize: "18px",
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 2,
      })
      .setOrigin(0.5)
      .setDepth(6);
  }

  createCodeEditor() {
    // Editor compacto estilo VS Code, ajustado para móviles
    if (this.isMobile) {
      this.editorX = this.gameWidth * 0.45; // Más a la izquierda en móviles
      this.editorY = 60;
      this.editorWidth = this.gameWidth * 0.5; // Más ancho en móviles
      this.editorHeight = this.gameHeight * 0.65; // Más alto en móviles
    } else {
      this.editorX = this.gameWidth * 0.55; // Más a la derecha
      this.editorY = 70;
      this.editorWidth = this.gameWidth * 0.4;
      this.editorHeight = this.gameHeight * 0.6; // Más largo hacia abajo
    }

    // Fondo del editor estilo VS Code
    this.editorBg = this.add
      .graphics()
      .fillStyle(0x1e1e1e, 0.95)
      .fillRoundedRect(
        this.editorX,
        this.editorY,
        this.editorWidth,
        this.editorHeight,
        8
      )
      .lineStyle(1, 0x3c3c3c, 1)
      .strokeRoundedRect(
        this.editorX,
        this.editorY,
        this.editorWidth,
        this.editorHeight,
        8
      )
      .setDepth(1);

    // Contenedor para los números de línea
    this.lineNumbersContainer = this.add
      .container(this.editorX + 15, this.editorY + 20)
      .setDepth(3);

    // Contenedor para el código
    this.codeContainer = this.add
      .container(this.editorX + 60, this.editorY + 20)
      .setDepth(2);
  }

  createMinimalButtons() {
    // Crear botones usando elementos de Phaser para posicionamiento correcto
    const buttonWidth = this.isMobile ? 140 : 160;
    const buttonHeight = this.isMobile ? 50 : 45;
    const buttonSpacing = this.isMobile ? 15 : 20;

    // Posición de los botones - centrados debajo del editor
    const buttonY = this.editorY + this.editorHeight + 20;

    // Calcular el centro exacto del editor
    const editorCenterX = this.editorX + this.editorWidth / 2;

    // Posición del botón izquierdo (pista) - a la izquierda del centro
    const hintButtonX = editorCenterX - buttonWidth - buttonSpacing / 2;

    // Posición del botón derecho (comprobar) - a la derecha del centro
    const checkButtonX = editorCenterX + buttonSpacing / 2;

    // Debug: mostrar las coordenadas en consola
    console.log("Editor X:", this.editorX);
    console.log("Editor Y:", this.editorY);
    console.log("Editor Height:", this.editorHeight);
    console.log("Editor Width:", this.editorWidth);
    console.log("Editor Center X:", editorCenterX);
    console.log("Button Y:", buttonY);
    console.log("Hint Button X:", hintButtonX);
    console.log("Check Button X:", checkButtonX);
    console.log("Game Width:", this.gameWidth);

    // Botón de pista usando Phaser
    this.hintButton = this.add
      .rectangle(
        hintButtonX + buttonWidth / 2,
        buttonY + buttonHeight / 2,
        buttonWidth,
        buttonHeight,
        0xfbbf24
      )
      .setInteractive({ useHandCursor: true })
      .setDepth(100);

    // Texto del botón pista
    this.hintButtonText = this.add
      .text(
        hintButtonX + buttonWidth / 2,
        buttonY + buttonHeight / 2,
        "💡 Pista",
        {
          fontFamily: "Arial",
          fontSize: this.isMobile ? "18px" : "16px",
          color: "#ffffff",
          stroke: "#000000",
          strokeThickness: 2,
        }
      )
      .setOrigin(0.5)
      .setDepth(101);

    // Eventos del botón pista
    this.hintButton.on("pointerover", () => {
      if (!this.isMobile) {
        this.hintButton.setFillStyle(0xf59e0b);
        this.hintButtonText.setScale(1.05);
      }
    });

    this.hintButton.on("pointerout", () => {
      if (!this.isMobile) {
        this.hintButton.setFillStyle(0xfbbf24);
        this.hintButtonText.setScale(1);
      }
    });

    // Función para manejar el clic en el botón de pista
    const onHintClick = (pointer) => {
      // Efecto visual inmediato
      this.hintButton.setFillStyle(0xf59e0b);
      this.hintButtonText.setScale(0.95);
      
      console.log("Botón Pista clickeado!");
      
      // Restaurar apariencia después de un breve retraso
      this.time.delayedCall(150, () => {
        this.hintButton.setFillStyle(0xfbbf24);
        this.hintButtonText.setScale(1);
      });
      
      // Ejecutar acción
      this.showHint();
    };
    
    // Asignar manejadores de eventos
    this.hintButton.on("pointerdown", (pointer) => onHintClick(pointer));
    this.hintButton.on("pointerup", (pointer) => onHintClick(pointer));
    this.hintButtonText.setInteractive({ useHandCursor: true })
      .on("pointerdown", (pointer) => onHintClick(pointer))
      .on("pointerup", (pointer) => onHintClick(pointer));

    // Botón de comprobar usando Phaser
    this.checkButton = this.add
      .rectangle(
        checkButtonX + buttonWidth / 2,
        buttonY + buttonHeight / 2,
        buttonWidth,
        buttonHeight,
        0x22c55e
      )
      .setInteractive({ useHandCursor: true })
      .setDepth(100);

    // Texto del botón comprobar
    this.checkButtonText = this.add
      .text(
        checkButtonX + buttonWidth / 2,
        buttonY + buttonHeight / 2,
        "✅ Comprobar",
        {
          fontFamily: "Arial",
          fontSize: this.isMobile ? "18px" : "16px",
          color: "#ffffff",
          stroke: "#000000",
          strokeThickness: 2,
        }
      )
      .setOrigin(0.5)
      .setDepth(101);

    // Eventos del botón comprobar
    this.checkButton.on("pointerover", () => {
      if (!this.isMobile) {
        this.checkButton.setFillStyle(0x16a34a);
        this.checkButtonText.setScale(1.05);
      }
    });

    this.checkButton.on("pointerout", () => {
      if (!this.isMobile) {
        this.checkButton.setFillStyle(0x22c55e);
        this.checkButtonText.setScale(1);
      }
    });

    // Función para manejar el clic en el botón de comprobar
    const onCheckClick = (pointer) => {
      // Efecto visual inmediato
      this.checkButton.setFillStyle(0x16a34a);
      this.checkButtonText.setScale(0.95);
      
      console.log("Botón Comprobar clickeado!");
      
      // Restaurar apariencia después de un breve retraso
      this.time.delayedCall(150, () => {
        this.checkButton.setFillStyle(0x22c55e);
        this.checkButtonText.setScale(1);
      });
      
      // Ejecutar acción
      this.checkAnswer();
    };
    
    // Asignar manejadores de eventos
    this.checkButton.on("pointerdown", (pointer) => onCheckClick(pointer));
    this.checkButton.on("pointerup", (pointer) => onCheckClick(pointer));
    this.checkButtonText.setInteractive({ useHandCursor: true })
      .on("pointerdown", (pointer) => onCheckClick(pointer))
      .on("pointerup", (pointer) => onCheckClick(pointer));
  }

  setupKeyboard() {
    this.inputText = "";
    this.isInputActive = false;

    // Limpiar cualquier listener anterior
    this.input.keyboard.off("keydown");

    // Solo configurar el teclado para dispositivos no móviles
    if (!this.isMobile) {
      this.input.keyboard.on("keydown", (event) => {
        if (!this.isInputActive) return;

        if (event.key === "Enter") {
          this.checkAnswer();
          return;
        }

        if (event.key === "Backspace") {
          if (this.inputText.length > 0) {
            this.inputText = this.inputText.slice(0, -1);
            this.updateInputDisplay();
          }
        } else if (
          event.key.length === 1 &&
          !event.ctrlKey &&
          !event.altKey &&
          !event.metaKey
        ) {
          this.inputText += event.key;
          this.updateInputDisplay();
        }
      });
    }
  }

  loadExercise(index) {
    if (index < 0 || index >= this.exercises.length) return;

    this.currentExercise = this.exercises[index];
    this.currentExerciseIndex = index;

    // Actualizar progreso
    this.progressText.setText(`${index + 1}/2`);

    // Limpiar contenedores anteriores
    this.codeContainer.removeAll(true);
    this.lineNumbersContainer.removeAll(true);

    // Limpiar elementos de input anteriores
    if (this.inputBg) {
      this.inputBg.destroy();
      this.inputBg = null;
    }
    if (this.inputTextObj) {
      this.inputTextObj.destroy();
      this.inputTextObj = null;
    }
    if (this.cursor) {
      this.cursor.destroy();
      this.cursor = null;
    }

    // Limpiar input móvil
    if (this.mobileInputContainer) {
      this.mobileInputContainer.destroy();
      this.mobileInputContainer = null;
    }

    // Limpiar título anterior
    if (this.exerciseTitle) {
      this.exerciseTitle.destroy();
    }

    // Título del ejercicio simple - más pequeño
    this.exerciseTitle = this.add
      .text(this.gameWidth / 2, 55, this.currentExercise.title, {
        fontFamily: "Arial",
        fontSize: this.isMobile ? "18px" : "20px",
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 2,
      })
      .setOrigin(0.5)
      .setDepth(5);

    // Mostrar código con números de línea estilo VS Code
    const lineHeight = this.isMobile ? 20 : 22;

    this.currentExercise.code.forEach((line, i) => {
      const y = i * lineHeight;

      // Número de línea estilo VS Code
      const lineNum = this.add
        .text(0, y + 2, (i + 1).toString().padStart(2, " "), {
          fontFamily: "Consolas, monospace",
          fontSize: this.isMobile ? "12px" : "14px",
          color: "#858585",
          align: "right",
          fixedWidth: this.isMobile ? 30 : 35,
        })
        .setOrigin(1, 0)
        .setDepth(2);
      this.lineNumbersContainer.add(lineNum);

      // Línea de código
      if (i + 1 === this.currentExercise.missingLine) {
        // Línea con valor faltante
        const parts = line.split("_____");
        if (parts.length === 2) {
          // Texto antes del input
          const beforeText = this.add
            .text(0, y + 2, parts[0], {
              fontFamily: "Consolas, monospace",
              fontSize: this.isMobile ? "12px" : "14px",
              color: "#d4d4d4",
            })
            .setOrigin(0, 0)
            .setDepth(2);
          this.codeContainer.add(beforeText);

          // Campo de entrada estilo VS Code
          const inputX = beforeText.width + 4;
          this.inputX = inputX;
          this.inputY = y + 2;

          // Fondo del input estilo VS Code
          this.inputBg = this.add
            .graphics()
            .fillStyle(0x264f78, 0.8)
            .fillRect(this.editorX + 60 + inputX, this.editorY + 20 + y, 80, 20)
            .lineStyle(1, 0x007acc, 1)
            .strokeRect(
              this.editorX + 60 + inputX,
              this.editorY + 20 + y,
              80,
              20
            )
            .setDepth(1);

          // En móviles, crear un área interactiva que muestre las opciones al tocarla
          if (this.isMobile) {
            // Crear un área interactiva que muestre las opciones al tocarla
            const inputArea = this.add
              .rectangle(
                this.editorX + 60 + inputX + 40,
                this.editorY + 20 + y + 10,
                80,
                20,
                0x264f78,
                0.8
              )
              .setInteractive({ useHandCursor: true })
              .setDepth(10);

            // No mostrar texto en el input para móviles
            // const placeholderText = this.add
            //   .text(
            //     this.editorX + 60 + inputX + 40,
            //     this.editorY + 20 + y + 10,
            //     "Toca para opciones",
            //     {
            //       fontFamily: "Consolas, monospace",
            //       fontSize: "12px",
            //       color: "#ffffff",
            //       stroke: "#000000",
            //       strokeThickness: 1,
            //     }
            //   )
            //   .setOrigin(0.5)
            //   .setDepth(11);

            // Al tocar el área, mostrar las opciones
            inputArea.on("pointerdown", () => {
              console.log("Área de input tocada");
              this.createMobileInput();
            });

            // También hacer el fondo del input interactivo
            this.inputBg.setInteractive({ useHandCursor: true });
            this.inputBg.on("pointerdown", () => {
              console.log("Fondo del input tocado");
              this.createMobileInput();
            });

            // Crear un botón adicional para móviles que abra las opciones
            const keyboardButton = this.add
              .rectangle(
                this.editorX + 60 + inputX + 90,
                this.editorY + 20 + y + 10,
                30,
                20,
                0x007acc,
                0.8
              )
              .setInteractive({ useHandCursor: true })
              .setDepth(15);

            const keyboardText = this.add
              .text(
                this.editorX + 60 + inputX + 105,
                this.editorY + 20 + y + 10,
                "⌨️",
                {
                  fontFamily: "Arial",
                  fontSize: "12px",
                  color: "#ffffff",
                }
              )
              .setOrigin(0.5)
              .setDepth(16);

            keyboardButton.on("pointerdown", () => {
              console.log("Botón de opciones tocado");
              this.createMobileInput();
            });

            // Agregar un evento de toque adicional para dispositivos móviles
            keyboardButton.on("pointerup", () => {
              // Este evento adicional ayuda en algunos dispositivos
              setTimeout(() => {
                this.createMobileInput();
              }, 100);
            });
          } else {
            // En desktop, usar el sistema original
            // Texto del input
            this.inputText = "";
            this.inputTextObj = this.add
              .text(
                this.editorX + 60 + inputX + 4,
                this.editorY + 20 + y + 3,
                "",
                {
                  fontFamily: "Consolas, monospace",
                  fontSize: "14px",
                  color: "#ffffff",
                }
              )
              .setOrigin(0, 0)
              .setDepth(2);

            // Cursor estilo VS Code
            this.cursor = this.add
              .rectangle(
                this.editorX + 60 + inputX + 4,
                this.editorY + 20 + y + 3,
                1,
                16,
                0xffffff
              )
              .setOrigin(0, 0)
              .setDepth(3);

            // Parpadeo del cursor
            this.tweens.add({
              targets: this.cursor,
              alpha: 0,
              duration: 800,
              repeat: -1,
              yoyo: true,
            });
          }

          // Texto después del input
          const afterText = this.add
            .text(inputX + 88, y + 2, parts[1], {
              fontFamily: "Consolas, monospace",
              fontSize: this.isMobile ? "12px" : "14px",
              color: "#d4d4d4",
            })
            .setOrigin(0, 0)
            .setDepth(2);
          this.codeContainer.add(afterText);

          // Activar input inmediatamente
          this.isInputActive = true;

          // Hacer clic en el campo de entrada para enfocarlo
          this.time.delayedCall(100, () => {
            this.isInputActive = true;
          });

          // Mostrar instrucción temporal
          const instruction = this.add
            .text(
              this.gameWidth / 2,
              this.gameHeight - 40,
              this.isMobile
                ? "💡 Selecciona tu respuesta de las opciones"
                : "💡 Haz clic en el campo azul para escribir tu respuesta",
              {
                fontFamily: "Arial",
                fontSize: this.isMobile ? "14px" : "16px",
                color: "#ffffff",
                stroke: "#000000",
                strokeThickness: 2,
              }
            )
            .setOrigin(0.5)
            .setDepth(100);

          // Ocultar instrucción después de 3 segundos
          this.time.delayedCall(3000, () => {
            this.tweens.add({
              targets: instruction,
              alpha: 0,
              duration: 500,
              onComplete: () => {
                instruction.destroy();
              },
            });
          });

          // En móviles, crear input HTML visible que funcione
          if (this.isMobile) {
            this.time.delayedCall(1000, () => {
              this.createMobileInput();
            });
          }
        }
      } else {
        // Línea normal de código estilo VS Code
        const codeLine = this.add
          .text(0, y + 2, line, {
            fontFamily: "Consolas, monospace",
            fontSize: this.isMobile ? "12px" : "14px",
            color: line.trim().startsWith("//") ? "#6a9955" : "#d4d4d4",
          })
          .setOrigin(0, 0)
          .setDepth(2);
        this.codeContainer.add(codeLine);
      }
    });

    // Actualizar imagen del dron
    this.drone.setTexture(`drone_${this.currentExercise.droneState}`);

    // Reiniciar estado del input
    this.inputText = "";
    if (this.inputTextObj) {
      this.inputTextObj.setText("");
    }
    this.updateInputDisplay();
  }

  updateInputDisplay() {
    if (!this.inputBg) return;

    // Calcular ancho del texto
    const textWidth = this.inputText.length * 8;
    const minWidth = 80;
    const padding = 4;
    const newWidth = Math.max(textWidth + padding * 2, minWidth);

    // Actualizar fondo del input
    this.inputBg
      .clear()
      .fillStyle(0x264f78, 0.8)
      .fillRect(
        this.editorX + 60 + this.inputX,
        this.editorY + 20 + this.inputY - 2,
        newWidth,
        20
      )
      .lineStyle(1, 0x007acc, 1)
      .strokeRect(
        this.editorX + 60 + this.inputX,
        this.editorY + 20 + this.inputY - 2,
        newWidth,
        20
      );

    // En desktop, actualizar texto y cursor
    if (!this.isMobile && this.inputTextObj) {
      this.inputTextObj.setText(this.inputText);
      
      // Actualizar posición del texto del input
      this.inputTextObj.x = this.editorX + 60 + this.inputX + 4;
      this.inputTextObj.y = this.editorY + 20 + this.inputY + 3;

      // Actualizar posición del cursor
      if (this.cursor) {
        const cursorX = this.editorX + 60 + this.inputX + padding + textWidth;
        this.cursor.x = cursorX;
        this.cursor.y = this.editorY + 20 + this.inputY;
      }
    }

    // En móviles, no usamos input HTML, solo el selector de opciones
    // por lo que no necesitamos actualizar ningún elemento HTML
  }

  checkAnswer() {
    if (!this.currentExercise) return;

    const userAnswer = this.inputText.trim();
    const correctAnswer = this.currentExercise.correctValue;

    console.log(
      "checkAnswer llamado - userAnswer:",
      userAnswer,
      "correctAnswer:",
      correctAnswer
    );

    // En móviles, si no hay respuesta del usuario, mostrar las opciones
    if (this.isMobile && !userAnswer) {
      console.log("Mostrando opciones móviles");
      this.createMobileInput();
      return;
    }

    if (userAnswer === correctAnswer) {
      // Respuesta correcta - solo mostrar mensaje si no es el último ejercicio
      const nextIndex = this.currentExerciseIndex + 1;
      if (nextIndex < this.exercises.length) {
        this.showMessage(this.currentExercise.successMessage, "#4ade80");
      }

      // Mover el dron al centro cuando responde bien
      const targetX = this.isMobile ? this.gameWidth / 2 : this.gameWidth / 2;
      const returnX = this.isMobile ? 80 : 120;

      this.tweens.add({
        targets: this.drone,
        x: targetX,
        duration: 1000,
        ease: "Power2",
        onComplete: () => {
          // Mover el dron de vuelta a su posición original después de 1 segundo
          this.time.delayedCall(1000, () => {
            this.tweens.add({
              targets: this.drone,
              x: returnX,
              duration: 800,
              ease: "Power2",
            });
          });
        },
      });

      // Efecto de éxito en el dron
      this.tweens.add({
        targets: this.drone,
        scaleX: 0.5,
        scaleY: 0.5,
        duration: 200,
        yoyo: true,
        repeat: 2,
      });

      // Pasar al siguiente ejercicio con mensaje más corto
      this.time.delayedCall(1000, () => {
        if (nextIndex < this.exercises.length) {
          this.loadExercise(nextIndex);
        } else {
          // Todos los ejercicios completados - cambiar dron a verde
          this.drone.setTint(0x00ff00); // Verde

          this.showMessage(
            "🎉 ¡Felicidades! Has completado exitosamente todos los ejercicios de reparación. Los drones ya volvieron a la funcionalidad completa y están listos para volar nuevamente. ¡Excelente trabajo!",
            "#4ade80",
            true // Especial para felicitaciones - no auto-ocultar
          );
          this.time.delayedCall(5000, () => {
            // Limpiar mensaje especial antes de cambiar escena
            if (this.messageBox) {
              this.messageBox.destroy();
              this.messageBg.destroy();
              this.messageBox = null;
              this.messageBg = null;
            }
            // Descongelar pantalla
            this.input.keyboard.enabled = true;
            this.input.mouse.enabled = true;
            this.scene.start("ArduinoGameScene");
          });
        }
      });
    } else {
      // Respuesta incorrecta - mensaje más corto
      this.showMessage("❌ Incorrecto. Inténtalo de nuevo.", "#f87171");

      // Efecto de error
      this.tweens.add({
        targets: this.drone,
        x: this.drone.x - 10,
        duration: 100,
        yoyo: true,
        repeat: 2,
      });
    }

    // Limpiar input
    this.inputText = "";
    this.updateInputDisplay();
  }

  showHint() {
    console.log("Función showHint ejecutada");
    console.log("currentExercise:", this.currentExercise);
    if (!this.currentExercise) {
      console.log("No hay ejercicio actual");
      return;
    }
    console.log("Mostrando pista:", this.currentExercise.hint);

    // Eliminar mensaje anterior si existe para evitar problemas
    if (this.messageBox) {
      this.closeMessage();
    }

    // Mostrar el mensaje de pista con auto-cierre
    this.showMessage(
      `💡 Pista: ${this.currentExercise.hint}`,
      "#fbbf24",
      false,
      3000
    );
  }

  showMessage(text, color = "#ffffff", isSpecial = false, duration = 2000) {
    console.log("Función showMessage ejecutada con:", text, color);

    // CONGELAR LA PANTALLA - Deshabilitar input
    this.input.keyboard.enabled = false;
    this.input.mouse.enabled = false;

    // Eliminar mensaje anterior si existe
    if (this.messageBox) {
      console.log("Destruyendo mensaje anterior");
      this.closeMessage();
    }

    // Crear fondo semi-transparente para el mensaje
    this.messageBg = this.add
      .graphics()
      .fillStyle(0x000000, 0.8)
      .fillRoundedRect(
        this.gameWidth / 2 - 300,
        this.gameHeight / 2 - 80,
        600,
        160,
        15
      )
      .lineStyle(3, 0xffffff, 0.3)
      .strokeRoundedRect(
        this.gameWidth / 2 - 300,
        this.gameHeight / 2 - 80,
        600,
        160,
        15
      )
      .setDepth(200);

    // Mensaje bonito y elegante en el centro
    this.messageBox = this.add
      .text(this.gameWidth / 2, this.gameHeight / 2, text, {
        fontFamily: "Arial",
        fontSize: "20px",
        color: color,
        stroke: "#000000",
        strokeThickness: 4,
        align: "center",
        wordWrap: { width: 550 },
        lineSpacing: 5,
      })
      .setOrigin(0.5)
      .setDepth(201);

    // Efecto de aparición con fade in
    this.messageBox.setAlpha(0);
    this.messageBg.setAlpha(0);

    this.tweens.add({
      targets: [this.messageBox, this.messageBg],
      alpha: 1,
      duration: 300,
      ease: "Power2",
    });

    console.log("Mensaje creado:", this.messageBox);

    // Auto-ocultar después de un tiempo (solo si no es mensaje especial)
    if (!isSpecial) {
      // Asegurar que el mensaje se cierre después del tiempo especificado
      this.messageCloseTimer = this.time.delayedCall(duration, () => {
        this.closeMessage();
      });
    } else {
      // Para mensajes especiales, agregar un botón para cerrar
      const closeButton = this.add
        .text(this.gameWidth / 2, this.gameHeight / 2 + 70, "[ Cerrar ]", {
          fontFamily: "Arial",
          fontSize: "16px",
          color: "#ffffff",
          stroke: "#000000",
          strokeThickness: 2,
        })
        .setOrigin(0.5)
        .setDepth(202)
        .setInteractive({ useHandCursor: true })
        .on("pointerdown", () => {
          this.closeMessage();
          closeButton.destroy();
        });

      // Agregar al grupo de mensaje para que se elimine junto con él
      if (this.messageBox) {
        this.messageBox.closeButton = closeButton;
      }
    }
  }

  closeMessage() {
    // Función para cerrar mensajes de forma segura
    if (this.messageBox || this.messageBg) {
      // Cancelar cualquier timer pendiente
      if (this.messageCloseTimer) {
        this.messageCloseTimer.remove();
        this.messageCloseTimer = null;
      }

      // Animar la desaparición
      this.tweens.add({
        targets: [this.messageBox, this.messageBg],
        alpha: 0,
        duration: 300,
        ease: "Power2",
        onComplete: () => {
          // Eliminar el botón de cierre si existe
          if (this.messageBox && this.messageBox.closeButton) {
            this.messageBox.closeButton.destroy();
          }

          // Eliminar los elementos del mensaje
          if (this.messageBox) {
            this.messageBox.destroy();
            this.messageBox = null;
          }

          if (this.messageBg) {
            this.messageBg.destroy();
            this.messageBg = null;
          }

          // DESCONGELAR LA PANTALLA - Habilitar input nuevamente
          this.input.keyboard.enabled = true;
          this.input.mouse.enabled = true;

          // Si estamos en móvil, intentar enfocar el input nuevamente
          if (this.isMobile && this.htmlInput) {
            setTimeout(() => {
              this.htmlInput.focus();
              // Forzar la apertura del teclado virtual
              if (navigator.userAgent.match(/Android/i)) {
                this.htmlInput.dispatchEvent(
                  new TouchEvent("touchstart", { bubbles: true })
                );
              } else if (navigator.userAgent.match(/iPhone|iPad|iPod/i)) {
                this.htmlInput.dispatchEvent(
                  new MouseEvent("click", { bubbles: true })
                );
              }
            }, 300);
          }
        },
      });
    } else {
      // Si no hay mensaje, solo asegurar que el input esté habilitado
      this.input.keyboard.enabled = true;
      this.input.mouse.enabled = true;
    }
  }

  createMobileInput() {
    console.log("createMobileInput llamado");

    // Si ya existe un contenedor de opciones, destruirlo primero
    if (this.mobileInputContainer) {
      this.mobileInputContainer.destroy();
      this.mobileInputContainer = null;
    }

    // Limpiar botones HTML anteriores
    const existingButtons = document.querySelectorAll(".mobile-option-button");
    existingButtons.forEach((btn) => btn.remove());

    // Obtener la respuesta correcta
    const correctAnswer = this.currentExercise.correctValue;
    const correctNum = parseInt(correctAnswer);
    
    // Determinar el rango del slider basado en el valor correcto
    let minValue = 0;
    let maxValue = 3000;
    
    // Ajustar el rango para que el valor correcto esté en un punto razonable
    if (correctNum <= 1000) {
      maxValue = 2000;
    } else if (correctNum <= 2000) {
      maxValue = 3000;
    } else {
      minValue = 1000;
      maxValue = 4000;
    }
    
    // Crear contenedor para el slider y elementos relacionados
    const sliderContainer = this.add
      .container(this.gameWidth / 2, this.gameHeight * 0.75)
      .setDepth(200);
    
    // Guardar referencia al contenedor
    this.mobileInputContainer = sliderContainer;
    
    // Fondo semi-transparente para el área del slider
    const bg = this.add
      .graphics()
      .fillStyle(0x1e293b, 0.95) // Color moderno oscuro
      .fillRoundedRect(-200, -80, 400, 160, 15)
      .lineStyle(2, 0x3b82f6, 1) // Borde azul moderno
      .strokeRoundedRect(-200, -80, 400, 160, 15)
      .setDepth(200);
    sliderContainer.add(bg);
    
    // Título
    const title = this.add
      .text(0, -55, "Ajusta el valor:", {
        fontFamily: "Arial",
        fontSize: "18px",
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 2,
      })
      .setOrigin(0.5)
      .setDepth(201);
    sliderContainer.add(title);
    
    // Crear la pista del slider
    const trackWidth = 300;
    const trackHeight = 8;
    const track = this.add
      .graphics()
      .fillStyle(0x475569, 1) // Color gris oscuro para la pista
      .fillRoundedRect(-trackWidth/2, -trackHeight/2, trackWidth, trackHeight, 4)
      .setDepth(201);
    track.x = 0;
    track.y = 0;
    sliderContainer.add(track);
    
    // Crear marcas de escala en la pista
    const numMarks = 6; // Número de marcas en la escala
    const markLabels = [];
    
    for (let i = 0; i <= numMarks; i++) {
      const markX = -trackWidth/2 + (i * (trackWidth / numMarks));
      const markValue = Math.round(minValue + (i * ((maxValue - minValue) / numMarks)));
      
      // Marca vertical
      const mark = this.add
        .graphics()
        .fillStyle(0x94a3b8, 1) // Color gris claro para las marcas
        .fillRect(markX - 1, -10, 2, 20)
        .setDepth(201);
      mark.x = 0;
      mark.y = 0;
      sliderContainer.add(mark);
      
      // Etiqueta de valor
      const label = this.add
        .text(markX, 20, markValue.toString(), {
          fontFamily: "Arial",
          fontSize: "14px",
          color: "#cbd5e1", // Color gris claro para las etiquetas
        })
        .setOrigin(0.5)
        .setDepth(201);
      sliderContainer.add(label);
      markLabels.push(label);
    }
    
    // Crear el control deslizante (handle)
    const handle = this.add
      .graphics()
      .fillStyle(0x3b82f6, 1) // Color azul para el handle
      .fillCircle(0, 0, 15)
      .lineStyle(2, 0x60a5fa, 1) // Borde azul claro
      .strokeCircle(0, 0, 15)
      .setDepth(202);
    handle.x = -trackWidth/2; // Posición inicial en el extremo izquierdo
    handle.y = 0;
    sliderContainer.add(handle);
    
    // Área interactiva para el handle
    const handleHitArea = this.add
      .circle(handle.x, handle.y, 25)
      .setInteractive()
      .setDepth(202);
    handleHitArea.alpha = 0.01; // Casi invisible
    sliderContainer.add(handleHitArea);
    
    // Mostrar valor actual
    const valueText = this.add
      .text(0, -25, minValue.toString(), {
        fontFamily: "Arial",
        fontSize: "24px",
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 3,
        fontWeight: "bold"
      })
      .setOrigin(0.5)
      .setDepth(202);
    sliderContainer.add(valueText);
    
    // Variable para almacenar el valor actual del slider
    let currentValue = minValue;
    
    // Hacer que el handle sea arrastrable
    this.input.setDraggable(handleHitArea);
    
    // Eventos para el handle
    handleHitArea.on('pointerover', function() {
      handle.clear()
        .fillStyle(0x2563eb, 1) // Azul más oscuro al pasar el mouse
        .fillCircle(0, 0, 15)
        .lineStyle(2, 0x93c5fd, 1) // Borde azul más claro
        .strokeCircle(0, 0, 15);
    });
    
    handleHitArea.on('pointerout', function() {
      handle.clear()
        .fillStyle(0x3b82f6, 1) // Volver al azul normal
        .fillCircle(0, 0, 15)
        .lineStyle(2, 0x60a5fa, 1) // Borde azul normal
        .strokeCircle(0, 0, 15);
    });
    
    // Función para actualizar el valor basado en la posición del handle
    const updateValue = (x) => {
      // Limitar x dentro de los límites de la pista
      const limitedX = Phaser.Math.Clamp(x, -trackWidth/2, trackWidth/2);
      
      // Calcular el valor basado en la posición
      const percentage = (limitedX + trackWidth/2) / trackWidth;
      currentValue = Math.round(minValue + percentage * (maxValue - minValue));
      
      // Actualizar el texto del valor
      valueText.setText(currentValue.toString());
      
      // Actualizar posición del handle y su área interactiva
      handle.x = limitedX;
      handleHitArea.x = limitedX;
    };
    
    // Evento de arrastre
    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
      if (gameObject === handleHitArea) {
        // Convertir coordenadas globales a locales del contenedor
        const localX = dragX - sliderContainer.x;
        updateValue(localX);
      }
    });
    
    // También permitir hacer clic directamente en la pista
    bg.setInteractive(new Phaser.Geom.Rectangle(-trackWidth/2, -30, trackWidth, 60), Phaser.Geom.Rectangle.Contains);
    bg.on('pointerdown', (pointer) => {
      // Convertir coordenadas globales a locales del contenedor
      const localX = pointer.x - sliderContainer.x;
      updateValue(localX);
    });
    
    // Botón de verificación
    const checkButton = this.add
      .graphics()
      .fillStyle(0x22c55e, 1) // Verde para el botón de verificar
      .fillRoundedRect(-75, 50, 150, 40, 10)
      .lineStyle(2, 0x4ade80, 1) // Borde verde claro
      .strokeRoundedRect(-75, 50, 150, 40, 10)
      .setDepth(201);
    sliderContainer.add(checkButton);
    
    // Texto del botón
    const checkText = this.add
      .text(0, 50, "Verificar", {
        fontFamily: "Arial",
        fontSize: "18px",
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 2,
        fontWeight: "bold"
      })
      .setOrigin(0.5)
      .setDepth(202);
    sliderContainer.add(checkText);
    
    // Área interactiva para el botón
    const checkHitArea = this.add
      .rectangle(0, 50, 150, 40, 0xffffff, 0)
      .setInteractive({ useHandCursor: true })
      .setDepth(202);
    sliderContainer.add(checkHitArea);

    // Eventos para el botón de verificación
    checkHitArea.on('pointerover', () => {
      checkButton.clear()
        .fillStyle(0x16a34a, 1) // Verde más oscuro al pasar el mouse
        .fillRoundedRect(-75, 50, 150, 40, 10)
        .lineStyle(2, 0x4ade80, 1)
        .strokeRoundedRect(-75, 50, 150, 40, 10);
      
      checkText.setScale(1.05);
    });
    
    checkHitArea.on('pointerout', () => {
      checkButton.clear()
        .fillStyle(0x22c55e, 1) // Volver al verde normal
        .fillRoundedRect(-75, 50, 150, 40, 10)
        .lineStyle(2, 0x4ade80, 1)
        .strokeRoundedRect(-75, 50, 150, 40, 10);
      
      checkText.setScale(1);
    });
    
    checkHitArea.on('pointerdown', (pointer, localX, localY, event) => {
      // Prevenir comportamientos por defecto
      if (event && event.preventDefault) {
        event.preventDefault();
      }
      if (event && event.stopPropagation) {
        event.stopPropagation();
      }
      
      // Efecto visual al presionar
      checkButton.clear()
        .fillStyle(0x15803d, 1) // Verde aún más oscuro al presionar
        .fillRoundedRect(-75, 50 + 2, 150, 40, 10) // Mover ligeramente hacia abajo
        .lineStyle(2, 0x4ade80, 1)
        .strokeRoundedRect(-75, 50 + 2, 150, 40, 10);
      
      checkText.setScale(0.95);
      checkText.y = 52; // Mover texto hacia abajo
    });
    
    checkHitArea.on('pointerup', (pointer, localX, localY, event) => {
      // Prevenir comportamientos por defecto
      if (event && event.preventDefault) {
        event.preventDefault();
      }
      if (event && event.stopPropagation) {
        event.stopPropagation();
      }
      
      // Restaurar estilo
      checkButton.clear()
        .fillStyle(0x22c55e, 1)
        .fillRoundedRect(-75, 50, 150, 40, 10)
        .lineStyle(2, 0x4ade80, 1)
        .strokeRoundedRect(-75, 50, 150, 40, 10);
      
      checkText.setScale(1);
      checkText.y = 50; // Restaurar posición del texto
      
      // Verificar la respuesta
      console.log("Verificando respuesta:", currentValue, "Respuesta correcta:", correctAnswer);
      
      if (currentValue.toString() === correctAnswer) {
        console.log("¡Correcto!");
        
        // Cambiar el botón a un check verde
        checkButton.clear()
          .fillStyle(0x22c55e, 1)
          .fillRoundedRect(-75, 50, 150, 40, 10)
          .lineStyle(2, 0x4ade80, 1)
          .strokeRoundedRect(-75, 50, 150, 40, 10);
        
        checkText.setText("✅ ¡Correcto!");
        
        // Añadir efecto de partículas para celebración
        const particles = this.add.particles(0, 0, 'particle', {
          speed: { min: 50, max: 100 },
          scale: { start: 0.2, end: 0 },
          quantity: 1,
          lifespan: 800,
          emitting: false,
          tint: [ 0x4ade80, 0x22c55e, 0xffffff ]
        });
        sliderContainer.add(particles);
        particles.explode(20);
        console.log('Partículas de celebración creadas');
        
        // Mostrar mensaje de éxito
        this.showMessage("¡Correcto! 🎉", "#4ade80", false, 1000);
        
        // Después de un breve retraso, cerrar el contenedor y proceder
        this.time.delayedCall(1500, () => {
          if (sliderContainer) {
            sliderContainer.destroy();
          }
          this.inputText = correctAnswer;
          this.checkAnswer();
        });
      } else {
        console.log("Incorrecto");
        
        // Calcular qué tan cerca está el valor del usuario
        const userValue = currentValue;
        const targetValue = parseInt(correctAnswer);
        const difference = Math.abs(userValue - targetValue);
        
        let message = "";
        
        // Dar pistas basadas en qué tan cerca está
        if (difference <= 100) {
          message = "¡Muy cerca! Ajusta un poco más.";
        } else if (difference <= 300) {
          message = userValue < targetValue ? "Un poco más alto." : "Un poco más bajo.";
        } else {
          message = userValue < targetValue ? "Mucho más alto." : "Mucho más bajo.";
        }
        
        // Cambiar el botón a rojo temporalmente
        checkButton.clear()
          .fillStyle(0xef4444, 1) // Rojo para respuesta incorrecta
          .fillRoundedRect(-75, 50, 150, 40, 10)
          .lineStyle(2, 0xf87171, 1)
          .strokeRoundedRect(-75, 50, 150, 40, 10);
        
        checkText.setText("Intenta de nuevo");
        
        // Mostrar mensaje con pista
        this.showMessage(message, "#f87171", false, 1500);
        
        // Efecto de vibración para respuesta incorrecta
        this.tweens.add({
          targets: [handle, handleHitArea],
          x: { from: handle.x - 5, to: handle.x + 5 },
          duration: 50,
          repeat: 3,
          yoyo: true,
          ease: 'Sine.easeInOut',
          onComplete: () => {
            // Asegurarse de que el handle vuelva a su posición correcta
            handleHitArea.x = handle.x;
          }
        });
        
        // Restaurar el botón después de un tiempo
        this.time.delayedCall(1500, () => {
          checkButton.clear()
            .fillStyle(0x22c55e, 1)
            .fillRoundedRect(-75, 50, 150, 40, 10)
            .lineStyle(2, 0x4ade80, 1)
            .strokeRoundedRect(-75, 50, 150, 40, 10);
          
          checkText.setText("Verificar");
        });
      }
    });
    
    // Efecto de aparición
    sliderContainer.setAlpha(0);
    this.tweens.add({
      targets: sliderContainer,
      alpha: 1,
      duration: 300,
      ease: "Power2",
    });
    
    // Guardar referencia al contenedor
    this.mobileInputContainer = sliderContainer;

    // Agregar mensaje de ayuda (solo si se presiona el botón de pista)
    // const helpMessage = this.add
    //   .text(0, 35, "💡 " + this.currentExercise.hint, {
    //     fontFamily: "Arial",
    //     fontSize: "14px",
    //     color: "#fbbf24",
    //     stroke: "#000000",
    //     strokeThickness: 1,
    //     align: "center",
    //     wordWrap: { width: 280 },
    //   })
    //   .setOrigin(0.5)
    //   .setDepth(201);
    // optionsContainer.add(helpMessage);

    // Efecto de entrada más sutil
    optionsContainer.setScale(0.9);
    optionsContainer.alpha = 0;
    this.tweens.add({
      targets: optionsContainer,
      scale: 1,
      alpha: 1,
      duration: 200,
      ease: "Power2",
    });

    // Guardar referencia al contenedor para poder destruirlo después
    this.mobileInputContainer = optionsContainer;

    console.log("Opciones creadas:", options.slice(0, 4));
    console.log("Respuesta correcta:", correctAnswer);
    console.log(
      "Contenedor de opciones creado en:",
      this.gameWidth * 0.25,
      this.gameHeight * 0.75
    );

    // Verificar que los botones se crearon
    setTimeout(() => {
      console.log("Verificando botones creados...");
      const buttons = optionsContainer.getAll();
      console.log("Elementos en contenedor:", buttons.length);
    }, 100);

    // Crear botones HTML como respaldo con diseño mejorado
    options.slice(0, 4).forEach((option, index) => {
      const button = document.createElement("button");
      button.className = "mobile-option-button";
      button.textContent = option.toString();
      button.style.cssText = `
        position: absolute;
        left: ${this.gameWidth * 0.25 + (index - 1.5) * 70 - 32}px;
        top: ${this.gameHeight * 0.75 + 10 - 22}px;
        width: 64px;
        height: 44px;
        background: linear-gradient(to bottom, #4f8bf9, #3b82f6);
        color: white;
        border: none;
        border-radius: 10px;
        font-size: 18px;
        font-weight: bold;
        z-index: 1000;
        cursor: pointer;
        box-shadow: 0 3px 0 #1d4ed8, 0 4px 6px rgba(0, 0, 0, 0.4);
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
        transition: all 0.1s ease;
        outline: none;
        border: 2px solid #60a5fa;
      `;

      // Añadir efectos visuales al botón HTML
      button.onmousedown = button.ontouchstart = () => {
        button.style.transform = 'translateY(3px)';
        button.style.boxShadow = '0 0 0 #1d4ed8, 0 1px 2px rgba(0, 0, 0, 0.4)';
      };
      
      button.onmouseup = button.onmouseleave = button.ontouchend = () => {
        button.style.transform = 'translateY(0)';
        button.style.boxShadow = '0 3px 0 #1d4ed8, 0 4px 6px rgba(0, 0, 0, 0.4)';
      };
      
      // Efecto hover para desktop
      if (!this.isMobile) {
        button.onmouseover = () => {
          button.style.background = 'linear-gradient(to bottom, #60a5fa, #4f8bf9)';
          button.style.transform = 'translateY(-2px)';
          button.style.boxShadow = '0 5px 0 #1d4ed8, 0 6px 8px rgba(0, 0, 0, 0.4)';
        };
        
        button.onmouseout = () => {
          button.style.background = 'linear-gradient(to bottom, #4f8bf9, #3b82f6)';
          button.style.transform = 'translateY(0)';
          button.style.boxShadow = '0 3px 0 #1d4ed8, 0 4px 6px rgba(0, 0, 0, 0.4)';
        };
      }
      
      // Manejar clic/toque
      button.onclick = () => {
        console.log("Botón HTML tocado:", option.toString());
        if (option.toString() === correctAnswer) {
          console.log("¡Correcto!");
          // Efecto visual para respuesta correcta
          button.style.background = "linear-gradient(to bottom, #22c55e, #16a34a)";
          button.style.borderColor = "#4ade80";
          button.style.boxShadow = "0 0 10px rgba(74, 222, 128, 0.5)";
          button.textContent = "✅";
          
          // Añadir efecto de confeti con CSS
          const confetti = document.createElement('div');
          confetti.className = 'confetti-container';
          confetti.style.cssText = `
            position: absolute;
            left: ${button.offsetLeft + button.offsetWidth/2}px;
            top: ${button.offsetTop + button.offsetHeight/2}px;
            width: 100px;
            height: 100px;
            pointer-events: none;
            z-index: 1001;
          `;
          
          // Crear partículas de confeti
          for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.style.cssText = `
              position: absolute;
              width: 8px;
              height: 8px;
              background: ${['#4ade80', '#22c55e', '#ffffff'][Math.floor(Math.random() * 3)]};
              border-radius: 50%;
              transform: translate(-50%, -50%);
              animation: confetti-fall 1s ease-out forwards;
            `;
            particle.style.left = '50%';
            particle.style.top = '50%';
            particle.style.animationDelay = `${Math.random() * 0.2}s`;
            confetti.appendChild(particle);
          }
          
          document.body.appendChild(confetti);
          
          // Añadir estilo para la animación si no existe
          if (!document.getElementById('confetti-style')) {
            const style = document.createElement('style');
            style.id = 'confetti-style';
            style.textContent = `
              @keyframes confetti-fall {
                0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
                100% { transform: translate(${Math.random() > 0.5 ? '' : '-'}${Math.random() * 50 + 50}px, ${Math.random() * 50 + 50}px) scale(0); opacity: 0; }
              }
            `;
            document.head.appendChild(style);
          }

          this.showMessage("¡Correcto! 🎉", "#4ade80", false, 1000);

          setTimeout(() => {
            if (optionsContainer) {
              optionsContainer.destroy();
            }
            const buttons = document.querySelectorAll(".mobile-option-button");
            buttons.forEach((btn) => btn.remove());
            
            // Eliminar confeti después de la animación
            const confettis = document.querySelectorAll('.confetti-container');
            confettis.forEach(c => c.remove());
            
            this.inputText = correctAnswer;
            this.checkAnswer();
          }, 1500);
        } else {
          console.log("Incorrecto");
          // Efecto visual para respuesta incorrecta
          button.style.background = "linear-gradient(to bottom, #ef4444, #dc2626)";
          button.style.borderColor = "#f87171";
          button.textContent = "❌";
          
          // Efecto de vibración
          const originalLeft = button.style.left;
          const shake = () => {
            const offset = 5;
            let count = 0;
            const interval = setInterval(() => {
              if (count >= 6) {
                clearInterval(interval);
                button.style.left = originalLeft;
                return;
              }
              
              button.style.left = `calc(${originalLeft} ${count % 2 === 0 ? '+' : '-'} ${offset}px)`;
              count++;
            }, 50);
          };
          shake();

          this.showMessage(
            "Incorrecto. Inténtalo de nuevo.",
            "#f87171",
            false,
            1000
          );

          setTimeout(() => {
            button.style.background = "linear-gradient(to bottom, #4f8bf9, #3b82f6)";
            button.style.borderColor = "#60a5fa";
            button.textContent = option.toString();
          }, 1000);
        }
      };

      document.body.appendChild(button);
    });
  }

  // Esta función ya no se usa, pero se mantiene por compatibilidad
  createHiddenInput() {
    // No hacemos nada, ahora usamos createMobileInput() en su lugar
    console.log(
      "createHiddenInput() está obsoleto, usando createMobileInput() en su lugar"
    );
    return;
  }

  // Esta función ya no se usa, pero se mantiene por compatibilidad
  showMobileInputModal() {
    // No hacemos nada, ahora usamos createMobileInput() en su lugar
    console.log(
      "showMobileInputModal() está obsoleto, usando createMobileInput() en su lugar"
    );

    // Llamar directamente a createMobileInput para mostrar las opciones
    this.createMobileInput();
    return;
  }

  createMobileOptionsButton() {
    // Esta función ya no se usa, las opciones se muestran automáticamente
    console.log("createMobileOptionsButton - función obsoleta");
    return;
  }

  showRotateMessage() {
    // Si ya existe un mensaje de rotación, no crear otro
    if (this.rotateMessage) return;
    
    // Crear un contenedor para el mensaje de rotación
    this.rotateMessage = this.add.container(this.gameWidth / 2, this.gameHeight / 2).setDepth(1000);
    
    // Fondo semi-transparente para el mensaje
    const bg = this.add
      .graphics()
      .fillStyle(0x000000, 0.8)
      .fillRoundedRect(-200, -100, 400, 200, 20)
      .lineStyle(3, 0xffffff, 0.5)
      .strokeRoundedRect(-200, -100, 400, 200, 20);
    
    // Texto del mensaje
    const text = this.add
      .text(0, -20, "Por favor, gira tu dispositivo\na modo horizontal para jugar.", {
        fontFamily: "Arial",
        fontSize: "24px",
        color: "#ffffff",
        align: "center",
        stroke: "#000000",
        strokeThickness: 3,
      })
      .setOrigin(0.5);
    
    // Botones de opciones de resolución con diseño mejorado
    const resolutions = [750, 1250, 1500, 2000];
    const buttonWidth = 80;
    const buttonHeight = 44;
    const buttonSpacing = 10;
    const totalWidth = resolutions.length * buttonWidth + (resolutions.length - 1) * buttonSpacing;
    let startX = -totalWidth / 2 + buttonWidth / 2;
    
    resolutions.forEach(resolution => {
      // Crear sombra para efecto 3D
      const buttonShadow = this.add.graphics()
        .fillStyle(0x1e293b, 0.7)
        .fillRoundedRect(startX - buttonWidth/2, 50 - buttonHeight/2 + 3, buttonWidth, buttonHeight, 10)
        .setDepth(1001);
      this.rotateMessage.add(buttonShadow);
      
      // Crear botón con gradiente y borde
      const button = this.add.graphics()
        .fillStyle(0x3b82f6, 1)
        .fillRoundedRect(startX - buttonWidth/2, 50 - buttonHeight/2, buttonWidth, buttonHeight, 10)
        .lineStyle(2, 0x60a5fa, 1)
        .strokeRoundedRect(startX - buttonWidth/2, 50 - buttonHeight/2, buttonWidth, buttonHeight, 10)
        .setDepth(1001);
      this.rotateMessage.add(button);
      
      // Crear área interactiva
      const hitArea = this.add
        .rectangle(startX, 50, buttonWidth, buttonHeight, 0xffffff, 0)
        .setInteractive({ useHandCursor: true })
        .setDepth(1002);
      
      // Texto del botón con estilo mejorado
      const buttonText = this.add
        .text(startX, 50, resolution.toString(), {
          fontFamily: "Arial",
          fontSize: "20px",
          color: "#ffffff",
          stroke: "#000000",
          strokeThickness: 2,
          fontWeight: "bold"
        })
        .setOrigin(0.5)
        .setDepth(1002);
      this.rotateMessage.add(buttonText);
      
      // Eventos del botón con efectos visuales mejorados
      hitArea.on("pointerdown", () => {
        // Efecto visual al presionar
        button.clear()
          .fillStyle(0x1d4ed8, 1)
          .fillRoundedRect(startX - buttonWidth/2, 50 - buttonHeight/2 + 2, buttonWidth, buttonHeight, 10)
          .lineStyle(2, 0x60a5fa, 1)
          .strokeRoundedRect(startX - buttonWidth/2, 50 - buttonHeight/2 + 2, buttonWidth, buttonHeight, 10);
        
        buttonText.setScale(0.95);
        buttonText.y = 50 + 2; // Mover texto hacia abajo
      });
      
      hitArea.on("pointerup", () => {
        // Restaurar estilo
        button.clear()
          .fillStyle(0x3b82f6, 1)
          .fillRoundedRect(startX - buttonWidth/2, 50 - buttonHeight/2, buttonWidth, buttonHeight, 10)
          .lineStyle(2, 0x60a5fa, 1)
          .strokeRoundedRect(startX - buttonWidth/2, 50 - buttonHeight/2, buttonWidth, buttonHeight, 10);
        
        buttonText.setScale(1);
        buttonText.y = 50; // Restaurar posición del texto
        
        // Añadir efecto de partículas al seleccionar
        const particles = this.add.particles(startX, 50, 'particle', {
          speed: { min: 50, max: 100 },
          scale: { start: 0.2, end: 0 },
          quantity: 1,
          lifespan: 800,
          emitting: false,
          tint: [ 0x4ade80, 0x22c55e, 0xffffff ]
        });
        this.rotateMessage.add(particles);
        particles.explode(15);
        console.log('Partículas de rotación creadas');
        
        // Ocultar mensaje
        this.hideRotateMessage();
        
        // Recrear opciones de entrada
        this.time.delayedCall(500, () => {
          this.createMobileInput();
        });
      });
      
      hitArea.on("pointerover", () => {
        // Efecto de brillo al pasar el mouse
        button.clear()
          .fillStyle(0x2563eb, 1)
          .fillRoundedRect(startX - buttonWidth/2, 50 - buttonHeight/2, buttonWidth, buttonHeight, 10)
          .lineStyle(3, 0x93c5fd, 1) // Borde más brillante
          .strokeRoundedRect(startX - buttonWidth/2, 50 - buttonHeight/2, buttonWidth, buttonHeight, 10);
        
        // Añadir un ligero efecto de escala
        this.tweens.add({
          targets: buttonText,
          scale: 1.05,
          duration: 100,
          ease: 'Sine.easeOut'
        });
      });
      
      hitArea.on("pointerout", () => {
        // Restaurar apariencia normal
        button.clear()
          .fillStyle(0x3b82f6, 1)
          .fillRoundedRect(startX - buttonWidth/2, 50 - buttonHeight/2, buttonWidth, buttonHeight, 10)
          .lineStyle(2, 0x60a5fa, 1)
          .strokeRoundedRect(startX - buttonWidth/2, 50 - buttonHeight/2, buttonWidth, buttonHeight, 10);
        
        // Restaurar escala normal
        this.tweens.add({
          targets: buttonText,
          scale: 1,
          duration: 100,
          ease: 'Sine.easeOut'
        });
      });
      
      // Agregar al contenedor
      this.rotateMessage.add(hitArea);
      
      // Actualizar posición para el siguiente botón
      startX += buttonWidth + buttonSpacing;
    });
    
    // Agregar elementos al contenedor
    this.rotateMessage.add(bg);
    this.rotateMessage.add(text);
    
    // Efecto de aparición
    this.rotateMessage.setAlpha(0);
    this.tweens.add({
      targets: this.rotateMessage,
      alpha: 1,
      duration: 300,
      ease: "Power2"
    });
  }
  
  hideRotateMessage() {
    // Si no hay mensaje de rotación, no hacer nada
    if (!this.rotateMessage) return;
    
    // Efecto de desaparición
    this.tweens.add({
      targets: this.rotateMessage,
      alpha: 0,
      duration: 300,
      ease: "Power2",
      onComplete: () => {
        // Destruir el mensaje
        this.rotateMessage.destroy();
        this.rotateMessage = null;
      }
    });
  }

  shutdown() {
    // Limpiar recursos
    if (this.cursor) {
      this.cursor.destroy();
    }

    // Limpiar input móvil
    if (this.mobileInputContainer) {
      this.mobileInputContainer.destroy();
      this.mobileInputContainer = null;
    }
    
    // Limpiar mensaje de rotación si existe
    if (this.rotateMessage) {
      this.rotateMessage.destroy();
      this.rotateMessage = null;
    }

    // Limpiar botón de opciones
    if (this.optionsButtonContainer) {
      this.optionsButtonContainer.destroy();
      this.optionsButtonContainer = null;
    }

    // Limpiar botón de opciones (referencia antigua)
    if (this.optionsButton) {
      this.optionsButton = null;
    }

    // Limpiar listeners de orientación
    if (this.orientationChangeHandler) {
      window.removeEventListener('orientationchange', this.orientationChangeHandler);
      window.removeEventListener('resize', this.orientationChangeHandler);
      this.orientationChangeHandler = null;
    }

    // Limpiar botones HTML móviles
    const htmlButtons = document.querySelectorAll('.mobile-option-button');
    htmlButtons.forEach((btn) => btn.remove());

    // Limpiar el teclado
    this.input.keyboard.off("keydown");
  }
}

// Exportar la clase como variable global para que esté disponible en game.js
window.DroneRepairScene = DroneRepairScene;
