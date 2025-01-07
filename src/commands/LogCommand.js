// LogCommand.js
export default class LogCommand {
    execute(value) {
      if (isNaN(value) || value <= 0) {
        throw new Error('Valeur invalide pour le logarithme');
      }
      return Math.log(value);
    }
  }
  