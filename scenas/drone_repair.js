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
  }

  create() {
    // Configuración básica
    this.gameWidth = this.cameras.main.width;
    this.gameHeight = this.cameras.main.height;
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

    // En móviles, mostrar directamente las opciones de respuesta
    if (this.isMobile) {
      // Mostrar mensaje de ayuda para móviles con texto más grande
      this.time.delayedCall(500, () => {
        const helpText = this.add
          .text(
            this.gameWidth / 2,
            this.gameHeight - 40,
            "Toca el botón ? para ver las opciones de respuesta",
            {
              fontFamily: "Arial",
              fontSize: "24px", // Texto más grande para mejor visibilidad
              color: "#ffffff",
              stroke: "#000000",
              strokeThickness: 3,
              backgroundColor: "#007acc", // Fondo azul para destacar
              padding: { x: 15, y: 8 }, // Padding para el fondo
            }
          )
          .setOrigin(0.5)
          .setDepth(100);

        // Hacer parpadear el texto para llamar la atención
        this.tweens.add({
          targets: helpText,
          alpha: 0.6,
          duration: 800,
          yoyo: true,
          repeat: 3,
          onComplete: () => {
            this.tweens.add({
              targets: helpText,
              alpha: 0,
              duration: 800,
              onComplete: () => helpText.destroy(),
            });
          },
        });
      });

      // Abrir automáticamente el modal de entrada para móviles después de un breve retraso
      this.time.delayedCall(1000, () => {
        // Mostrar directamente las opciones de respuesta
        this.createMobileInput();
      });
    }
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
      this.hintButton.setFillStyle(0xf59e0b);
      this.hintButtonText.setScale(1.05);
    });

    this.hintButton.on("pointerout", () => {
      this.hintButton.setFillStyle(0xfbbf24);
      this.hintButtonText.setScale(1);
    });

    this.hintButton.on("pointerdown", () => {
      console.log("Botón Pista clickeado!");

      // Prueba directa - crear mensaje inmediatamente
      const testMessage = this.add
        .text(this.gameWidth / 2, this.gameHeight - 100, "Mensaje de prueba", {
          fontFamily: "Arial",
          fontSize: "24px",
          color: "#ff0000",
          stroke: "#ffffff",
          strokeThickness: 3,
        })
        .setOrigin(0.5)
        .setDepth(200);

      // Destruir mensaje de prueba después de 2 segundos
      this.time.delayedCall(2000, () => {
        testMessage.destroy();
      });

      // También llamar a la función original
      this.showHint();
    });

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
      this.checkButton.setFillStyle(0x16a34a);
      this.checkButtonText.setScale(1.05);
    });

    this.checkButton.on("pointerout", () => {
      this.checkButton.setFillStyle(0x22c55e);
      this.checkButtonText.setScale(1);
    });

    this.checkButton.on("pointerdown", () => {
      console.log("Botón Comprobar clickeado!");
      this.checkAnswer();
    });
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

    // Crear opciones de respuesta para móviles
    const correctAnswer = this.currentExercise.correctValue;

    // Generar opciones incorrectas más inteligentes
    let options = [correctAnswer];
    const correctNum = parseInt(correctAnswer);

    // Agregar opciones incorrectas que sean plausibles pero incorrectas
    if (correctNum === 1000) {
      options.push(500, 1500, 2000, 750, 1250);
    } else if (correctNum === 2000) {
      options.push(1000, 3000, 1500, 2500, 1800);
    } else {
      // Para otros valores, generar opciones cercanas
      options.push(
        correctNum + 500,
        correctNum - 500,
        correctNum + 1000,
        correctNum - 1000,
        correctNum + 200
      );
    }

    // Mezclar las opciones
    options = options.sort(() => Math.random() - 0.5);

    // Crear contenedor de opciones debajo del dron, más a la izquierda
    const optionsContainer = this.add
      .container(this.gameWidth * 0.25, this.gameHeight * 0.75)
      .setDepth(200);

    // Fondo semi-transparente solo para el área de opciones
    const bg = this.add
      .graphics()
      .fillStyle(0x1e293b, 0.95) // Color más moderno
      .fillRoundedRect(-150, -60, 300, 120, 15)
      .lineStyle(2, 0x3b82f6, 1) // Borde azul más moderno
      .strokeRoundedRect(-150, -60, 300, 120, 15)
      .setDepth(200);
    optionsContainer.add(bg);

    // Título más pequeño
    const title = this.add
      .text(0, -45, "Selecciona tu respuesta:", {
        fontFamily: "Arial",
        fontSize: "18px",
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 2,
      })
      .setOrigin(0.5)
      .setDepth(201);
    optionsContainer.add(title);

    // Crear botones de opciones (1 fila de 4) más pequeños
    options.slice(0, 4).forEach((option, index) => {
      const x = (index - 1.5) * 70; // 4 opciones en una fila horizontal
      const y = 10; // Debajo del título

      // Botón más pequeño pero fácil de tocar
      const button = this.add
        .rectangle(x, y, 60, 40, 0x3b82f6, 0.9) // Botón más pequeño
        .setInteractive({ useHandCursor: true })
        .setDepth(201)
        .setOrigin(0.5)
        .setStrokeStyle(2, 0x60a5fa); // Borde más delgado

      const buttonText = this.add
        .text(x, y, option.toString(), {
          fontFamily: "Arial",
          fontSize: "16px", // Texto más pequeño
          color: "#ffffff",
          stroke: "#000000",
          strokeThickness: 2, // Contorno más delgado
        })
        .setOrigin(0.5)
        .setDepth(202);

      optionsContainer.add(button);
      optionsContainer.add(buttonText);

      // Eventos del botón
      button.on("pointerover", () => {
        button.setFillStyle(0x2563eb);
        button.setScale(1.05);
        buttonText.setScale(1.05);
      });

      button.on("pointerout", () => {
        button.setFillStyle(0x3b82f6, 0.9);
        button.setScale(1);
        buttonText.setScale(1);
      });

      // Evento de clic simple
      button.on("pointerdown", () => {
        console.log("Botón tocado:", option.toString());

        if (option.toString() === correctAnswer) {
          console.log("¡Correcto!");
          button.setFillStyle(0x22c55e);
          buttonText.setText("✅ " + option.toString());

          this.showMessage("¡Correcto! 🎉", "#4ade80", false, 1000);

          this.time.delayedCall(1500, () => {
            if (optionsContainer) {
              optionsContainer.destroy();
            }
            this.inputText = correctAnswer;
            this.checkAnswer();
          });
        } else {
          console.log("Incorrecto");
          button.setFillStyle(0xef4444);
          buttonText.setText("❌ " + option.toString());

          this.showMessage(
            "Incorrecto. Inténtalo de nuevo.",
            "#f87171",
            false,
            1000
          );

          this.time.delayedCall(1000, () => {
            button.setFillStyle(0x3b82f6, 0.9);
            buttonText.setText(option.toString());
          });
        }
      });
    });

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

    // Limpiar botón de opciones
    if (this.optionsButtonContainer) {
      this.optionsButtonContainer.destroy();
      this.optionsButtonContainer = null;
    }

    // Limpiar botón de opciones (referencia antigua)
    if (this.optionsButton) {
      this.optionsButton = null;
    }

    // Limpiar el teclado
    this.input.keyboard.off("keydown");
  }
}

// Exportar la clase como variable global para que esté disponible en game.js
window.DroneRepairScene = DroneRepairScene;
