class scenaFallos extends Phaser.Scene {
  constructor() {
    super({ key: "scenaFallos" });
    this.answered = false;
    this.correctOption = 1; // (B) es la correcta, índice 1
    this.options = [
      "Un código con instrucciones fijas y sin condiciones.",
      "Un algoritmo de toma de decisiones basado en sensores y datos del entorno.",
      "Un sistema que espera órdenes humanas en todo momento.",
      "Apagar el robot cuando detecte un error en su programación.",
    ];
    this.feedbackTexts = [
      "Piensa en cómo un robot puede operar sin supervisión directa.",
      "¡Correcto! Un robot autónomo debe adaptarse a su entorno mediante sensores y lógica de IA.",
      "Piensa en cómo un robot puede operar sin supervisión directa.",
      "Piensa en cómo un robot puede operar sin supervisión directa.",
    ];
  }

  preload() {
    // Use existing background image from scenaPrincipal
    this.load.image("key_nuevo_fondo", "assets/scenaPrincipal/1.jpg");
    // Create a simple particle texture instead of data URI
    this.load.image("particle", "assets/logorobcodesolutions.ico");
  }

  create() {
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;

    // Fallback background if image fails to load
    const bg = this.add.rectangle(centerX, centerY, this.cameras.main.width, this.cameras.main.height, 0x0f172a);

    // Try to load the background image, fallback to solid color
    if (this.textures.exists("key_nuevo_fondo")) {
      this.add.image(centerX, centerY, "key_nuevo_fondo").setAlpha(0.7);
    } else {
      // Create gradient background using graphics
      const graphics = this.add.graphics();
      graphics.fillGradientStyle(0x1e293b, 0x1e293b, 0x0f172a, 0x0f172a, 1);
      graphics.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);
    }

    // Animated background particles - only if texture exists
    if (this.textures.exists("particle")) {
      this.createParticles();
    }

    // Modern glassmorphism panel with gradient border
    const panel = this.add
      .rectangle(centerX, centerY, 620, 420, 0x1a1a2e, 0.85)
      .setOrigin(0.5)
      .setInteractive();

    // Gradient border effect
    const border = this.add
      .rectangle(centerX, centerY, 626, 426)
      .setStrokeStyle(3, 0x00d4ff, 0.8)
      .setOrigin(0.5);

