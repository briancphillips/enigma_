class Rtr {
  constructor(mapping, notch, ringSetting = 0, label) {
    this.mapping = mapping;
    this.notch = notch.charCodeAt(0) - 65;
    this.ringSetting = ringSetting;
    this.position = 0;
    this.label = label;
  }

  isNotchPosition(position) {
    return this.notch === (position + 26) % 26;
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
