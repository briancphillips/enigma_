// Logger class extracted from script.js
class Logger {
  constructor() {
    this.logEntries = [];
    this.currentInput = "";
    this.currentOutput = "";
  }

  logRotation(key) {
    this.addEntry(`-------- ROTATION FOR KEY ${key} --------`);
  }

  logRotorsState(rotors, stateDescription) {
    const rotorPositions = rotors
      .map((r) => String.fromCharCode(r.position + 65))
      .join(" ");
    this.addEntry(`${stateDescription}: ${rotorPositions}`);
  }

  logCharacterProcessing(inputChar, outputChar) {
    this.currentInput += inputChar; // Append the input character to currentInput
    this.currentOutput += outputChar; // Append the output character to currentOutput
    this.addEntry(`Input until now: ${this.currentInput}`);
    this.addEntry(`Output until now: ${this.currentOutput}`);
  }

  addEntry(entry) {
    this.logEntries.push(entry);
  }

  displayLog() {
    console.log(this.logEntries.join("\n"));
    const logContainer = document.getElementsByClassName("cde")[0];
    if (logContainer) {
      logContainer.textContent = this.getLogAsString(); // Replace instead of append
    }
  }

  clearLog() {
    this.logEntries = [];
    this.currentInput = "";
    this.currentOutput = "";
  }

  getLogAsString() {
    return this.logEntries.join("\n");
  }
}

class Rtr {
  constructor(mapping, notch, ringSetting = 0, label) {
    this.mapping = mapping;
    this.notch = notch.charCodeAt(0) - 65;
    this.ringSetting = ringSetting;
    this.position = 0;
    this.label = label;
  }

  // Method to check if a given position is the notch position
  isNotchPosition(position) {
    return this.notch === (position + 26) % 26; // Adjust for wrapping
  }
  logAction(inputLetter, outputLetter, pathLabel) {
    enigma.logger.addEntry(
      `${pathLabel} (${this.label}): ${inputLetter} -> ${outputLetter}`
    );
  }

  reachedNotch() {
    return this.position === this.notch;
  }

  encodeDecode(letter, reverse = false) {
    const shiftLetter = (pos) => String.fromCharCode(65 + ((pos + 26) % 26));
    const letterPosition = letter.charCodeAt(0) - 65;

    const adjustedPosition = (letterPosition + this.ringSetting) % 26;
    const shiftedPosition = (adjustedPosition + this.position) % 26;

    let mappedLetter;
    if (reverse) {
      const reverseShiftedPosition = this.mapping.indexOf(
        shiftLetter(shiftedPosition)
      );
      mappedLetter = shiftLetter(reverseShiftedPosition - this.ringSetting);
    } else {
      mappedLetter = this.mapping[shiftedPosition];
    }

    const unshiftedPosition =
      (mappedLetter.charCodeAt(0) - 65 - this.position - this.ringSetting) % 26;
    return shiftLetter(unshiftedPosition);
  }

  rotate() {
    this.position = (this.position + 1) % 26;
    return this.reachedNotch();
  }
}

class EnigmaMachine {
  constructor(rotors, reflector, plugboard) {
    this.rotors = rotors;
    this.reflector = reflector;
    this.plugboard = plugboard;
    this.logger = new Logger(); // Add a logger instance
  }

  debugLog(message) {
    console.log(message);
    this.rotors.forEach((rotor, index) => {
      console.log(
        `Rotor ${index + 1}: Position = ${
          rotor.position
        }, Notch = ${String.fromCharCode(rotor.notch + 65)}`
      );
    });
  }

  processCharacter(character) {
    let originalCharacter = character; // Preserve the original character
    this.logger.logRotation(character);
    character = this.plugboard.encode(character);

    this.stepRotors();

    character = this.processThroughRotors(character, false); // false for forward
    character = this.reflector.reflect(character);
    character = this.processThroughRotors(character, true); // true for reverse

    character = this.plugboard.encode(character);

    this.logger.logCharacterProcessing(originalCharacter, character); // Log the original and final characters
    enigma.logger.addEntry(`Lampboard: ${character}`);
    return character;
  }

