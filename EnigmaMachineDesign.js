class EnigmaMachineDesign {
  constructor(ctx, canvasWidth, canvasHeight, config = {}) {
    this.ctx = ctx;
    this.canvasDimensions = { width: canvasWidth, height: canvasHeight };
    this.config = config;

    this.initializeComponents();
  }

  initializeComponents() {
    this.rotor = new Rotor(this.ctx, this.config.rotorConfig);
    this.lightboard = new Lightboard(this.ctx, this.config.lightboardConfig);
    this.keyboard = new Keyboard(this.ctx, this.config.keyboardConfig);
    this.plugboard = new Plugboard(this.ctx, this.config.plugboardConfig);
  }

  draw() {
    const { width, height } = this.canvasDimensions;
    // Clear the entire canvas
    this.ctx.clearRect(0, 0, width, height);

    this.ctx.fillStyle = "#8b8b8b";
    this.ctx.fillRect(0, 0, width, height);

    this.rotor.draw();
    this.lightboard.draw();
    this.keyboard.draw();
    this.plugboard.draw();
  }
}
