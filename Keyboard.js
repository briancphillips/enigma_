class Keyboard {
  constructor(ctx, config = {}) {
    this.ctx = ctx;
    this.config = {
      numRows: 3,
      numCols: 9,
      keyWidth: 35,
      keyHeight: 30,
      keyGap: 10,
      keyColor: "#4d4d4d",
      startX: 0,
      startY: 0,
      keys: null,
      ...config,
    };
    this.activeKey = null; // Add a property to track the active key
  }
  findKeyCoordinates(letter) {
    const upperLetter = letter.toUpperCase();
    let totalCols = this.config.numCols;
    let colOffset = 0;

    // Check each row
    for (let row = 0; row < this.config.numRows; row++) {
      if (row === 1) {
        // Middle row might have fewer keys
        totalCols = this.config.numCols - 1;
        colOffset = this.config.keyWidth / 2;
      } else {
        totalCols = this.config.numCols;
        colOffset = 0;
      }

      for (let col = 0; col < totalCols; col++) {
        let index = row * this.config.numCols + col - (row < 2 ? 0 : 1);
        if (index >= this.config.keys.length) {
          continue; // Skip if index is beyond the keys array
        }
        if (this.config.keys[index] === upperLetter) {
          return [row, col, colOffset]; // Return row, col, and the column offset if needed
        }
      }
    }

    return null; // Letter not found
  }
  draw() {
    this.ctx.fillStyle = this.config.keyColor;
    for (let row = 0; row < this.config.numRows; row++) {
      let cols = row === 1 ? this.config.numCols - 1 : this.config.numCols;
      for (let col = 0; col < cols; col++) {
        let pad = row == 1 ? this.config.keyWidth / 2 : 0;
        let x =
          this.config.startX +
          pad +
          col * (this.config.keyWidth + this.config.keyGap);
        let y =
          this.config.startY +
          row * (this.config.keyHeight + this.config.keyGap);

        // Check if the current key is the active one
        let isActive =
          this.activeKey &&
          this.activeKey[0] === row &&
          this.activeKey[1] === col;
        this.drawKey(x, y, row, col, isActive);
      }
    }
  }

  drawKey(x, y, row, col, isActive) {
    // Change color if the key is active
    this.ctx.fillStyle = isActive ? "#e2e2e2" : this.config.keyColor;
    this.ctx.fillRect(x, y, this.config.keyWidth, this.config.keyHeight);

    // Draw letter on the key
    this.drawLetter(x + 4, y + 4, row, col);
  }

  highlightKey(row, col) {
    this.activeKey = [row, col];
    this.draw(); // Redraw the keyboard with the highlighted key
  }

  drawLetter(x, y, row, col) {
    this.ctx.fillStyle = "#000000";
    this.ctx.font = "12px serif";
    const idx =
      row < 2
        ? row * this.config.numCols + col
        : row * this.config.numCols + col - 1;
    const letter = this.config.keys[idx];
    this.ctx.fillText(
      letter,
      x + this.config.keyWidth / 4,
      y + this.config.keyHeight / 2
    );
    this.ctx.fillStyle = this.config.keyColor;
  }
}