  processThroughRotors(character, reverse) {
    let rotors = reverse ? [...this.rotors].reverse() : this.rotors;
    rotors.forEach((rotor, index) => {
      let originalCharacter = character;
      character = rotor.encodeDecode(character, reverse);
      // Update the log to reflect the correct rotor based on the reverse flag and actual rotor label
      rotor.logAction(
        originalCharacter,
        character,
        reverse
          ? "Reverse path - " + rotor.label
          : "Forward path - " + rotor.label
      );
    });
    return character;
  }

  stepRotors() {
    this.logger.logRotorsState(this.rotors, "Rotors before rotation");
    let willRotate = true;
    this.rotors.forEach((rotor, index) => {
      if (index === this.rotors.length - 2) {
        if (this.rotors[index + 1].reachedNotch() || rotor.reachedNotch()) {
          willRotate = true;
        }
      }
      if (willRotate) {
        willRotate = rotor.rotate();
      }
    });
    this.logger.logRotorsState(this.rotors, "Rotors after rotation");
  }

  processInput(input) {
    enigma.logger.clearLog();
    return input
      .toUpperCase()
      .split("")
      .map((char) =>
        char < "A" || char > "Z" ? char : this.processCharacter(char)
      )
      .join("");
  }
}

class Pb {
  constructor() {
    this.plugboardMap = {};
  }

  clearPlug(letter = null) {
    if (letter) {
      // Clear specific plug and its pair
      const pairedLetter = this.plugboardMap[letter];
      delete this.plugboardMap[letter];
      if (pairedLetter) {
        delete this.plugboardMap[pairedLetter];
      }
    } else {
      // Clear all plugs
      this.plugboardMap = {};
    }
  }

  setPlug(letterA, letterB) {
    this.plugboardMap[letterA] = letterB;
    this.plugboardMap[letterB] = letterA;
  }
  logAction(inputLetter, outputLetter) {
    enigma.logger.addEntry(`Plugboard: ${inputLetter} -> ${outputLetter}`);
  }

  encode(letter) {
    const outputLetter = this.plugboardMap[letter] || letter;
    this.logAction(letter, outputLetter);
    return outputLetter;
  }
}

class Reflector {
  constructor(mapping) {
    this.mapping = mapping;
  }

  logAction(inputLetter, outputLetter) {
    enigma.logger.addEntry(`Reflector: ${inputLetter} -> ${outputLetter}`);
  }

  reflect(letter) {
    const index = letter.charCodeAt(0) - 65;
    const outputLetter = this.mapping[index];
    this.logAction(letter, outputLetter);
    return outputLetter;
  }
}
// Example usage remains the same.

// Initialization and usage remains the same
ringSetting = [0, 0, 0];
// Initialization
let rotor1 = new Rtr("EKMFLGDQVZNTOWYHXUSPAIBRCJ", "Q", ringSetting[0], "I");
let rotor2 = new Rtr("AJDKSIRUXBLHWTMCQGZNPYFVOE", "E", ringSetting[1], "II");
let rotor3 = new Rtr("BDFHJLCPRTXVZNYEIWGAKMUSQO", "V", ringSetting[2], "III");
let reflector = new Reflector("YRUHQSLDPXNGOKMIEBFZCWVJAT");
let pb = new Pb();
//pb.setPlug("H", "B");

let enigma = new EnigmaMachine([rotor1, rotor2, rotor3], reflector, pb);

// Function to reset rotor positions
function resetRotors() {
  rotor1.position = rotor2.position = rotor3.position = 0;
}

