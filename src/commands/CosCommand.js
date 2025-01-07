// Commande de cosinus permettant d'exécuter et d'annuler un calcul de cosinus
export default class CosCommand {
  execute(value) {
    if (isNaN(value)) {
      throw new Error('Valeur invalide pour le sinus');
    }
    return Math.cos(value);
  }
  }
  