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
        missingLine: 10,
        correctValue: "2000",
        hint: "El motor debe estar encendido por 2 segundos (2000 milisegundos)",
        droneState: "slow",
        successMessage:
          "¡Correcto! El motor ahora gira a la velocidad correcta.",
      },
      {
        title: "Ejercicio 3: Sensor de luz",
        code: [
          "// Sensor de luz (LDR)",
          "int sensorPin = A0;",
          "int ledPin = 13;",
          "",
          "void setup() {",
          "  pinMode(ledPin, OUTPUT);",
          "}",
          "",
          "void loop() {",
          "  int lectura = analogRead(sensorPin);",
          "  if (lectura > 500) {",
          "    _________(ledPin, HIGH);",
          "  } else {",
          "    digitalWrite(ledPin, LOW);",
          "  }",
          "  delay(100);",
          "}",
        ],
        missingLine: 11,
        correctValue: "digitalWrite",
        hint: "Usa la función para escribir en un pin digital",
        droneState: "working",
        successMessage: "¡Excelente! El LED se enciende con luz ambiental.",
      },
    ];
  }

  preload() {
    this.load.image("background", "assets/drones/1.jpg");
    this.load.image("drone_off", "assets/drones/1.png");
    this.load.image("drone_slow", "assets/drones/1.png");
    this.load.image("drone_working", "assets/drones/1.png");
  }

  create() {
    // Configuración básica
    this.gameWidth = this.cameras.main.width;
    this.gameHeight = this.cameras.main.height;
    this.cameras.main.setRoundPixels(true);

    // Habilitar input para toda la escena
    this.input.setDefaultCursor("pointer");

    // Fondo con overlay muy sutil
    this.add
      .image(0, 0, "background")
      .setOrigin(0, 0)
      .setDisplaySize(this.gameWidth, this.gameHeight);

    // Overlay muy sutil
    this.add
      .graphics()
      .fillStyle(0x000000, 0.15)
      .fillRect(0, 0, this.gameWidth, this.gameHeight);

    // Dron más grande
    this.drone = this.add
      .image(120, this.gameHeight / 2, "drone_off")
      .setScale(0.45)
      .setDepth(10);

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

    // Configurar entrada de teclado
    this.setupKeyboard();
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
      .text(this.gameWidth - 50, 20, "1/3", {
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
    // Editor compacto estilo VS Code, más arriba
    this.editorX = this.gameWidth * 0.45;
    this.editorY = 70; // Subido de 100 a 70
    this.editorWidth = this.gameWidth * 0.5;
    this.editorHeight = this.gameHeight * 0.6; // Reducido de 0.7 a 0.6

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
    const buttonWidth = 160;
    const buttonHeight = 45;
    const buttonSpacing = 20;

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
          fontSize: "16px",
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
        .text(
          this.gameWidth / 2,
          this.gameHeight - 100,
          "PRUEBA: Pista funcionando!",
          {
            fontFamily: "Arial",
            fontSize: "24px",
            color: "#ff0000",
            stroke: "#ffffff",
            strokeThickness: 3,
          }
        )
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
          fontSize: "16px",
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

  loadExercise(index) {
    if (index < 0 || index >= this.exercises.length) return;

    this.currentExercise = this.exercises[index];
    this.currentExerciseIndex = index;

    // Actualizar progreso
    this.progressText.setText(`${index + 1}/3`);

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

    // Limpiar título anterior
    if (this.exerciseTitle) {
      this.exerciseTitle.destroy();
    }

    // Título del ejercicio simple - más pequeño
    this.exerciseTitle = this.add
      .text(this.gameWidth / 2, 55, this.currentExercise.title, {
        fontFamily: "Arial",
        fontSize: "20px",
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 2,
      })
      .setOrigin(0.5)
      .setDepth(5);

    // Mostrar código con números de línea estilo VS Code
    const lineHeight = 22;

    this.currentExercise.code.forEach((line, i) => {
      const y = i * lineHeight;

      // Número de línea estilo VS Code
      const lineNum = this.add
        .text(0, y + 2, (i + 1).toString().padStart(2, " "), {
          fontFamily: "Consolas, monospace",
          fontSize: "14px",
          color: "#858585",
          align: "right",
          fixedWidth: 35,
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
              fontSize: "14px",
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

          // Texto después del input
          const afterText = this.add
            .text(inputX + 88, y + 2, parts[1], {
              fontFamily: "Consolas, monospace",
              fontSize: "14px",
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
              "💡 Haz clic en el campo azul para escribir tu respuesta",
              {
                fontFamily: "Arial",
                fontSize: "16px",
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
        }
      } else {
        // Línea normal de código estilo VS Code
        const codeLine = this.add
          .text(0, y + 2, line, {
            fontFamily: "Consolas, monospace",
            fontSize: "14px",
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
    if (!this.inputTextObj || !this.inputBg) return;

    // Actualizar texto del input
    this.inputTextObj.setText(this.inputText);

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

    // Actualizar posición del cursor
    if (this.cursor) {
      const cursorX = this.editorX + 60 + this.inputX + padding + textWidth;
      this.cursor.x = cursorX;
      this.cursor.y = this.editorY + 20 + this.inputY;
    }
  }

  checkAnswer() {
    if (!this.currentExercise) return;

    const userAnswer = this.inputText.trim();
    const correctAnswer = this.currentExercise.correctValue;

    if (userAnswer === correctAnswer) {
      // Respuesta correcta
      this.showMessage(this.currentExercise.successMessage, "#4ade80");

      // Efecto de éxito en el dron
      this.tweens.add({
        targets: this.drone,
        scaleX: 0.5,
        scaleY: 0.5,
        duration: 200,
        yoyo: true,
        repeat: 2,
      });

      // Pasar al siguiente ejercicio
      this.time.delayedCall(2500, () => {
        const nextIndex = this.currentExerciseIndex + 1;
        if (nextIndex < this.exercises.length) {
          this.loadExercise(nextIndex);
        } else {
          // Todos los ejercicios completados
          this.showMessage(
            "🎉 ¡Felicidades! Has completado todos los ejercicios.",
            "#4ade80"
          );
          this.time.delayedCall(3000, () => {
            this.scene.start("scenaVideo2");
          });
        }
      });
    } else {
      // Respuesta incorrecta
      this.showMessage(
        "❌ Incorrecto. Inténtalo de nuevo o usa la pista.",
        "#f87171"
      );

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
    this.showMessage(`💡 Pista: ${this.currentExercise.hint}`, "#fbbf24");
  }

  showMessage(text, color = "#ffffff") {
    console.log("Función showMessage ejecutada con:", text, color);

    // Eliminar mensaje anterior si existe
    if (this.messageBox) {
      console.log("Destruyendo mensaje anterior");
      this.messageBox.destroy();
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

    // Auto-ocultar después de un tiempo
    this.time.delayedCall(4000, () => {
      if (this.messageBox) {
        this.tweens.add({
          targets: [this.messageBox, this.messageBg],
          alpha: 0,
          duration: 500,
          ease: "Power2",
          onComplete: () => {
            this.messageBox.destroy();
            this.messageBg.destroy();
            this.messageBox = null;
            this.messageBg = null;
          },
        });
      }
    });
  }

  shutdown() {
    // Limpiar recursos
    if (this.cursor) {
      this.cursor.destroy();
    }

    // Limpiar elementos DOM
    // No hay elementos DOM para limpiar aquí, ya que los botones son de Phaser

    // Limpiar el teclado
    this.input.keyboard.off("keydown");
  }
}