function processAndUpdateOutput() {
  resetRotorPositions(); // Reset rotor positions for consistent encoding
  const inputText = document.getElementById("inputText").value;
  const processedText = enigma.processInput(inputText); // Process input through Enigma machine
  document.getElementById("outputText").value = processedText;

  // Clear previous highlights on the lightboard
  enigmaMachine.lightboard.clearHighlights();

  // Highlight based on the last character of the encoded output
  if (processedText.length > 0) {
    enigma.logger.displayLog(); // Display the log
    const lastEncodedChar = processedText.charAt(processedText.length - 1);
    enigmaMachine.lightboard.highlightLight(lastEncodedChar);
  }

  enigmaMachine.draw(); // Redraw to show changes
}

document
  .getElementById("inputText")
  .addEventListener("input", processAndUpdateOutput);

// Interactivity code extracted from the third file (misnamed enigma.js)
document
  .querySelectorAll("#encryptButton, #decryptButton")
  .forEach((button) =>
    button.addEventListener("click", (event) =>
      processText(event.target.id === "encryptButton" ? "encrypt" : "decrypt")
    )
  );

document.getElementById("inputText").addEventListener("keyup", (event) => {
  console.log("Event triggered for key:", event.key); // For debugging
  processAndUpdateOutput();
});

document.getElementById("inputText").addEventListener("keyup", (event) => {
  const letter = event.key;
  if (letter.length === 1 && /[a-z]/i.test(letter)) {
    const keyCoordinates = enigmaMachine.keyboard.findKeyCoordinates(letter);
    if (keyCoordinates) {
      const [row, col] = keyCoordinates;
      enigmaMachine.keyboard.highlightKey(row, col);
    }
  }
});

document
  .getElementById("inputText")
  .addEventListener("input", function (event) {
    // Replace any non-alphabetic character with '', and convert to uppercase
    this.value = this.value.replace(/[^a-z]/gi, "").toUpperCase();
  });

function processText(action) {
  const inputText = document.getElementById("inputText").value;
  resetRotorPositions();
  const processedText = enigma.processInput(inputText);
  document.getElementById("outputText").value = processedText;
}

function resetRotorPositions() {
  rotor1.position = rotor2.position = rotor3.position = 0;
}

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

class Rotor {
  constructor(ctx, config = {}) {
    this.ctx = ctx;
    this.config = {
      rotorWidth: 30,
      rotorHeight: 80,
      totalRotors: 3,
      rotorGap: 30,
      rotorColor: "#6B6B6B",
      startX: 0,
      startY: 0,
      ...config,
    };
  }

  // New method to get the letter for a given position
  getLetterAtPosition(position) {
    const totalLetters = 26; // Total number of letters in the alphabet
    const adjustedPosition = (position + totalLetters) % totalLetters; // Adjust for negative positions
    return String.fromCharCode(65 + adjustedPosition); // Convert position to letter
  }

  // Updated draw method
  draw() {
    this.drawHousing();
    this.ctx.fillStyle = this.config.rotorColor;
    let x = this.config.startX;
    let rotors = ["III", "II", "I"];
    for (let i = this.config.totalRotors - 1; i >= 0; i--) {
      let rotor = enigma.rotors[i]; // Reference to the rotor
      // Validate that rotor is an instance of Rotor and has the method isNotchPosition

      this.ctx.fillRect(
        x,
        this.config.startY,
        this.config.rotorWidth,
        this.config.rotorHeight
      );

      // Draw previous, current, and next letters
      const positions = [
        rotor.position - 1, // Previous position
        rotor.position, // Current position
        rotor.position + 1, // Next position
      ];

      positions.forEach((pos, index) => {
        const letter = this.getLetterAtPosition(pos);
        const isNotch = rotor.isNotchPosition(pos); // Define isNotch inside the loop
        this.ctx.fillStyle = isNotch ? "#FFFFFF" : "#000000"; // White for notch, black otherwise

        this.ctx.fillText(letter, x + 10, this.config.startY + 20 + index * 20);
        // Debugging output
        console.log(
          `Rotor ${
            i + 1
          }, Position ${pos}, Letter ${letter}, Is Notch: ${isNotch}`
        );
      });
      this.ctx.fillStyle = this.config.rotorColor;

      x += this.config.rotorWidth + this.config.rotorGap;
    }
  }

