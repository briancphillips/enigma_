class Pb {
  constructor() {
    this.plugboardMap = {};
  }

  clearPlug(letter = null) {
    if (letter) {
      const pairedLetter = this.plugboardMap[letter];
      delete this.plugboardMap[letter];
      if (pairedLetter) {
        delete this.plugboardMap[pairedLetter];
      }
    } else {
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
