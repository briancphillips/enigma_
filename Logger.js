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
    this.currentInput += inputChar;
    this.currentOutput += outputChar;
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
      logContainer.textContent = this.getLogAsString();
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