  drawHousing() {
    this.ctx.fillStyle = "#111111";

    this.ctx.fillRect(
      this.config.startX - 30,
      this.config.startY - 1,
      this.config.rotorWidth * 4 + 90,
      this.config.rotorHeight + 2
    );
  }
}

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

function drawShape(type, ...params) {
  ctx.beginPath();
  if (type === "line") {
    ctx.moveTo(params[0], params[1]);
    ctx.lineTo(params[2], params[3]);
  } else if (type === "circle") {
    ctx.arc(params[0], params[1], params[2], 0, Math.PI * 2);
  }
  ctx.stroke();
}

// Usage
let config = {
  rotorConfig: {
    startX: 180,
    startY: 20,
    mappings: [
      "EKMFLGDQVZNTOWYHXUSPAIBRCJ",
      "AJDKSIRUXBLHWTMCQGZNPYFVOE",
      "BDFHJLCPRTXVZNYEIWGAKMUSQO",
    ],
    notches: ["Q", "E", "V"],
  },
  lightboardConfig: {
    startX: 90,
    startY: 140,
    keys: "QWERTZUIOASDFGHJKPYXCVBNML",
  },
  keyboardConfig: {
    startX: 50,
    startY: 260,
    keys: "QWERTZUIOASDFGHJKPYXCVBNML",
  },
  plugboardConfig: {
    startX: 50,
    startY: 420,
    keys1: "ABCDEFGHIJKLM",
    keys2: "NOPQRTSUVWXYZ",
  },
};

const canvas = document.getElementById("canvas");
const canvasContext = canvas.getContext("2d");
const enigmaMachine = new EnigmaMachineDesign(
  canvasContext,
  canvas.width,
  canvas.height,
  config
);
enigmaMachine.draw();

// canvas.addEventListener("click", function (event) {
//   const rect = canvas.getBoundingClientRect();
//   const x = event.clientX - rect.left;
//   const y = event.clientY - rect.top;
//   checkKeyboardClick(x, y);
// });

function checkKeyboardClick(x, y) {
  // Iterate over the keyboard keys and check if the click is within a key
  for (let row = 0; row < enigmaMachine.keyboard.config.numRows; row++) {
    let cols =
      row === 1
        ? enigmaMachine.keyboard.config.numCols - 1
        : enigmaMachine.keyboard.config.numCols;
    for (let col = 0; col < cols; col++) {
      let pad = row == 1 ? enigmaMachine.keyboard.config.keyWidth / 2 : 0;
      let keyX =
        enigmaMachine.keyboard.config.startX +
        pad +
        col *
          (enigmaMachine.keyboard.config.keyWidth +
            enigmaMachine.keyboard.config.keyGap);
      let keyY =
        enigmaMachine.keyboard.config.startY +
        row *
          (enigmaMachine.keyboard.config.keyHeight +
            enigmaMachine.keyboard.config.keyGap);

      if (
        x > keyX &&
        x < keyX + enigmaMachine.keyboard.config.keyWidth &&
        y > keyY &&
        y < keyY + enigmaMachine.keyboard.config.keyHeight
      ) {
        // A key was clicked
        let index =
          row * enigmaMachine.keyboard.config.numCols + col - (row < 2 ? 0 : 1);
        let keyLetter = enigmaMachine.keyboard.config.keys[index]; // Correctly define keyLetter

        let inputBox = document.getElementById("inputText");
        inputBox.value += keyLetter; // Update the value of the input box
        inputBox.focus(); // Keep focus on the input box

        processAndUpdateOutput();
        enigmaMachine.keyboard.highlightKey(row, col);

        // Prevent any default action that might take focus away
        event.preventDefault();
        //enigmaMachine.lightboard.highlightLight(keyLetter);
        // console.log(
        //   "Key Pressed:",
        //   enigmaMachine.keyboard.config.keys[
        //     row * enigmaMachine.keyboard.config.numCols +
        //       col -
        //       (row < 2 ? 0 : 1)
        //   ],
        //   row * enigmaMachine.keyboard.config.numCols + col - (row < 2 ? 0 : 1)
        // );
        // Add your logic here for what happens when a key is clicked
        break;
      }
    }
  }
  processAndUpdateOutput();
}

