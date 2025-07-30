class Rompecabezas extends Phaser.Scene {
    constructor() {
        super({ key: 'Rompecabezas' });
        this.currentSection = 0;
        this.sections = [
            {
                name: "Ejercicio 1: LED Básico",
                errors: [
                    { line: 3, message: 'Falta punto y coma', solution: 'Agrega ";" al final de la línea.' },
                    { line: 4, message: 'Falta punto y coma', solution: 'Agrega ";" al final de la línea.' }
                ],
                codeLines: [
                    '// Encender LED en pin 13',
                    'void setup() {',
                    '  pinMode(13, OUTPUT)',
                    '  digitalWrite(13, HIGH)',
                    '}'
                ],
                correctedLines: [
                    '// Encender LED en pin 13',
                    'void setup() {',
                    '  pinMode(13, OUTPUT);',
                    '  digitalWrite(13, HIGH);',
                    '}'
                ]
            },
            {
                name: "Ejercicio 2: LED Parpadeante",
                errors: [
                    { line: 4, message: 'Falta delay', solution: 'Agrega "delay(1000);" para el parpadeo.' }
                ],
                codeLines: [
                    '// LED parpadeante',
                    'void loop() {',
                    '  digitalWrite(13, HIGH);',
                    '  digitalWrite(13, LOW);',
                    '}'
                ],
                correctedLines: [
                    '// LED parpadeante',
                    'void loop() {',
                    '  digitalWrite(13, HIGH);',
                    '  delay(1000);',
                    '  digitalWrite(13, LOW);',
                    '}'
                ]
            },
            {
                name: "Ejercicio 3: Sensor de Luz",
                errors: [
                    { line: 3, message: 'Variable no declarada', solution: 'Agrega "int sensorPin = A0;" antes de usarla.' }
                ],
                codeLines: [
                    '// Leer sensor de luz',
                    'void setup() {',
                    '  pinMode(sensorPin, INPUT);',
                    '  Serial.begin(9600);',
                    '}'
                ],
                correctedLines: [
                    '// Leer sensor de luz',
                    'void setup() {',
                    '  int sensorPin = A0;',
                    '  pinMode(sensorPin, INPUT);',
                    '  Serial.begin(9600);',
                    '}'
                ]
            }
        ];

        // Usar la primera sección (mostrar código con errores)
        this.errors = this.sections[0].errors;
        this.codeLines = this.sections[0].codeLines;
        this.correctedLines = this.sections[0].correctedLines;

        this.iaFixed = false;
        this.errorClicks = 0;
        this.isMessageOpen = false;
    }

    preload() {
        this.load.image('ia_roja', 'assets/rompecabezas/Taller.png'); // Usa tu imagen de IA defectuosa
        this.load.image('ia_verde', 'assets/rompecabezas/Taller.png'); // Usa la misma imagen pero cambia el color a verde si tienes otra
    }

    create() {
        const width = this.sys.game.config.width;
        const height = this.sys.game.config.height;

        // Fondo con gradiente mejorado y efectos de partículas
        this.cameras.main.setBackgroundColor('#2a2a4a');

        // Fondo con tonos cálidos sutiles

        // Título con tonos cálidos
        let title = this.add.text(width/2, 20, 'Repara el codigo de la IA', {
            font: 'bold 28px Arial',
            fill: '#ffffff',
            stroke: '#4a6a8a',
            strokeThickness: 3
        }).setOrigin(0.5).setName('title');

        let subtitle = this.add.text(width/2, 60, 'Encuentra y corrige los errores en el codigo', {
            font: 'bold 20px Arial',
            fill: '#ffd700',
            stroke: '#2a2a3a',
            strokeThickness: 1
        }).setOrigin(0.5);

        // Panel de código con tonos cálidos
        const panelX = 40;
        const panelY = 80;
        const panelWidth = 520;
        const lineHeight = 30;
        const panelHeight = this.codeLines.length * lineHeight + 30;

        // Fondo del panel con tono azul-gris suave
        this.codePanel = this.add.rectangle(panelX + panelWidth/2, panelY + panelHeight/2, panelWidth, panelHeight, 0x3a4a6a, 0.9)
            .setStrokeStyle(2, 0x6a7a9a, 0.8);

        // Título del panel con tono cálido
        let panelTitle = this.add.text(panelX + 10, panelY - 25, 'CÓDIGO', {
            font: 'bold 16px monospace',
            fill: '#b8d4f8'
        });

        // Indicador de estado con tono cálido
        this.statusIndicator = this.add.circle(panelX + panelWidth - 15, panelY - 15, 5, 0xff6b6b);

        // Mostrar código línea por línea (todas clickeables)
        this.codeTexts = [];
        this.errorZones = [];
        for (let i = 0; i < this.codeLines.length; i++) {
            let isErrorLine = this.errors.find(e => e.line === i);
            let lineColor = '#ffffff'; // Mismo color para todas las líneas
            let bgColor = 'rgba(0,0,0,0.2)';

            // Número de línea
            let lineNumber = this.add.text(panelX + 5, panelY + 15 + i * 25, (i + 1).toString().padStart(2, '0'), {
                font: '16px monospace',
                fill: '#9ab4d6'
            }).setName('lineNumber');

            // Texto del código (mostrando el código con errores)
            let codeText = this.add.text(panelX + 35, panelY + 15 + i * 25, this.codeLines[i], {
                font: '18px monospace',
                fill: '#ffffff'
            });

            // Hacer TODAS las líneas clickeables
            codeText.setInteractive({ useHandCursor: true });
            codeText.on('pointerdown', () => this.handleErrorClick(i));

            this.codeTexts.push(codeText);
        }

        // Imagen de IA minimalista
        const iaX = width - 200;
        const iaY = height / 2 - 50;

        this.iaImage = this.add.image(iaX, iaY, 'ia_roja').setDisplaySize(180, 180);
        this.iaImage.setAlpha(0.9);
        this.iaImage.setTint(0xff4444); // Aplicar tinte rojo intenso

        // Texto de estado con tono cálido
        this.jarvisStatus = this.add.text(iaX, iaY + 110, 'SISTEMA DAÑADO', {
            font: 'bold 18px Arial',
            fill: '#ff6b6b',
            backgroundColor: 'rgba(58,74,106,0.6)',
            padding: { left: 10, right: 10, top: 4, bottom: 4 }
        }).setOrigin(0.5);

        // Botones con tonos cálidos
        this.solutionButton = this.createModernButton(iaX, iaY + 150, 'SOLUCIÓN', '#6a8aba', () => this.showSolution());
        this.solutionButton.setVisible(false);

        // Feedback
        this.feedbackBox = this.add.rectangle(width/2, 60, 480, 90, 0x000000, 0.85).setStrokeStyle(2, 0x00ff00).setVisible(false);
        this.feedbackText = this.add.text(width/2 - 220, 30, '', { font: '20px Arial', fill: '#fff', wordWrap: { width: 440 } }).setVisible(false);

        // Estado de errores
        this.errorsLeft = this.errors.length;
        this.totalErrors = this.sections.length; // Ahora es por ejercicio completado
        this.correctedErrors = 0;

        // Barra de progreso
        this.createProgressBar();
    }

    createModernButton(x, y, text, color, callback) {
        const buttonWidth = 140;
        const buttonHeight = 40;
        const borderRadius = 4;
        const hexColor = Phaser.Display.Color.HexStringToColor(color).color;

        let buttonContainer = this.add.container(x, y);

        let buttonBg = this.add.graphics();
        buttonBg.fillStyle(hexColor, 0.7);
        buttonBg.fillRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, borderRadius);

        let buttonText = this.add.text(0, 0, text, {
            font: '14px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5);

        buttonContainer.add([buttonBg, buttonText]);

        buttonContainer.setSize(buttonWidth, buttonHeight);
        buttonContainer.setInteractive({ useHandCursor: true });

        buttonContainer.on('pointerover', () => {
            buttonBg.clear();
            buttonBg.fillStyle(hexColor, 0.9);
            buttonBg.fillRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, borderRadius);
        });

        buttonContainer.on('pointerout', () => {
            buttonBg.clear();
            buttonBg.fillStyle(hexColor, 0.7);
            buttonBg.fillRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, borderRadius);
        });

        buttonContainer.on('pointerdown', callback);

        return buttonContainer;
    }

    restartGame() {
        // Reiniciar el juego
        this.scene.restart();
    }

    createFloatingParticles() {
        // Crear partículas flotantes para ambiente futurista
        for (let i = 0; i < 15; i++) {
            let particle = this.add.circle(
                Phaser.Math.Between(0, this.sys.game.config.width),
                Phaser.Math.Between(0, this.sys.game.config.height),
                Phaser.Math.Between(2, 6),
                0x00ffff,
                0.3
            );

            // Animación flotante
            this.tweens.add({
                targets: particle,
                y: particle.y - Phaser.Math.Between(50, 150),
                x: particle.x + Phaser.Math.Between(-30, 30),
                alpha: 0,
                duration: Phaser.Math.Between(3000, 6000),
                delay: Phaser.Math.Between(0, 2000),
                repeat: -1,
                onRepeat: () => {
                    particle.y = this.sys.game.config.height + 10;
                    particle.x = Phaser.Math.Between(0, this.sys.game.config.width);
                    particle.alpha = 0.3;
                }
            });
        }
    }

    handleErrorClick(lineIndex) {
        // Bloquear si ya hay un mensaje abierto
        if (this.isMessageOpen) return;

        const error = this.errors.find(e => e.line === lineIndex);
        if (error && !this.iaFixed) {
            this.isMessageOpen = true;

            // Deshabilitar todas las líneas mientras hay mensaje
            this.codeTexts.forEach(text => {
                text.disableInteractive();
            });

            this.showEnhancedFeedback('✅ ¡CORRECTO!', error.message + '\n💡 ' + error.solution, '#00ff00');

            // Actualizar texto a la versión corregida
            this.codeTexts[lineIndex].setText(this.correctedLines[lineIndex]);
            this.codeTexts[lineIndex].setStyle({
                fill: '#00ff88',
                backgroundColor: 'rgba(0,255,100,0.2)'
            });

            // Esperar 2 segundos y luego cargar la siguiente sección
            this.time.delayedCall(2000, () => {
                this.isMessageOpen = false;
                this.loadNextSection();
            });

        } else {
            this.isMessageOpen = true;

            // Deshabilitar todas las líneas mientras hay mensaje
            this.codeTexts.forEach(text => {
                text.disableInteractive();
            });

            this.showEnhancedFeedback('🔍 LÍNEA CORRECTA', 'Aquí no está el error en el código. Busca en otra línea.', '#ffff00');

            // Reactivar interacción después de 3 segundos
            this.time.delayedCall(3000, () => {
                this.isMessageOpen = false;
                this.codeTexts.forEach(text => {
                    text.setInteractive({ useHandCursor: true });
                });
            });
        }
    }

    loadNextSection() {
        // Actualizar barra de progreso al completar un ejercicio
        this.updateProgressBar();

        // Limpiar código actual
        this.codeTexts.forEach(text => text.destroy());
        this.codeTexts = [];

        // Destruir números de línea anteriores
        const lineNumbers = this.children.list.filter(child =>
            child.name === 'lineNumber'
        );
        lineNumbers.forEach(element => element.destroy());

        // Avanzar a la siguiente sección
        this.currentSection++;

        if (this.currentSection < this.sections.length) {
            // Cargar nueva sección
            this.errors = this.sections[this.currentSection].errors;
            this.codeLines = this.sections[this.currentSection].codeLines;
            this.correctedLines = this.sections[this.currentSection].correctedLines;

            // Actualizar título y elementos sin reiniciar la escena
            this.updateSection();
        } else {
            // Todas las secciones completadas
            this.iaFixed = true;
            this.repairJarvis();
        }
    }

    updateSection() {
        const width = this.sys.game.config.width;
        const height = this.sys.game.config.height;
        const panelX = 40;
        const panelY = 80;
        const panelWidth = 520;
        const lineHeight = 30;
        const panelHeight = this.codeLines.length * lineHeight + 30;

        // Limpiar mensajes existentes
        const feedbackElements = this.children.list.filter(child =>
            child.name === 'feedbackBox' ||
            child.name === 'feedbackTitle' ||
            child.name === 'feedbackMessage' ||
            child.name === 'feedbackText'
        );
        feedbackElements.forEach(element => element.destroy());

        // Resetear estado de mensaje
        this.isMessageOpen = false;

        // Actualizar título
        this.children.getByName('title')?.setText(`Repara el código de la IA - ${this.sections[this.currentSection].name}`);

        // Actualizar panel de código
        this.codePanel.setSize(panelWidth, panelHeight);
        this.codePanel.setPosition(panelX + panelWidth/2, panelY + panelHeight/2);

        // Mostrar nuevo código - limpiar elementos anteriores
        this.codeTexts.forEach(text => text.destroy());
        this.codeTexts = [];

        // Destruir números de línea anteriores
        const lineNumbers = this.children.list.filter(child =>
            child.name === 'lineNumber'
        );
        lineNumbers.forEach(element => element.destroy());

        for (let i = 0; i < this.codeLines.length; i++) {
            let lineNumber = this.add.text(panelX + 5, panelY + 15 + i * lineHeight, (i + 1).toString().padStart(2, '0'), {
                font: '16px monospace',
                fill: '#9ab4d6'
            }).setName('lineNumber');

            let codeText = this.add.text(panelX + 35, panelY + 15 + i * lineHeight, this.codeLines[i], {
                font: '18px monospace',
                fill: '#ffffff'
            });

            codeText.setInteractive({ useHandCursor: true });
            codeText.on('pointerdown', () => this.handleErrorClick(i));
            this.codeTexts.push(codeText);
        }

        // Actualizar estado de errores
        this.errorsLeft = this.errors.length;
        this.statusIndicator.setFillStyle(0xff6b6b);
    }

    createSuccessEffect(target) {
        // Partículas de éxito
        for (let i = 0; i < 8; i++) {
            let particle = this.add.circle(
                target.x + target.width/2,
                target.y + target.height/2,
                4,
                0x00ff00,
                0.8
            );

            this.tweens.add({
                targets: particle,
                x: particle.x + Phaser.Math.Between(-50, 50),
                y: particle.y + Phaser.Math.Between(-50, 50),
                alpha: 0,
                scale: 0,
                duration: 800,
                ease: 'Power2',
                onComplete: () => particle.destroy()
            });
        }
    }

    createErrorEffect(target) {
        // Efecto de sacudida
        this.tweens.add({
            targets: target,
            x: target.x - 5,
            duration: 50,
            yoyo: true,
            repeat: 3
        });

        // Partículas de error
        for (let i = 0; i < 5; i++) {
            let particle = this.add.circle(
                target.x + target.width/2,
                target.y + target.height/2,
                3,
                0xff0000,
                0.8
            );

            this.tweens.add({
                targets: particle,
                x: particle.x + Phaser.Math.Between(-30, 30),
                y: particle.y - Phaser.Math.Between(20, 40),
                alpha: 0,
                duration: 600,
                onComplete: () => particle.destroy()
            });
        }
    }

    repairJarvis() {
        // Congelar la pantalla - deshabilitar toda interacción
        this.isMessageOpen = true;
        this.codeTexts.forEach(text => {
            text.disableInteractive();
        });
        if (this.solutionButton) {
            this.solutionButton.disableInteractive();
        }

        // Cambiar imagen de IA a verde (reparada)
        this.iaImage.setTint(0x44ff44);

        // Actualizar texto de estado
        this.jarvisStatus.setText('✅ SISTEMA REPARADO');
        this.jarvisStatus.setStyle({ fill: '#00ff00' });

        // Actualizar indicador
        this.statusIndicator.setFillStyle(0x00ff00);

        // Efecto de reparación completa
        this.createRepairEffect();

        // Mostrar mensaje de felicitaciones
        this.showEnhancedFeedback('🎉 ¡MISIÓN COMPLETADA!', 'Jarvis está completamente reparado y funcionando', '#00ff00');

        // Esperar 4 segundos y luego cambiar a la siguiente escena
        this.time.delayedCall(4000, () => {
            this.scene.start("scenaVideo4"); // Cambiar a la siguiente escena
        });
    }

    createProgressBar() {
        const width = this.sys.game.config.width;
        const barWidth = 400;
        const barHeight = 20;
        const barX = width / 2;
        const barY = this.sys.game.config.height - 40;

        // Fondo de la barra
        this.progressBarBg = this.add.rectangle(barX, barY, barWidth, barHeight, 0x333333, 0.5)
            .setStrokeStyle(2, 0x666666);

        // Barra de progreso
        this.progressBar = this.add.rectangle(barX - barWidth/2, barY, 0, barHeight, 0x00ff00, 0.8)
            .setOrigin(0, 0.5);

        // Texto de progreso
        this.progressText = this.add.text(barX, barY - 25, `Ejercicios: 0/${this.totalErrors}`, {
            font: '16px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5);
    }

    updateProgressBar() {
        this.correctedErrors++;
        const progress = this.correctedErrors / this.totalErrors;
        const barWidth = 400;

        // Animar el llenado de la barra
        this.tweens.add({
            targets: this.progressBar,
            width: barWidth * progress,
            duration: 500,
            ease: 'Power2'
        });

        // Actualizar texto
        this.progressText.setText(`Ejercicios: ${this.correctedErrors}/${this.totalErrors}`);
    }

    createRepairEffect() {
        // Explosión de partículas de éxito
        for (let i = 0; i < 20; i++) {
            let particle = this.add.circle(
                this.iaImage.x,
                this.iaImage.y,
                Phaser.Math.Between(4, 8),
                Phaser.Math.Between(0x00ff00, 0x00ffff),
                0.8
            );

            this.tweens.add({
                targets: particle,
                x: particle.x + Phaser.Math.Between(-150, 150),
                y: particle.y + Phaser.Math.Between(-150, 150),
                alpha: 0,
                scale: 0,
                duration: 1500,
                ease: 'Power2',
                onComplete: () => particle.destroy()
            });
        }
    }

    showFeedback(msg) {
        this.feedbackBox.setVisible(true);
        this.feedbackText.setText(msg);
        this.feedbackText.setVisible(true);
        this.feedbackBox.setName('feedbackBox');
        this.feedbackText.setName('feedbackText');
        this.time.delayedCall(2500, () => {
            this.feedbackBox.setVisible(false);
            this.feedbackText.setVisible(false);
        });
    }

    showEnhancedFeedback(title, message, color) {
        // Crear feedback mejorado con animaciones
        const width = this.sys.game.config.width;

        // Fondo del feedback
        let feedbackBg = this.add.rectangle(width/2, 150, 600, 120, 0x000000, 0.9)
            .setStrokeStyle(4, Phaser.Display.Color.HexStringToColor(color).color, 1)
            .setName('feedbackBox');

        // Título del feedback
        let feedbackTitle = this.add.text(width/2, 120, title, {
            font: 'bold 28px Arial',
            fill: color,
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5)
        .setName('feedbackTitle');

        // Mensaje del feedback
        let feedbackMsg = this.add.text(width/2, 160, message, {
            font: '20px Arial',
            fill: '#ffffff',
            wordWrap: { width: 550 },
            align: 'center'
        }).setOrigin(0.5)
        .setName('feedbackMessage');

        // Animación de entrada
        [feedbackBg, feedbackTitle, feedbackMsg].forEach(obj => {
            obj.setAlpha(0);
            obj.setScale(0.8);
            this.tweens.add({
                targets: obj,
                alpha: 1,
                scale: 1,
                duration: 400,
                ease: 'Back.easeOut'
            });
        });

        // Animación de salida
        this.time.delayedCall(3000, () => {
            [feedbackBg, feedbackTitle, feedbackMsg].forEach(obj => {
                this.tweens.add({
                    targets: obj,
                    alpha: 0,
                    scale: 0.8,
                    duration: 300,
                    onComplete: () => obj.destroy()
                });
            });
        });
    }

    showHint() {
        if (this.isMessageOpen) return;
        this.isMessageOpen = true;

        // Deshabilitar todas las líneas mientras hay mensaje
        this.codeTexts.forEach(text => {
            text.disableInteractive();
        });

        // Hacer parpadear las líneas de error en rojo
        for (let i = 0; i < this.errors.length; i++) {
            let errorLine = this.errors[i].line;
            let codeText = this.codeTexts[errorLine];
            if (codeText && codeText.active) {
                this.tweens.add({
                    targets: codeText,
                    alpha: 0.3,
                    duration: 200,
                    yoyo: true,
                    repeat: 5,
                    onStart: () => {
                        codeText.setStyle({
                            fill: '#ff4444',
                            stroke: '#ff0000',
                            strokeThickness: 2,
                            backgroundColor: 'rgba(255,50,50,0.3)'
                        });
                    },
                    onComplete: () => {
                        codeText.setStyle({
                            fill: '#ff4444',
                            stroke: '#ff0000',
                            strokeThickness: 2,
                            backgroundColor: 'rgba(255,50,50,0.3)'
                        });
                    }
                });
            }
        }

        let hint = '';
        if (this.errorsLeft === 3) hint = 'Revisa los puntos y comas en el setup.';
        else if (this.errorsLeft === 2) hint = '¿El pin 14 existe en Arduino Uno?';
        else if (this.errorsLeft === 1) hint = 'Cuidado con los nombres de funciones.';
        else hint = '¡Ya no quedan errores!';
        this.showEnhancedFeedback('💡 PISTA', hint, '#ffaa00');

        // Reactivar interacción después de 4 segundos
        this.time.delayedCall(4000, () => {
            this.isMessageOpen = false;
            this.codeTexts.forEach(text => {
                text.setInteractive({ useHandCursor: true });
            });
        });
    }

    showSolution() {
        let msg = 'Solución:\n';
        for (let i = 0; i < this.correctedLines.length; i++) {
            msg += this.correctedLines[i] + '\n';
        }
        this.showFeedback(msg);
    }
}

// No olvides registrar la escena en tu game.js