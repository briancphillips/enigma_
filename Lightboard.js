class Lightboard {
  constructor(ctx, config = {}) {
    this.ctx = ctx;
    this.config = {
      numRows: 3,
      numCols: 9,
      lightRadius: 14,
      lightGap: 10,
      lightColor: "#333",
      startX: 0,
      startY: 0,
      keys: null,
      ...config,
    };
    this.activeLight = null; // Property to track the active light
  }

  draw() {
    for (let row = 0; row < this.config.numRows; row++) {
      let cols = row === 1 ? this.config.numCols - 1 : this.config.numCols;
      for (let col = 0; col < cols; col++) {
        let pad =
          row === 1 ? this.config.lightRadius + this.config.lightRadius / 2 : 0;
        let x =
          this.config.startX +
          pad +
          col * (2 * this.config.lightRadius + this.config.lightGap);
        let y =
          this.config.startY +
          row * (2 * this.config.lightRadius + this.config.lightGap);

        // Determine if this light is the active one
        const idx =
          row < 2
            ? row * this.config.numCols + col
            : this.config.numCols * 2 - 1 + col;

        //console.log("INSIDE LIGhtbOARD", idx, " INDEX", row, "row");
        let isActive = idx === this.activeLight;

        this.drawLight(x, y, row, col, isActive);
      }
    }
  }

  clearHighlights() {
    this.activeLight = null; // Reset the active light
    this.draw(); // Redraw the lightboard without any highlights
  }

  drawLight(x, y, row, col, isActive) {
    this.ctx.beginPath();
    this.ctx.arc(x, y, this.config.lightRadius, 0, 2 * Math.PI);

    // Set the fill style for the light
    this.ctx.fillStyle = isActive ? "#FFFF00" : this.config.lightColor; // Yellow for active, for example
    this.ctx.fill();

    // Draw the letter on the light
    this.drawLetter(x, y, row, col, isActive);
  }
  highlightLight(letter) {
    // Find the index of the letter in the lightboard configuration
    const upperLetter = letter.toUpperCase();
    this.activeLight = this.config.keys.indexOf(upperLetter);

    if (this.activeLight !== -1) {
      this.draw(); // Redraw the lightboard with the highlighted light
    }
  }

  drawLetter(x, y, row, col, isActive) {
    // Set the text color based on whether the lamp is active
    this.ctx.fillStyle = isActive ? "#000000" : "#ffffff"; // Example: Red for active, black for inactive

    // Existing text drawing code
    this.ctx.font = "12px serif";
    const idx =
      row < 2
        ? row * this.config.numCols + col
        : row * this.config.numCols + col - 1;
    const letter = this.config.keys[idx];
    this.ctx.fillText(letter, x - 4, y + 4);
  }
}
