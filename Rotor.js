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
