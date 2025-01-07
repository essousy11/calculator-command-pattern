// SquareCommand.js
export default class TanCommand {
  execute(value) {
    if (isNaN(value)) {
      throw new Error('Valeur invalide pour le tangent');
    }
    return Math.tan(value);
  }
  }
  