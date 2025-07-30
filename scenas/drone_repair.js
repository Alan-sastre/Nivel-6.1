class DroneRepairScene extends Phaser.Scene {
    constructor() {
        super({ key: 'DroneRepairScene' });
        this.exercises = [
            {
                title: 'Ejercicio 1: Tiempo de encendido',
                code: [
                    '// Programa para encender un LED',
                    'void setup() {',
                    '  pinMode(13, OUTPUT);',
                    '}',
                    '',
                    'void loop() {',
                    '  digitalWrite(13, HIGH);',
                    '  delay(1000);',
                    '  digitalWrite(13, LOW);',
                    '  delay(1000);',
                    '}'
                ],
                missingLine: 7,
                missingValue: '1000',
                correctValue: '1000',
                hint: 'El LED debe estar encendido por 1 segundo (1000 milisegundos)',
                droneState: 'off',
                successMessage: '¡Correcto! El LED ahora parpadea cada 1 segundo.'
            },
            {
                title: 'Ejercicio 2: Velocidad del motor',
                code: [
                    '// Programa para controlar un motor',
                    'int motorPin = 9;',
                    '',
                    'void setup() {',
                    '  pinMode(motorPin, OUTPUT);',
                    '}',
                    '',
                    'void loop() {',
                    '  // Enciende el motor',
                    '  analogWrite(motorPin, 200);',
                    '  delay(2000);',
                    '  // Apaga el motor',
                    '  analogWrite(motorPin, 0);',
                    '  delay(1000);',
                    '}'
                ],
                missingLine: 10,
                missingValue: '200',
                correctValue: '200',
                hint: 'La velocidad del motor es de 200 (rango 0-255)',
                droneState: 'slow',
                successMessage: '¡Correcto! El motor ahora gira a la velocidad correcta.'
            },
            {
                title: 'Ejercicio 3: Sensor de luz',
                code: [
                    '// Usa un sensor de luz (LDR)',
                    'int sensorPin = A0;',
                    'int ledPin = 13;',
                    'int umbral = 500;',
                    '',
                    'void setup() {',
                    '  pinMode(ledPin, OUTPUT);',
                    '  Serial.begin(9600);',
                    '}',
                    '',
                    'void loop() {',
                    '  int lectura = analogRead(sensorPin);',
                    '  if (lectura > umbral) {',
                    '    digitalWrite(ledPin, HIGH);',
                    '  } else {',
                    '    digitalWrite(ledPin, LOW);',
                    '  }',
                    '  delay(100);',
                    '}'
                ],
                missingLine: 13,
                missingValue: 'digitalWrite',
                correctValue: 'digitalWrite',
                hint: 'Usa la función para escribir en un pin digital',
                droneState: 'slow',
                successMessage: '¡Excelente! El LED se enciende con luz ambiental.'
            }
        ];
    }

    preload() {
        this.load.image('background', 'assets/drones/1.jpg');
        this.load.image('drone_off', 'assets/drones/1.png');
        this.load.image('drone_slow', 'assets/drones/1.png');
    }
    
    create() {
        // Configuración básica
        this.gameWidth = this.cameras.main.width;
        this.gameHeight = this.cameras.main.height;
        this.centerY = this.gameHeight / 2;
        this.cameras.main.setRoundPixels(true);
        
        // Fondo
        this.add.image(0, 0, 'background')
            .setOrigin(0, 0)
            .setDisplaySize(this.gameWidth, this.gameHeight);
        
        // Dron
        this.drone = this.add.image(200, this.gameHeight / 2, 'drone_off')
            .setScale(0.6)
            .setDepth(10);
        
        // Interfaz de usuario
        this.setupUI();
        this.createCodeEditor();
        this.createInputField();
        this.createButtons();
        
        // Cargar primer ejercicio
        this.loadExercise(0);
    }
    
    setupUI() {
        // Título
        this.add.text(this.gameWidth / 2, 30, 'REPARACIÓN DE DRONES', {
            fontFamily: 'Arial',
            fontSize: '32px',
            color: '#fff',
            stroke: '#000',
            strokeThickness: 5
        }).setOrigin(0.5);
        
        // Área de mensajes
        this.messageText = this.add.text(this.gameWidth / 2, this.gameHeight - 50, '', {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#fff',
            backgroundColor: 'rgba(0,0,0,0.7)',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setVisible(false);
    }
    
    createCodeEditor() {
        // Configurar las dimensiones del editor de código
        this.editorX = this.gameWidth * 0.45;
        this.editorY = 80;
        this.editorWidth = this.gameWidth * 0.5;
        this.editorHeight = this.gameHeight * 0.7;
        
        // Fondo del editor
        this.add.graphics()
            .fillStyle(0x1e1e1e, 0.9)
            .fillRoundedRect(this.editorX, this.editorY, this.editorWidth, this.editorHeight, 10);
        
        // Contenedor para el código
        this.codeContainer = this.add.container(this.editorX + 20, this.editorY + 40);
    }
    
    createInputField() {
        // Usaremos un objeto de texto de Phaser para el input
        this.inputText = '';
        this.isInputActive = false;
        
        // Manejar entrada de teclado
        this.input.keyboard.off('keydown'); // Remove any existing listeners
        this.input.keyboard.on('keydown', (event) => {
            if (!this.isInputActive) return;
            
            // Prevenir el comportamiento por defecto para evitar duplicación
            event.preventDefault();
            
            if (event.key === 'Enter') {
                this.checkAnswer();
                return;
            }
            
            let textChanged = false;
            
            if (event.key === 'Backspace') {
                if (this.inputText.length > 0) {
                    this.inputText = this.inputText.slice(0, -1);
                    textChanged = true;
                }
            } else if (event.key.length === 1 && !event.ctrlKey && !event.altKey && !event.metaKey) {
                this.inputText += event.key;
                textChanged = true;
            }
            
            // Actualizar el texto del input solo si hubo cambios
            if (textChanged && this.inputTextObj) {
                this.updateInputDisplay();
            }
        });
    }
    
    createButtons() {
        const buttonStyle = {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#fff',
            backgroundColor: '#4a6da7',
            padding: { x: 20, y: 10 },
            borderRadius: 5
        };
        
        // Botón de pista
        this.hintButton = this.add.text(
            this.gameWidth * 0.6,
            this.editorY + this.editorHeight + 70,
            'PISTA',
            { ...buttonStyle, backgroundColor: '#ff9800' }
        )
        .setOrigin(0.5)
        .setInteractive()
        .on('pointerdown', () => this.showHint());
        
        // Botón de verificar
        this.verifyButton = this.add.text(
            this.gameWidth * 0.8,
            this.editorY + this.editorHeight + 70,
            'VERIFICAR',
            { ...buttonStyle, backgroundColor: '#4caf50' }
        )
        .setOrigin(0.5)
        .setInteractive()
        .on('pointerdown', () => this.checkAnswer());
    }
    
    loadExercise(index) {
        if (index < 0 || index >= this.exercises.length) return;
        
        const exercise = this.exercises[index];
        this.currentExercise = index;
        this.codeContainer.removeAll(true);
        
        // Mostrar código con el campo de entrada en la línea faltante
        const lineHeight = 24;
        const lineNumberWidth = 40; // Ancho para los números de línea
        let currentY = 0;
        
        // Ocultar el campo de entrada hasta que lo necesitemos
        if (this.inputElement) {
            this.inputElement.style.display = 'none';
        } else {
            // Crear el elemento de entrada si no existe
            this.createInputField();
        }
        
        // Añadir número de línea y código
        exercise.code.forEach((line, i) => {
            // Número de línea
            const lineNumber = this.add.text(
                10, // Margen izquierdo
                currentY,
                `${i + 1}`.padStart(2, ' '),
                { fontFamily: 'Courier New', fontSize: '16px', color: '#6a9955' }
            );
            
            // Si es la línea que necesita entrada
            if (i === exercise.missingLine) {
                const missingValue = exercise.missingValue;
                const valueIndex = line.indexOf(missingValue);
                const beforeValue = line.substring(0, valueIndex);
                const afterValue = line.substring(valueIndex + missingValue.length);
                
                // Mostrar la parte antes del valor faltante
                const beforeText = this.add.text(
                    lineNumberWidth,
                    currentY,
                    beforeValue,
                    { fontFamily: 'Courier New', fontSize: '16px', color: '#d4d4b0' }
                );
                
                // Mostrar la parte después del valor faltante
                const afterText = this.add.text(
                    0, // Se posicionará después del input
                    currentY,
                    afterValue,
                    { fontFamily: 'Courier New', fontSize: '16px', color: '#d4d4b0' }
                );
                
                // Calcular posición del input
                const beforeTextWidth = beforeText.width;
                
                // Posición relativa al contenedor de código
                const inputX = beforeTextWidth + 5;
                const inputY = currentY - 2; // Ajuste fino para centrar verticalmente
                
                // Crear un contenedor para la línea de código
                const lineContainer = this.add.container(lineNumberWidth, 0);
                
                // Posicionar el texto antes del input
                beforeText.x = 0;
                beforeText.y = currentY;
                
                // Calcular el ancho del input basado en el texto faltante
                const charWidth = 9; // Ancho aproximado de cada carácter en píxeles
                const minInputWidth = 50;
                const padding = 6; // 3px a cada lado
                const inputWidth = Math.max(missingValue.length * charWidth + padding * 2, minInputWidth);
                
                // Crear el fondo del input
                this.inputBg = this.add.graphics()
                    .fillStyle(0x1e1e1e, 1)
                    .fillRect(inputX, currentY - 1, inputWidth, 20)
                    .lineStyle(1, 0x569cd6, 1)
                    .strokeRect(inputX, currentY - 1, inputWidth, 20);
                
                // Crear el texto del input
                this.inputText = '';
                this.inputTextObj = this.add.text(
                    inputX + padding,
                    currentY,
                    '',
                    { 
                        fontFamily: 'Courier New', 
                        fontSize: '16px', 
                        color: '#4ec9b0',
                        backgroundColor: 'transparent',
                        padding: 0
                    }
                );
                
                // Guardar referencias para actualización
                this.afterText = afterText;
                this.inputX = inputX;
                this.inputY = currentY;
                this.lineContainer = lineContainer;
                this.padding = padding;
                
                // Posicionar el texto después del input
                afterText.x = inputX + inputWidth + 2;
                afterText.y = currentY;
                
                // Agregar elementos al contenedor de línea
                lineContainer.add([beforeText, this.inputBg, this.inputTextObj, afterText]);
                this.codeContainer.add([lineNumber, lineContainer]);
                
                // Activar el input
                this.isInputActive = true;
                
                // Crear cursor parpadeante
                this.createCursor(inputX + 3, currentY);
            } else {
                // Mostrar línea normal de código
                const lineText = this.add.text(
                    lineNumberWidth, // Alineado con el texto de las otras líneas
                    currentY,
                    line,
                    { fontFamily: 'Courier New', fontSize: '16px', color: '#d4d4b0' }
                );
                this.codeContainer.add([lineNumber, lineText]);
            }
            
            currentY += 24; // Aumentar para la siguiente línea
        });
        
        // Actualizar el estado del dron
        this.drone.setTexture(`drone_${exercise.droneState}`);
    }
    
    showHint() {
        const exercise = this.exercises[this.currentExercise];
        
        // Crear ventana de pista
        if (this.hintWindow) this.hintWindow.destroy();
        
        // Fondo de la ventana
        const hintBg = this.add.graphics()
            .fillStyle(0x2d2d30, 0.95)
            .fillRoundedRect(
                this.editorX + 20,
                this.editorY + 40,
                this.editorWidth - 40,
                80,
                10
            )
            .lineStyle(2, 0xff9800, 1)
            .strokeRoundedRect(
                this.editorX + 20,
                this.editorY + 40,
                this.editorWidth - 40,
                80,
                10
            );
        
        // Texto de pista
        const hintText = this.add.text(
            this.editorX + 40,
            this.editorY + 60,
            `💡 Pista: ${exercise.hint}`,
            {
                fontFamily: 'Arial',
                fontSize: '16px',
                color: '#ffcc80',
                wordWrap: { width: this.editorWidth - 80 }
            }
        );
        
        // Botón de cierre
        const closeButton = this.add.text(
            this.editorX + this.editorWidth - 50,
            this.editorY + 50,
            '✕',
            { fontFamily: 'Arial', fontSize: '20px', color: '#ff6666' }
        )
        .setInteractive()
        .on('pointerdown', () => {
            hintBg.destroy();
            hintText.destroy();
            closeButton.destroy();
        });
        
        // Agrupar elementos de la ventana de pista
        this.hintWindow = this.add.container();
        this.hintWindow.add([hintBg, hintText, closeButton]);
        
        // Cerrar automáticamente después de 5 segundos
        this.time.delayedCall(5000, () => {
            if (this.hintWindow) {
                this.hintWindow.destroy();
                this.hintWindow = null;
            }
        });
    }
    
    createCursor(x, y) {
        if (this.cursor) {
            this.cursor.destroy();
        }
        
        // Crear el cursor invisible
        this.cursor = this.add.rectangle(x, y, 0, 0, 0x000000, 0);
        this.cursor.setOrigin(0, 0);
        this.cursor.setDepth(100);
        
        return this.cursor;
    }
    
    updateInputDisplay() {
        if (!this.inputTextObj) return;
        
        // Actualizar el texto
        this.inputTextObj.setText(this.inputText || '');
        
        // Calcular el ancho del texto actual
        const charWidth = 9; // Ancho aproximado de cada carácter
        const textWidth = this.inputText.length * charWidth;
        const minInputWidth = 50;
        const inputWidth = Math.max(textWidth + this.padding * 2, minInputWidth);
        
        // Actualizar el fondo del input
        this.inputBg.clear()
            .fillStyle(0x1e1e1e, 1)
            .fillRect(this.inputX, this.inputY - 1, inputWidth, 20)
            .lineStyle(1, 0x569cd6, 1)
            .strokeRect(this.inputX, this.inputY - 1, inputWidth, 20);
        
        // Mover el cursor
        if (this.cursor) {
            const cursorX = this.inputX + this.padding + textWidth;
            this.cursor.x = cursorX;
            this.cursor.y = this.inputY + 2;
            this.cursor.setDepth(100);
        }
        
        // Mover el texto después del input
        if (this.afterText) {
            this.afterText.x = this.inputX + inputWidth + 2;
            
            // Forzar actualización de la pantalla
            this.scene.scene.systems.displayList.depthSort();
        }
    }
    
    checkAnswer() {
        const exercise = this.exercises[this.currentExercise];
        const userAnswer = this.inputText.trim();
        
        if (userAnswer === exercise.correctValue) {
            // Respuesta correcta
            this.showMessage(exercise.successMessage, '#00ff00');
            
            // Actualizar el estado del dron
            this.updateDroneState(exercise.droneState);
            
            // Desactivar input actual
            this.isInputActive = false;
            if (this.cursor) {
                this.cursor.destroy();
                this.cursor = null;
            }
            
            // Pasar al siguiente ejercicio después de un retraso
            this.time.delayedCall(1500, () => {
                const nextIndex = this.currentExercise + 1;
                if (nextIndex < this.exercises.length) {
                    this.loadExercise(nextIndex);
                } else {
                    this.showMessage('¡Has completado todos los ejercicios!', '#00ff00');
                    // Volver al menú después de un retraso
                    this.time.delayedCall(2000, () => {
                        this.scene.start('MenuScene');
                    });
                }
            });
        } else {
            // Respuesta incorrecta
            this.showMessage('Respuesta incorrecta. Intenta de nuevo.', '#ff0000');
            this.inputText = '';
            if (this.inputTextObj) {
                this.inputTextObj.setText(' ');
            }
            this.updateInputDisplay();
        }
    }
    
    showMessage(text, color) {
        this.messageText.setText(text)
            .setBackgroundColor(color)
            .setVisible(true);
        
        this.time.delayedCall(3000, () => {
            this.messageText.setVisible(false);
        });
    }
    
    shutdown() {
        // Limpiar recursos
        if (this.inputElement && this.inputElement.parentNode) {
            this.inputElement.parentNode.removeChild(this.inputElement);
        }
        if (this.hintWindow) {
            this.hintWindow.destroy();
        }
        
        // Limpiar el cursor si existe
        if (this.cursor) {
            this.cursor.destroy();
        }
        
        // Limpiar el teclado
        this.input.keyboard.off('keydown');
    }
}