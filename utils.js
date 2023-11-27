function processAndUpdateOutput() {
  resetRotorPositions();
  const inputText = document.getElementById("inputText").value;
  const processedText = enigma.processInput(inputText);
  document.getElementById("outputText").value = processedText;

  enigmaMachine.lightboard.clearHighlights();
  if (processedText.length > 0) {
    enigma.logger.displayLog();
    const lastEncodedChar = processedText.charAt(processedText.length - 1);
    enigmaMachine.lightboard.highlightLight(lastEncodedChar);
  }

  enigmaMachine.draw();
}

function resetRotorPositions() {
  rotor1.position = rotor2.position = rotor3.position = 0;
}

document
  .getElementById("inputText")
  .addEventListener("input", processAndUpdateOutput);

document
  .querySelectorAll("#encryptButton, #decryptButton")
  .forEach((button) =>
    button.addEventListener("click", (event) =>
      processText(event.target.id === "encryptButton" ? "encrypt" : "decrypt")
    )
  );

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
    this.value = this.value.replace(/[^a-z]/gi, "").toUpperCase();
  });

function processText(action) {
  const inputText = document.getElementById("inputText").value;
  resetRotorPositions();
  const processedText = enigma.processInput(inputText);
  document.getElementById("outputText").value = processedText;
}

// ... Additional event listener functions: checkKeyboardClick, checkPlugboardClick, isMouseOverKey, isMouseOverPlug ...
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

// Example usage remains the same.
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

const canvas = document.getElementById("canvas");
const canvasContext = canvas.getContext("2d");
const enigmaMachine = new EnigmaMachineDesign(
  canvasContext,
  canvas.width,
  canvas.height,
  config
);

// Canvas Event Listeners
canvas.addEventListener("click", function (event) {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  checkKeyboardClick(x, y);
  checkPlugboardClick(x, y);
});

canvas.addEventListener("mousemove", function (event) {
  const x = event.clientX - this.getBoundingClientRect().left;
  const y = event.clientY - this.getBoundingClientRect().top;

  if (isMouseOverKey(x, y) || isMouseOverPlug(x, y)) {
    this.style.cursor = "pointer";
  } else {
    this.style.cursor = "default";
  }
});

enigmaMachine.draw();