    // Animated glow effect
    this.tweens.add({
      targets: border,
      alpha: { from: 0.8, to: 0.3 },
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Enhanced title with gradient text
    const title = this.add
      .text(centerX, centerY - 150, "Exploración de la Colonia", {
        fontSize: "28px",
        fill: "#ffffff",
        fontFamily: "Orbitron, Arial Black",
        align: "center",
        stroke: "#00d4ff",
        strokeThickness: 3,
        shadow: {
          offsetX: 0,
          offsetY: 0,
          color: '#00d4ff',
          blur: 10,
          fill: true
        }
      })
      .setOrigin(0.5);

    // Title animation
    this.tweens.add({
      targets: title,
      scale: { from: 0.9, to: 1 },
      duration: 1000,
      ease: 'Back.easeOut'
    });

    // Enhanced subtitle
    this.add
      .text(
        centerX,
        centerY - 110,
        "Analiza los registros de la IA defectuosa y responde:",
        {
          fontSize: "16px",
          fill: "#94a3b8",
          fontFamily: "Inter, Arial",
          align: "center",
          fontStyle: "italic",
          shadow: {
            offsetX: 0,
            offsetY: 2,
            color: '#000000',
            blur: 4,
            fill: true
          }
        }
      )
      .setOrigin(0.5);

    // Enhanced question with better typography
    this.add
      .text(
        centerX,
        centerY - 70,
        "¿Cuál de estos enfoques permitiría mejorar la toma de decisiones en un robot autónomo?",
        {
          fontSize: "18px",
          fill: "#e2e8f0",
          fontFamily: "Inter, Arial",
          align: "center",
          wordWrap: { width: 550 },
          lineSpacing: 8,
          shadow: {
            offsetX: 0,
            offsetY: 1,
            color: '#000000',
            blur: 3,
            fill: true
          }
        }
      )
      .setOrigin(0.5);

    // Modern option buttons with hover effects
    this.optionButtons = [];
    for (let i = 0; i < this.options.length; i++) {
      const y = centerY + i * 50 - 20;

      // Create container for each option
      const container = this.add.container(centerX, y);

      // Rounded rectangle background
      const button = this.add
        .rectangle(0, 0, 560, 42, 0x334155, 0.9)
        .setStrokeStyle(2, 0x475569, 0.8)
        .setInteractive({ useHandCursor: true });

      // Text with modern styling
      const text = this.add
        .text(
          0,
          0,
          `(${String.fromCharCode(65 + i)}) ${this.options[i]}`,
          {
            fontSize: "16px",
            fill: "#f1f5f9",
            fontFamily: "Inter, Arial",
            align: "center",
            wordWrap: { width: 520 },
            lineSpacing: 4
          }
        )
        .setOrigin(0.5);

      container.add([button, text]);

      // Enhanced hover effects
      button.on("pointerover", () => {
        if (!button.getData("disabled")) {
          this.tweens.add({
            targets: [button, text],
            scaleX: 1.02,
            scaleY: 1.05,
            duration: 200,
            ease: 'Power2'
          });
          button.setFillStyle(0x475569, 1);
          button.setStrokeStyle(2, 0x00d4ff, 1);
        }
      });

      button.on("pointerout", () => {
        if (!button.getData("disabled")) {
          this.tweens.add({
            targets: [button, text],
            scaleX: 1,
            scaleY: 1,
            duration: 200,
            ease: 'Power2'
          });
          button.setFillStyle(0x334155, 0.9);
          button.setStrokeStyle(2, 0x475569, 0.8);
        }
      });

      button.setData("disabled", false);
      button.on("pointerdown", () => this.handleAnswer(i));

      // Staggered animation on load
      container.setAlpha(0);
      this.tweens.add({
        targets: container,
        alpha: 1,
        delay: i * 100,
        duration: 600,
        ease: 'Power2'
      });

      this.optionButtons.push({ button, text, container });
    }

    // Enhanced feedback with animation
    this.feedback = this.add
      .text(centerX, centerY + 190, "", {
        fontSize: "20px",
        fill: "#64748b",
        fontFamily: "Inter, Arial Black",
        align: "center",
        wordWrap: { width: 550 },
        shadow: {
          offsetX: 0,
          offsetY: 2,
          color: '#000000',
          blur: 4,
          fill: true
        }
      })
      .setOrigin(0.5)
      .setAlpha(0);
  }

  createParticles() {
    // Create floating particles for atmosphere
    const particles = this.add.particles(0, 0, 'particle', {
      x: { min: 0, max: this.cameras.main.width },
      y: { min: 0, max: this.cameras.main.height },
      speed: { min: 20, max: 40 },
      scale: { start: 0.5, end: 0 },
      alpha: { start: 0.3, end: 0 },
      lifespan: 4000,
      frequency: 200,
      tint: [0x00d4ff, 0x3b82f6, 0x8b5cf6]
    });

    // Make particles move slowly
    particles.setDepth(-1);
  }

  handleAnswer(selectedIndex) {
    if (this.answered) return;
    const isCorrect = selectedIndex === this.correctOption;
    const { button, text, container } = this.optionButtons[selectedIndex];

    if (isCorrect) {
      // Disable all buttons with animation
      this.optionButtons.forEach(({ button: btn, text: txt }, idx) => {
        btn.disableInteractive();
        btn.setData("disabled", true);

        if (idx !== selectedIndex) {
          // Fade out incorrect options
          this.tweens.add({
            targets: [btn, txt],
            alpha: 0.3,
            duration: 300,
            ease: 'Power2'
          });
        }
      });

      this.answered = true;

      // Enhanced correct feedback with animations
      this.feedback.setText(this.feedbackTexts[selectedIndex]);
      this.feedback.setStyle({ fill: "#10b981" });

      // Success animation for correct answer
      this.tweens.add({
        targets: [button, text],
        scaleX: 1.05,
        scaleY: 1.1,
        duration: 200,
        yoyo: true,
        ease: 'Back.easeOut'
      });

      button.setFillStyle(0x065f46, 1);
      button.setStrokeStyle(3, 0x10b981, 1);

      // Glow effect for correct answer
      const glow = this.add.circle(container.x, container.y, 300, 0x10b981, 0.1)
        .setScale(0.5)
        .setAlpha(0);

      this.tweens.add({
        targets: glow,
        alpha: 0.3,
        scale: 1,
        duration: 800,
        ease: 'Power2',
        onComplete: () => {
          this.tweens.add({
            targets: glow,
            alpha: 0,
            duration: 400
          });
        }
      });

      // Animate feedback appearance
      this.tweens.add({
        targets: this.feedback,
        alpha: 1,
        duration: 500,
        ease: 'Power2'
      });

      // Enhanced transition to next scene
      this.time.delayedCall(3000, () => {
        this.cameras.main.fadeOut(1000, 0, 0, 0);
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
          this.scene.start("scenaVideo2");
        });
      });

    } else {
      // Enhanced incorrect feedback with shake animation
      this.tweens.add({
        targets: container,
        x: container.x + 10,
        duration: 50,
        yoyo: true,
        repeat: 3,
        ease: 'Power2'
      });

      button.setFillStyle(0x991b1b, 1);
      button.setStrokeStyle(3, 0xef4444, 1);
      button.disableInteractive();
      button.setData("disabled", true);

      this.feedback.setText(this.feedbackTexts[selectedIndex]);
      this.feedback.setStyle({ fill: "#ef4444" });

      // Animate feedback appearance
      this.tweens.add({
        targets: this.feedback,
        alpha: 1,
        duration: 400,
        ease: 'Power2'
      });

      // Fade feedback after 2 seconds
      this.time.delayedCall(2000, () => {
        this.tweens.add({
          targets: this.feedback,
          alpha: 0,
          duration: 300
        });
      });
    }
  }
}
