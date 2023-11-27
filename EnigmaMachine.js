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
