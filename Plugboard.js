class Plugboard {
  constructor(ctx, config = {}) {
    this.ctx = ctx;
    this.config = {
      numRows: 2,
      numCols: 12,
      numPlugs: 10,
      plugRadius: 15,
      plugGap: 20,
      plugColor: "#333",
      startX: 0,
      startY: 0,
      keys1: null,
      keys2: null,
      ...config,
    };
    this.keys = this.config.keys1 + this.config.keys2;
    this.selectedPlugs = [];
    this.connections = new Map();
    this.connectionColors = {}; // Store colors for each connection
    this.colorIndex = 0; // To track which color to use next
    this.pendingPlug = null; // To store the first clicked plug awaiting connection
    // Store connections as a map
    console.log("Plugboard initialized"); // Debug output// Add a property to track selected plugs
  }

  update() {
    this.draw();
    requestAnimationFrame(() => this.update());
  }

  selectPlug(row, col) {
    const plugIndex = row * this.config.numCols + col;
    const plugLetter = this.keys[plugIndex]; // Assuming 'this.keys' holds the letter for each plug

    if (
      this.connections.has(plugLetter) ||
      Array.from(this.connections.values()).includes(plugLetter)
    ) {
      // If the plug is already connected, disconnect it
      this.connections.delete(plugLetter);
      pb.clearPlug(plugLetter);
      this.connections.forEach((val, key, map) => {
        if (val === plugLetter) map.delete(key);
      });
      this.pendingPlug = null; // Clear pending plug as the connection is removed
    } else {
      if (this.pendingPlug === null) {
        // If no plug is pending, set the current one as pending
        this.pendingPlug = plugLetter;
      } else {
        // Connect the pending plug with the currently selected plug
        if (this.pendingPlug !== plugLetter && this.connections.size < 20) {
          this.connections.set(this.pendingPlug, plugLetter);
          this.connections.set(plugLetter, this.pendingPlug);
          pb.setPlug(this.pendingPlug, plugLetter);
          this.pendingPlug = null; // Clear the pending plug as the connection is made
        }
      }
    }
    processAndUpdateOutput();
    console.log(
      `Current connections: ${JSON.stringify(
        Array.from(this.connections.entries())
      )}`
    );

    this.draw();
    // Redraw the entire Enigma machine to reflect the updated state
    enigmaMachine.draw(); // Redraw the plugboard
  }

  drawConnectionLines() {
    this.connections.forEach((connectedPlug, plug) => {
      if (plug !== connectedPlug) {
        const plug1Coords = this.getPlugCoordinates(plug);
        const plug2Coords = this.getPlugCoordinates(connectedPlug);

        // Determine the color for this connection
        const color = this.getConnectionColor(plug, connectedPlug);

        // Draw the connection line
        const controlPoints = this.getControlPoints(plug1Coords, plug2Coords);
        this.ctx.beginPath();
        this.ctx.moveTo(plug1Coords.x, plug1Coords.y);
        this.ctx.quadraticCurveTo(
          controlPoints.x,
          controlPoints.y,
          plug2Coords.x,
          plug2Coords.y
        );
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
      }
    });
  }

  getConnectionColor(plug1, plug2) {
    const connectionKey = [plug1, plug2].sort().join("-"); // Sort to ensure consistency
    if (!this.connectionColors[connectionKey]) {
      this.connectionColors[connectionKey] = this.getNextColor();
    }
    return this.connectionColors[connectionKey];
  }

  getNextColor() {
    const colors = [
      "#ff0000",
      "#00ff00",
      "#0000ff",
      "#ffff00",
      "#ff00ff",
      "#00ffff" /* more colors */,
    ];
    const color = colors[this.colorIndex % colors.length];
    this.colorIndex++;
    return color;
  }

  getControlPoints(coords1, coords2) {
    // Calculate midpoints
    const midX = (coords1.x + coords2.x) / 2;
    const midY = (coords1.y + coords2.y) / 2;

    // Determine the direction and magnitude of the curve
    const offset = 20; // Adjust the offset for curvature
    const direction = coords1.y === coords2.y ? 1 : -1; // Curve up or down based on row

    return {
      x: midX,
      y: midY + offset * direction,
    };
  }

  getPlugCoordinates(plugLetter) {
    // Assuming you have a way to get the index from the letter
    const plugIndex = this.keys.indexOf(plugLetter);
    const row = Math.floor(plugIndex / this.config.numCols);
    const col = plugIndex % this.config.numCols;
    return {
      x:
        this.config.startX +
        col * (this.config.plugRadius + this.config.plugGap),
      y:
        this.config.startY +
        row * 1.5 * (this.config.plugRadius + this.config.plugGap),
    };
  }

  draw() {
    this.ctx.fillStyle = this.config.plugColor;
    for (let row = 0; row < this.config.numRows; row++) {
      for (let col = 0; col < this.config.numCols; col++) {
        let x =
          this.config.startX +
          col * (this.config.plugRadius + this.config.plugGap);
        let y =
          this.config.startY +
          row * 1.5 * (this.config.plugRadius + this.config.plugGap);
        this.drawPlug(x, y, row, col);
      }
    }
    this.drawConnectionLines();
  }

  drawPlug(x, y, row, col) {
    this.ctx.beginPath();
    this.ctx.arc(x, y, this.config.plugRadius, 0, 2 * Math.PI);
    this.ctx.fill();

    this.drawLetter(x, y, row, col);
  }

  drawLetter(x, y, row, col) {
    this.ctx.fillStyle = "#ffffff";
    this.ctx.font = "12px serif";
    const idx = row * this.config.numCols + col;
    const letter = this.keys[idx];
    this.ctx.fillText(
      letter,
      x - this.config.plugGap / 4,
      y + this.config.plugGap / 4
    );
    this.ctx.fillStyle = this.config.plugColor;
  }
}
