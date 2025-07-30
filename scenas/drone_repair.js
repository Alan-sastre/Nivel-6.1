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
                    '  delay(____);',
                    '  digitalWrite(13, LOW);',
                    '  delay(1000);',
                    '}'
                ],
                missingLine: 7,
                valueToReplace: '1000',
                hint: 'El LED debe estar encendido por 1 segundo (____ milisegundos)',
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
                    '  analogWrite(motorPin, ____);',
                    '  delay(2000);',
                    '  // Apaga el motor',
                    '  analogWrite(motorPin, 0);',
                    '  delay(1000);',
                    '}'
                ],
                missingLine: 10,
                valueToReplace: '200',
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
                correctAnswer: '    digitalWrite(ledPin, HIGH);',
                hint: 'Usa: digitalWrite(ledPin, HIGH);',
                solution: 'digitalWrite(ledPin, HIGH);',
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
        // Crear un campo de entrada de Phaser
        this.inputElement = document.createElement('input');
        this.inputElement.type = 'text';
        this.inputElement.className = 'code-input';
        this.inputElement.style.cssText = `
            position: absolute;
            font-family: 'Courier New', monospace;
            font-size: 16px;
            background: #2a2a2a;
            color: #4ec9b0;
            border: 1px solid #4ec9b0;
            border-radius: 3px;
            padding: 2px 5px;
            margin: 0 2px;
            width: 60px;
            outline: none;
            z-index: 1000;
            display: none;
        `;
        
        // Manejar la tecla Enter
        this.inputElement.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                this.checkAnswer();
            }
        });
        
        // Asegurarse de que el campo de entrada esté en el DOM
        document.body.appendChild(this.inputElement);
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
        let currentY = 0;
        
        // Ocultar el campo de entrada hasta que lo necesitemos
        if (this.inputElement) {
            this.inputElement.style.display = 'none';
        }
        
        // Añadir número de línea y código
        exercise.code.forEach((line, i) => {
            // Número de línea
            const lineNumber = this.add.text(
                0,
                currentY,
                `${i + 1}`.padStart(2, ' '),
                { fontFamily: 'Courier New', fontSize: '16px', color: '#6a9955' }
            );
            
            // Si es la línea que necesita entrada
            if (i === exercise.missingLine) {
                // Encontrar la posición de los guiones bajos
                const valuePos = line.indexOf('____');
                const beforeValue = line.substring(0, valuePos);
                const afterValue = line.substring(valuePos + 4);
                
                // Mostrar la parte antes del valor
                const beforeText = this.add.text(
                    0,
                    currentY,
                    beforeValue,
                    { fontFamily: 'Courier New', fontSize: '16px', color: '#d4d4b0' }
                );
                
                // Mostrar la parte después del valor
                const afterText = this.add.text(
                    0, // Posición X se ajustará después
                    currentY,
                    afterValue,
                    { fontFamily: 'Courier New', fontSize: '16px', color: '#d4d4b0' }
                );
                
                // Ajustar posición de afterText basado en el ancho del input
                afterText.x = beforeText.width + 60; // Espacio para el input
                
                // Mostrar el valor correcto como pista en el placeholder
                const placeholder = exercise.valueToReplace || '';
                
                // Posicionar el campo de entrada
                const inputX = this.editorX + 20 + beforeText.width;
                const inputY = this.editorY + 40 + currentY - 2; // Ajuste fino de posición vertical
                
                this.inputElement.style.left = inputX + 'px';
                this.inputElement.style.top = inputY + 'px';
                this.inputElement.style.width = '60px';
                this.inputElement.style.display = 'inline';
                this.inputElement.value = '';
                this.inputElement.placeholder = placeholder;
                this.inputElement.focus();
                
                // Agregar elementos al contenedor
                this.codeContainer.add([beforeText, afterText]);
            } else {
                // Mostrar línea normal de código
                const lineText = this.add.text(
                    20, // Espacio para los números de línea
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
    
    checkAnswer() {
        const exercise = this.exercises[this.currentExercise];
        const userAnswer = this.inputElement ? this.inputElement.value.trim() : '';
        
        if (userAnswer === exercise.correctValue) {
            this.showMessage(exercise.successMessage, '#4caf50');
            this.time.delayedCall(1500, () => {
                const next = this.currentExercise + 1;
                if (next < this.exercises.length) {
                    this.loadExercise(next);
                } else {
                    this.showMessage('¡Felicidades! Has completado todos los ejercicios.', '#4caf50');
                }
            });
        } else {
            this.showMessage('Respuesta incorrecta. Intenta de nuevo.', '#f44336');
            this.inputField.value = '';
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
        if (this.inputField) {
            this.inputField.destroy();
        }
        if (this.hintWindow) {
            this.hintWindow.destroy();
        }
    }
}
