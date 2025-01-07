// SinCommand.js
export default class SinCommand {
    execute(value) {
      if (isNaN(value)) {
        throw new Error('Valeur invalide pour le sinus');
      }
      return Math.sin(value);
    }
  }
  