function checkPlugboardClick(x, y) {
  for (let row = 0; row < enigmaMachine.plugboard.config.numRows; row++) {
    for (let col = 0; col < enigmaMachine.plugboard.config.numCols; col++) {
      let plugX =
        enigmaMachine.plugboard.config.startX +
        col *
          (enigmaMachine.plugboard.config.plugRadius +
            enigmaMachine.plugboard.config.plugGap);
      let plugY =
        enigmaMachine.plugboard.config.startY +
        row *
          1.5 *
          (enigmaMachine.plugboard.config.plugRadius +
            enigmaMachine.plugboard.config.plugGap);

      let distanceSquared = (x - plugX) ** 2 + (y - plugY) ** 2;
      if (distanceSquared <= enigmaMachine.plugboard.config.plugRadius ** 2) {
        // Plug was clicked
        console.log("Plug clicked at row:", row, "col:", col);
        enigmaMachine.plugboard.selectPlug(row, col);
        break;
      }
    }
  }
}

// Add the event listener to the canvas
canvas.addEventListener("click", function (event) {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  checkKeyboardClick(x, y); // Existing function for keyboard clicks
  checkPlugboardClick(x, y); // New function for plugboard clicks
});

// IMPORTANT: The actual Enigma machine logic is missing and would be required to complete this file.
canvas.addEventListener("mousemove", function (event) {
  const x = event.clientX - this.getBoundingClientRect().left;
  const y = event.clientY - this.getBoundingClientRect().top;

  if (isMouseOverKey(x, y) || isMouseOverPlug(x, y)) {
    this.style.cursor = "pointer";
  } else {
    this.style.cursor = "default";
  }
});

function isMouseOverKey(x, y) {
  for (let row = 0; row < enigmaMachine.keyboard.config.numRows; row++) {
    for (let col = 0; col < enigmaMachine.keyboard.config.numCols; col++) {
      let keyX =
        enigmaMachine.keyboard.config.startX +
        col *
          (enigmaMachine.keyboard.config.keyWidth +
            enigmaMachine.keyboard.config.keyGap);
      let keyY =
        enigmaMachine.keyboard.config.startY +
        row *
          (enigmaMachine.keyboard.config.keyHeight +
            enigmaMachine.keyboard.config.keyGap);

      if (
        x > keyX &&
        x < keyX + enigmaMachine.keyboard.config.keyWidth &&
        y > keyY &&
        y < keyY + enigmaMachine.keyboard.config.keyHeight
      ) {
        return true;
      }
    }
  }
  return false;
}
function isMouseOverPlug(x, y) {
  for (let row = 0; row < enigmaMachine.plugboard.config.numRows; row++) {
    for (let col = 0; col < enigmaMachine.plugboard.config.numCols; col++) {
      let plugX =
        enigmaMachine.plugboard.config.startX +
        col *
          (enigmaMachine.plugboard.config.plugRadius +
            enigmaMachine.plugboard.config.plugGap);
      let plugY =
        enigmaMachine.plugboard.config.startY +
        row *
          1.5 *
          (enigmaMachine.plugboard.config.plugRadius +
            enigmaMachine.plugboard.config.plugGap);

      let distanceSquared = (x - plugX) ** 2 + (y - plugY) ** 2;
      if (distanceSquared <= enigmaMachine.plugboard.config.plugRadius ** 2) {
        return true;
      }
    }
  }
  return false;
}
