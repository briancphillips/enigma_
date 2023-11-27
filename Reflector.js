class Reflector {
  constructor(mapping) {
    this.mapping = mapping;
  }

  logAction(inputLetter, outputLetter, logger) {
    logger.addEntry(`Reflector: ${inputLetter} -> ${outputLetter}`);
  }

  reflect(letter, logger) {
    const index = letter.charCodeAt(0) - 65;
    const outputLetter = this.mapping[index];
    this.logAction(letter, outputLetter, enigma.logger);
    return outputLetter;
  }
}
