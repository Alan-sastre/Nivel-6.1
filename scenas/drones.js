class DronesScene extends Phaser.Scene {
    constructor() {
        super({ key: 'DronesScene' });
    }

    preload() {
        this.load.image('background', 'assets/drones/1.jpg');
        this.load.image('drone', 'assets/drones/1.png');
    }

    create() {
        const screenWidth = this.cameras.main.width;
        const screenHeight = this.cameras.main.height;

        // Fondo
        this.add.image(0, 0, 'background')
            .setOrigin(0, 0)
            .setDisplaySize(screenWidth, screenHeight);

        // Overlay para mejor legibilidad
        this.add.graphics()
            .fillStyle(0x000000, 0.4)
            .fillRect(0, 0, screenWidth, screenHeight);

        // Título
        this.add.text(screenWidth / 2, 100, '🚁 ESCENA DE DRONES', {
            fontFamily: 'Arial Black',
            fontSize: '32px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        // Descripción
        this.add.text(screenWidth / 2, 200, 'Esta es una escena de transición para drones.\nPresiona ESPACIO o haz clic para continuar.', {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#ffffff',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        // Dron animado
        const drone = this.add.image(screenWidth / 2, screenHeight / 2, 'drone')
            .setScale(0.4);

        // Animación del dron
        this.tweens.add({
            targets: drone,
            y: drone.y - 50,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Controles
        this.input.keyboard.on('keydown-SPACE', () => {
            this.scene.start('scenaVideo3');
        });

        this.input.on('pointerdown', () => {
            this.scene.start('scenaVideo3');
        });
    }
}
